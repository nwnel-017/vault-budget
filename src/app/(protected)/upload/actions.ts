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

// this was moved to @lib
// takes in a row from the csv and the selected column mappings
// function parseValidTransactionRow(
//   row: Record<string, unknown>,
//   selectedColumns: SelectedUploadColumns,
// ): ParsedTransactionRow | null {
//   // look up the values in the row and normalize
//   const merchantType = normalizeTextValue(row[selectedColumns.merchantType]);
//   const amountValue = normalizeAmountValue(row[selectedColumns.amount]);
//   const transactionDateValue = normalizeTextValue(
//     row[selectedColumns.transactionDate],
//   );

//   if (!merchantType || !amountValue || !transactionDateValue) {
//     return null;
//   }

//   // TO DO - handle invalid amounts and dates here
//   const amount = Number(amountValue);
//   const transactionDate = new Date(transactionDateValue);

//   if (!Number.isFinite(amount) || Number.isNaN(transactionDate.getTime())) {
//     return null;
//   }

//   return {
//     merchantType,
//     amount,
//     transactionDate,
//   };
// }

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
) {
  // validate session
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
      message: null,
    };
  }

  // validate the file
  const fileResult = validateCsvFile(form);

  if (!fileResult || fileResult.error || !fileResult.file) {
    return {
      success: false,
      error: fileResult.error,
      message: null,
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
    };
  }

  // parse the file
  // add parsed rows to parsedRows array, keep track of skipped rows
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

    // check user id in session
    // TO DO - do this check before
    const userId = sessionResult.session?.user.id;
    if (!userId) {
      return fileValidationErrorResult("Missing user id in session");
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

    // insert parsed transactions
    // for each row - we call matchTransactionCategory to find a category match
    // if no category match is found - category = null
    await db.transaction.createMany({
      data: parsedRows.map((row) => {
        const matchedRule = matchTransactionCategory(
          row.merchantType,
          sortedUserTransactionRules,
        );

        return {
          merchant: row.merchantType,
          amount: row.amount,
          date_purchased: row.transactionDate,
          user_id: userId,
          category_id: matchedRule?.category_id ?? null,
          transaction_rule_id: matchedRule?.id ?? null,
        };
      }),
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
