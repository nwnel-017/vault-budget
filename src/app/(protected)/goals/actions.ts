"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";

// TO DO - review
// fix errors
export async function changeCategoryGoal(
  categoryId: string,
  amountValue: string,
) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
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

  const userId = sessionResult.session?.user.id;

  if (!userId) {
    return {
      success: false,
      error: "Missing user id in session",
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
  } catch {
    return {
      success: false,
      error: "Unable to update goal.",
    };
  }
}
