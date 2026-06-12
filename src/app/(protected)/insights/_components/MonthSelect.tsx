import styles from "./MonthSelect.module.css";

type MonthSelectProps = {
  startMonth: string;
  endMonth: string;
  minMonth: string;
  maxMonth: string;
};

export default function MonthSelect({
  startMonth,
  endMonth,
  minMonth,
  maxMonth,
}: MonthSelectProps) {
  return (
    <form action="/insights" method="get" className={styles.form}>
      <div className={styles.fieldRow}>
        <label className={styles.field}>
          <span className={styles.label}>Start month</span>
          <input
            className={styles.input}
            type="month"
            name="startDate"
            defaultValue={startMonth}
            min={minMonth}
            max={maxMonth}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>End month</span>
          <input
            className={styles.input}
            type="month"
            name="endDate"
            defaultValue={endMonth}
            min={minMonth}
            max={maxMonth}
            required
          />
        </label>
      </div>

      <div className={styles.actions}>
        <button className={styles.button} type="submit">
          Apply
        </button>
      </div>
    </form>
  );
}
