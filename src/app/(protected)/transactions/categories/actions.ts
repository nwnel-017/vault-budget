"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@/app/generated/prisma/client";
import { requireSession } from "@/lib/auth/auth-helpers";
import db from "@/lib/general/prisma";
import { sanitizeTextInput } from "@/utils/transactions";

// TO DO - refactor
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
      error: "Category name contains invalid characters.",
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
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "You already have a category with this name.",
      };
    }

    return {
      success: false,
      error: "Unable to create category.",
    };
  }
}

export async function deleteCategory(categoryId: string) {
  const sessionResult = await requireSession();
  const userId = sessionResult?.session?.user.id;

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

export async function editCategoryName(
  categoryId: string,
  categoryName: string,
) {
  const sessionResult = await requireSession();
  const userId = sessionResult?.session?.user.id;

  if (sessionResult.error || !userId) {
    return {
      success: false,
      error: sessionResult.error,
    };
  }

  const validatedCategoryId = String(categoryId ?? "").trim();
  const trimmedCategoryName = String(categoryName ?? "").trim();
  const sanitizedCategoryName = sanitizeTextInput(trimmedCategoryName);

  if (!validatedCategoryId) {
    return {
      success: false,
      error: "Category id is required.",
    };
  }

  if (!trimmedCategoryName) {
    return {
      success: false,
      error: "Category name is required.",
    };
  }

  if (!sanitizedCategoryName) {
    return {
      success: false,
      error: "Invalid category name",
    };
  }

  if (sanitizedCategoryName !== trimmedCategoryName) {
    return {
      success: false,
      error: "Category name contains invalid characters.",
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

    await db.category.update({
      where: {
        id: validatedCategoryId,
      },
      data: {
        category_name: sanitizedCategoryName,
      },
    });

    revalidatePath("/transactions/categories");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        error: "You already have a category with this name.",
      };
    }

    return {
      success: false,
      error: "Unable to update category name.",
    };
  }
}
