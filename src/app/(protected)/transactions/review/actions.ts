"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";
import {
  generateCategoryRule,
} from "@/lib/category-rules";
import { validateCategoryTransaction } from "@/lib/transaction-validation";
import { updateTransactionCategory } from "@/lib/update-transaction-category";

// function to generate a category rule for a transaction based on the merchant name
export async function categorizeTransaction(
  transactionId: string,
  categoryId: string,
) {
  // validate session
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
    };
  }

  // ensure transaction and category are both valid
  const validationResult = await validateCategoryTransaction(
    userId,
    transactionId,
    categoryId,
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const { transaction, validatedCategoryId, validatedTransactionId } =
    validationResult;

  // if there is an existing transaction rule - we will update the transaction rule and category
  // otherwise - we will generate a new transaction rule based on the merchant name and store
  try {
    // TO DO: fix - updateTransactionCategory calls validation again - we are doing this twice
    if (transaction.transaction_rule_id) {
      return updateTransactionCategory(
        userId,
        validatedTransactionId,
        validatedCategoryId,
      );
    }

    const rulePattern = generateCategoryRule(
      transaction.merchant,
      validatedCategoryId,
    );

    await db.$transaction(async (tx) => {
      let transactionRuleId: string | null = null;

      // create a new transaction rule if a pattern was generated
      // update the transaction with the new category and transaction rule
      if (rulePattern) {
        const createdRule = await tx.transactionRule.create({
          data: {
            pattern: rulePattern,
            category_id: validatedCategoryId,
            user_id: userId,
          },
          select: {
            id: true,
          },
        });

        transactionRuleId = createdRule.id;
      }

      await tx.transaction.update({
        where: {
          id: validatedTransactionId,
        },
        data: {
          category_id: validatedCategoryId,
          transaction_rule_id: transactionRuleId,
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
      error: "Unable to categorize transaction.",
    };
  }
}
