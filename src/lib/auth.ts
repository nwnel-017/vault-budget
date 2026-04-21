import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { nextCookies } from "better-auth/next-js";
import { sendVerificationEmail } from "./email";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    // Send the first verification email right after sign up.
    sendOnSignUp: true,
    // Resend the link if an unverified user tries to sign in.
    sendOnSignIn: true,
    // After verification, Better Auth can create the session for them.
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail({
        to: user.email,
        subject: "Verify your email address",
        text: `Click this link to verify your email: ${url}`,
      });
    },
  },
  providers: [],
  plugins: [nextCookies()],
});
