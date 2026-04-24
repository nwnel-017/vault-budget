"use client";

import { useState } from "react";
import styles from "./PayPeriodConfig.module.css";

type SelectPayPeriodResult = {
  success: boolean;
  error: string | null;
};

export default function PayPeriodConfig({
  onSelectPayPeriod,
}: {
  onSelectPayPeriod: (periodBegin: string) => Promise<SelectPayPeriodResult>;
}) {
  const [periodBegin, setPeriodBegin] = useState("");
  const dayOptions = Array.from({ length: 31 }, (_, index) => `${index + 1}`);

  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!periodBegin) {
      alert("Please select a day.");
      return;
    }

    const result = await onSelectPayPeriod(periodBegin);

    if (!result.success) {
      alert(result.error ?? "Something went wrong!");
      return;
    }

    alert("Pay period start saved.");
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        aria-labelledby="income-select-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Budget Vault setup</span>
          <h1 className={styles.title} id="income-select-title">
            Select the day you usually get your first paycheck
          </h1>
          <p className={styles.description}>
            This helps Budget Vault calculate your pay period correctly. You can
            change this later in your settings.
          </p>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.label} htmlFor="pay-period-day">
            Day of the month
          </label>
          <select
            className={styles.select}
            id="pay-period-day"
            value={periodBegin}
            onChange={(event) => setPeriodBegin(event.target.value)}
            required
          >
            <option value="">Select a day</option>
            {dayOptions.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <button className={styles.submitButton} type="submit">
            Save Pay Period
          </button>
        </form>
      </section>
    </div>
  );
}
