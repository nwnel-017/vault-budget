import "server-only";

import { revalidatePath } from "next/cache";
import type { PrismaClient } from "@/app/generated/prisma/client";
import db from "@/lib/general/prisma";
import {
  generateCategoryRule,
  updateTransactionRule,
} from "@/lib/transactions/review/category-rules";
import { validateCategoryTransaction } from "@/lib/transactions/review/transaction-validation";
import type { Transaction } from "@/lib/transactions/review/transaction-validation";

export async function cleanupUnusedTransactionRule(
  tx: Pick<PrismaClient, "transaction" | "transactionRule">,
  userId: string,
  transactionRuleId: string | null,
) {
  if (!transactionRuleId || !userId) {
    return;
  }

  const remainingRuleUsageCount = await tx.transaction.count({
    where: {
      user_id: userId,
      transaction_rule_id: transactionRuleId,
    },
  });

  if (remainingRuleUsageCount === 0) {
    await tx.transactionRule.delete({
      where: {
        id: transactionRuleId,
        user_id: userId,
      },
    });
  }
}

export async function cleanupAllUnusedTransactionRules(
  tx: Pick<PrismaClient, "transaction" | "transactionRule">,
  userId: string,
) {
  if (!userId) {
    throw new Error("User ID is required to clean up transaction rules.");
  }

  await tx.transactionRule.deleteMany({
    where: {
      user_id: userId,
      transactions: {
        none: {
          user_id: userId,
        },
      },
    },
  });
}

export async function associateTranToCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
) {
  const validationResult = await validateCategoryTransaction(
    userId,
    transactionId,
    newCategoryId,
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const { transaction, validatedCategoryId, validatedTransactionId } =
    validationResult;

  if (transaction.transaction_rule_id) {
    return updateTransactionCategory(
      userId,
      validatedTransactionId,
      validatedCategoryId,
      transaction,
    );
  }

  // create a new transaction-category association
  return addNewTransactionCategory(
    userId,
    validatedTransactionId,
    validatedCategoryId,
    transaction,
  );
}

export async function changeTransactionCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
) {
  const validationResult = await validateCategoryTransaction(
    userId,
    transactionId,
    newCategoryId,
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const { transaction, validatedCategoryId, validatedTransactionId } =
    validationResult;

  try {
    await db.$transaction(async (tx) => {
      await tx.transaction.update({
        where: {
          id: validatedTransactionId,
        },
        data: {
          category_id: validatedCategoryId,
          transaction_rule_id: null,
        },
      });

      await cleanupUnusedTransactionRule(
        tx,
        userId,
        transaction.transaction_rule_id,
      );
    });

    revalidatePath("/transactions/review");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update transaction category.",
    };
  }
}

export async function updateTransactionCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
  transaction: Transaction,
) {
  if (!transaction.transaction_rule_id) {
    return {
      success: false,
      error: "Transaction does not have an existing transaction rule.",
    };
  }

  try {
    const existingTransactionRule = await db.transactionRule.findFirst({
      where: {
        id: transaction.transaction_rule_id,
        user_id: userId,
      },
      select: {
        id: true,
        pattern: true,
        matches: true,
        category_id: true,
      },
    });

    if (!existingTransactionRule) {
      return {
        success: false,
        error: "Transaction rule not found.",
      };
    }

    if (existingTransactionRule.category_id === newCategoryId) {
      return {
        success: false,
        error: "Matching rule already uses this category.",
      };
    }

    const oldPattern = existingTransactionRule.pattern;

    const updatedPattern = updateTransactionRule(
      oldPattern,
      transaction.merchant,
    );

    if (!updatedPattern) {
      await db.$transaction(async (tx) => {
        await tx.transaction.update({
          where: {
            id: transactionId,
          },
          data: {
            category_id: newCategoryId,
            transaction_rule_id: null,
          },
        });

        await cleanupUnusedTransactionRule(
          tx,
          userId,
          existingTransactionRule.id,
        );
      });

      revalidatePath("/transactions/review");

      return {
        success: true,
        error: null,
      };
    }

    await db.$transaction(async (tx) => {
      // TO DO - fix race condition here
      // if two concurrent requests dont find a transaction rule - they could insert duplicates
      const existingRule = await tx.transactionRule.findFirst({
        where: {
          user_id: userId,
          pattern: updatedPattern,
        },
        select: {
          id: true,
          category_id: true,
        },
      });

      let transactionRuleId = existingRule?.id;

      if (existingRule && existingRule.category_id !== newCategoryId) {
        throw new Error("Rule already exists for a different category.");
      }

      if (!transactionRuleId) {
        const createdRule = await tx.transactionRule.create({
          data: {
            user_id: userId,
            category_id: newCategoryId,
            pattern: updatedPattern,
          },
          select: {
            id: true,
          },
        });

        transactionRuleId = createdRule.id;
      }

      await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          category_id: newCategoryId,
          transaction_rule_id: transactionRuleId,
        },
      });

      await cleanupUnusedTransactionRule(
        tx,
        userId,
        existingTransactionRule.id,
      );

      // i will uncomment later
      // we first need to find an efficient way to increment transaction_rule.matches whenever a new transaction uses a rule
      // either we use matches column or just lookup all transactions using the rule here and delete if there arent any
      // if (existingTransactionRule.matches <= 1) {
      //   await tx.transactionRule.delete({
      //     where: {
      //       id: existingTransactionRule.id,
      //     },
      //   });
      // } else {
      //   await tx.transactionRule.update({
      //     where: {
      //       id: existingTransactionRule.id,
      //     },
      //     data: {
      //       matches: {
      //         decrement: 1,
      //       },
      //       errors: {
      //         increment: 1,
      //       },
      //     },
      //   });
      // }
    });

    revalidatePath("/transactions/review");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to update transaction category.",
    };
  }
}

export async function addNewTransactionCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
  transaction: Transaction,
) {
  const rulePattern = generateCategoryRule(transaction.merchant);

  if (!rulePattern) {
    return {
      success: false,
      error: "Failed to create association",
    };
  }
  try {
    await db.$transaction(async (tx) => {
      const existingRule = await tx.transactionRule.findFirst({
        where: {
          user_id: userId,
          pattern: rulePattern,
        },
        select: {
          id: true,
          category_id: true,
        },
      });

      let transactionRuleId = existingRule?.id;

      if (existingRule && existingRule.category_id !== newCategoryId) {
        throw new Error("Rule already exists for a different category.");
      }

      if (!transactionRuleId) {
        const createdRule = await tx.transactionRule.create({
          data: {
            pattern: rulePattern,
            category_id: newCategoryId,
            user_id: userId,
          },
          select: {
            id: true,
          },
        });

        transactionRuleId = createdRule.id;
      }

      await tx.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          category_id: newCategoryId,
          transaction_rule_id: transactionRuleId,
        },
      });
    });

    revalidatePath("/transactions/review");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to categorize transaction.",
    };
  }
}

export async function removeTransactionCategory(
  userId: string,
  transactionId: string,
) {
  const validatedUserId = String(userId ?? "").trim();
  const validatedTransactionId = String(transactionId ?? "").trim();

  if (!validatedUserId || !validatedTransactionId) {
    return {
      success: false,
      error: "User id and transaction id are required.",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.findFirst({
        where: {
          id: validatedTransactionId,
          user_id: validatedUserId,
        },
        select: {
          id: true,
          category_id: true,
          transaction_rule_id: true,
        },
      });

      if (!transaction) {
        throw new Error("Transaction not found.");
      }

      if (!transaction.category_id) {
        throw new Error("Transaction is already uncategorized.");
      }

      const currentRuleId = transaction.transaction_rule_id;

      // Clear the category and rule link on the selected transaction.
      await tx.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          category_id: null,
          transaction_rule_id: null,
        },
      });

      if (!currentRuleId) {
        return;
      }

      await cleanupUnusedTransactionRule(tx, validatedUserId, currentRuleId);
    });

    revalidatePath("/transactions/review");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to remove transaction category.",
    };
  }
}

export async function cleanupTransactions(
  userId: string,
  latestTransactionDate: Date,
) {
  const cutoffDate = new Date(latestTransactionDate);
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

  await db.transaction.deleteMany({
    where: {
      user_id: userId,
      date_purchased: {
        lt: cutoffDate,
      },
    },
  });
}
