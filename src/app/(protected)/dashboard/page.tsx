import { requireSession } from "@/lib/auth/auth-helpers";
import {
  getLatestTransaction,
  getUserPayPeriod,
} from "@/lib/dashboard/dashboard-queries";
import {
  getDashboardViewData,
  resolveDashboardDateRange,
} from "@/lib/dashboard/dashboard-service";
import { setUserPayPeriodBegin } from "../upload/actions";
import TopCategories from "./_components/TopCategories";
import DashHeader from "./_components/DashHeader";
import RangeSelector from "./_components/RangeSelector";
import PayPeriodConfig from "./_components/PayPeriodConfig";
import WelcomePanel from "./_components/WelcomePanel";
import styles from "./page.module.css";

function getSearchParamValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId || sessionResult.error) {
    return null;
  }

  const userPayPeriod = await getUserPayPeriod(userId);

  if (!userPayPeriod) {
    return <PayPeriodConfig onSelectPayPeriod={setUserPayPeriodBegin} />;
  }

  const latestTransaction = await getLatestTransaction(userId);
  const resolvedSearchParams = await searchParams;

  const startDateString = getSearchParamValue(resolvedSearchParams.start);
  const endDateString = getSearchParamValue(resolvedSearchParams.end);

  const { startDate, endDate, dateRanges, selectedLabel } =
    resolveDashboardDateRange(
      startDateString,
      endDateString,
      latestTransaction?.date_purchased,
      userPayPeriod.pay_period_start_day,
    );

  if (!startDateString || !endDateString) {
    if (!latestTransaction) {
      return <WelcomePanel />;
    }
  }

  if (!latestTransaction) {
    return <WelcomePanel />;
  }

  if (!startDate || !endDate) {
    return null;
  }

  const dashboardViewData = await getDashboardViewData(
    userId,
    startDate,
    endDate,
  );

  if (!dashboardViewData) {
    return null;
  }

  const {
    topCategories,
    totalSpent,
    totalEarned,
    savingsGoalAmount,
    savedHistory,
  } = dashboardViewData;

  return (
    <div className="flex-col gap col-center max-width">
      {!userPayPeriod?.pay_period_start_day ? (
        <PayPeriodConfig onSelectPayPeriod={setUserPayPeriodBegin} />
      ) : null}
      <div className={styles.headingBlock}>
        <RangeSelector
          startDate={startDate}
          endDate={endDate}
          selectedLabel={selectedLabel}
          dateRanges={dateRanges}
        />
      </div>
      <DashHeader
        totalSpent={totalSpent}
        totalEarned={totalEarned}
        topCategories={topCategories}
        savingsGoal={savingsGoalAmount ?? null}
        savedHistory={savedHistory}
      />
      <TopCategories categories={topCategories} />
    </div>
  );
}
