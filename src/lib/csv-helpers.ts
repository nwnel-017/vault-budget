import type { ParsedTransactionRow } from "@/app/(protected)/upload/actions";
import type { SelectedUploadColumns } from "@/app/(protected)/upload/actions";
import { normalizeTextValue } from "@/utils/transactions";
import { normalizeAmountValue } from "@/utils/transactions";

// takes in a row from the csv and the selected column mappings
function parseValidTransactionRow(
  row: Record<string, unknown>,
  selectedColumns: SelectedUploadColumns,
): ParsedTransactionRow | null {
  // look up the values in the row and normalize
  const merchantType = normalizeTextValue(row[selectedColumns.merchantType]);
  const amountValue = normalizeAmountValue(row[selectedColumns.amount]);
  const transactionDateValue = normalizeTextValue(
    row[selectedColumns.transactionDate],
  );

  if (!merchantType || !amountValue || !transactionDateValue) {
    return null;
  }

  // TO DO - handle invalid amounts and dates here
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

export { parseValidTransactionRow };
