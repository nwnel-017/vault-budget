"use client";

import { useState, useEffect } from "react";
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
    { key: "merchantField", label: "merchant type" },
    { key: "amountField", label: "transaction amount" },
    { key: "dateField", label: "date of transaction" },
  ] as const;

  const [curStep, setCurStep] = useState(0);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>(headers);
  const [selectedColumns, setSelectedColumns] = useState({
    merchantField: "",
    amountField: "",
    dateField: "",
  });

  useEffect(() => {
    setAvailableHeaders(headers);
  }, [headers]);

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

    setAvailableHeaders(availableHeaders.filter((h) => h !== header));

    if (curStep === steps.length - 1) {
      setCurStep(0);
      onComplete(nextSelectedColumns);
      return;
    }

    setCurStep(curStep + 1);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1>Please choose a column for: {steps[curStep]?.label}</h1>
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
      </div>
    </div>
  );
}
