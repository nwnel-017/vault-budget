"use client";

import { useState } from "react";
import { formatTransaction } from "@/utils/funds";
import styles from "./IncomeSelect.module.css";
import type { IncomeSelectionTransaction } from "../actions";

type IncomeSelectClientProps = {
  transactions: IncomeSelectionTransaction[];
  onSelectIncomeTransaction: (transactionId: string) => void;
};

export default function IncomeSelectClient({
  transactions,
  onSelectIncomeTransaction,
}: IncomeSelectClientProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState("");

  return (
    <section className={styles.section}>
      <div className={styles.gridHeader} role="row">
        <span>Transaction Date</span>
        <span>Description</span>
        <span>Amount</span>
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
            transactionAmount < 0 ? styles.negativeAmount : styles.positiveAmount;
          const rowClassName =
            transaction.id === selectedTransactionId
              ? `${styles.gridRow} ${styles.selectedRow}`
              : styles.gridRow;

          return (
            <button
              key={transaction.id}
              type="button"
              className={rowClassName}
              onClick={() => {
                setSelectedTransactionId(transaction.id);
                onSelectIncomeTransaction(transaction.id);
              }}
            >
              <span>{formattedDate}</span>
              <span>{transaction.merchant}</span>
              <span className={amountClassName}>
                {formatTransaction(transaction.amount)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
