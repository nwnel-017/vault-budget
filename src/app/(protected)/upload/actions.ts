"use server";

import { Readable } from "node:stream";
import csv from "csv-parser";
import { requireSession } from "@/lib/auth-helpers";
import { matchTransactionCategory } from "@/lib/category-rules";
import { parseValidTransactionRow } from "@/lib/csv-helpers";
import db from "@/lib/prisma";
import {
  fileValidationErrorResult,
  sanitizeHeader,
  validateCsvFile,
} from "@/utils/transactions";

const FREE_TIER_TRANSACTION_LIMIT =
  Number(process.env.FREE_TIER_TRANSACTION_LIMIT) || 300;
const MAX_CSV_ROW_BYTES = 64 * 1024;

// Reviewed

export type SelectedUploadColumns = {
  merchantType: string;
  amount: string;
  transactionDate: string;
};

export type ParsedTransactionRow = {
  merchantType: string;
  amount: number;
  transactionDate: Date;
};

export type IncomeSelectionTransaction = {
  id: string;
  amount: string;
  merchant: string;
  date_purchased: string;
};

export type UploadInputResult = {
  success: boolean;
  error: string | null;
  message: string | null;
  firstTimeUser: boolean;
  transactions: IncomeSelectionTransaction[];
  limitReached: boolean;
};

const DEFAULT_UPLOAD_FILE_NAME = "uploaded-file.csv";
const MAX_UPLOAD_FILE_NAME_LENGTH = 255;

function normalizeUploadFileName(fileName: string) {
  const normalizedFileName = fileName
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedFileName) {
    return DEFAULT_UPLOAD_FILE_NAME;
  }

  return normalizedFileName.slice(0, MAX_UPLOAD_FILE_NAME_LENGTH);
}

// Read only the header row from the CSV file.
export async function normalizeFile(form: FormData) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return fileValidationErrorResult(sessionResult.error);
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return fileValidationErrorResult(fileResult.error ?? "No file");
  }

  try {
    const fileBuffer = Buffer.from(await fileResult.file.arrayBuffer());
    const source = Readable.from(fileBuffer);
    const parser = csv({
      maxRowBytes: MAX_CSV_ROW_BYTES,
    });

    const normalizedHeaders = await new Promise<string[]>((resolve, reject) => {
      let headersResolved = false;

      parser.on("headers", (headers: string[]) => {
        if (headersResolved) {
          return;
        }

        headersResolved = true;
        resolve(headers.map((header) => header.replace(/^\uFEFF/, "").trim()));

        source.destroy();
        parser.destroy();
      });

      parser.on("end", () => {
        if (headersResolved) {
          return;
        }

        reject(new Error("CSV file does not contain headers."));
      });

      parser.on("error", reject);
      source.on("error", reject);
      source.pipe(parser);
    });

    return {
      error: null,
      success: true,
      headers: normalizedHeaders,
    };
  } catch {
    return {
      error: "Unable to read CSV headers.",
      success: false,
      headers: [],
    };
  }
}

export async function uploadInput(
  form: FormData,
  merchantTypeColumn: string,
  amountColumn: string,
  transactionDateColumn: string,
  fileName: string,
): Promise<UploadInputResult> {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
  }

  const userId = sessionResult.session?.user.id;
  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return {
      success: false,
      error: fileResult.error ?? "No file",
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
  }

  const selectedColumns = {
    merchantType: sanitizeHeader(merchantTypeColumn),
    amount: sanitizeHeader(amountColumn),
    transactionDate: sanitizeHeader(transactionDateColumn),
  };
  const normalizedFileName = normalizeUploadFileName(fileName ?? "");

  if (
    !selectedColumns.merchantType ||
    !selectedColumns.amount ||
    !selectedColumns.transactionDate
  ) {
    return {
      success: false,
      error: "Please enter in valid values for all fields.",
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
  }

  try {
    // TO DO - check if columns are different from stored columns first
    // save the column mappings for next time
    await db.userColumnMappings.upsert({
      where: {
        user_id: userId,
      },
      create: {
        user_id: userId,
        amount: selectedColumns.amount,
        date_purchased: selectedColumns.transactionDate,
        merchant: selectedColumns.merchantType,
      },
      update: {
        amount: selectedColumns.amount,
        date_purchased: selectedColumns.transactionDate,
        merchant: selectedColumns.merchantType,
      },
    });
  } catch (err) {
    console.log("failed to save column mappings: " + err);
    return {
      success: false,
      error: "Internal Error",
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
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

    const arrayBuffer = await fileResult.file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    const parsedRows: ParsedTransactionRow[] = [];
    let skippedRows = 0;

    await new Promise<void>((resolve, reject) => {
      Readable.from(fileBuffer)
        .pipe(
          csv({
            mapHeaders: ({ header }) => sanitizeHeader(header),
          }),
        )
        .on("data", (row: Record<string, unknown>) => {
          const parsedRow = parseValidTransactionRow(row, selectedColumns);

          if (!parsedRow) {
            skippedRows += 1;
            return;
          }

          parsedRows.push(parsedRow);
        })
        .on("end", resolve)
        .on("error", reject);
    });

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

    if (!earliestTransactionDate || !latestTransactionDate) {
      return {
        success: false,
        error: "No valid transactions were found in the uploaded file.",
        message: null,
        firstTimeUser: false,
        transactions: [],
        limitReached: false,
      };
    }

    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accountTier: true,
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
        message: null,
        firstTimeUser: false,
        transactions: [],
        limitReached: false,
      };
    }

    const userTransactionRules = await db.transactionRule.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        pattern: true,
        category_id: true,
      },
    });
    // do this in the db instead?
    const sortedUserTransactionRules = userTransactionRules
      .filter((rule) => rule.pattern)
      .sort((a, b) => b.pattern.length - a.pattern.length);

    const { createdTransactions, blockedByFreeTierLimit } =
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "user" WHERE id = ${userId} FOR UPDATE`;

        const fileUpload = await tx.userFileUpload.create({
          data: {
            user_id: userId,
            file_name: normalizedFileName,
            start_date: earliestTransactionDate,
            end_date: latestTransactionDate,
          },
          select: {
            id: true,
          },
        });

        const existingTransactionCount = await tx.transaction.count({
          where: {
            user_id: userId,
          },
        });

        let runningTransactionCount = existingTransactionCount;
        let blockedTransactionCount = 0;

        const createdRows = await tx.transaction.createManyAndReturn({
          data: parsedRows.map((row) => {
            let matchedRule = null;

            if (
              user.role === "ADMIN" ||
              user.accountTier !== "FREE" ||
              runningTransactionCount < FREE_TIER_TRANSACTION_LIMIT
            ) {
              matchedRule = matchTransactionCategory(
                row.merchantType,
                sortedUserTransactionRules,
              );
            } else {
              blockedTransactionCount += 1;
            }

            runningTransactionCount += 1;

            return {
              file_upload_id: fileUpload.id,
              merchant: row.merchantType,
              amount: row.amount,
              date_purchased: row.transactionDate,
              user_id: userId,
              category_id: matchedRule?.category_id ?? null,
              transaction_rule_id: matchedRule?.id ?? null,
            };
          }),
          select: {
            id: true,
            amount: true,
            merchant: true,
            date_purchased: true,
          },
        });

        return {
          createdTransactions: createdRows,
          blockedByFreeTierLimit: blockedTransactionCount,
        };
      });

    const incomeSelectionTransactions = createdTransactions.map(
      (transaction) => ({
        id: transaction.id,
        amount: transaction.amount.toString(),
        merchant: transaction.merchant,
        date_purchased: transaction.date_purchased.toISOString(),
      }),
    );

    // TO DO - add back later and find a way to safely delete old transactions
    // this is removed as a safety feature - protects a incorrect date that is newly added from wiping data
    // it also protects the bug where users can delete their transactions and get functionally limitless premium access
    // if (latestTransactionDate) {
    //   await cleanupTransactions(userId, latestTransactionDate);
    // }

    // option - add a job for routinely scheduled transaction cleanup

    const freeTierLimitReached = blockedByFreeTierLimit > 0;

    return {
      success: true,
      error: null,
      message:
        skippedRows > 0
          ? `Uploaded ${createdTransactions.length} transactions successfully. Skipped ${skippedRows} invalid transactions.`
          : `Uploaded ${createdTransactions.length} transactions successfully.`,
      firstTimeUser: !existingPayPeriod,
      transactions: !existingPayPeriod ? incomeSelectionTransactions : [],
      limitReached: freeTierLimitReached,
    };
  } catch {
    return {
      success: false,
      error: "Unable to process CSV upload.",
      message: null,
      firstTimeUser: false,
      transactions: [],
      limitReached: false,
    };
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

  const userId = sessionResult.session?.user.id;
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

  // Only accept a plain day number so values like 1e2 or 1abc are rejected.
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
