import "server-only";

import {
  formatDateInputValue,
  formatSelectedDateLabel,
  getDateRanges,
  getDefaultDateRange,
  getEndDateExclusive,
  getSelectedDateRange,
  type DateRangeOption,
} from "@/utils/date";
import {
  getDashboardSpendingSummary,
  getSavedHistoryFetchRange,
  getSavedHistoryLastThreeMonths,
} from "@/lib/dashboard/dashboard-calculations";
import {
  getDashboardTransactions,
  getSavingsGoal,
  getSavingsHistoryTransactions,
} from "@/lib/dashboard/dashboard-queries";
import type { SavedHistory } from "@/types/dashboard";

type ResolvedDashboardDateRange = {
  startDate: Date | null;
  endDate: Date | null;
  dateRanges: DateRangeOption[];
  selectedLabel: string;
};

type DashboardViewData = {
  topCategories: ReturnType<
    typeof getDashboardSpendingSummary
  >["topCategories"];
  totalSpent: number;
  totalEarned: number;
  savingsGoalAmount: number | null;
  savedHistory: SavedHistory[];
};

export function resolveDashboardDateRange(
  startDateString: string | null,
  endDateString: string | null,
  latestTransactionDate: Date | null | undefined,
  payPeriodStartDay?: number | null,
): ResolvedDashboardDateRange {
  if (!startDateString || !endDateString) {
    if (!latestTransactionDate) {
      return {
        startDate: null,
        endDate: null,
        dateRanges: [],
        selectedLabel: "",
      };
    }

    const defaultRange = getDefaultDateRange(
      latestTransactionDate,
      payPeriodStartDay,
    );

    if (!defaultRange.startDate || !defaultRange.endDate) {
      return {
        startDate: null,
        endDate: null,
        dateRanges: [],
        selectedLabel: "",
      };
    }

    startDateString = formatDateInputValue(defaultRange.startDate);
    endDateString = formatDateInputValue(defaultRange.endDate);
  }

  const selectedDateRange = getSelectedDateRange(
    startDateString,
    endDateString,
  );
  const startDate = selectedDateRange.startDate;
  const endDate = selectedDateRange.endDate;

  if (!startDate || !endDate) {
    return {
      startDate: null,
      endDate: null,
      dateRanges: [],
      selectedLabel: "",
    };
  }

  return {
    startDate,
    endDate,
    dateRanges: latestTransactionDate
      ? getDateRanges(latestTransactionDate, payPeriodStartDay)
      : [],
    selectedLabel: formatSelectedDateLabel(startDate, endDate),
  };
}

export async function getDashboardViewData(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<DashboardViewData | null> {
  const endDateExclusive = getEndDateExclusive(endDate);

  if (!endDateExclusive) {
    return null;
  }

  const savedHistoryFetchRange = getSavedHistoryFetchRange(startDate, endDate);
  const savingsHistoryTransactionsPromise = savedHistoryFetchRange
    ? getSavingsHistoryTransactions(
        userId,
        savedHistoryFetchRange.oldestStartDateAtMidnight,
        savedHistoryFetchRange.currentEndDateExclusive,
      )
    : Promise.resolve([]);

  const [transactions, savingsGoal, savingsHistoryTransactions] =
    await Promise.all([
      getDashboardTransactions(userId, startDate, endDateExclusive),
      getSavingsGoal(userId),
      savingsHistoryTransactionsPromise,
    ]);

  const { topCategories, totalSpent, totalEarned } =
    getDashboardSpendingSummary(transactions);

  return {
    topCategories,
    totalSpent,
    totalEarned,
    savingsGoalAmount: savingsGoal ? Number(savingsGoal.amount) : null,
    savedHistory: savedHistoryFetchRange
      ? getSavedHistoryLastThreeMonths(
          savingsHistoryTransactions,
          startDate,
          endDate,
        )
      : [],
  };
}
