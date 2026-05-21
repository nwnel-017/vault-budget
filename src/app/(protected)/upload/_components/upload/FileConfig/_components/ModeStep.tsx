"use client";

import type { AmountMappingMode } from "@/types/upload-actions";
import CsvPreviewGrid from "./CsvPreviewGrid";
import styles from "../FileConfig.module.css";

export default function ModeStep({
  title,
  description,
  onSelectMode,
}: {
  title: string;
  description: string[];
  onSelectMode: (mode: AmountMappingMode) => void;
}) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      {description.map((text) => (
        <p key={text} className={styles.text}>
          {text}
        </p>
      ))}
      <div className={styles.previewExamples}>
        <div className={styles.previewExample}>
          <p className={styles.previewLabel}>Split payment example</p>
          <CsvPreviewGrid
            columns={["date", "description", "credit", "debit"]}
            previewRows={2}
          />
        </div>
        <div className={styles.previewExample}>
          <p className={styles.previewLabel}>Single amount example</p>
          <CsvPreviewGrid
            columns={["date", "description", "amount"]}
            previewRows={2}
          />
        </div>
      </div>
      <div className={styles.optionGrid}>
        <button
          type="button"
          className={styles.optionButton}
          onClick={() => onSelectMode("SPLIT")}
        >
          Yes, amounts are split
        </button>
        <button
          type="button"
          className={styles.optionButton}
          onClick={() => onSelectMode("SINGLE")}
        >
          No, there is one amount column
        </button>
      </div>
    </>
  );
}
