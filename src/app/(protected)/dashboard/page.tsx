import db from "../../../lib/prisma";
import ReviewTransactions from "../transactions/categories/page";
import Transactions from "../transactions/review/_components/Transactions";
import DashHeader from "./_components/DashHeader";

export default async function Dashboard() {
  const transactions = await db.transaction.findMany({
    take: 100,
    include: {
      category: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
  });

  const totalSpent = transactions.reduce((total, transaction) => {
    const amount = Number(transaction.amount);

    if (Number.isNaN(amount) || amount > 0) {
      return total;
    }

    return total + amount;
  }, 0);

  return (
    <div>
      <DashHeader totalSpent={totalSpent} />
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
