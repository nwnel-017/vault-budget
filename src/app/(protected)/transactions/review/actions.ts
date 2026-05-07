"use server";

import { requireSession } from "@/lib/auth-helpers";
import { hasReachedFreeTierTransactionLimit } from "@/lib/free-tier-limit";
import db from "@/lib/prisma";
import {
  associateTranToCategory,
  changeTransactionCategory,
  cleanupAllUnusedTransactionRules,
  cleanupUnusedTransactionRule,
  removeTransactionCategory,
} from "@/lib/transaction-rules";

export async function resetUserTransactions() {
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

  await db.$transaction(async (tx) => {
    await tx.transaction.deleteMany({
      where: {
        user_id: userId,
      },
    });

    await cleanupAllUnusedTransactionRules(tx, userId);
  });

  return {
    success: true,
    error: null,
  };
}

export async function deleteTransaction(transactionId: string) {
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

  if (!transactionId) {
    return {
      success: false,
      error: "Missing transaction id",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: {
          id: transactionId,
          user_id: userId,
        },
        select: {
          id: true,
          transaction_rule_id: true,
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      await tx.transaction.delete({
        where: {
          id: transaction.id,
        },
      });

      await cleanupUnusedTransactionRule(
        tx,
        userId,
        transaction.transaction_rule_id,
      );
    });
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unable to delete transaction",
    };
  }

  return {
    success: true,
    error: null,
  };
}

export async function categorizeTransaction(
  transactionId: string,
  categoryId: string,
  shouldCreateRule: boolean,
) {
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
      showFreeTrialNotice: false,
    };
  }

  const categorizedTransactionCount = await db.transaction.count({
    where: {
      user_id: userId,
      category_id: {
        not: null,
      },
    },
  });

  const freeTierReached = await hasReachedFreeTierTransactionLimit(userId);
  const showFreeTrialNotice = categorizedTransactionCount === 0;

  // Free tier users cannot create a new rule after the limit is reached.
  const shouldOnlyChangeCategory = freeTierReached || !shouldCreateRule;

  const result = shouldOnlyChangeCategory
    ? await changeTransactionCategory(userId, transactionId, categoryId)
    : await associateTranToCategory(userId, transactionId, categoryId);

  if (!result.success) {
    return {
      ...result,
      showFreeTrialNotice: false,
    };
  }

  return {
    ...result,
    showFreeTrialNotice,
  };
}

export async function deleteTransactionCategory(transactionId: string) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: "Invalid Session",
    };
  }

  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "Missing user in session",
    };
  }

  const validatedTransactionId = String(transactionId ?? "").trim();

  if (!validatedTransactionId) {
    return {
      success: false,
      error: "Transaction id is required.",
    };
  }
  try {
    return removeTransactionCategory(userId, validatedTransactionId);
  } catch (error) {
    console.error("Error in deleteTransactionCategory action:", error);
    return {
      success: false,
      error:
        "An unexpected error occurred while removing the transaction category.",
    };
  }
}
