"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/prisma";
import { updateTransactionRule } from "@/lib/category-rules";
import { validateCategoryTransaction } from "@/lib/transaction-validation";

export async function updateTransactionCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
) {
  const validationResult = await validateCategoryTransaction(
    userId,
    transactionId,
    newCategoryId,
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const { transaction, validatedCategoryId, validatedTransactionId } =
    validationResult;

  try {
    if (!transaction.transaction_rule_id) {
      return {
        success: false,
        error: "Transaction does not have an existing transaction rule.",
      };
    }

    const transactionRule = await db.transactionRule.findFirst({
      where: {
        id: transaction.transaction_rule_id,
        user_id: userId,
      },
      select: {
        id: true,
        pattern: true,
        category_id: true,
      },
    });

    if (!transactionRule) {
      return {
        success: false,
        error: "Transaction rule not found.",
      };
    }

    if (transactionRule.category_id === validatedCategoryId) {
      return {
        success: false,
        error: "Matching rule already uses this category.",
      };
    }

    const oldPattern = transactionRule.pattern;
    const updatedPattern = updateTransactionRule(
      oldPattern,
      transaction.merchant,
    );

    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id: validatedTransactionId,
        },
        data: {
          category_id: validatedCategoryId,
          transaction_rule_id: transactionRule.id,
        },
      });

      await tx.transactionRule.update({
        where: {
          id: transactionRule.id,
        },
        data: {
          category_id: validatedCategoryId,
          pattern: updatedPattern || oldPattern,
        },
      });
    });

    revalidatePath("/transactions/review");

    return {
      success: true,
      error: null,
    };
  } catch {
    return {
      success: false,
      error: "Unable to update transaction category.",
    };
  }
}
