import db from "./prisma";

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

// TO DO - review
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

// TO DO - review
// do not use raw SQL
// this isnt running the calculations correctly
export async function getSavedHistoryLastThreeMonths(
  userId: string,
  anchorDate: Date,
) {
  const currentMonthStart = new Date(anchorDate);
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const firstMonthStart = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() - 2,
    1,
  );
  const nextMonthStart = new Date(
    currentMonthStart.getFullYear(),
    currentMonthStart.getMonth() + 1,
    1,
  );

  const savingsRows = await db.$queryRaw<
    {
      month_start: Date;
      total_saved: unknown;
    }[]
  >`
    SELECT
      date_trunc('month', date_purchased)::date AS month_start,
      COALESCE(SUM(amount), 0) AS total_saved
    FROM "transaction"
    WHERE user_id = ${userId}
      AND date_purchased >= ${firstMonthStart}
      AND date_purchased < ${nextMonthStart}
    GROUP BY month_start
    ORDER BY month_start ASC
  `;

  const savingsByMonth = new Map<string, number>(
    savingsRows.map((row) => [
      `${row.month_start.getFullYear()}-${`${row.month_start.getMonth() + 1}`.padStart(2, "0")}`,
      Number(row.total_saved),
    ]),
  );

  const savingsHistory: SavingsHistoryPoint[] = [];

  for (let monthOffset = 0; monthOffset < 3; monthOffset += 1) {
    const monthStart = new Date(
      firstMonthStart.getFullYear(),
      firstMonthStart.getMonth() + monthOffset,
      1,
    );
    const monthKey = `${monthStart.getFullYear()}-${`${monthStart.getMonth() + 1}`.padStart(2, "0")}`;

    savingsHistory.push({
      monthStart: monthStart.toISOString(),
      totalSaved: savingsByMonth.get(monthKey) ?? 0,
    });
  }

  return savingsHistory;
}
