"use client";

import { useState } from "react";
import styles from "./FileConfig.module.css";

export default function FileConfig({
  active,
  headers,
  onComplete,
}: {
  active: boolean;
  headers: string[];
  onComplete: (selectedColumns: {
    merchantField: string;
    amountField: string;
    dateField: string;
  }) => void;
}) {
  const steps = [
    {
      key: "merchantField",
      label: "merchant / transaction description (ex: Walmart, Chevron, etc.)",
    },
    { key: "amountField", label: "transaction amount" },
    { key: "dateField", label: "date of transaction" },
  ] as const;

  const [showOverview, setShowOverview] = useState(true);
  const [curStep, setCurStep] = useState(0);
  const [selectedColumns, setSelectedColumns] = useState({
    merchantField: "",
    amountField: "",
    dateField: "",
  });

  const availableHeaders = headers.filter(
    (header) => !Object.values(selectedColumns).includes(header),
  );

  if (!active) {
    return null;
  }

  function selectItem(header: string) {
    if (!header) {
      return;
    }

    const currentStep = steps[curStep];

    if (!currentStep) {
      return;
    }

    const nextSelectedColumns = {
      ...selectedColumns,
      [currentStep.key]: header,
    };

    setSelectedColumns(nextSelectedColumns);

    if (curStep === steps.length - 1) {
      setShowOverview(true);
      setCurStep(0);
      setSelectedColumns({
        merchantField: "",
        amountField: "",
        dateField: "",
      });
      onComplete(nextSelectedColumns);
      return;
    }

    setCurStep(curStep + 1);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {showOverview ? (
          <>
            <h1 className={styles.title}>Before you upload</h1>
            <p className={styles.text}>
              Look at the spreadsheet you uploaded and find the columns that
              match the transaction description, amount, and effective date.
            </p>
            <p className={styles.text}>
              In the next step, you will choose each matching column one at a
              time.
            </p>
            <p className={styles.text}>
              {process.env.NEXT_PUBLIC_APP_NAME} will remember your choices for
              next time, so if your spreadsheet has the same format in the
              future, you can skip this step.
            </p>
            <button
              type="button"
              className={styles.continueButton}
              onClick={() => setShowOverview(false)}
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h1 className={styles.title}>
              Please choose a column for: {steps[curStep]?.label}
            </h1>
            <div className={styles.headerGrid}>
              {availableHeaders.map((h) => (
                <button
                  key={h}
                  type="button"
                  className={styles.headerItem}
                  onClick={() => selectItem(h)}
                >
                  {h}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
