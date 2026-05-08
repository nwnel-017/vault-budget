import "server-only";

import { sanitizeHeader } from "@/utils/transactions";
import type {
  SelectedUploadColumns,
  UploadInputResult,
} from "@/types/upload-actions";

const DEFAULT_UPLOAD_FILE_NAME = "uploaded-file.csv";
const MAX_UPLOAD_FILE_NAME_LENGTH = 255;

export function normalizeUploadFileName(fileName: string) {
  const normalizedFileName = fileName
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .trim()
    .replace(/\s+/g, " ");

  if (!normalizedFileName) {
    return DEFAULT_UPLOAD_FILE_NAME;
  }

  return normalizedFileName.slice(0, MAX_UPLOAD_FILE_NAME_LENGTH);
}

export function sanitizeSelectedUploadColumns(
  merchantTypeColumn: string,
  amountColumn: string,
  transactionDateColumn: string,
): SelectedUploadColumns {
  return {
    merchantType: sanitizeHeader(merchantTypeColumn),
    amount: sanitizeHeader(amountColumn),
    transactionDate: sanitizeHeader(transactionDateColumn),
  };
}

export function hasValidSelectedUploadColumns(
  selectedColumns: SelectedUploadColumns,
) {
  return Boolean(
    selectedColumns.merchantType &&
      selectedColumns.amount &&
      selectedColumns.transactionDate,
  );
}

export function createUploadFailureResult(
  error: string,
  overrides?: Partial<UploadInputResult>,
): UploadInputResult {
  return {
    success: false,
    error,
    message: null,
    firstTimeUser: false,
    transactions: [],
    limitReached: false,
    ...overrides,
  };
}
