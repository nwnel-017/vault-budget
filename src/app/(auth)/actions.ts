"use server";

import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
    });

    // if (result) {
    //   throw new Error(result.error.message);
    // }

    // On successful login, redirect to dashboard or home
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function signup(email: string, password: string, name: string) {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    });

    // if (result.error) {
    //   throw new Error(result.error.message);
    // }

    // On successful signup, redirect to login or home
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
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
