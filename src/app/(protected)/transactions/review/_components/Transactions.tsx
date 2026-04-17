"use client";

import { formatTransaction } from "@/utils/funds";
import styles from "../page.module.css";

// TO DO - move to types/
export type TransactionsProps = {
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

export default function Transactions({ transactions }: TransactionsProps) {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <h1>Transactions</h1>
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
                  {transaction.category
                    ? transaction.category.category_name
                    : "No category"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
