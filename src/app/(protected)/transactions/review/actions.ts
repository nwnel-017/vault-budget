"use server";

import { requireSession } from "@/lib/auth-helpers";
import { hasReachedFreeTierTransactionLimit } from "@/lib/free-tier-limit";
import db from "@/lib/prisma";
import {
  associateTranToCategory,
  changeTransactionCategory,
} from "@/lib/transaction-rules";

// lets the user delete all their transactions
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

  await db.transaction.deleteMany({
    where: {
      user_id: userId,
    },
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

  const deletedTransaction = await db.transaction.deleteMany({
    where: {
      id: transactionId,
      user_id: userId,
    },
  });

  if (deletedTransaction.count === 0) {
    return {
      success: false,
      error: "Transaction not found",
    };
  }

  return {
    success: true,
    error: null,
  };
}

// function to generate a category rule for a transaction based on the merchant name
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

  // checks if this will be the user's first categorized transaction
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
