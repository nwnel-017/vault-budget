import "server-only";

import db from "@/lib/general/prisma";
import { getEndDateExclusive, isValidDate } from "@/utils/date";

type MonthlySavingsRow = {
  monthStart: Date;
  totalSaved: unknown;
};

function getOneYearEarlier(date: Date) {
  if (!date || !isValidDate(date)) {
    return null;
  }
  const previousYearDate = new Date(date);
  previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
  return previousYearDate;
}

function isWithinOneYear(startDate: Date, endDate: Date) {
  const oneYearEarlier = getOneYearEarlier(endDate);
  return oneYearEarlier ? startDate >= oneYearEarlier : false;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthStartsInRange(startDate: Date, endDate: Date) {
  const monthStarts: Date[] = [];
  const currentMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    1,
  );
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (currentMonth <= lastMonth) {
    monthStarts.push(new Date(currentMonth));
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return monthStarts;
}

function validateInsightsRange(startDate: Date, endDate: Date) {
  if (!isValidDate(startDate) || !isValidDate(endDate) || startDate > endDate) {
    return {
      success: false,
      message: "Invalid insights date range.",
    };
  }

  if (!isWithinOneYear(startDate, endDate)) {
    return {
      success: false,
      message: "Insights date range cannot be greater than one year.",
    };
  }

  return {
    success: true,
    message: "",
  };
}

export async function getAverageMonthlySavings(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  const validationResult = validateInsightsRange(startDate, endDate);

  if (!validationResult.success) {
    return {
      success: false,
      average: 0,
      message: validationResult.message,
    };
  }

  const endDateExclusive = getEndDateExclusive(endDate);

  if (!endDateExclusive) {
    return {
      success: false,
      average: 0,
      message: "Invalid insights end date.",
    };
  }
  try {
    const monthlySavingsRows = await db.$queryRaw<MonthlySavingsRow[]>`
    SELECT
      date_trunc('month', "date_purchased") AS "monthStart",
      COALESCE(SUM("amount"), 0) AS "totalSaved"
    FROM "transaction"
    WHERE "user_id" = ${userId}
      AND "date_purchased" >= ${startDate}
      AND "date_purchased" < ${endDateExclusive}
    GROUP BY date_trunc('month', "date_purchased")
    ORDER BY date_trunc('month', "date_purchased") ASC
  `;

    const savingsByMonth = new Map(
      monthlySavingsRows.map((row) => {
        const monthStart = new Date(row.monthStart);
        return [getMonthKey(monthStart), Number(row.totalSaved) || 0] as const;
      }),
    );

    const monthStarts = getMonthStartsInRange(startDate, endDate);

    if (monthStarts.length === 0) {
      return {
        success: true,
        average: 0,
        message: "No months in the specified range.",
      };
    }

    const totalSaved = monthStarts.reduce((runningTotal, monthStart) => {
      return runningTotal + (savingsByMonth.get(getMonthKey(monthStart)) ?? 0);
    }, 0);

    return {
      success: true,
      average: totalSaved / monthStarts.length,
      message: "",
    };
  } catch (error) {
    console.log("Something went wrong retrieving monthly average: " + error);
    return {
      success: false,
      average: 0,
      message: "Error occurred while retrieving monthly average.",
    };
  }
}
