"use client";

import { useState } from "react";
import Button from "@/app/components/ui/Button";
import styles from "./UpgradeMembershipForm.module.css";

type UpgradeMembershipFormProps = {
  monthlyRateLabel: string;
};

// Reviewed
export default function UpgradeMembershipForm({
  monthlyRateLabel,
}: UpgradeMembershipFormProps) {
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit() {
    setError("");
    setIsPending(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = (await response.json()) as {
        error?: string;
        sessionId?: string;
        url?: string | null;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create checkout session.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Stripe checkout session was not returned.");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to start checkout.",
      );
      setIsPending(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <div className={styles.summary}>
        <span className={styles.summaryLabel}>Premium Membership</span>
        <span className={styles.price}>{monthlyRateLabel}</span>
        <p className={styles.priceNote}>Billed monthly through Stripe.</p>
      </div>

      <p className={styles.confirmText}>
        Confirm that you would like to upgrade your account to premium
        membership.
      </p>

      <Button fullWidth type="submit" disabled={isPending}>
        {isPending ? "Redirecting..." : "Upgrade to Premium"}
      </Button>

      {error ? <p className={styles.error}>{error}</p> : null}
    </form>
  );
}
