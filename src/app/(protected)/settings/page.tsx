import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import styles from "./page.module.css";
import PayPeriodSection from "./_components/PayPeriodSection";

export default async function Settings() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const userPayPeriod = await db.userPayPeriod.findUnique({
    where: {
      user_id: userId,
    },
    select: {
      pay_period_start_day: true,
    },
  });

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Settings</h1>

        <div className={styles.sectionList}>
          <div className={styles.sectionCard}>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Pay Period Start</h2>
              <p className={styles.sectionDescription}>
                Current day: {userPayPeriod?.pay_period_start_day ?? "Not set"}.
                Review or update the day your monthly pay period begins.
              </p>
            </div>
            <PayPeriodSection
              currentPayPeriodStartDay={
                userPayPeriod?.pay_period_start_day ?? null
              }
            />
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Change password</h2>
              <p className={styles.sectionDescription}>
                Update your password to keep your account secure.
              </p>
            </div>
            <Link className={styles.actionLink} href="/settings">
              Manage
            </Link>
          </div>

          <div className={styles.sectionCard}>
            <div className={styles.sectionContent}>
              <h2 className={styles.sectionTitle}>Membership</h2>
              <p className={styles.sectionDescription}>
                Review your current plan and manage premium membership options.
              </p>
            </div>
            <Link className={styles.actionLink} href="/settings/membership">
              Manage
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
