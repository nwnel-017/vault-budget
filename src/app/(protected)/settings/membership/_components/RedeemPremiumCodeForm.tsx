"use client";

import { useActionState, useState } from "react";
import Button from "@/app/components/ui/Button";
import {
  redeemPremiumCode,
  type RedeemPremiumCodeState,
} from "../actions";
import styles from "./RedeemPremiumCodeForm.module.css";

const initialState: RedeemPremiumCodeState = {
  error: null,
  success: null,
};

export default function RedeemPremiumCodeForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    redeemPremiumCode,
    initialState,
  );

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.toggleButton}
        type="button"
        onClick={() => setIsOpen((currentState) => !currentState)}
      >
        Get access to premium using an access code
      </button>

      <p className={styles.description}>
        Enter a valid premium access code to unlock premium on your account.
      </p>

      {isOpen ? (
        <form className={styles.form} action={formAction}>
          <label className={styles.label} htmlFor="premium-code">
            Access code
          </label>
          <input
            className={styles.input}
            id="premium-code"
            name="premiumCode"
            type="text"
            maxLength={64}
            autoCapitalize="characters"
            required
          />

          <p className={styles.helper}>
            Codes are not case sensitive. Each code can only be used once.
          </p>

          {state.error ? (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className={styles.success} role="status">
              {state.success}
            </p>
          ) : null}

          <Button fullWidth type="submit" disabled={pending}>
            {pending ? "Applying..." : "Apply Code"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
