import "server-only";

import db from "@/lib/prisma";
import { sanitizeTextInput } from "@/utils/transactions";

type TransactionValidationResult =
  | {
      success: true;
      validatedCategoryId: string;
      validatedTransactionId: string;
      transaction: {
        id: string;
        merchant: string;
        category_id: string | null;
        transaction_rule_id: string | null;
      };
    }
  | {
      success: false;
      error: string;
    };

// TO DO - move to generic types folder
export type Transaction = {
  id: string;
  merchant: string;
  category_id: string | null;
  transaction_rule_id: string | null;
};

export async function validateCategoryTransaction(
  userId: string,
  transactionId: string,
  categoryId: string,
): Promise<TransactionValidationResult> {
  categoryId = String(categoryId ?? "").trim();
  transactionId = String(transactionId ?? "").trim();

  if (!categoryId || !transactionId) {
    return {
      success: false,
      error: "Category id and transaction id are required.",
    };
  }

  const validatedCategoryId = sanitizeTextInput(categoryId);
  const validatedTransactionId = sanitizeTextInput(transactionId);

  if (!validatedCategoryId || !validatedTransactionId) {
    return {
      success: false,
      error: "Invalid category or transaction",
    };
  }

  const [transaction, category] = await Promise.all([
    db.transaction.findFirst({
      where: {
        id: validatedTransactionId,
        user_id: userId,
      },
      select: {
        id: true,
        merchant: true,
        category_id: true,
        transaction_rule_id: true,
      },
    }),
    db.category.findFirst({
      where: {
        id: validatedCategoryId,
        user_id: userId,
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!transaction) {
    return {
      success: false,
      error: "Transaction not found.",
    };
  }

  if (!category) {
    return {
      success: false,
      error: "Category not found.",
    };
  }

  return {
    success: true,
    validatedCategoryId,
    validatedTransactionId,
    transaction,
  };
}
