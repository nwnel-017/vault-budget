"use server";

import { Readable } from "node:stream";
import csv from "csv-parser";
import { requireSession } from "@/lib/auth-helpers";
import { matchTransactionCategory } from "@/lib/category-rules";
import { parseValidTransactionRow } from "@/lib/csv-helpers";
import db from "@/lib/prisma";
import { cleanupTransactions } from "@/lib/transaction-rules";
import {
  fileValidationErrorResult,
  sanitizeHeader,
  validateCsvFile,
} from "@/utils/transactions";

const FREE_TIER_TRANSACTION_LIMIT =
  Number(process.env.FREE_TIER_TRANSACTION_LIMIT) || 300;

// TO DO - refactor and move into separate functions / files

// TO DO - move these to types
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
};

// function to validate file and return the normalized headers
export async function normalizeFile(form: FormData) {
  const sessionResult = await requireSession();

  // validate the session
  if (sessionResult.error) {
    return fileValidationErrorResult(sessionResult.error);
  }

  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return fileValidationErrorResult(fileResult.error ?? "No file");
  }

  // we just want to retrieve the headers of the csv file
  // we will just grab the first line and normalize
  // either retrieve the headers or return an error if we are unable to read the file
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

// uploads the entire file
// takes in the form and the selected column mappings
export async function uploadInput(
  form: FormData,
  merchantTypeColumn: string,
  amountColumn: string,
  transactionDateColumn: string,
): Promise<UploadInputResult> {
  // validate session
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
      message: null,
      firstTimeUser: false,
      transactions: [],
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
    };
  }

  // validate the file
  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return {
      success: false,
      error: fileResult.error ?? "No file",
      message: null,
      firstTimeUser: false,
      transactions: [],
    };
  }

  // validate input column selections
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
      firstTimeUser: false,
      transactions: [],
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
    };
  }
  // parse the file
  // add parsed rows to parsedRows array, keep track of skipped rows
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

    // created batch of parsed rows
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
      throw new Error("USER_NOT_FOUND");
    }

    // find transaction rules for the user
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
    const sortedUserTransactionRules = userTransactionRules
      .filter((rule) => rule.pattern)
      .sort((a, b) => b.pattern.length - a.pattern.length);

    const { createdTransactions, blockedByFreeTierLimit } =
      await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "user" WHERE id = ${userId} FOR UPDATE`;

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

    const latestTransactionDate = parsedRows.reduce<Date | null>(
      (latestDate, row) => {
        if (!latestDate || row.transactionDate > latestDate) {
          return row.transactionDate;
        }

        return latestDate;
      },
      null,
    );

    if (latestTransactionDate) {
      // Keep uploaded history trimmed to one year from the newest transaction.
      await cleanupTransactions(userId, latestTransactionDate);
    }

    return {
      success: true,
      error: null,
      message:
        blockedByFreeTierLimit > 0
          ? `Uploaded ${createdTransactions.length} transaction rows successfully. Skipped ${skippedRows} invalid rows. ${blockedByFreeTierLimit} uploaded rows were saved without automatic categorization because your free plan has reached the ${FREE_TIER_TRANSACTION_LIMIT} transaction limit.`
          : `Parsed ${createdTransactions.length} transaction rows successfully. Skipped ${skippedRows} invalid rows.`,
      firstTimeUser: !existingPayPeriod,
      transactions: !existingPayPeriod ? incomeSelectionTransactions : [],
    };
  } catch {
    return {
      success: false,
      error: "Unable to process CSV upload.",
      message: null,
      firstTimeUser: false,
      transactions: [],
    };
  }
}

// sets the default pay period
// used as the beginning of the month for tracking spending
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

  const parsedPeriodBegin = Number.parseInt(periodBegin, 10);
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
