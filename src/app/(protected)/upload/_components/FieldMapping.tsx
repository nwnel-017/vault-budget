"use client";

import type { FieldMap } from "@/types/upload";
import styles from "./FieldMapping.module.css";

export default function FieldMapping({
  active,
  fieldMap,
  onConfirm,
  onCancel,
}: {
  active: boolean;
  fieldMap: FieldMap;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!active) {
    return null;
  }

  const fieldRows = [
    {
      field: "Amount",
      column: fieldMap.amount,
    },
    {
      field: "Date purchased",
      column: fieldMap.date_purchased,
    },
    {
      field: "Merchant",
      column: fieldMap.merchant,
    },
  ];

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        aria-labelledby="field-mapping-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Saved preferences</span>
          <h1 className={styles.title} id="field-mapping-title">
            Confirm your saved field mappings
          </h1>
          <p className={styles.description}>
            We found saved upload preferences for this file. Please confirm that
            you want to use these saved column mappings.
          </p>
        </div>

        <div className={styles.gridWrapper}>
          <div className={styles.gridHeader} role="row">
            <span>Field</span>
            <span>Column mapping</span>
          </div>
          <div className={styles.gridBody}>
            {fieldRows.map((row) => (
              <div className={styles.gridRow} key={row.field} role="row">
                <span className={styles.fieldLabel}>{row.field}</span>
                <span className={styles.columnValue}>
                  {row.column || "No saved column"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onCancel}
          >
            Review manually
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={onConfirm}
          >
            Use saved preferences
          </button>
        </div>
      </section>
    </div>
  );
}
