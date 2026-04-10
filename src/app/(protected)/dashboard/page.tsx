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

// TO DO - spending calculation logic is off - we need to investigate
// make sure the same date column (effective date / posting date) are used across all files - could that be the issue?
// we should make the user select effective date
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return null;
  }

  const resolvedSearchParams = await searchParams;

  let startDateString: string | null = null;
  let endDateString: string | null = null;
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  startDateString = getSearchParamValue(resolvedSearchParams.start);
  endDateString = getSearchParamValue(resolvedSearchParams.end);

  if (!startDateString || !endDateString) {
    const defaultRange = getDefaultDateRange();

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
  const transactions = await db.transaction.findMany({
    where: {
      date_purchased: {
        gte: startDate,
        lt: endDateExclusive,
      },
      user_id: userId,
    },
    include: {
      category: true,
    },
    orderBy: {
      date_purchased: "desc",
    },
  });

  const { topCategories, topCategory, totalSpent, totalEarned } =
    getDashboardSpendingSummary(transactions);

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
      />
      <TopCategories categories={topCategories} />
    </div>
  );
}
