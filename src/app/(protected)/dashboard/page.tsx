import db from "../../../lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import { getDashboardSpendingSummary } from "@/lib/dashboard-calculations";
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
import styles from "./page.module.css";

function getSearchParamValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}

// TO DO - spending calculation logic is off? - we need to investigate
// Review logic
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

  // get interval from search params
  startDateString = getSearchParamValue(resolvedSearchParams.start);
  endDateString = getSearchParamValue(resolvedSearchParams.end);

  // TO DO - we want the default range to be the 1st to 31st of the last month of data
  // if there are no start date or end date - look up date of last transaction
  // call helper function to get month date range
  if (!startDateString || !endDateString) {
    const latestTransaction = await db.transaction.findFirst({
      where: {
        user_id: userId,
      },
      orderBy: { date_purchased: "desc" },
    });
    const userPayPeriod = await db.userPayPeriod.findUnique({
      where: {
        user_id: userId,
      },
      select: {
        pay_period_start_day: true,
      },
    });

    if (!latestTransaction) {
      return null;
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
  // TO DO - cache this and only recalculate with start / end dates
  let transactions;
  if (startDateString && endDateString) {
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
  } else {
    // no start and end date values were given
    // we will retrieve transactions for the 1st to 31st of the last month of data
    // TO DO - fetch the last month of transactions
    // 1.) fetch latest transaction date
    // 2.) call getdefaultValue() to get the date interval - 1st to 31st of last month
    // fetch transaction between these bounds
    transactions = await db.transaction.findMany({
      where: {
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
  }

  const { topCategories, topCategory, totalSpent, totalEarned } =
    getDashboardSpendingSummary(transactions);

  const savingsGoal = await db.savingsGoal.findFirst({
    where: {
      user_id: userId,
    },
    select: {
      amount: true,
    },
  });

  const savingsGoalAmount = savingsGoal ? Number(savingsGoal.amount) : null;

  return (
    <div>
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
        topCategory={topCategory}
        savingsGoal={savingsGoalAmount ?? null}
      />
      <TopCategories categories={topCategories} />
    </div>
  );
}
