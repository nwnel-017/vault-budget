"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth-helpers";
import db from "@/lib/prisma";

export type DeleteAccountState = {
  error: string | null;
};

const MAX_FEEDBACK_LENGTH = 500;

export async function deleteAccount(
  _currentState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const sessionResult = await requireSession();
  const user = sessionResult.session?.user;

  if (sessionResult.error || !user?.id || !user.email) {
    return {
      error: "You must be logged in to delete your account.",
    };
  }

  const password = formData.get("password");
  const feedbackValue = formData.get("feedback");
  const feedback =
    typeof feedbackValue === "string" ? feedbackValue.trim() : "";

  if (typeof password !== "string" || !password) {
    return {
      error: "Enter your password to delete your account.",
    };
  }

  if (feedback.length > MAX_FEEDBACK_LENGTH) {
    return {
      error: "Feedback must be 500 characters or fewer.",
    };
  }

  try {
    await auth.api.deleteUser({
      headers: await headers(),
      body: {
        password,
      },
    });
  } catch {
    return {
      error: "Account deletion failed. Check your password and try again.",
    };
  }

  if (feedback) {
    try {
      // Keep feedback storage separate so the deleted account is not restored by an insert error.
      await db.userCancelReason.create({
        data: {
          user_id: user.id,
          user_email: user.email,
          reason: feedback,
        },
      });
    } catch (error) {
      console.error("Failed to save cancellation feedback:", error);
    }
  }

  redirect("/login");
}
