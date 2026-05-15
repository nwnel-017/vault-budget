import type { AmountMappingMode } from "./upload-actions";

export type FieldMap = {
  mode: AmountMappingMode;
  amount: string | null;
  positiveColumns: string[];
  negativeColumns: string[];
  date_purchased: string;
  merchant: string;
};
