import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
//client side instance
export const authClient = createAuthClient({
  //you can pass client configuration here
  baseURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}`,
  secret: `${process.env.NEXT_PUBLIC_BETTER_AUTH_SECRET}`,
  fetchOptions: { credentials: "include" }, // ensure cookies are sent
});
