import "server-only";

import db from "@/lib/general/prisma";

export function getUserPayPeriod(userId: string) {
  return db.userPayPeriod.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      pay_period_start_day: true,
    },
  });
}

export function getLatestTransaction(userId: string) {
  return db.transaction.findFirst({
    where: {
      user_id: userId,
    },
    select: {
      date_purchased: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
  });
}

export function getUserTransactionDateRange(userId: string) {
  return db.transaction.aggregate({
    where: {
      user_id: userId,
    },
    _min: {
      date_purchased: true,
    },
    _max: {
      date_purchased: true,
    },
  });
}

export function getDashboardTransactions(
  userId: string,
  startDate: Date,
  endDateExclusive: Date,
) {
  return db.transaction.findMany({
    where: {
      date_purchased: {
        gte: startDate,
        lt: endDateExclusive,
      },
      user_id: userId,
    },
    include: {
      category: {
        include: {
          goal: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
    orderBy: {
      date_purchased: "desc",
    },
  });
}

export function getSavingsGoal(userId: string) {
  return db.savingsGoal.findFirst({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
    },
  });
}

export function getSavingsHistoryTransactions(
  userId: string,
  startDate: Date,
  endDateExclusive: Date,
) {
  return db.transaction.findMany({
    where: {
      user_id: userId,
      date_purchased: {
        gte: startDate,
        lt: endDateExclusive,
      },
    },
    select: {
      amount: true,
      date_purchased: true,
    },
  });
}
