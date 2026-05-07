// Reviewed

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

export function formatDateInputValue(date: Date) {
  if (!isValidDate(date)) {
    return "";
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearValue, monthValue, dayValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
}

export function getDate(value: string) {
  try {
    const parsedDate = new Date(value);

    if (!isValidDate(parsedDate)) {
      return null;
    }

    return parsedDate;
  } catch {
    return null;
  }
}

export function getUserFacingDateValue(value: string | Date) {
  const parsedDate = value instanceof Date ? value : getDate(value);

  if (!parsedDate || !isValidDate(parsedDate)) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsedDate);
  } catch {
    return "";
  }
}

export function getDefaultDateRange(
  mostRecentTransactionDate: Date,
  payPeriodStartDay?: number | null,
) {
  if (!mostRecentTransactionDate || !isValidDate(mostRecentTransactionDate)) {
    return { startDate: null, endDate: null };
  }

  let startDate: Date;
  let endDate: Date;

  // if the user does not have a default pay period - use 1st to 31st of month
  if (
    payPeriodStartDay === undefined ||
    payPeriodStartDay === null ||
    !Number.isInteger(payPeriodStartDay) ||
    payPeriodStartDay < 1 ||
    payPeriodStartDay > 31
  ) {
    startDate = new Date(
      mostRecentTransactionDate.getFullYear(),
      mostRecentTransactionDate.getMonth(),
      1,
    );
    endDate = new Date(
      mostRecentTransactionDate.getFullYear(),
      mostRecentTransactionDate.getMonth() + 1,
      0,
    );
  } else {
    // use the most recent completed interval with customized pay period
    const getPeriodStartForMonth = (year: number, month: number) => {
      const lastDay = new Date(year, month + 1, 0).getDate();

      return new Date(year, month, Math.min(payPeriodStartDay, lastDay));
    };

    const getIntervalStart = (date: Date) => {
      const currentMonthStart = getPeriodStartForMonth(
        date.getFullYear(),
        date.getMonth(),
      );

      if (date >= currentMonthStart) {
        return currentMonthStart;
      }

      return getPeriodStartForMonth(date.getFullYear(), date.getMonth() - 1);
    };

    const currentIntervalStart = getIntervalStart(mostRecentTransactionDate);

    endDate = new Date(currentIntervalStart);
    endDate.setDate(currentIntervalStart.getDate() - 1);

    startDate = getIntervalStart(endDate);
  }

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
}

export type DateRangeOption = {
  label: string;
  start: string;
  end: string;
};

export function getDateRanges(
  latestTransactionDate: Date,
  payPeriodStartDay?: number | null,
): DateRangeOption[] {
  if (!latestTransactionDate || !isValidDate(latestTransactionDate)) {
    return [];
  }

  const latestRange = getDefaultDateRange(
    latestTransactionDate,
    payPeriodStartDay,
  );

  if (!latestRange.startDate || !latestRange.endDate) {
    return [];
  }

  const dateRanges: DateRangeOption[] = [];
  let currentStartDate: Date | null = latestRange.startDate;
  let currentEndDate: Date | null = latestRange.endDate;

  // Build the last 12 available intervals for the dropdown.
  for (let index = 0; index < 12; index++) {
    if (!currentStartDate || !currentEndDate) {
      break;
    }

    dateRanges.push({
      label: formatSelectedDateLabel(currentStartDate, currentEndDate),
      start: formatDateInputValue(currentStartDate),
      end: formatDateInputValue(currentEndDate),
    });

    currentStartDate = getDatePreviousMonth(currentStartDate);
    currentEndDate = getDatePreviousMonth(currentEndDate);
  }

  return dateRanges;
}

export function getDatePreviousMonth(date: Date) {
  if (!date || !isValidDate(date)) {
    return null;
  }

  const previousMonthYear =
    date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
  const previousMonth = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
  const previousMonthLastDay = new Date(
    previousMonthYear,
    previousMonth + 1,
    0,
  );

  if (!isValidDate(previousMonthLastDay)) {
    return null;
  }

  const previousMonthDate = new Date(
    previousMonthYear,
    previousMonth,
    Math.min(date.getDate(), previousMonthLastDay.getDate()),
  );

  if (!isValidDate(previousMonthDate)) {
    return null;
  }

  return previousMonthDate;
}

export function getFirstDayNextMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const firstDayNextMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1,
  );

  if (!isValidDate(firstDayNextMonth)) {
    return null;
  }

  return firstDayNextMonth;
}

export function getLastDayNextMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const lastDayNextMonth = new Date(date.getFullYear(), date.getMonth() + 2, 0);

  if (!isValidDate(lastDayNextMonth)) {
    return null;
  }

  return lastDayNextMonth;
}

export function getFirstDayLastMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const firstDayLastMonth = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    1,
  );

  if (!isValidDate(firstDayLastMonth)) {
    return null;
  }

  return firstDayLastMonth;
}

export function getLastDayLastMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const lastDayLastMonth = new Date(date.getFullYear(), date.getMonth(), 0);

  if (!isValidDate(lastDayLastMonth)) {
    return null;
  }

  return lastDayLastMonth;
}

export function getDateNextMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const nextMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 2, 0);

  if (!isValidDate(nextMonthLastDay)) {
    return null;
  }

  const nextMonthDate = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    Math.min(date.getDate(), nextMonthLastDay.getDate()),
  );

  if (!isValidDate(nextMonthDate)) {
    return null;
  }

  return nextMonthDate;
}

export function getPreviousRange(startDate: Date) {
  if (!isValidDate(startDate)) {
    return { startDate: null, endDate: null };
  }

  const previousEndDate = new Date(startDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);

  if (!isValidDate(previousEndDate)) {
    return { startDate: null, endDate: null };
  }

  const previousStartDate = getDatePreviousMonth(startDate);

  if (!previousStartDate) {
    return { startDate: null, endDate: null };
  }

  return {
    startDate: previousStartDate,
    endDate: previousEndDate,
  };
}

export function getNextRange(endDate: Date) {
  if (!isValidDate(endDate)) {
    return { startDate: null, endDate: null };
  }

  const nextStartDate = new Date(endDate);
  nextStartDate.setDate(nextStartDate.getDate() + 1);

  if (!isValidDate(nextStartDate)) {
    return { startDate: null, endDate: null };
  }

  const nextStartMonth = nextStartDate.getMonth();
  const nextStartYear = nextStartDate.getFullYear();
  const nextEndMonthLastDay = new Date(nextStartYear, nextStartMonth + 2, 0);

  if (!isValidDate(nextEndMonthLastDay)) {
    return { startDate: null, endDate: null };
  }

  const nextEndDate = new Date(
    nextStartYear,
    nextStartMonth + 1,
    Math.min(nextStartDate.getDate() - 1, nextEndMonthLastDay.getDate()),
  );

  if (!isValidDate(nextEndDate)) {
    return { startDate: null, endDate: null };
  }

  return {
    startDate: nextStartDate,
    endDate: nextEndDate,
  };
}

export function getSelectedDateRange(
  startDateString: string,
  endDateString: string,
) {
  return {
    startDate: parseDateInputValue(startDateString),
    endDate: parseDateInputValue(endDateString),
  };
}

export function getEndDateExclusive(endDate: Date) {
  if (!isValidDate(endDate)) {
    return null;
  }

  const exclusiveEndDate = new Date(endDate);
  exclusiveEndDate.setDate(exclusiveEndDate.getDate() + 1);

  if (!isValidDate(exclusiveEndDate)) {
    return null;
  }

  return exclusiveEndDate;
}

export function formatSelectedDateLabel(startDate: Date, endDate: Date) {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return "";
  }

  try {
    const dateFormatter = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${dateFormatter.format(startDate)} to ${dateFormatter.format(endDate)}`;
  } catch {
    return "";
  }
}
