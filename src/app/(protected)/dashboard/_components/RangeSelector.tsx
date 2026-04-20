import styles from "./RangeSelector.module.css";
import {
  formatDateInputValue,
  getDateNextMonth,
  getDatePreviousMonth,
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
  const previousRangeStart = getDatePreviousMonth(startDate);
  const previousRangeEnd = getDatePreviousMonth(endDate);
  const nextRangeStart = getDateNextMonth(startDate);
  const nextRangeEnd = getDateNextMonth(endDate);

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
      <div className={styles.selector}>
        <div className={styles.buttonWrap}>
          <form action="/dashboard" method="get">
            <input type="hidden" name="start" value={previousMonthStart} />
            <input type="hidden" name="end" value={previousMonthEnd} />
            <button className={styles.button} type="submit">
              <span className={styles.buttonArrow} aria-hidden="true">
                &#8249;
              </span>
              <span className={styles.buttonText}>Previous</span>
            </button>
          </form>
        </div>
        <h3 className={styles.label}>{selectedLabel}</h3>

        <div className={styles.buttonWrap}>
          <form action="/dashboard" method="get">
            <input type="hidden" name="start" value={nextMonthStart} />
            <input type="hidden" name="end" value={nextMonthEnd} />
            <button className={styles.button} type="submit">
              <span className={styles.buttonText}>Next</span>
              <span className={styles.buttonArrow} aria-hidden="true">
                &#8250;
              </span>
            </button>
          </form>
        </div>
      </div>
      {/* <form className={styles.selector} action="/dashboard" method="get">
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
      </form> */}
    </div>
  );
}
