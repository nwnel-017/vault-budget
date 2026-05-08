"use server";

import {
  createTransactionsForUpload,
  getUploadUserData,
  saveUserColumnMappings,
} from "@/lib/transactions/upload/upload-persistence";
import {
  normalizeCsvHeaders,
  parseUploadedTransactionRows,
} from "@/lib/transactions/upload/upload-parsing";
export type {
  IncomeSelectionTransaction,
  ParsedTransactionRow,
  SelectedUploadColumns,
  UploadInputResult,
} from "@/types/upload-actions";
import type { UploadInputResult } from "@/types/upload-actions";
import {
  createUploadFailureResult,
  hasValidSelectedUploadColumns,
  normalizeUploadFileName,
  sanitizeSelectedUploadColumns,
} from "@/lib/transactions/upload/upload-validation";
import { requireSession } from "@/lib/auth/auth-helpers";
import db from "@/lib/general/prisma";
import {
  fileValidationErrorResult,
  validateCsvFile,
} from "@/utils/transactions";

function getTransactionDateRange(parsedRows: { transactionDate: Date }[]) {
  const earliestTransactionDate = parsedRows.reduce<Date | null>(
    (earliestDate, row) => {
      if (!earliestDate || row.transactionDate < earliestDate) {
        return row.transactionDate;
      }

      return earliestDate;
    },
    null,
  );
  const latestTransactionDate = parsedRows.reduce<Date | null>(
    (latestDate, row) => {
      if (!latestDate || row.transactionDate > latestDate) {
        return row.transactionDate;
      }

      return latestDate;
    },
    null,
  );

  return {
    earliestTransactionDate,
    latestTransactionDate,
  };
}

export async function normalizeFile(form: FormData) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return fileValidationErrorResult(sessionResult.error);
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return fileValidationErrorResult(fileResult.error ?? "No file");
  }

  return normalizeCsvHeaders(fileResult.file);
}

export async function uploadInput(
  form: FormData,
  merchantTypeColumn: string,
  amountColumn: string,
  transactionDateColumn: string,
  fileName: string,
) : Promise<UploadInputResult> {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return createUploadFailureResult(sessionResult.error);
  }

  const userId = sessionResult.session?.user.id ?? null;

  if (!userId) {
    return createUploadFailureResult("Missing user id in session");
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return createUploadFailureResult(fileResult?.error ?? "No file");
  }

  const selectedColumns = sanitizeSelectedUploadColumns(
    merchantTypeColumn,
    amountColumn,
    transactionDateColumn,
  );
  const normalizedFileName = normalizeUploadFileName(fileName ?? "");

  if (!hasValidSelectedUploadColumns(selectedColumns)) {
    return createUploadFailureResult(
      "Please enter in valid values for all fields.",
    );
  }

  try {
    await saveUserColumnMappings(userId, selectedColumns);
  } catch (error) {
    console.log("failed to save column mappings: " + error);
    return createUploadFailureResult("Internal Error");
  }

  try {
    const existingPayPeriod = await db.userPayPeriod.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
      },
    });
    const { parsedRows, skippedRows } = await parseUploadedTransactionRows(
      fileResult.file,
      selectedColumns,
    );
    const { earliestTransactionDate, latestTransactionDate } =
      getTransactionDateRange(parsedRows);

    if (!earliestTransactionDate || !latestTransactionDate) {
      return createUploadFailureResult(
        "No valid transactions were found in the uploaded file.",
      );
    }

    const { user, sortedUserTransactionRules } =
      await getUploadUserData(userId);

    if (!user) {
      return createUploadFailureResult("User not found");
    }

    const { createdTransactions, blockedByFreeTierLimit } =
      await createTransactionsForUpload(
        userId,
        parsedRows,
        normalizedFileName,
        earliestTransactionDate,
        latestTransactionDate,
        sortedUserTransactionRules,
        user,
      );

    const freeTierLimitReached = blockedByFreeTierLimit > 0;

    return {
      success: true,
      error: null,
      message:
        skippedRows > 0
          ? `Uploaded ${createdTransactions.length} transactions successfully. Skipped ${skippedRows} invalid transactions.`
          : `Uploaded ${createdTransactions.length} transactions successfully.`,
      firstTimeUser: !existingPayPeriod,
      transactions: !existingPayPeriod ? createdTransactions : [],
      limitReached: freeTierLimitReached,
    };
  } catch {
    return createUploadFailureResult("Unable to process CSV upload.");
  }
}

export async function setUserPayPeriodBegin(periodBegin: string) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const userId = sessionResult.session?.user.id ?? null;

  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
    };
  }

  if (!periodBegin) {
    return {
      success: false,
      error: "Pay period start day is required.",
    };
  }

  const normalizedPeriodBegin = String(periodBegin).trim();

  if (!/^\d{1,2}$/.test(normalizedPeriodBegin)) {
    return {
      success: false,
      error: "Please enter a valid number.",
    };
  }

  const parsedPeriodBegin = Number.parseInt(normalizedPeriodBegin, 10);

  if (
    Number.isNaN(parsedPeriodBegin) ||
    parsedPeriodBegin < 1 ||
    parsedPeriodBegin > 31
  ) {
    return {
      success: false,
      error: "Invalid pay period start day.",
    };
  }

  await db.userPayPeriod.upsert({
    where: {
      user_id: userId,
    },
    create: {
      user_id: userId,
      pay_period_start_day: parsedPeriodBegin,
    },
    update: {
      pay_period_start_day: parsedPeriodBegin,
    },
  });

  return {
    success: true,
    error: null,
  };
}
