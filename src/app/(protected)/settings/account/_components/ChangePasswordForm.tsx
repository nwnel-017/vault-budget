"use client";

import { useActionState } from "react";
import Button from "@/app/components/ui/Button";
import { changePassword, type ChangePasswordState } from "../actions";
import styles from "./ChangePasswordForm.module.css";

const initialState: ChangePasswordState = {
  error: null,
  success: null,
};

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(
    changePassword,
    initialState,
  );

  return (
    <form className={styles.form} action={formAction}>
      <label className={styles.label} htmlFor="current-password">
        Current password
      </label>
      <input
        className={styles.input}
        id="current-password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
      />

      <label className={styles.label} htmlFor="new-password">
        New password
      </label>
      <input
        className={styles.input}
        id="new-password"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
      />

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
        {pending ? "Saving..." : "Change Password"}
      </Button>
    </form>
  );
}
