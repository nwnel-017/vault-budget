import Link from "next/link";
import styles from "./RangeSelector.module.css";

type RangeSelectorProps = {
  selectedRange: "week" | "month" | "year";
};

const rangeOptions = [
  { value: "week", label: "Past week" },
  { value: "month", label: "Past month" },
  { value: "year", label: "Past year" },
] as const;

export default function RangeSelector({ selectedRange }: RangeSelectorProps) {
  return (
    <div className={styles.rangeCard}>
      <h1>Spending results for the past {selectedRange}</h1>
      <div className={styles.selector} aria-label="Select dashboard range">
        {rangeOptions.map((rangeOption) => {
          const isActive = rangeOption.value === selectedRange;

          return (
            <Link
              key={rangeOption.value}
              href={`/dashboard?range=${rangeOption.value}`}
              className={`${styles.button} ${isActive ? styles.active : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {rangeOption.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
