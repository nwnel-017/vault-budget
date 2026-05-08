"use client";

import { useActionState } from "react";
import Button from "@/app/components/ui/Button";
import type { DeleteAccountState } from "../../../../membership/actions";
import { deleteAccount } from "../../../../membership/actions";
import styles from "./ConfirmDelete.module.css";

const initialState: DeleteAccountState = {
  error: null,
};

export default function ConfirmDelete({
  feedback,
  onCancel,
}: {
  feedback: string;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    deleteAccount,
    initialState,
  );

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        aria-labelledby="confirm-delete-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Delete account</span>
          <h2 className={styles.title} id="confirm-delete-title">
            This permanently deletes your account.
          </h2>
          <p className={styles.description}>
            Enter your password to confirm. Your account, membership status,
            transactions, categories, and goals will be deleted.
          </p>
        </div>

        <form className={styles.form} action={formAction}>
          <input name="feedback" type="hidden" value={feedback} />

          <label className={styles.label} htmlFor="delete-account-password">
            Password
          </label>
          <input
            className={styles.input}
            id="delete-account-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />

          {state.error ? (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onCancel}
              disabled={pending}
            >
              Cancel
            </button>
            <Button
              className={styles.deleteConfirmButton}
              fullWidth
              type="submit"
              disabled={pending}
            >
              {pending ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
