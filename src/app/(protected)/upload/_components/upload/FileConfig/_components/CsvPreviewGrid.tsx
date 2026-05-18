import styles from "./CsvPreviewGrid.module.css";

const COLUMN_HEADERS = ["column1", "column2", "column3", "column4"];
const PREVIEW_ROWS = 4;

export default function CsvPreviewGrid() {
  return (
    <div className={styles.preview} aria-hidden="true">
      <div className={styles.headerRow}>
        {COLUMN_HEADERS.map((header) => (
          <div key={header} className={styles.headerCell}>
            <span className={styles.headerLabel}>{header}</span>
          </div>
        ))}
      </div>

      {Array.from({ length: PREVIEW_ROWS }, (_, rowIndex) => (
        <div key={rowIndex} className={styles.bodyRow}>
          {COLUMN_HEADERS.map((header) => (
            <div key={`${header}-${rowIndex}`} className={styles.bodyCell} />
          ))}
        </div>
      ))}
    </div>
  );
}
