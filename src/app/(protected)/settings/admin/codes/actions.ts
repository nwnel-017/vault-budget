"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/auth-helpers";
import db from "@/lib/general/prisma";

const ADMIN_CODES_PATH = "/settings/admin/codes";

export type CreatePremiumCodeState = {
  error: string | null;
  success: string | null;
};

async function requireAdminUser() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/settings");
  }

  return userId;
}

export async function createPremiumCode(
  _currentState: CreatePremiumCodeState,
  formData: FormData,
): Promise<CreatePremiumCodeState> {
  await requireAdminUser();

  const rawCode = formData.get("code");
  const code = typeof rawCode === "string" ? rawCode.trim().toUpperCase() : "";

  if (!code) {
    return {
      error: "Enter a premium access code.",
      success: null,
    };
  }

  try {
    await db.subscriptionPremiumCodes.create({
      data: {
        code,
      },
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return {
        error: "That premium code already exists.",
        success: null,
      };
    }

    return {
      error: "Unable to create premium code right now.",
      success: null,
    };
  }

  revalidatePath(ADMIN_CODES_PATH);

  return {
    error: null,
    success: `Premium code ${code} created.`,
  };
}

export async function deletePremiumCode(formData: FormData) {
  await requireAdminUser();

  const premiumCodeId = formData.get("premium_code_id");

  if (typeof premiumCodeId !== "string" || !premiumCodeId.trim()) {
    return;
  }

  await db.subscriptionPremiumCodes.delete({
    where: {
      id: premiumCodeId,
    },
  });

  revalidatePath(ADMIN_CODES_PATH);
}
