import db from "../../../../lib/prisma";
import ReviewTransactionsClient from "./_components/ReviewTransactionsClient";
import DeleteTransactions from "./_components/DeleteTransactions";

export default async function ReviewTransactions() {
  const transactions = await db.transaction.findMany({
    // take: 100,
    include: {
      category: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
  });

  const categories = await db.category.findMany();

  return (
    <>
      <DeleteTransactions />
      <ReviewTransactionsClient
        categories={categories.map((category) => ({
          id: category.id,
          category_name: category.category_name,
        }))}
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
    </>
  );
}
