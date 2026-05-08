import "server-only";

import db from "@/lib/general/prisma";
import { matchTransactionCategory } from "@/lib/transactions/review/category-rules";
import type {
  IncomeSelectionTransaction,
  ParsedTransactionRow,
  SelectedUploadColumns,
} from "@/types/upload-actions";
import type { CategoryRuleMatch } from "@/lib/transactions/review/category-rules";

const FREE_TIER_TRANSACTION_LIMIT =
  Number(process.env.FREE_TIER_TRANSACTION_LIMIT) || 300;

export async function saveUserColumnMappings(
  userId: string,
  selectedColumns: SelectedUploadColumns,
) {
  return db.userColumnMappings.upsert({
    where: {
      user_id: userId,
    },
    create: {
      user_id: userId,
      amount: selectedColumns.amount,
      date_purchased: selectedColumns.transactionDate,
      merchant: selectedColumns.merchantType,
    },
    update: {
      amount: selectedColumns.amount,
      date_purchased: selectedColumns.transactionDate,
      merchant: selectedColumns.merchantType,
    },
  });
}

export async function getUploadUserData(userId: string) {
  const [user, userTransactionRules] = await Promise.all([
    db.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        accountTier: true,
        role: true,
      },
    }),
    db.transactionRule.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        pattern: true,
        category_id: true,
      },
    }),
  ]);

  return {
    user,
    sortedUserTransactionRules: userTransactionRules
      .filter((rule) => rule.pattern)
      .sort((a, b) => b.pattern.length - a.pattern.length),
  };
}

export async function createTransactionsForUpload(
  userId: string,
  parsedRows: ParsedTransactionRow[],
  normalizedFileName: string,
  earliestTransactionDate: Date,
  latestTransactionDate: Date,
  sortedUserTransactionRules: CategoryRuleMatch[],
  user: {
    accountTier: string;
    role: string;
  },
): Promise<{
  createdTransactions: IncomeSelectionTransaction[];
  blockedByFreeTierLimit: number;
}> {
  const { createdTransactions, blockedByFreeTierLimit } = await db.$transaction(
    async (tx) => {
      await tx.$queryRaw`SELECT id FROM "user" WHERE id = ${userId} FOR UPDATE`;

      const fileUpload = await tx.userFileUpload.create({
        data: {
          user_id: userId,
          file_name: normalizedFileName,
          start_date: earliestTransactionDate,
          end_date: latestTransactionDate,
        },
        select: {
          id: true,
        },
      });

      const existingTransactionCount = await tx.transaction.count({
        where: {
          user_id: userId,
        },
      });

      let runningTransactionCount = existingTransactionCount;
      let blockedTransactionCount = 0;

      const createdRows = await tx.transaction.createManyAndReturn({
        data: parsedRows.map((row) => {
          let matchedRule = null;

          if (
            user.role === "ADMIN" ||
            user.accountTier !== "FREE" ||
            runningTransactionCount < FREE_TIER_TRANSACTION_LIMIT
          ) {
            matchedRule = matchTransactionCategory(
              row.merchantType,
              sortedUserTransactionRules,
            );
          } else {
            blockedTransactionCount += 1;
          }

          runningTransactionCount += 1;

          return {
            file_upload_id: fileUpload.id,
            merchant: row.merchantType,
            amount: row.amount,
            date_purchased: row.transactionDate,
            user_id: userId,
            category_id: matchedRule?.category_id ?? null,
            transaction_rule_id: matchedRule?.id ?? null,
          };
        }),
        select: {
          id: true,
          amount: true,
          merchant: true,
          date_purchased: true,
        },
      });

      return {
        createdTransactions: createdRows.map((transaction) => ({
          id: transaction.id,
          amount: transaction.amount.toString(),
          merchant: transaction.merchant,
          date_purchased: transaction.date_purchased.toISOString(),
        })),
        blockedByFreeTierLimit: blockedTransactionCount,
      };
    },
  );

  return {
    createdTransactions,
    blockedByFreeTierLimit,
  };
}
