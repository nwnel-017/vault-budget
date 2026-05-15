import type { ParsedTransactionRow } from "@/types/upload-actions";
import type { SelectedUploadColumns } from "@/types/upload-actions";
import { normalizeTextValue } from "@/utils/transactions";
import { normalizeAmountValue } from "@/utils/transactions";
import { isValidDate } from "@/utils/date";

function parseAmountNumber(value: unknown) {
  const normalizedValue = normalizeAmountValue(value);

  if (!normalizedValue) {
    return null;
  }

  const amount = Number(normalizedValue);

  return Number.isFinite(amount) ? amount : null;
}

function sumMappedAmounts(row: Record<string, unknown>, columns: string[]) {
  let total = 0;
  let hasValue = false;

  for (const column of columns) {
    const amount = parseAmountNumber(row[column]);

    if (amount === null) {
      continue;
    }

    hasValue = true;
    total += amount;
  }

  return {
    total,
    hasValue,
  };
}

function resolveTransactionAmount(
  row: Record<string, unknown>,
  selectedColumns: SelectedUploadColumns,
) {
  if (selectedColumns.mode === "SINGLE") {
    return parseAmountNumber(row[selectedColumns.amount]);
  }

  const positiveResult = sumMappedAmounts(row, selectedColumns.positiveColumns);
  const negativeResult = sumMappedAmounts(row, selectedColumns.negativeColumns);

  if (!positiveResult.hasValue && !negativeResult.hasValue) {
    return null;
  }

  const amount = positiveResult.total - negativeResult.total;

  if (!Number.isFinite(amount)) {
    return null;
  }

  return amount;
}

function parseValidTransactionRow(
  row: Record<string, unknown>,
  selectedColumns: SelectedUploadColumns,
): ParsedTransactionRow | null {
  const merchantType = normalizeTextValue(row[selectedColumns.merchantType]);
  const transactionDateValue = normalizeTextValue(
    row[selectedColumns.transactionDate],
  );
  const amount = resolveTransactionAmount(row, selectedColumns);

  if (!merchantType || amount === null || !transactionDateValue) {
    return null;
  }

  const transactionDate = new Date(transactionDateValue);
  if (!isValidDate(transactionDate) || !Number.isFinite(amount)) {
    return null;
  }

  return {
    merchantType,
    amount,
    transactionDate,
  };
}

export { parseValidTransactionRow };
