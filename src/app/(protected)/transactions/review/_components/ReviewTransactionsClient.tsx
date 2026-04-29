"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toastError, toastSuccess } from "@/lib/toast";
import { ChooseCategory } from "./ChooseCategory";
import FreeTrialNotice from "./FreeTrialNotice";
import { categorizeTransaction, deleteTransaction } from "../actions";
import { formatTransaction } from "@/utils/funds";
import styles from "../page.module.css";

type ReviewTransactionsClientProps = {
  categories: {
    id: string;
    category_name: string;
  }[];
  currentPage: number;
  totalPages: number;
  totalTransactions: number;
  transactions: {
    id: string;
    amount: string;
    merchant: string;
    date_purchased: string;
    category: {
      id: string;
      category_name: string;
    } | null;
  }[];
};

type TransactionFilter = "all" | "categorized" | "uncategorized";

// takes in categories and transactions
// TO DO - review logic
export default function ReviewTransactionsClient({
  activeFilter,
  categories,
  currentPage,
  totalPages,
  totalTransactions,
  transactions,
}: ReviewTransactionsClientProps & {
  activeFilter: TransactionFilter;
}) {
  const [chooseCategoryOptions, setChooseCategoryOptions] = useState(false);
  const [showFreeTrialNotice, setShowFreeTrialNotice] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [autoCategorizeSimilarTransactions, setAutoCategorizeSimilarTransactions]
    = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateTransactionView(filter: TransactionFilter, page: number) {
    const params = new URLSearchParams(searchParams.toString());

    if (filter === "all") {
      params.delete("tab");
    } else {
      params.set("tab", filter);
    }

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    router.push(nextUrl);
  }

  async function addTransactionCategory(categoryId: string) {
    if (!selectedTransaction || !categoryId) {
      toastError("No transaction selected");
      return;
    }

    // This lets the user choose whether to create a future rule.
    const response = await categorizeTransaction(
      selectedTransaction,
      categoryId,
      autoCategorizeSimilarTransactions,
    );

    if (!response?.success) {
      toastError(response?.error || "Something went wrong!");
    } else {
      // shows the free trial notice only after the first successful categorization
      setShowFreeTrialNotice(response.showFreeTrialNotice === true);
      router.refresh();
      toastSuccess("Updated transaction category.");
    }

    setSelectedTransaction("");
    setAutoCategorizeSimilarTransactions(true);
    setChooseCategoryOptions(false);
  }

  function selectTransaction(id: string) {
    if (!id) return;

    setSelectedTransaction(id);
    setAutoCategorizeSimilarTransactions(true);
    setChooseCategoryOptions(true);
  }

  async function removeTransaction(id: string) {
    if (!id) {
      return;
    }

    const response = await deleteTransaction(id);

    if (!response.success) {
      toastError(response.error ?? "Unable to delete transaction.");
      return;
    }

    router.refresh();
    toastSuccess("Transaction deleted.");
  }

  return (
    <div>
      <FreeTrialNotice active={showFreeTrialNotice} />
      <ChooseCategory
        active={chooseCategoryOptions}
        categories={categories}
        addTransactionCategory={addTransactionCategory}
        autoCategorizeSimilarTransactions={autoCategorizeSimilarTransactions}
        setAutoCategorizeSimilarTransactions={
          setAutoCategorizeSimilarTransactions
        }
        closeChooseCategory={() => {
          setAutoCategorizeSimilarTransactions(true);
          setChooseCategoryOptions(false);
        }}
      />
      <section className={styles.page}>
        <div className={styles.gridWrapper}>
          <div className={styles.gridTopBar}>
            <div className={styles.header}>
              <h1>Review Transactions</h1>
            </div>
            <div
              className={styles.filterTabs}
              role="tablist"
              aria-label="Filter transactions"
            >
              <button
                className={`${styles.filterTab} ${
                  activeFilter === "all" ? styles.activeFilterTab : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeFilter === "all"}
                onClick={() => updateTransactionView("all", 1)}
              >
                All
              </button>
              <button
                className={`${styles.filterTab} ${
                  activeFilter === "categorized" ? styles.activeFilterTab : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeFilter === "categorized"}
                onClick={() => updateTransactionView("categorized", 1)}
              >
                Categorized
              </button>
              <button
                className={`${styles.filterTab} ${
                  activeFilter === "uncategorized" ? styles.activeFilterTab : ""
                }`}
                type="button"
                role="tab"
                aria-selected={activeFilter === "uncategorized"}
                onClick={() => updateTransactionView("uncategorized", 1)}
              >
                Uncategorized
              </button>
            </div>
          </div>
          <div className={styles.gridHeader} role="row">
            <span>Amount</span>
            <span>Merchant</span>
            <span>Date</span>
            <span>Category</span>
            <span className={styles.actionHeader}>Action</span>
          </div>
          <div className={styles.gridBody}>
            {transactions.length === 0 ? (
              <div className={styles.emptyState}>No transactions found.</div>
            ) : null}
            {transactions.map((transaction) => {
              const formattedDate = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }).format(new Date(transaction.date_purchased));
              const transactionAmount = Number(transaction.amount);
              const amountClassName =
                transactionAmount < 0
                  ? styles.negativeAmount
                  : styles.positiveAmount;

              return (
                <div className={styles.gridRow} key={transaction.id} role="row">
                  <span className={styles.amountCell}>
                    <span className={amountClassName}>
                      {formatTransaction(transaction.amount)}
                    </span>
                  </span>
                  <span className={styles.merchantCell}>
                    <span className={styles.merchantName}>
                      {transaction.merchant}
                    </span>
                  </span>
                  <span className={styles.dateCell}>{formattedDate}</span>
                  <span className={styles.categoryCell}>
                    {transaction.category ? (
                      <button
                        className={`${styles.categoryButton} ${styles.changeCategoryButton}`}
                        type="button"
                        onClick={() => selectTransaction(transaction.id)}
                      >
                        {transaction.category.category_name}
                      </button>
                    ) : (
                      <button
                        className={`${styles.categoryButton} ${styles.addCategoryButton}`}
                        type="button"
                        onClick={() => selectTransaction(transaction.id)}
                      >
                        Uncategorized
                      </button>
                    )}
                  </span>
                  <span className={styles.actionCell}>
                    <button
                      className={styles.deleteRowButton}
                      type="button"
                      onClick={() => removeTransaction(transaction.id)}
                    >
                      Delete
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
          {totalTransactions > 0 ? (
            <div className={styles.gridFooter}>
              <p className={styles.resultsText}>
                Showing page {currentPage} of {totalPages} for{" "}
                {totalTransactions} transactions
              </p>
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  type="button"
                  onClick={() =>
                    updateTransactionView(activeFilter, currentPage - 1)
                  }
                  disabled={currentPage <= 1}
                >
                  Previous
                </button>
                <p className={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </p>
                <button
                  className={styles.paginationButton}
                  type="button"
                  onClick={() =>
                    updateTransactionView(activeFilter, currentPage + 1)
                  }
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
