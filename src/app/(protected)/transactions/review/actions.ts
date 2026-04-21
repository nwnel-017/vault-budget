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

// function to generate a category rule for a transaction based on the merchant name
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

  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
    };
  }

  const freeTierReached = await hasReachedFreeTierTransactionLimit(userId);

  if (freeTierReached) {
    return changeTransactionCategory(userId, transactionId, categoryId);
  }

  return associateTranToCategory(userId, transactionId, categoryId);
}
