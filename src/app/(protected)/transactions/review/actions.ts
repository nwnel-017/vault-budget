"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";
import { generateCategoryRule } from "@/lib/category-rules";
import { sanitizeTextInput } from "@/utils/transactions";

// TO DO
// for each transaction - we should call generateCategoryRule to generate a rule pattern
// store that pattern in the db in a category_rules table with the category id
export async function categorizeTransaction(
  transactionId: string,
  categoryId: string,
) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  categoryId = String(categoryId ?? "").trim();
  transactionId = String(transactionId ?? "").trim();

  if (!categoryId || !transactionId) {
    return {
      success: false,
      error: "Category id is required.",
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

  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
    };
  }

  try {
    const [transaction, category] = await Promise.all([
      db.transaction.findFirst({
        where: {
          id: validatedTransactionId,
          user_id: userId,
        },
      }),
      db.category.findFirst({
        where: {
          id: validatedCategoryId,
          user_id: userId,
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

    const rulePattern = generateCategoryRule(transaction.merchant, category.id);

    if (rulePattern) {
      await db.transactionRule.create({
        data: {
          pattern: rulePattern,
          category_id: category.id,
          user_id: userId,
        },
      });
    }
    await db.transaction.update({
      where: {
        id: validatedTransactionId,
      },
      data: {
        category_id: validatedCategoryId,
      },
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
