import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import {
  getDashboardSpendingSummary,
  getSavedHistoryLastThreeMonths,
} from "@/lib/dashboard-calculations";
import { setUserPayPeriodBegin } from "../upload/actions";
import {
  getDateRanges,
  formatDateInputValue,
  formatSelectedDateLabel,
  getEndDateExclusive,
  getSelectedDateRange,
  getDefaultDateRange,
  type DateRangeOption,
} from "@/utils/date";
import TopCategories from "./_components/TopCategories";
import DashHeader from "./_components/DashHeader";
import RangeSelector from "./_components/RangeSelector";
import PayPeriodConfig from "./_components/PayPeriodConfig";
import WelcomePanel from "./_components/WelcomePanel";
import styles from "./page.module.css";

function getSearchParamValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

// Reviewed
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

  const resolvedSearchParams = await searchParams;

  let startDateString: string | null = null;
  let endDateString: string | null = null;
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let dateRanges: DateRangeOption[] = [];

  const userPayPeriod = await db.userPayPeriod.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      pay_period_start_day: true,
    },
  });

  if (!userPayPeriod) {
    return <PayPeriodConfig onSelectPayPeriod={setUserPayPeriodBegin} />;
  }

  const latestTransaction = await db.transaction.findFirst({
    where: {
      user_id: userId,
    },
    orderBy: { date_purchased: "desc" },
  });

  startDateString = getSearchParamValue(resolvedSearchParams.start);
  endDateString = getSearchParamValue(resolvedSearchParams.end);

  if (!startDateString || !endDateString) {
    if (!latestTransaction) {
      return <WelcomePanel />;
    }

    const defaultRange = getDefaultDateRange(
      latestTransaction.date_purchased,
      userPayPeriod?.pay_period_start_day,
    );

    if (!defaultRange.startDate || !defaultRange.endDate) {
      return null;
    }

    startDateString = formatDateInputValue(defaultRange.startDate);
    endDateString = formatDateInputValue(defaultRange.endDate);
  }

  const selectedDateRange = getSelectedDateRange(
    startDateString,
    endDateString,
  );
  startDate = selectedDateRange.startDate;
  endDate = selectedDateRange.endDate;

  if (!startDate || !endDate) {
    return null;
  }

  if (!latestTransaction) {
    return <WelcomePanel />;
  }

  dateRanges = getDateRanges(
    latestTransaction.date_purchased,
    userPayPeriod.pay_period_start_day,
  );

  const endDateExclusive = getEndDateExclusive(endDate);
  const selectedLabel = formatSelectedDateLabel(startDate, endDate);

  if (!endDateExclusive) {
    return null;
  }

  const transactions = await db.transaction.findMany({
    where: {
      date_purchased: {
        gte: startDate,
        lt: endDateExclusive,
      },
      user_id: userId,
    },
    include: {
      category: {
        include: {
          goal: {
            select: {
              amount: true,
            },
          },
        },
      },
    },
    orderBy: {
      date_purchased: "desc",
    },
  });

  const { topCategories, totalSpent, totalEarned } =
    getDashboardSpendingSummary(transactions);

  const [savingsGoal, savedHistory] = await Promise.all([
    db.savingsGoal.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        amount: true,
      },
    }),
    getSavedHistoryLastThreeMonths(userId, startDate, endDate),
  ]);
  const savingsGoalAmount = savingsGoal ? Number(savingsGoal.amount) : null;

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
