"use client";

import { getUserFacingDateValue } from "@/utils/date";
import { formatTransaction } from "@/utils/funds";
import styles from "./Transactions.module.css";

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

// Reviewed
export default function Transactions({ transactions }: TransactionsProps) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headingBlock}>
          <h1 className={styles.title}>Transactions</h1>
          <p className={styles.subtitle}>
            Review your recent activity and category coverage at a glance.
          </p>
        </div>
        <span className={styles.countPill}>{transactions.length} entries</span>
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
            const formattedDate = getUserFacingDateValue(
              transaction.date_purchased,
            );
            const transactionAmount = Number(transaction.amount);
            const amountClassName =
              transactionAmount < 0
                ? styles.negativeAmount
                : styles.positiveAmount;

            return (
              <div className={styles.gridRow} key={transaction.id} role="row">
                <span className={styles.mobileLabel}>Amount</span>
                <span className={styles.valueCell}>
                  <span className={amountClassName}>
                    {formatTransaction(transaction.amount)}
                  </span>
                </span>
                <span className={styles.mobileLabel}>Merchant</span>
                <span className={styles.valueCell}>{transaction.merchant}</span>
                <span className={styles.mobileLabel}>Date</span>
                <span className={styles.valueCell}>{formattedDate}</span>
                <span className={styles.mobileLabel}>Category</span>
                <span className={styles.valueCell}>
                  <span className={styles.categoryPill}>
                    {transaction.category
                      ? transaction.category.category_name
                      : "No category"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
