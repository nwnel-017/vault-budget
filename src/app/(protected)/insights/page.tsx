import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/auth-helpers";
import { getLatestTransaction } from "@/lib/dashboard/dashboard-queries";
import { formatFunds } from "@/utils/funds";
import { getAverageMonthlySavings } from "@/lib/insights/my-insights";
import styles from "./page.module.css";

function getOneYearEarlier(date: Date) {
  const previousYearDate = new Date(date);
  previousYearDate.setFullYear(previousYearDate.getFullYear() - 1);
  return previousYearDate;
}

export default async function SavingsInsightsPage() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const latestTransaction = await getLatestTransaction(userId);

  let averageMonthlySavings = 0;

  if (latestTransaction?.date_purchased) {
    const endDate = latestTransaction.date_purchased;
    const startDate = getOneYearEarlier(endDate);

    averageMonthlySavings = await getAverageMonthlySavings(
      userId,
      startDate,
      endDate,
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <h1 className={styles.title}>Savings Insights</h1>
        <div className={styles.summary}>
          <span className={styles.label}>Average monthly savings:</span>
          <span className={styles.amount}>
            {formatFunds(averageMonthlySavings)}
          </span>
        </div>
      </section>
    </main>
  );
}
