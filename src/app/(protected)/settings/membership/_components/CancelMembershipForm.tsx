"use client";

import { useActionState } from "react";
import Button from "@/app/components/ui/Button";
import {
  cancelPremiumMembership,
  type CancelMembershipState,
} from "../actions";
import styles from "./CancelMembershipForm.module.css";

const initialState: CancelMembershipState = {
  error: null,
  success: null,
};

// Reviewed
export default function CancelMembershipForm() {
  const [state, formAction, pending] = useActionState(
    cancelPremiumMembership,
    initialState,
  );

  return (
    <form className={styles.form} action={formAction}>
      <Button fullWidth type="submit" disabled={pending}>
        {pending ? "Cancelling..." : "Cancel Premium Membership"}
      </Button>
      <p className={styles.note}>
        Cancelling stops renewal and keeps premium active through the end of the
        current billing period.
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
    </form>
  );
}
