"use client";

import { toastError, toastSuccess } from "@/lib/toast";
import { resetUserTransactions } from "../actions";
import styles from "./DeleteTransactions.module.css";

export default function DeleteTransactions() {
  async function resetTransactions() {
    const res = await resetUserTransactions();

    if (!res.success) {
      toastError(res.error ?? "Something went wrong!");
      return;
    }

    toastSuccess("Transactions deleted.");
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.panel}>
        <h2 className={styles.title}>Remove stored transactions</h2>
        <p className={styles.description}>
          Clear all saved transactions from your account if you want to start
          over with a fresh upload.
        </p>
        <button
          className={styles.button}
          type="button"
          onClick={resetTransactions}
        >
          Remove your stored transactions
        </button>
      </div>
    </section>
  );
}
