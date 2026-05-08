import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}`,
  secret: `${process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET}`,
  fetchOptions: { credentials: "include" },
});
