import type { Prisma } from "@/app/generated/prisma/client";
import db from "../../../../lib/prisma";
import ReviewTransactionsClient from "./_components/ReviewTransactionsClient";
import DeleteTransactions from "./_components/DeleteTransactions";
import styles from "./page.module.css";

type ReviewSearchParams = Promise<{
  page?: string | string[] | undefined;
  tab?: string | string[] | undefined;
}>;

type TransactionFilter = "all" | "categorized" | "uncategorized";

const PAGE_SIZE = 50;

function getSearchParamValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeFilter(value: string | undefined): TransactionFilter {
  if (value === "categorized" || value === "uncategorized") {
    return value;
  }

  return "all";
}

function normalizePage(value: string | undefined) {
  const pageNumber = Number.parseInt(value ?? "1", 10);

  if (Number.isNaN(pageNumber) || pageNumber < 1) {
    return 1;
  }

  return pageNumber;
}

export default async function ReviewTransactions({
  searchParams,
}: {
  searchParams: ReviewSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeFilter(
    getSearchParamValue(resolvedSearchParams.tab),
  );
  const requestedPage = normalizePage(
    getSearchParamValue(resolvedSearchParams.page),
  );

  // Build one shared filter so the count and page query stay aligned.
  const where: Prisma.TransactionWhereInput = {};

  if (activeFilter === "categorized") {
    where.category_id = {
      not: null,
    };
  }

  if (activeFilter === "uncategorized") {
    where.category_id = null;
  }

  const [totalTransactions, categories] = await Promise.all([
    db.transaction.count({
      where,
    }),
    db.category.findMany(),
  ]);

  const totalPages =
    totalTransactions > 0 ? Math.ceil(totalTransactions / PAGE_SIZE) : 1;
  const currentPage = Math.min(requestedPage, totalPages);
  const transactions = await db.transaction.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
    skip: (currentPage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div className={styles.pageLayout}>
      <DeleteTransactions />
      <ReviewTransactionsClient
        activeFilter={activeFilter}
        categories={categories.map((category) => ({
          id: category.id,
          category_name: category.category_name,
        }))}
        currentPage={currentPage}
        totalPages={totalPages}
        totalTransactions={totalTransactions}
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
