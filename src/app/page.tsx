import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import LandingPage from "./_components/landing/LandingPage";

export const metadata: Metadata = {
  title: "FlowVault: Budgeting App Without Bank Linking",
  description:
    "Import bank transaction CSV files, categorize expenses, track spending, and set savings goals with FlowVault—no bank account connection required.",
};

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
