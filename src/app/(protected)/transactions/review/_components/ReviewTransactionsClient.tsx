"use client";

import { useState } from "react";
import { ChooseCategory } from "./ChooseCategory";
import { categorizeTransaction } from "../actions";
import { formatTransaction } from "@/utils/funds";
import styles from "../page.module.css";

// TO DO: change this
// we dont want hardcoded database types
type ReviewTransactionsClientProps = {
  categories: {
    id: string;
    category_name: string;
  }[];
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

// takes in categories and transactions
export default function ReviewTransactionsClient({
  categories,
  transactions,
}: ReviewTransactionsClientProps) {
  const [chooseCategoryOptions, setChooseCategoryOptions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState("");

  async function addTransactionCategory(categoryId: string) {
    if (!selectedTransaction || !categoryId) alert("No transaction selected");
    const response = await categorizeTransaction(
      selectedTransaction,
      categoryId,
    );

    if (!response?.success) {
      alert(response?.error || "Something went wrong!");
    } else {
      alert("Updated transaction category");
    }
    setChooseCategoryOptions(false);
  }

  function selectTransaction(id: string) {
    if (!id) return;

    setSelectedTransaction(id);
    setChooseCategoryOptions(true);
  }

  return (
    <div>
      <ChooseCategory
        active={chooseCategoryOptions}
        categories={categories}
        addTransactionCategory={addTransactionCategory}
        closeChooseCategory={() => setChooseCategoryOptions(false)}
      />
      <section className={styles.page}>
        <div className={styles.header}>
          <h1>Review Transactions</h1>
        </div>
        <div className={styles.gridWrapper}>
          <div className={styles.gridHeader} role="row">
            <span>Amount</span>
            <span>Merchant</span>
            <span>Date</span>
            <span>Category</span>
          </div>
          <div className={styles.gridBody}>
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
                  <span>
                    <span className={amountClassName}>
                      {formatTransaction(transaction.amount)}
                    </span>
                  </span>
                  <span>{transaction.merchant}</span>
                  <span>{formattedDate}</span>
                  <span>
                    {transaction.category ? (
                      transaction.category.category_name
                    ) : (
                      <button
                        className={styles.addCategoryButton}
                        type="button"
                        onClick={() => selectTransaction(transaction.id)}
                      >
                        Add Category
                      </button>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
