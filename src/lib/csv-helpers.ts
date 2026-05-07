import type { ParsedTransactionRow } from "@/app/(protected)/upload/actions";
import type { SelectedUploadColumns } from "@/app/(protected)/upload/actions";
import { normalizeTextValue } from "@/utils/transactions";
import { normalizeAmountValue } from "@/utils/transactions";
import { isValidDate } from "@/utils/date";

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

  const transactionDate = new Date(transactionDateValue);

  const amount = Number(amountValue);
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
