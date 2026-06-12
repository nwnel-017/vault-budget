import { Suspense } from "react";
import { requireSession } from "@/lib/auth/auth-helpers";
import {
  getLatestTransaction,
  getUserPayPeriod,
} from "@/lib/dashboard/dashboard-queries";
import {
  getDashboardViewData,
  resolveDashboardDateRange,
} from "@/lib/dashboard/dashboard-service";
import { getSearchParamValue } from "@/utils/search-params";
import { setUserPayPeriodBegin } from "../upload/actions";
import TopCategories from "./_components/categories/TopCategories/TopCategories";
import RangeSelector from "./_components/date-range/RangeSelector/RangeSelector";
import PayPeriodConfig from "./_components/setup/PayPeriodConfig/PayPeriodConfig";
import WelcomePanel from "./_components/setup/WelcomePanel/WelcomePanel";
import DashHeader from "./_components/summary/DashHeader/DashHeader";
import LoadingSkeleton from "./_components/LoadingSkeleton";
import styles from "./page.module.css";

type DashboardSearchParams = {
  [key: string]: string | string[] | undefined;
};

type DashboardProps = {
  searchParams: Promise<DashboardSearchParams>;
};

async function DashboardContent({
  searchParams,
}: DashboardProps) {
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
    <div className={styles.pageContainer}>
      {!userPayPeriod?.pay_period_start_day ? (
        <PayPeriodConfig onSelectPayPeriod={setUserPayPeriodBegin} />
      ) : null}
      <div className={styles.contentColumn}>
        <div className={styles.headingBlock}>
          <RangeSelector
            startDate={startDate}
            endDate={endDate}
            selectedLabel={selectedLabel}
            dateRanges={dateRanges}
          />
        </div>
      </div>
      <DashHeader
        totalSpent={totalSpent}
        totalEarned={totalEarned}
        topCategories={topCategories}
        savingsGoal={savingsGoalAmount ?? null}
        savedHistory={savedHistory}
      />
      <div className={styles.contentColumn}>
        <TopCategories categories={topCategories} />
      </div>
    </div>
  );
}

export default function Dashboard({ searchParams }: DashboardProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
