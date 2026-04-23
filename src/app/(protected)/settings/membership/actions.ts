"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/auth-helpers";

export type DeleteAccountState = {
  error: string | null;
};

export async function deleteAccount(
  _currentState: DeleteAccountState,
  formData: FormData,
): Promise<DeleteAccountState> {
  const sessionResult = await requireSession();

  if (sessionResult.error || !sessionResult.session?.user.id) {
    return {
      error: "You must be logged in to delete your account.",
    };
  }

  const password = formData.get("password");

  if (typeof password !== "string" || !password) {
    return {
      error: "Enter your password to delete your account.",
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

  redirect("/login");
}
