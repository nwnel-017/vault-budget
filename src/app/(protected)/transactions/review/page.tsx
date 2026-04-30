import type { Prisma } from "@/app/generated/prisma/client";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helpers";
import db from "../../../../lib/prisma";
import ReviewTransactionsClient from "./_components/ReviewTransactionsClient";
import DeleteTransactions from "./_components/DeleteTransactions";
import FreeTierExpired from "./_components/FreeTierExpired";
import WelcomePanel from "./_components/WelcomePanel";
import styles from "./page.module.css";

// TO DO - review new flow with limit reached param
// cleanup

type ReviewSearchParams = Promise<{
  freeTierLimitReached?: string | string[] | undefined;
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
  // make sure only signed-in users can review transactions
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const activeFilter = normalizeFilter(
    getSearchParamValue(resolvedSearchParams.tab),
  );
  const showFreeTierExpired =
    getSearchParamValue(resolvedSearchParams.freeTierLimitReached) === "true";
  const requestedPage = normalizePage(
    getSearchParamValue(resolvedSearchParams.page),
  );

  // Build one shared filter so the count and page query stay aligned.
  const where: Prisma.TransactionWhereInput = {
    user_id: userId,
  };

  if (activeFilter === "categorized") {
    where.category_id = {
      not: null,
    };
  }

  if (activeFilter === "uncategorized") {
    where.category_id = null;
  }

  const [totalTransactions, categorizedTransactionCount, categories] =
    await Promise.all([
      db.transaction.count({
        where,
      }),
      db.transaction.count({
        where: {
          user_id: userId,
          category_id: {
            not: null,
          },
        },
      }),
      db.category.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          category_name: "asc",
        },
      }),
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
      <FreeTierExpired active={showFreeTierExpired} />
      <WelcomePanel active={categorizedTransactionCount === 0} />
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
