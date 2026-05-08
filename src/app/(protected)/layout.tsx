import { auth } from "../../lib/auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NavBar from "@/components/nav-bar";
import styles from "./layout.module.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className={styles.layout}>
      <NavBar />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
