import styles from "./RangeSelector.module.css";
import {
  formatDateInputValue,
  getFirstDayLastMonth,
  getFirstDayNextMonth,
  getLastDayLastMonth,
  getLastDayNextMonth,
} from "@/utils/date";

type RangeSelectorProps = {
  startDate: Date | null;
  endDate: Date | null;
  selectedLabel: string;
};

export default function RangeSelector({
  startDate,
  endDate,
  selectedLabel,
}: RangeSelectorProps) {
  if (!startDate || !endDate) {
    return null;
  }

  // get range dates for previous and next month buttons
  const previousRangeStart = getFirstDayLastMonth(startDate);
  const previousRangeEnd = getLastDayLastMonth(endDate);
  const nextRangeStart = getFirstDayNextMonth(startDate);
  const nextRangeEnd = getLastDayNextMonth(endDate);

  // convert to string
  const previousMonthStart = previousRangeStart
    ? formatDateInputValue(previousRangeStart)
    : "";
  const previousMonthEnd = previousRangeEnd
    ? formatDateInputValue(previousRangeEnd)
    : "";
  const nextMonthStart = nextRangeStart
    ? formatDateInputValue(nextRangeStart)
    : "";
  const nextMonthEnd = nextRangeEnd ? formatDateInputValue(nextRangeEnd) : "";

  return (
    <div className={styles.rangeCard}>
      <h1>Spending results for {selectedLabel}</h1>
      <div className={styles.selector}>
        <form action="/dashboard" method="get">
          <input type="hidden" name="start" value={previousMonthStart} />
          <input type="hidden" name="end" value={previousMonthEnd} />
          <button className={styles.button} type="submit">
            Previous month
          </button>
        </form>
        <form action="/dashboard" method="get">
          <input type="hidden" name="start" value={nextMonthStart} />
          <input type="hidden" name="end" value={nextMonthEnd} />
          <button className={styles.button} type="submit">
            Next month
          </button>
        </form>
      </div>
      <form className={styles.selector} action="/dashboard" method="get">
        <label className={styles.field}>
          <span>Start date</span>
          <input
            className={styles.input}
            type="date"
            name="start"
            defaultValue={formatDateInputValue(startDate)}
            max={formatDateInputValue(endDate)}
            required
          />
        </label>
        <label className={styles.field}>
          <span>End date</span>
          <input
            className={styles.input}
            type="date"
            name="end"
            defaultValue={formatDateInputValue(endDate)}
            min={formatDateInputValue(startDate)}
            required
          />
        </label>
        <button className={styles.button} type="submit">
          Apply range
        </button>
      </form>
    </div>
  );
}
