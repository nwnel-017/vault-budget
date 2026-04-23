import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import {
  getDashboardSpendingSummary,
  getSavedHistoryLastThreeMonths,
} from "@/lib/dashboard-calculations";
import { setUserPayPeriodBegin } from "../upload/actions";
import {
  formatDateInputValue,
  formatSelectedDateLabel,
  getEndDateExclusive,
  getSelectedDateRange,
  getDefaultDateRange,
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

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // validate session
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
  const firstTimeUser = getSearchParamValue(resolvedSearchParams.firstTimeUser);
  // const showWelcomePanel = firstTimeUser === "true";

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

  // get interval from search params
  startDateString = getSearchParamValue(resolvedSearchParams.start);
  endDateString = getSearchParamValue(resolvedSearchParams.end);

  if (!startDateString || !endDateString) {
    const latestTransaction = await db.transaction.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: { date_purchased: "desc" },
    });

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

  const endDateExclusive = getEndDateExclusive(endDate);
  const selectedLabel = formatSelectedDateLabel(startDate, endDate);

  if (!endDateExclusive) {
    return null;
  }

  // all transactions and their corresponding categories
  let transactions;
  transactions = await db.transaction.findMany({
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
          goals: {
            select: {
              amount: true,
            },
            take: 1,
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
    <div className="flex-col gap col-center">
      {!userPayPeriod?.pay_period_start_day ? (
        <PayPeriodConfig onSelectPayPeriod={setUserPayPeriodBegin} />
      ) : null}
      <div className={styles.headingBlock}>
        <RangeSelector
          startDate={startDate}
          endDate={endDate}
          selectedLabel={selectedLabel}
        />
      </div>
      <DashHeader
        totalSpent={totalSpent}
        totalEarned={totalEarned}
        topCategories={topCategories}
        savingsGoal={savingsGoalAmount ?? null}
        savedHistory={savedHistory}
      />
      <TopCategories categories={topCategories} />)
    </div>
  );
}
