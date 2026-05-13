import "server-only";

import { Readable } from "node:stream";
import csv from "csv-parser";
import { parseValidTransactionRow } from "@/lib/transactions/review/csv-helpers";
import type {
  NormalizeFileResult,
  ParsedTransactionRow,
  SelectedUploadColumns,
} from "@/types/upload-actions";
import { sanitizeHeader } from "@/utils/transactions";

const MAX_CSV_ROW_BYTES = 64 * 1024;

export async function normalizeCsvHeaders(file: File): Promise<NormalizeFileResult> {
  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
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

export async function parseUploadedTransactionRows(
  file: File,
  selectedColumns: SelectedUploadColumns,
): Promise<{
  parsedRows: ParsedTransactionRow[];
  skippedRows: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);
  const parsedRows: ParsedTransactionRow[] = [];
  let skippedRows = 0;

  await new Promise<void>((resolve, reject) => {
    Readable.from(fileBuffer)
      .pipe(
        csv({
          maxRowBytes: MAX_CSV_ROW_BYTES,
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

  return {
    parsedRows,
    skippedRows,
  };
}
