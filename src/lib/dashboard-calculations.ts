type TransactionCategory = {
  id: string;
  category_name: string;
};

type DashboardTransaction = {
  amount: unknown;
  category: TransactionCategory | null;
};

type CategorySpending = {
  id: string;
  categoryName: string;
  totalSpent: number;
};

type TopCategory = {
  categoryName: string;
  amountSpent: number;
};

// TO DO
// we need to investigate spending calculation logic for total spent and total earned
// something is off with the bounds
export function getDashboardSpendingSummary(
  transactions: DashboardTransaction[] | null | undefined,
) {
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
      const categoryId = transaction?.category?.id;
      const categoryName = transaction?.category?.category_name;

      if (Number.isNaN(amount) || amount >= 0 || !categoryId || !categoryName) {
        return categoryTotals;
      }

      const existingCategory = categoryTotals.get(categoryId);
      const spentAmount = Math.abs(amount);

      if (existingCategory) {
        existingCategory.totalSpent += spentAmount;
        return categoryTotals;
      }

      categoryTotals.set(categoryId, {
        id: categoryId,
        categoryName,
        totalSpent: spentAmount,
      });

      return categoryTotals;
    }, new Map());

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
