import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";

export async function requireSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { session: null, error: "Unauthorized" };
  }

  return { session, error: null };
}
