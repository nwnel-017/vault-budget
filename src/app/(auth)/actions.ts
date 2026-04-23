"use server";

import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

function getAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  if (
    "body" in error &&
    error.body &&
    typeof error.body === "object" &&
    "code" in error.body &&
    typeof error.body.code === "string"
  ) {
    return error.body.code;
  }

  return null;
}

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
        callbackURL: "/dashboard",
      },
    });
    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error("Login error:", error);

    if (getAuthErrorCode(error) === "EMAIL_NOT_VERIFIED") {
      return {
        success: false,
        message:
          "Please verify your email address. A new verification link was sent.",
      };
    }

    return {
      success: false,
      message: "Login failed. Please check your credentials and try again.",
    };
  }
}

export async function signup(email: string, password: string, name: string) {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        callbackURL: "/dashboard?firstTimeUser=true",
      },
    });

    return {
      success: true,
      message:
        "Signup successful. Check your email to verify your account before logging in.",
    };
  } catch (error) {
    console.error("Signup error:", error);
    return { success: false, message: "Signup failed. Please try again." };
  }
}

export async function logout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}
