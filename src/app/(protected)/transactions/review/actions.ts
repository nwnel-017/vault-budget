"use server";

import { requireSession } from "@/lib/auth-helpers";
import { associateTranToCategory } from "@/lib/transaction-rules";

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

  return associateTranToCategory(userId, transactionId, categoryId);
}
