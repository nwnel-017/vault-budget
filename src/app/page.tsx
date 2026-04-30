import styles from "./page.module.css";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="flex-center">
        <h1>Welcome</h1>
      </div>
      <div className="space-between gap">
        <Link href="login" className="link-btn">
          Login
        </Link>
        <Link href="signup" className="link-btn">
          Signup
        </Link>
      </div>
      <AppLogo />
    </div>
  );
}
