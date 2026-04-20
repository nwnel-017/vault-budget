import db from "./prisma";
import { getDatePreviousMonth, isValidDate } from "@/utils/date";

type TransactionCategory = {
  id: string;
  category_name: string;
  goals?: {
    amount: unknown;
  }[];
};

type DashboardTransaction = {
  amount: unknown;
  category: TransactionCategory | null;
};

type CategorySpending = {
  id: string;
  categoryName: string;
  totalSpent: number;
  goalAmount: number | null;
  goalDifference: number | null;
};

type TopCategory = {
  categoryName: string;
  amountSpent: number;
};

type SavingsHistoryPoint = {
  monthStart: string;
  totalSaved: number;
};

export function getDashboardSpendingSummary(
  transactions: DashboardTransaction[] | null | undefined,
) {
  const uncategorizedCategoryId = "uncategorized";
  const uncategorizedCategoryName = "Uncategorized";
  const emptySummary = {
    topCategories: [] as CategorySpending[],
    topCategory: null as TopCategory | null,
    totalSpent: 0,
    totalEarned: 0,
  };

  if (!Array.isArray(transactions)) {
    return emptySummary;
  }

  try {
    // total spent for each category
    const spendingByCategory = transactions.reduce<
      Map<string, CategorySpending>
    >((categoryTotals, transaction) => {
      const amount = Number(transaction?.amount);
      const categoryId = transaction?.category?.id ?? uncategorizedCategoryId;
      const categoryName =
        transaction?.category?.category_name ?? uncategorizedCategoryName;
      const goalAmount = transaction?.category?.goals?.[0]?.amount ?? null;

      if (Number.isNaN(amount) || amount >= 0) {
        return categoryTotals;
      }

      const existingCategory = categoryTotals.get(categoryId);
      const spentAmount = Math.abs(amount);

      if (existingCategory) {
        existingCategory.totalSpent += spentAmount;
        return categoryTotals;
      }

      const parsedGoalAmount = goalAmount === null ? null : Number(goalAmount);

      categoryTotals.set(categoryId, {
        id: categoryId,
        categoryName,
        totalSpent: spentAmount,
        goalAmount:
          parsedGoalAmount === null || Number.isNaN(parsedGoalAmount)
            ? null
            : parsedGoalAmount,
        goalDifference: null,
      });

      return categoryTotals;
    }, new Map());

    spendingByCategory.forEach((category) => {
      if (category.goalAmount === null) {
        return;
      }

      category.goalDifference = category.goalAmount - category.totalSpent; // positive if user has spent below their goal
    });

    // categories sorted by total spent in descending order
    const topCategories = Array.from(spendingByCategory.values()).sort(
      (firstCategory, secondCategory) => {
        return secondCategory.totalSpent - firstCategory.totalSpent;
      },
    );

    // category with the highest total spent
    const topCategory: TopCategory | null = topCategories[0]
      ? {
          categoryName: topCategories[0].categoryName,
          amountSpent: topCategories[0].totalSpent,
        }
      : null;

    // the total amount spent
    const totalSpent = transactions.reduce((total, transaction) => {
      const amount = Number(transaction?.amount);

      if (Number.isNaN(amount) || amount > 0) {
        return total;
      }

      return total + amount;
    }, 0);

    const totalEarned = transactions.reduce((total, transaction) => {
      const amount = Number(transaction?.amount);

      if (Number.isNaN(amount) || amount < 0) {
        return total;
      }

      return total + amount;
    }, 0);

    return {
      topCategories,
      topCategory,
      totalSpent,
      totalEarned,
    };
  } catch {
    return emptySummary;
  }
}

export async function getSavedHistoryLastThreeMonths(
  userId: string,
  currentStartDate: Date,
  currentEndDate: Date,
): Promise<SavingsHistoryPoint[]> {
  if (!isValidDate(currentStartDate) || !isValidDate(currentEndDate)) {
    return [];
  }

  // build the same rolling periods the dashboard uses
  const previousStartDate = getDatePreviousMonth(currentStartDate);
  const previousEndDate = getDatePreviousMonth(currentEndDate);
  const oldestStartDate = previousStartDate
    ? getDatePreviousMonth(previousStartDate)
    : null;
  const oldestEndDate = previousEndDate
    ? getDatePreviousMonth(previousEndDate)
    : null;

  if (
    !previousStartDate ||
    !previousEndDate ||
    !oldestStartDate ||
    !oldestEndDate
  ) {
    return [];
  }

  const oldestStartDateAtMidnight = new Date(oldestStartDate);
  oldestStartDateAtMidnight.setHours(0, 0, 0, 0);

  const currentEndDateExclusive = new Date(currentEndDate);
  currentEndDateExclusive.setDate(currentEndDateExclusive.getDate() + 1);
  currentEndDateExclusive.setHours(0, 0, 0, 0);

  let transactions;

  try {
    transactions = await db.transaction.findMany({
      where: {
        user_id: userId,
        date_purchased: {
          gte: oldestStartDateAtMidnight,
          lt: currentEndDateExclusive,
        },
      },
      select: {
        amount: true,
        date_purchased: true,
      },
    });
  } catch (err) {
    console.log("failed to fetch transactions: " + err);
    return [];
  }

  const ranges = [
    {
      monthStart: oldestStartDate,
      monthEnd: oldestEndDate,
    },
    {
      monthStart: previousStartDate,
      monthEnd: previousEndDate,
    },
    {
      monthStart: currentStartDate,
      monthEnd: currentEndDate,
    },
  ];

  return ranges.map(({ monthStart, monthEnd }) => {
    const totalSaved = transactions.reduce((total, transaction) => {
      const transactionDate = new Date(transaction.date_purchased);

      if (transactionDate < monthStart || transactionDate > monthEnd) {
        return total;
      }

      const amount = Number(transaction.amount);

      if (!amount || Number.isNaN(amount)) {
        return total;
      }

      return total + amount;
    }, 0);

    return {
      monthStart: monthStart.toISOString(),
      totalSaved,
    };
  });
}
