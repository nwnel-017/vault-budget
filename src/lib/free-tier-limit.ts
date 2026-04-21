import "server-only";

import db from "@/lib/prisma";

const FREE_TIER_TRANSACTION_LIMIT = 150;

export async function hasReachedFreeTierTransactionLimit(userId: string) {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      accountTier: true,
      role: true,
    },
  });

  if (!user || user.role === "ADMIN" || user.accountTier !== "FREE") {
    return false;
  }

  const transactionCount = await db.transaction.count({
    where: {
      user_id: userId,
    },
  });

  return transactionCount >= FREE_TIER_TRANSACTION_LIMIT;
}
