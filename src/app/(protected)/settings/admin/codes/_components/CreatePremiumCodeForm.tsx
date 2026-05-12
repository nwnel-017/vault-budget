"use client";

import { useActionState, useEffect, useRef } from "react";
import Button from "@/app/components/ui/Button";
import { toastError, toastSuccess } from "@/lib/general/toast";
import {
  createPremiumCode,
  type CreatePremiumCodeState,
} from "../actions";
import styles from "../page.module.css";

const initialState: CreatePremiumCodeState = {
  error: null,
  success: null,
};

export default function CreatePremiumCodeForm() {
  const [state, formAction, pending] = useActionState(
    createPremiumCode,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toastError(state.error);
      return;
    }

    if (state.success) {
      toastSuccess(state.success);
      formRef.current?.reset();
    }
  }, [state.error, state.success]);

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel} htmlFor="code">
          Code
        </label>
        <input
          className={styles.fieldInput}
          id="code"
          name="code"
          type="text"
          maxLength={64}
          placeholder="SPRINGFREE30"
          required
          disabled={pending}
        />
      </div>

      {/* <div className={styles.fieldGroup}>
        <label
          className={styles.fieldLabel}
          htmlFor="premium_duration_days"
        >
          Premium duration in days
        </label>
        <input
          className={styles.fieldInput}
          id="premium_duration_days"
          name="premium_duration_days"
          type="number"
          min="1"
          max="3650"
          placeholder="30"
          required
        />
      </div> */}

      <p className={styles.helperText}>
        Codes are saved in uppercase and can be redeemed once.
      </p>

      <Button type="submit" fullWidth disabled={pending}>
        {pending ? "Adding..." : "Add Code"}
      </Button>
    </form>
  );
}
