import { start } from "repl";

function isValidDate(value: unknown): value is Date {
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

// TO DO - rewrite function
// take in date object of most recent transaction
// use the value to find the default interval of the most recent month
// the interval will go from the 1st of the month to the last day of the month
export function getDefaultDateRange(mostRecentTransactionDate: Date) {
  if (!mostRecentTransactionDate || !isValidDate(mostRecentTransactionDate)) {
    return { startDate: null, endDate: null };
  }

  const startDate = new Date(
    mostRecentTransactionDate.getFullYear(),
    mostRecentTransactionDate.getMonth(),
    1,
  );
  const endDate = new Date(
    mostRecentTransactionDate.getFullYear(),
    mostRecentTransactionDate.getMonth() + 1,
    0,
  );

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
}

// TO DO - complete function
// this function gets the same day of the previous month
// if the date is invalid, return null
// if the same date of the previous month does not exist (ex: february does not have 31st day) - then return the corresponding day of the month (ex: february 28th)
export function getDatePreviousMonth(date: Date) {
  if (!isValidDate(date)) {
    return null;
  }

  const previousMonthLastDay = new Date(date.getFullYear(), date.getMonth(), 0);

  if (!isValidDate(previousMonthLastDay)) {
    return null;
  }

  const previousMonthDate = new Date(
    date.getFullYear(),
    date.getMonth() - 1,
    Math.min(date.getDate(), previousMonthLastDay.getDate()),
  );

  if (!isValidDate(previousMonthDate)) {
    return null;
  }

  return previousMonthDate;
}

// TO DO - split into these functions:
// getLastDayNextMonth()
// getLastDayLastMonth()
// getFirstDayNextMonth()
// getFirstDayLastMonth()
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

  const lastDayNextMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 2,
    0,
  );

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
