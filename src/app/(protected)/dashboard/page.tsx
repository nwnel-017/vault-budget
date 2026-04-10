import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import TopCategories from "./_components/TopCategories";
import DashHeader from "./_components/DashHeader";
import RangeSelector from "./_components/RangeSelector";
import styles from "./page.module.css";

type DashboardRange = "week" | "month" | "year";

function getSelectedRange(
  rangeValue: string | string[] | undefined,
): DashboardRange {
  if (
    rangeValue === "week" ||
    rangeValue === "month" ||
    rangeValue === "year"
  ) {
    return rangeValue;
  }

  return "month";
}

function getRangeStartDate(selectedRange: DashboardRange, endDate: Date) {
  const startDate = new Date(endDate);

  if (selectedRange === "week") {
    startDate.setDate(startDate.getDate() - 7);
    return startDate;
  }

  if (selectedRange === "year") {
    startDate.setFullYear(startDate.getFullYear() - 1);
    return startDate;
  }

  startDate.setMonth(startDate.getMonth() - 1);
  return startDate;
}

// TO DO - review code and improve logic
// fix UI - on full screens categories  can expand
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;
  const resolvedSearchParams = await searchParams;
  const selectedRange = getSelectedRange(resolvedSearchParams.range); // gets date interval for analytics

  if (!userId) {
    return null;
  }

  const today = new Date();
  const startDate = getRangeStartDate(selectedRange, today); // the date where we start the calculations for the analytics

  // joining transactions to categories to get all transactions with categories for date interval
  const transactions = await db.transaction.findMany({
    where: {
      date_purchased: {
        gte: startDate,
        lte: today,
      },
      user_id: userId,
    },
    include: {
      category: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
  });

  // spending total for each category
  const spendingByCategory = transactions.reduce<
    Map<string, { id: string; categoryName: string; totalSpent: number }> // TO DO - clean up return type
  >((categoryTotals, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount >= 0 || !transaction.category) {
      return categoryTotals;
    }

    const existingCategory = categoryTotals.get(transaction.category.id);
    const spentAmount = Math.abs(amount);

    if (existingCategory) {
      existingCategory.totalSpent += spentAmount;
      return categoryTotals;
    }

    categoryTotals.set(transaction.category.id, {
      id: transaction.category.id,
      categoryName: transaction.category.category_name,
      totalSpent: spentAmount,
    });

    return categoryTotals;
  }, new Map());

  // only grabs the first 10 categories with the most spending
  const topCategories = Array.from(spendingByCategory.values())
    .sort((firstCategory, secondCategory) => {
      return secondCategory.totalSpent - firstCategory.totalSpent;
    })
    .slice(0, 10);

  // top category to be displayed in the header
  const topCategory = topCategories[0]
    ? {
        categoryName: topCategories[0].categoryName,
        amountSpent: topCategories[0].totalSpent,
      }
    : null;

  // total spent for the date range
  const totalSpent = transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount > 0) {
      return total;
    }

    return total + amount;
  }, 0);

  // total earned for the date range
  const totalEarned = transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount < 0) {
      return total;
    }

    return total + amount;
  }, 0);

  return (
    <div>
      <div className={styles.headingBlock}>
        <RangeSelector selectedRange={selectedRange} />
      </div>
      <DashHeader
        totalSpent={totalSpent}
        totalEarned={totalEarned}
        topCategory={topCategory}
      />
      <TopCategories categories={topCategories} />
    </div>
  );
}
