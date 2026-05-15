export type AmountMappingMode = "SINGLE" | "SPLIT";

export type SingleAmountSelectedUploadColumns = {
  merchantType: string;
  transactionDate: string;
  mode: "SINGLE";
  amount: string;
  positiveColumns: [];
  negativeColumns: [];
};

export type SplitAmountSelectedUploadColumns = {
  merchantType: string;
  transactionDate: string;
  mode: "SPLIT";
  amount: null;
  positiveColumns: string[];
  negativeColumns: string[];
};

export type SelectedUploadColumns =
  | SingleAmountSelectedUploadColumns
  | SplitAmountSelectedUploadColumns;

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

export type NormalizeFileResult = {
  error: string | null;
  success: boolean;
  headers: string[];
};
