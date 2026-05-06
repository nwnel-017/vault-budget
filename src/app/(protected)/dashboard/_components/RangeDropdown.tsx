"use client";

import { useRouter } from "next/navigation";
import { type ChangeEvent } from "react";
import { type DateRangeOption } from "@/utils/date";
import styles from "./RangeDropdown.module.css";

type RangeDropdownProps = {
  ranges: DateRangeOption[];
  selectedLabel: string;
  selectedValue: string;
};

// Reviewed
export default function RangeDropdown({
  ranges,
  selectedLabel,
  selectedValue,
}: RangeDropdownProps) {
  const router = useRouter();

  function handleRangeChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextValue = event.target.value;

    if (!nextValue) {
      return;
    }

    const selectedRange = ranges.find((range) => {
      return `${range.start}|${range.end}` === nextValue;
    });

    if (!selectedRange) {
      return;
    }

    router.push(
      `/dashboard?start=${selectedRange.start}&end=${selectedRange.end}`,
    );
  }

  return (
    <label className={styles.field}>
      <span className={styles.label}>Selected range</span>
      <select
        className={styles.select}
        value={selectedValue}
        onChange={handleRangeChange}
        aria-label={`Selected range: ${selectedLabel}`}
      >
        {ranges.map((range) => {
          const optionValue = `${range.start}|${range.end}`;

          return (
            <option key={optionValue} value={optionValue}>
              {range.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}
