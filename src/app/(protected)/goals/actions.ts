"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";
import { sanitizeFunds } from "@/utils/funds";

export async function changeCategoryGoal(
  categoryId: string,
  amountValue: string,
) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const validatedCategoryId = String(categoryId ?? "").trim();

  if (!validatedCategoryId) {
    return {
      success: false,
      error: "Category id is required.",
    };
  }

  const parsedAmount = Number(amountValue);

  if (!Number.isFinite(parsedAmount) || Number.isNaN(parsedAmount)) {
    return {
      success: false,
      error: "Enter a valid dollar amount.",
    };
  }

  if (parsedAmount < 0) {
    return {
      success: false,
      error: "Goal amount cannot be negative.",
    };
  }

  try {
    const category = await db.category.findFirst({
      where: {
        id: validatedCategoryId,
        user_id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found.",
      };
    }

    await db.categoryGoal.upsert({
      where: {
        category_id: validatedCategoryId,
      },
      update: {
        amount: parsedAmount,
      },
      create: {
        category_id: validatedCategoryId,
        amount: parsedAmount,
      },
    });

    revalidatePath("/goals");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.log("Failed to update category goal:", error);
    return {
      success: false,
      error: "Unable to update goal.",
    };
  }
}

export async function updateSavingsGoal(
  _previousState: { success: boolean; error: string | null },
  formData: FormData,
) {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const rawAmount = formData.get("spendingGoalAmount")?.toString() ?? "";
  const sanitizedAmount = sanitizeFunds(rawAmount);

  if (!sanitizedAmount) {
    return {
      success: false,
      error: "Enter a valid dollar amount.",
    };
  }

  const parsedAmount = Number(sanitizedAmount);

  if (!Number.isFinite(parsedAmount) || Number.isNaN(parsedAmount)) {
    return {
      success: false,
      error: "Enter a valid dollar amount.",
    };
  }

  if (parsedAmount < 0) {
    return {
      success: false,
      error: "Goal amount cannot be negative.",
    };
  }

  try {
    await db.savingsGoal.upsert({
      where: {
        user_id: userId,
      },
      update: {
        amount: parsedAmount,
      },
      create: {
        user_id: userId,
        amount: parsedAmount,
      },
    });

    revalidatePath("/goals");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.log("Failed to update savings goal:", error);
    return {
      success: false,
      error: "Unable to update goal.",
    };
  }
}
