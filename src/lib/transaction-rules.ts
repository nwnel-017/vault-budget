import "server-only";

// TO DO - reevaluate structure

import { revalidatePath } from "next/cache";
import db from "@/lib/prisma";
import {
  generateCategoryRule,
  updateTransactionRule,
} from "@/lib/category-rules";
import { validateCategoryTransaction } from "@/lib/transaction-validation";
import type { Transaction } from "@/lib/transaction-validation";

export async function associateTranToCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
) {
  // validate transaction and category
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

  // if there is an existing transaction-category association, we will update it
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

  const { validatedCategoryId, validatedTransactionId } = validationResult;

  try {
    await db.transaction.update({
      where: {
        id: validatedTransactionId,
      },
      data: {
        category_id: validatedCategoryId,
        transaction_rule_id: null,
      },
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

// TO DO - make sure matches is incremented in transaction_rule when new transactions are categorized

// TO DO - fix problem
// when we manually categorize a transaction - we also want to find all other uncategorized transactions that match the rule and apply the category to them as well
// when we manually update a transaction category:
//  first retreive all transaction rules for the user and ordered by length of the pattern
//  find the first one that matches
//  if the first match is our current rule (the old rule) - then we need to create a new rule pattern and store
//  if the first match is not our current rule - then we have found a better rule - we dont need to generate a new rule pattern
//    in this case we update the category and use this existing rule id
//    this way - if multiple transactions were incorrectly categorized and all should belong to same category - manually moving each one to a
//    new category does not generate new pattern every time

// update a transaction that is already categorized
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
    // later - review error handling
    // it might be better to throw errors inside this try / catch for better visibility
    // a safe error response will be returned in catch block

    // look up current transaction rule
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

    // get old rule to generate a more specific rule
    const oldPattern = existingTransactionRule.pattern;

    const updatedPattern = updateTransactionRule(
      oldPattern,
      transaction.merchant,
    );

    if (!updatedPattern) {
      return {
        success: false,
        error: "Could not recategorize transaction",
      };
    }

    // 1.) create new transaction rule
    // 2.) update the current transaction to have new category and new rule
    // LATER
    // 3.) lookup transactions for the user with no category assigned yet
    // 4.) apply updatedPattern
    // 5.) update those trans to have newCategoryId and rule id
    await db.$transaction(async (tx) => {
      // check if there is already a rule with our pattern
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

      // only create a new transaction rule if there was not an existing one
      if (!transactionRuleId) {
        console.log("new transaction rule created");
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

// add a new category association to a transaction
export async function addNewTransactionCategory(
  userId: string,
  transactionId: string,
  newCategoryId: string,
  transaction: Transaction,
) {
  // get the new rule pattern
  const rulePattern = generateCategoryRule(transaction.merchant, newCategoryId);

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
      // Load the user's transaction first so ownership is enforced here too.
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

      const remainingRuleUsageCount = await tx.transaction.count({
        where: {
          user_id: validatedUserId,
          transaction_rule_id: currentRuleId,
        },
      });

      // Remove orphaned rules after the current transaction is detached.
      if (remainingRuleUsageCount === 0) {
        await tx.transactionRule.delete({
          where: {
            id: currentRuleId,
          },
        });
      }
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

  // Remove older history so only the rolling one-year window remains.
  await db.transaction.deleteMany({
    where: {
      user_id: userId,
      date_purchased: {
        lt: cutoffDate,
      },
    },
  });
}
