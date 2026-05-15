"use client";

import type { AmountMappingMode } from "@/types/upload-actions";
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
