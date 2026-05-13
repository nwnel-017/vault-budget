"use client";

import { useState } from "react";
import styles from "./ChangeCategoryGoal.module.css";

type ChangeCategoryGoalProps = {
  active: boolean;
  categoryName: string;
  currentGoal?: string | null;
  isPending?: boolean;
  errorMsg?: string;
  closeChangeGoal: () => void;
  changeCategoryGoal: (amount: string) => void | Promise<void>;
};

export default function ChangeCategoryGoal({
  active,
  categoryName,
  currentGoal = "",
  isPending = false,
  errorMsg = "",
  closeChangeGoal,
  changeCategoryGoal,
}: ChangeCategoryGoalProps) {
  const [amount, setAmount] = useState(currentGoal ?? "");

  if (!active) {
    return null;
  }

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const sanitizedAmount = amount.trim();

    await changeCategoryGoal(sanitizedAmount);
  }

  return (
    <div className={styles.overlay} onClick={closeChangeGoal}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headingBlock}>
            <h2 className={styles.title}>Change goal</h2>
            <p className={styles.categoryName}>{categoryName}</p>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={closeChangeGoal}
          >
            Close
          </button>
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="categoryGoalAmount">
            Dollar amount
          </label>
          <div className={styles.inputRow}>
            <span className={styles.currencySymbol}>$</span>
            <input
              className={styles.input}
              id="categoryGoalAmount"
              name="categoryGoalAmount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              disabled={isPending}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={closeChangeGoal}
            >
              Cancel
            </button>
            <button className={styles.primaryButton} type="submit">
              Save goal
            </button>
          </div>

          {errorMsg ? (
            <p className={styles.errorMessage} role="alert">
              {errorMsg}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
