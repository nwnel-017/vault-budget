"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserPayPeriodBegin } from "@/app/(protected)/upload/actions";
import styles from "./PayPeriodSection.module.css";

type PayPeriodSectionProps = {
  currentPayPeriodStartDay: number | null;
};

export default function PayPeriodSection({
  currentPayPeriodStartDay,
}: PayPeriodSectionProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedDay, setSelectedDay] = useState(
    currentPayPeriodStartDay ? currentPayPeriodStartDay.toString() : "1",
  );
  const dayOptions = Array.from({ length: 31 }, (_, index) => `${index + 1}`);

  function openModal() {
    // Reset the form to the saved value each time the popup opens.
    setSelectedDay(currentPayPeriodStartDay ? currentPayPeriodStartDay.toString() : "1");
    setErrorMessage("");
    setIsOpen(true);
  }

  function closeModal() {
    setErrorMessage("");
    setIsOpen(false);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setErrorMessage("");

    try {
      const response = await setUserPayPeriodBegin(selectedDay);

      if (!response.success) {
        setErrorMessage(response.error ?? "Unable to update pay period.");
        return;
      }

      closeModal();
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button className={styles.triggerButton} type="button" onClick={openModal}>
        Change
      </button>

      {isOpen ? (
        <div className={styles.overlay} onClick={closeModal}>
          <section
            className={styles.modal}
            aria-labelledby="pay-period-title"
            aria-modal="true"
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title} id="pay-period-title">
                Pay Period Start Day
              </h2>
              <p className={styles.description}>
                Choose the first day of the month your pay period should begin.
              </p>
              <p className={styles.currentValue}>
                Current day: {currentPayPeriodStartDay ?? "Not set"}
              </p>
            </div>

            <form className={styles.form} onSubmit={submit}>
              <label className={styles.label} htmlFor="pay-period-day">
                First day of the month
              </label>
              <select
                className={styles.select}
                id="pay-period-day"
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
                disabled={isPending}
              >
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>

              <div className={styles.actions}>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={closeModal}
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  className={styles.primaryButton}
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Saving..." : "Save Pay Period"}
                </button>
              </div>

              {errorMessage ? (
                <p className={styles.errorMessage} role="alert">
                  {errorMessage}
                </p>
              ) : null}
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
