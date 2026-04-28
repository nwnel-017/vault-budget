"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth-helpers";

export type ChangePasswordState = {
  error: string | null;
  success: string | null;
};

export async function changePassword(
  _currentState: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  const sessionResult = await requireSession();

  if (sessionResult.error) {
    return {
      error: "You must be logged in to change your password.",
      success: null,
    };
  }

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");

  if (typeof currentPassword !== "string" || !currentPassword) {
    return {
      error: "Enter your current password.",
      success: null,
    };
  }

  if (typeof newPassword !== "string" || !newPassword) {
    return {
      error: "Enter a new password.",
      success: null,
    };
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      },
    });
  } catch (error) {
    console.log(
      error instanceof Error ? error.message : "Something went wrong!",
    );
    return {
      error: "Unable to change password right now.",
      success: null,
    };
  }

  return {
    error: null,
    success: "Password updated successfully.",
  };
}
