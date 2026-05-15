import "server-only";

import { sanitizeHeader } from "@/utils/transactions";
import type {
  SelectedUploadColumns,
  AmountMappingMode,
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

function sanitizeHeaderList(columns: string[]) {
  return columns
    .map((column) => sanitizeHeader(column))
    .filter(Boolean);
}

export function sanitizeSelectedUploadColumns(input: {
  merchantTypeColumn: string;
  amountMappingMode: AmountMappingMode;
  amountColumn?: string | null;
  positiveColumns?: string[];
  negativeColumns?: string[];
  transactionDateColumn: string;
}): SelectedUploadColumns {
  const merchantType = sanitizeHeader(input.merchantTypeColumn);
  const transactionDate = sanitizeHeader(input.transactionDateColumn);

  if (input.amountMappingMode === "SINGLE") {
    return {
      mode: "SINGLE",
      merchantType,
      amount: sanitizeHeader(input.amountColumn ?? ""),
      positiveColumns: [],
      negativeColumns: [],
      transactionDate,
    };
  }

  return {
    mode: "SPLIT",
    merchantType,
    amount: null,
    positiveColumns: sanitizeHeaderList(input.positiveColumns ?? []),
    negativeColumns: sanitizeHeaderList(input.negativeColumns ?? []),
    transactionDate,
  };
}

export function hasValidSelectedUploadColumns(
  selectedColumns: SelectedUploadColumns,
) {
  if (
    !selectedColumns.merchantType ||
    !selectedColumns.transactionDate
  ) {
    return false;
  }

  if (selectedColumns.mode === "SINGLE") {
    return Boolean(selectedColumns.amount);
  }

  return Boolean(
    selectedColumns.positiveColumns.length > 0 &&
      selectedColumns.negativeColumns.length > 0,
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
