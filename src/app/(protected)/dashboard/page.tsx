import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import ReviewTransactions from "../transactions/categories/page";
import Transactions from "../transactions/review/_components/Transactions";
import DashHeader from "./_components/DashHeader";

// /Findings - Review this feedback

//   1. Medium: “Top category” is showing a negative amount for spending, which is likely the wrong user-facing value. In /C:/xampp/htdocs/budgeting-app/src/app/
//      (protected)/dashboard/page.tsx:79, amountSpent is built from the summed negative transaction total, and in /C:/xampp/htdocs/budgeting-app/src/app/
//      (protected)/dashboard/_components/DashHeader.tsx:31 it is rendered directly with formatFunds(). That means a label like Top category: Groceries
//      (-$245.00), which reads as a signed balance, not “amount spent.” If the intent is “spent,” this should usually be displayed as a positive absolute value.
//   2. Low: The dashboard still carries dead code and misleading comments. /C:/xampp/htdocs/budgeting-app/src/app/(protected)/dashboard/page.tsx:3 imports
//      ReviewTransactions but never uses it, and the TODO at /C:/xampp/htdocs/budgeting-app/src/app/(protected)/dashboard/page.tsx:7 says user filtering is
//      missing even though user_id: userId is now present at /C:/xampp/htdocs/budgeting-app/src/app/(protected)/dashboard/page.tsx:28. That increases
//      maintenance noise and makes future review harder.
//   3. Low: The main transaction query is broader than necessary. In /C:/xampp/htdocs/budgeting-app/src/app/(protected)/dashboard/page.tsx:22, include:
//      { category: true } loads full category records for every monthly transaction, but the page only uses category.id and category.category_name later at /C:/
//      xampp/htdocs/budgeting-app/src/app/(protected)/dashboard/page.tsx:119. Switching to select for just the fields you render will reduce payload size and
//      keep the query cleaner.
export default async function Dashboard() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return null;
  }

  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const transactions = await db.transaction.findMany({
    where: {
      date_purchased: {
        gte: oneMonthAgo,
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

  // we need to get the user id
  const topCategorySpend = await db.transaction.groupBy({
    by: ["category_id"],
    where: {
      user_id: userId,
      category_id: {
        not: null,
      },
      amount: {
        lt: 0,
      },
      date_purchased: {
        gte: oneMonthAgo,
        lte: today,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "asc",
      },
    },
    take: 1,
  });

  const topCategoryId = topCategorySpend[0]?.category_id;
  const topCategoryAmount = topCategorySpend[0]?._sum.amount;

  const topCategoryRecord = topCategoryId
    ? await db.category.findUnique({
        where: {
          id: topCategoryId,
        },
        select: {
          category_name: true,
        },
      })
    : null;

  const topCategory = topCategoryRecord
    ? {
        categoryName: topCategoryRecord.category_name,
        amountSpent: Number(topCategoryAmount ?? 0),
      }
    : null;

  const totalSpent = transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount > 0) {
      return total;
    }

    return total + amount;
  }, 0);

  const totalEarned = transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount < 0) {
      return total;
    }

    return total + amount;
  }, 0);

  return (
    <div>
      <DashHeader
        totalSpent={totalSpent}
        totalEarned={totalEarned}
        topCategory={topCategory}
      />
      <Transactions
        transactions={transactions.map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount.toString(),
          merchant: transaction.merchant,
          date_purchased: transaction.date_purchased.toISOString(),
          category: transaction.category
            ? {
                id: transaction.category.id,
                category_name: transaction.category.category_name,
              }
            : null,
        }))}
      />
    </div>
  );
}
