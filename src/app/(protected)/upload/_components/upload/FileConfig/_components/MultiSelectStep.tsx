"use client";

import styles from "../FileConfig.module.css";

export default function MultiSelectStep({
  title,
  description,
  headers,
  selectedHeaders,
  onToggleHeader,
  onContinue,
}: {
  title: string;
  description?: string[];
  headers: string[];
  selectedHeaders: string[];
  onToggleHeader: (header: string) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <h1 className={styles.title}>{title}</h1>
      {description?.map((text) => (
        <p key={text} className={styles.text}>
          {text}
        </p>
      ))}
      <div className={styles.headerGrid}>
        {headers.map((header) => (
          <button
            key={header}
            type="button"
            className={`${styles.headerItem} ${selectedHeaders.includes(header) ? styles.headerItemSelected : ""}`}
            onClick={() => onToggleHeader(header)}
          >
            {header}
          </button>
        ))}
      </div>
      <button
        type="button"
        className={styles.continueButton}
        onClick={onContinue}
        disabled={selectedHeaders.length === 0}
      >
        Continue
      </button>
    </>
  );
}
