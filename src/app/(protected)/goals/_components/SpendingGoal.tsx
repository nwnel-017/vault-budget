"use client";

import { useActionState, useEffect, useState } from "react";
import { updateSavingsGoal } from "../actions";
import styles from "./SpendingGoal.module.css";

// TO DO - review
export default function SpendingGoal({
  currentGoal,
}: {
  currentGoal?: string | null;
}) {
  const savedGoalAmount = currentGoal ?? "0.00";
  const initialState = {
    success: false,
    error: null,
  };
  const [state, formAction, isPending] = useActionState(
    updateSavingsGoal,
    initialState,
  );
  const [amount, setAmount] = useState(currentGoal ?? "");

  useEffect(() => {
    setAmount(currentGoal ?? "");
  }, [currentGoal]);

  return (
    <section className={styles.wrapper}>
      <form className={styles.form} action={formAction}>
        <label className={styles.label} htmlFor="spendingGoalAmount">
          Goal for total savings per month: ${savedGoalAmount}
        </label>
        <input
          className={styles.input}
          id="spendingGoalAmount"
          name="spendingGoalAmount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          disabled={isPending}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? "Updating..." : "Update Goal"}
        </button>
        {state.error ? <p role="alert">{state.error}</p> : null}
      </form>
    </section>
  );
}
