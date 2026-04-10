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

// TO DO - review
export function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 12);

  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
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
