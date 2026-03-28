"use server";

import { Readable } from "node:stream";
import csv from "csv-parser";
import { requireSession } from "@/lib/auth-helpers";
import { matchTransactionCategory } from "@/lib/category-rules";
import db from "@/lib/prisma";
import {
  fileValidationErrorResult,
  normalizeAmountValue,
  normalizeTextValue,
  sanitizeHeader,
  validateCsvFile,
} from "@/utils/transactions";

type SelectedUploadColumns = {
  merchantType: string;
  amount: string;
  transactionDate: string;
};

type ParsedTransactionRow = {
  merchantType: string;
  amount: number;
  transactionDate: Date;
};

function parseValidTransactionRow(
  row: Record<string, unknown>,
  selectedColumns: SelectedUploadColumns,
): ParsedTransactionRow | null {
  const merchantType = normalizeTextValue(row[selectedColumns.merchantType]);
  const amountValue = normalizeAmountValue(row[selectedColumns.amount]);
  const transactionDateValue = normalizeTextValue(
    row[selectedColumns.transactionDate],
  );

  if (!merchantType || !amountValue || !transactionDateValue) {
    return null;
  }

  const amount = Number(amountValue);
  const transactionDate = new Date(transactionDateValue);

  if (!Number.isFinite(amount) || Number.isNaN(transactionDate.getTime())) {
    return null;
  }

  return {
    merchantType,
    amount,
    transactionDate,
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

  try {
    const chunk = await fileResult.file.slice(0, 1024).text();
    const firstLine = chunk.split(/\r?\n/)[0];
    console.log(firstLine);
    const normalizedHeaders = firstLine
      .split(",")
      .map((header) => header.trim().replace(/^"|"$/g, ""));

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

// TO DO - review and see if we can refactor
export async function uploadInput(
  form: FormData,
  merchantTypeColumn: string,
  amountColumn: string,
  transactionDateColumn: string,
) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
      message: null,
    };
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return {
      success: false,
      error: fileResult.error,
      message: null,
    };
  }

  const selectedColumns = {
    merchantType: sanitizeHeader(merchantTypeColumn),
    amount: sanitizeHeader(amountColumn),
    transactionDate: sanitizeHeader(transactionDateColumn),
  };

  if (
    !selectedColumns.merchantType ||
    !selectedColumns.amount ||
    !selectedColumns.transactionDate
  ) {
    return {
      success: false,
      error: "All column selections are required.",
      message: null,
    };
  }

  try {
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

    const userId = sessionResult.session?.user.id;
    if (!userId) {
      return fileValidationErrorResult("Missing user id in session");
    }

    const userTransactionRules = await db.transactionRule.findMany({
      where: {
        user_id: userId,
      },
      select: {
        pattern: true,
        category_id: true,
      },
    });

    await db.transaction.createMany({
      data: parsedRows.map((row) => ({
        merchant: row.merchantType,
        amount: row.amount,
        date_purchased: row.transactionDate,
        user_id: userId,
        category_id: matchTransactionCategory(
          row.merchantType,
          userTransactionRules,
        ),
      })),
    });

    return {
      success: true,
      error: null,
      message: `Parsed ${parsedRows.length} transaction rows successfully. Skipped ${skippedRows} invalid rows.`,
    };
  } catch {
    return {
      success: false,
      error: "Unable to process CSV upload.",
      message: null,
    };
  }
}
