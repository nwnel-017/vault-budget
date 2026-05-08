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
  limitReached: boolean;
};

export type NormalizeFileResult = {
  error: string | null;
  success: boolean;
  headers: string[];
};
