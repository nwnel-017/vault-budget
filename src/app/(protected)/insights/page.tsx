import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/auth-helpers";
import { getUserTransactionDateRange } from "@/lib/dashboard/dashboard-queries";
import { resolveInsightsDateRange } from "@/lib/insights/insights-service";
import { formatFunds } from "@/utils/funds";
import { getSearchParamValue } from "@/utils/search-params";
import { getAverageMonthlySavings } from "@/lib/insights/my-insights";
import MonthSelect from "./_components/MonthSelect";
import styles from "./page.module.css";

type InsightsSearchParams = {
  [key: string]: string | string[] | undefined;
};

type InsightsPageProps = {
  searchParams: Promise<InsightsSearchParams>;
};

export default async function SavingsInsightsPage({
  searchParams,
}: InsightsPageProps) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const transactionDateRange = await getUserTransactionDateRange(userId);
  const resolvedSearchParams = await searchParams;
  const startDateParam = getSearchParamValue(resolvedSearchParams.startDate);
  const endDateParam = getSearchParamValue(resolvedSearchParams.endDate);

  let averageMonthlySavings = 0;
  let error = "";
  let startMonthValue = "";
  let endMonthValue = "";
  let minMonthValue = "";
  let maxMonthValue = "";

  const earliestTransactionDate = transactionDateRange._min.date_purchased;
  const latestTransactionDate = transactionDateRange._max.date_purchased;

  const resolvedDateRange = resolveInsightsDateRange(
    earliestTransactionDate,
    latestTransactionDate,
    startDateParam,
    endDateParam,
  );

  startMonthValue = resolvedDateRange.startMonthValue;
  endMonthValue = resolvedDateRange.endMonthValue;
  minMonthValue = resolvedDateRange.minMonthValue;
  maxMonthValue = resolvedDateRange.maxMonthValue;
  error = resolvedDateRange.error;

  if (resolvedDateRange.startDate && resolvedDateRange.endDate && !error) {
    const result = await getAverageMonthlySavings(
      userId,
      resolvedDateRange.startDate,
      resolvedDateRange.endDate,
    );
    if (result.success) {
      averageMonthlySavings = result.average;
    } else {
      error = result.message;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Savings Insights</h1>
        <h2 className={styles.description}>
          Please select a date range to see your average monthly savings. You
          can choose a range of up to one year.
        </h2>
        <div className={styles.controls}>
          <MonthSelect
            startMonth={startMonthValue}
            endMonth={endMonthValue}
            minMonth={minMonthValue}
            maxMonth={maxMonthValue}
          />
        </div>
        <div className={styles.summary}>
          <span className={styles.label}>Average monthly savings:</span>
          {error ? <p className={styles.error}>{error}</p> : null}
          <span className={styles.amount}>
            {formatFunds(averageMonthlySavings)}
          </span>
        </div>
      </section>
    </main>
  );
}
