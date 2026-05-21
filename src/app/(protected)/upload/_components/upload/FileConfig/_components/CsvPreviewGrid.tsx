import type { CSSProperties } from "react";
import styles from "./CsvPreviewGrid.module.css";

const PREVIEW_ROWS = 4;

export default function CsvPreviewGrid({
  columns,
  previewRows = PREVIEW_ROWS,
}: {
  columns: string[];
  previewRows?: number;
}) {
  const columnCount = Math.max(columns.length, 1);

  return (
    <div
      className={styles.preview}
      style={{ "--preview-column-count": columnCount } as CSSProperties}
      aria-hidden="true"
    >
      <div className={styles.headerRow}>
        {columns.map((header) => (
          <div key={header} className={styles.headerCell}>
            <span className={styles.headerLabel}>{header}</span>
          </div>
        ))}
      </div>

      {Array.from({ length: previewRows }, (_, rowIndex) => (
        <div key={rowIndex} className={styles.bodyRow}>
          {columns.map((header) => (
            <div key={`${header}-${rowIndex}`} className={styles.bodyCell} />
          ))}
        </div>
      ))}
    </div>
  );
}
