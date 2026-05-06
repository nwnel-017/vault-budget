"use client";

import styles from "./SpendingGoal.module.css";
import { useActionState, useEffect, useState } from "react";
import { updateSavingsGoal } from "../actions";

// Reviewed
export default function ChangeSpendingGoal({
  onClose,
}: {
  onClose: () => void;
}) {
  const initialState = {
    success: false,
    error: null,
  };
  const [state, formAction, isPending] = useActionState(
    updateSavingsGoal,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      onClose();
    }
  }, [state.success, onClose]);

  const [amount, setAmount] = useState("");
  return (
    <section className={styles.overlay} onClick={() => onClose()}>
      <form
        className={styles.form}
        action={formAction}
        onClick={(event) => event.stopPropagation()}
      >
        <label className={styles.label} htmlFor="spendingGoalAmount">
          Goal for total savings per month:
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
