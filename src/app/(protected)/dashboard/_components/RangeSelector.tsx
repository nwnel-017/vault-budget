import styles from "./RangeSelector.module.css";
import {
  formatDateInputValue,
  getNextRange,
  getPreviousRange,
  type DateRangeOption,
} from "@/utils/date";
import RangeDropdown from "./RangeDropdown";

type RangeSelectorProps = {
  startDate: Date | null;
  endDate: Date | null;
  selectedLabel: string;
  dateRanges: DateRangeOption[];
};

// TO DO - looks off on medium screen sizes - fix
export default function RangeSelector({
  startDate,
  endDate,
  selectedLabel,
  dateRanges,
}: RangeSelectorProps) {
  if (!startDate || !endDate) {
    return null;
  }

  const selectedStart = formatDateInputValue(startDate);
  const selectedEnd = formatDateInputValue(endDate);
  const selectedValue = `${selectedStart}|${selectedEnd}`;
  const latestRange = dateRanges[0] ?? null;
  const oldestRange = dateRanges[dateRanges.length - 1] ?? null;
  const disablePreviousButton =
    oldestRange !== null &&
    selectedStart === oldestRange.start &&
    selectedEnd === oldestRange.end;
  const disableNextButton =
    latestRange !== null &&
    selectedStart === latestRange.start &&
    selectedEnd === latestRange.end;

  // get range dates for previous and next month buttons
  const previousRange = getPreviousRange(startDate);
  const nextRange = getNextRange(endDate);

  // convert to string
  const previousMonthStart = previousRange.startDate
    ? formatDateInputValue(previousRange.startDate)
    : "";
  const previousMonthEnd = previousRange.endDate
    ? formatDateInputValue(previousRange.endDate)
    : "";
  const nextRangeStart = nextRange.startDate;
  const nextRangeEnd = nextRange.endDate;
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
            <button
              className={styles.button}
              type="submit"
              disabled={disablePreviousButton}
            >
              <span className={styles.buttonArrow} aria-hidden="true">
                &#8249;
              </span>
              {/* <span>Previous</span> */}
            </button>
          </form>
        </div>
        <div className={styles.dropdownWrap}>
          <div className={styles.hamburgerIcon}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <RangeDropdown
            ranges={dateRanges}
            selectedLabel={selectedLabel}
            selectedValue={selectedValue}
          />
        </div>

        <div className={styles.buttonWrap}>
          <form action="/dashboard" method="get">
            <input type="hidden" name="start" value={nextMonthStart} />
            <input type="hidden" name="end" value={nextMonthEnd} />
            <button
              className={styles.button}
              type="submit"
              disabled={disableNextButton}
            >
              <span className={styles.buttonArrow} aria-hidden="true">
                &#8250;
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
