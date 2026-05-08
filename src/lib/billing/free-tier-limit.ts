import "server-only";

import db from "@/lib/general/prisma";

export function getFreeTierTransactionLimit() {
  return !isNaN(Number(process.env.FREE_TIER_TRANSACTION_LIMIT))
    ? Number(process.env.FREE_TIER_TRANSACTION_LIMIT)
    : 300;
}

export async function hasReachedFreeTierTransactionLimit(userId: string) {
  const FREE_TIER_TRANSACTION_LIMIT = getFreeTierTransactionLimit();
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      accountTier: true,
      role: true,
      billing: {
        select: {
          access_expires_at: true,
        },
      },
    },
  });

  if (!user) {
    return true;
  }

  if (user.role === "ADMIN" || user.accountTier !== "FREE") {
    return false;
  }

  // Let canceled premium users keep access until their saved end date passes.
  if (
    user?.accountTier === "FREE" &&
    user.billing?.access_expires_at &&
    user.billing.access_expires_at > new Date()
  ) {
    return false;
  }

  const transactionCount = await db.transaction.count({
    where: {
      user_id: userId,
    },
  });

  return transactionCount >= FREE_TIER_TRANSACTION_LIMIT;
}
