import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import styles from "./page.module.css";
import PayPeriodSection from "./_components/PayPeriodSection";

function getPayPeriodLabel(day: number | null | undefined) {
  if (
    !day ||
    !Number.isInteger(day) ||
    day === undefined ||
    day < 1 ||
    day > 31
  ) {
    return "Not set";
  }

  const remainder = day % 100;

  if (remainder >= 11 && remainder <= 13) {
    return `${day}th`;
  }

  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

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
                First paycheck is received on the{" "}
                {getPayPeriodLabel(userPayPeriod?.pay_period_start_day)} day of
                the month.
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
              <h2 className={styles.sectionTitle}>Account settings</h2>
              <p className={styles.sectionDescription}>
                Review your email, update your password, or delete your account.
              </p>
            </div>
            <Link className={styles.actionLink} href="/settings/account">
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
