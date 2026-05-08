import {
  getDatePreviousMonth,
  getEndDateExclusive,
  isValidDate,
} from "@/utils/date";

type TransactionCategory = {
  id: string;
  category_name: string;
  goal?: {
    amount: unknown;
  } | null;
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

type SavingsHistoryTransaction = {
  amount: unknown;
  date_purchased: Date;
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
    const spendingByCategory = transactions.reduce<
      Map<string, CategorySpending>
    >((categoryTotals, transaction) => {
      const amount = Number(transaction?.amount);
      const categoryId = transaction?.category?.id ?? uncategorizedCategoryId;
      const categoryName =
        transaction?.category?.category_name ?? uncategorizedCategoryName;
      const goalAmount = transaction?.category?.goal?.amount ?? null;

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

    const topCategories = Array.from(spendingByCategory.values()).sort(
      (firstCategory, secondCategory) => {
        return secondCategory.totalSpent - firstCategory.totalSpent;
      },
    );

    const topCategory: TopCategory | null = topCategories[0]
      ? {
          categoryName: topCategories[0].categoryName,
          amountSpent: topCategories[0].totalSpent,
        }
      : null;

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
  } catch (error) {
    console.log("Failed to retrieve dashboard summary: " + error);
    return emptySummary;
  }
}

export function getSavedHistoryFetchRange(
  currentStartDate: Date,
  currentEndDate: Date,
): {
  oldestStartDateAtMidnight: Date;
  currentEndDateExclusive: Date;
} | null {
  if (!isValidDate(currentStartDate) || !isValidDate(currentEndDate)) {
    return null;
  }

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
    return null;
  }

  const oldestStartDateAtMidnight = new Date(oldestStartDate);
  oldestStartDateAtMidnight.setHours(0, 0, 0, 0);

  const currentEndDateExclusive = new Date(currentEndDate);
  currentEndDateExclusive.setDate(currentEndDateExclusive.getDate() + 1);
  currentEndDateExclusive.setHours(0, 0, 0, 0);

  return {
    oldestStartDateAtMidnight,
    currentEndDateExclusive,
  };
}

export function getSavedHistoryLastThreeMonths(
  transactions: SavingsHistoryTransaction[],
  currentStartDate: Date,
  currentEndDate: Date,
): SavingsHistoryPoint[] {
  if (!isValidDate(currentStartDate) || !isValidDate(currentEndDate)) {
    return [];
  }

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
    const monthStartAtMidnight = new Date(monthStart);
    monthStartAtMidnight.setHours(0, 0, 0, 0);

    const monthEndExclusive = getEndDateExclusive(monthEnd);

    if (!monthEndExclusive) {
      return {
        monthStart: monthStart.toISOString(),
        totalSaved: 0,
      };
    }

    const totalSaved = transactions.reduce((total, transaction) => {
      const transactionDate = new Date(transaction.date_purchased);

      if (
        transactionDate < monthStartAtMidnight ||
        transactionDate >= monthEndExclusive
      ) {
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
