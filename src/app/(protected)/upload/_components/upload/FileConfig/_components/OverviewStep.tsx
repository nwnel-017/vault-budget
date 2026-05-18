"use client";

import CsvPreviewGrid from "./CsvPreviewGrid";
import styles from "../FileConfig.module.css";

export default function OverviewStep({
  title,
  description,
  onContinue,
}: {
  title: string;
  description: string[];
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      {description.map((text) => (
        <p key={text} className={styles.text}>
          {text}
        </p>
      ))}
      <CsvPreviewGrid />
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
      >
        Continue
      </button>
    </>
  );
}
