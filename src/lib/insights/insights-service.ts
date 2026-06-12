import "server-only";

import {
  formatMonthInputValue,
  getDefaultInsightsDateRange,
  getMonthEnd,
  getMonthStart,
  isDateWithinRange,
  parseMonthInputValue,
} from "@/utils/date";

type ResolvedInsightsDateRange = {
  startDate: Date | null;
  endDate: Date | null;
  startMonthValue: string;
  endMonthValue: string;
  minMonthValue: string;
  maxMonthValue: string;
  error: string;
};

export function resolveInsightsDateRange(
  earliestTransactionDate: Date | null,
  latestTransactionDate: Date | null,
  startDateParam: string | null,
  endDateParam: string | null,
): ResolvedInsightsDateRange {
  if (!earliestTransactionDate || !latestTransactionDate) {
    return {
      startDate: null,
      endDate: null,
      startMonthValue: "",
      endMonthValue: "",
      minMonthValue: "",
      maxMonthValue: "",
      error: "",
    };
  }

  const availableStartDate = getMonthStart(earliestTransactionDate);
  const availableEndDate = getMonthEnd(latestTransactionDate);
  const defaultRange = getDefaultInsightsDateRange(latestTransactionDate);

  if (
    !availableStartDate ||
    !availableEndDate ||
    !defaultRange.startDate ||
    !defaultRange.endDate
  ) {
    return {
      startDate: null,
      endDate: null,
      startMonthValue: "",
      endMonthValue: "",
      minMonthValue: "",
      maxMonthValue: "",
      error: "Unable to resolve insights date range.",
    };
  }

  const parsedStartMonth = parseMonthInputValue(startDateParam);
  const parsedEndMonth = parseMonthInputValue(endDateParam);
  const clampedDefaultStartDate =
    defaultRange.startDate < availableStartDate
      ? availableStartDate
      : defaultRange.startDate;

  const minMonthValue = formatMonthInputValue(availableStartDate);
  const maxMonthValue = formatMonthInputValue(availableEndDate);
  let startDate = clampedDefaultStartDate;
  let endDate = defaultRange.endDate;
  let startMonthValue = formatMonthInputValue(clampedDefaultStartDate);
  let endMonthValue = formatMonthInputValue(defaultRange.endDate);
  let error = "";

  if (startDateParam || endDateParam) {
    if (!parsedStartMonth || !parsedEndMonth) {
      error = "Select a valid start and end month.";
    } else if (
      !isDateWithinRange(
        parsedStartMonth.monthStart,
        availableStartDate,
        availableEndDate,
      ) ||
      !isDateWithinRange(
        parsedEndMonth.monthEnd,
        availableStartDate,
        availableEndDate,
      )
    ) {
      error = "Selected months must fall within your transaction history.";
    } else if (parsedStartMonth.monthStart > parsedEndMonth.monthEnd) {
      error = "Start month must be before end month.";
    } else {
      startDate = parsedStartMonth.monthStart;
      endDate = parsedEndMonth.monthEnd;
      startMonthValue = startDateParam ?? startMonthValue;
      endMonthValue = endDateParam ?? endMonthValue;
    }
  }

  return {
    startDate,
    endDate,
    startMonthValue,
    endMonthValue,
    minMonthValue,
    maxMonthValue,
    error,
  };
}
