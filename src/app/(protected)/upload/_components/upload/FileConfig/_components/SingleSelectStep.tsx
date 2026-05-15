"use client";

import styles from "../FileConfig.module.css";

export default function SingleSelectStep({
  title,
  description,
  headers,
  onSelectHeader,
}: {
  title: string;
  description?: string[];
  headers: string[];
  onSelectHeader: (header: string) => void;
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
            className={styles.headerItem}
            onClick={() => onSelectHeader(header)}
          >
            {header}
          </button>
        ))}
      </div>
    </>
  );
}
