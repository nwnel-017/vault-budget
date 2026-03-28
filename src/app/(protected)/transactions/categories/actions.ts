"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";
import { sanitizeTextInput } from "@/utils/transactions";

export async function createCategory(category: string) {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const categoryName = String(category ?? "").trim();
  const sanitizedCategory = sanitizeTextInput(categoryName);

  if (!sanitizedCategory) {
    return { success: false, error: "Invalid category name" };
  }

  if (!categoryName) {
    return {
      success: false,
      error: "Category name is required.",
    };
  }

  if (sanitizedCategory !== categoryName) {
    return {
      success: false,
      error:
        "Category name contains invalid characters. Use only letters, numbers, spaces, and hyphens.",
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
    await db.category.create({
      data: {
        category_name: sanitizedCategory,
        user_id: userId,
      },
    });

    revalidatePath("/transactions/categories");

    return {
      success: true,
      error: null,
    };
  } catch {
    return {
      success: false,
      error: "Unable to create category.",
    };
  }
}

export async function deleteCategory(categoryId: string) {
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
    });

    if (!category) {
      return {
        success: false,
        error: "Category not found.",
      };
    }

    await db.category.delete({
      where: {
        id: validatedCategoryId,
      },
    });

    revalidatePath("/transactions/categories");

    return {
      success: true,
      error: null,
    };
  } catch {
    return {
      success: false,
      error: "Unable to delete category.",
    };
  }
}
