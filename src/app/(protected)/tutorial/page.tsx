import Link from "next/link";
import styles from "./page.module.css";

export default function TutorialPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>How to Use Budget Vault</h1>
          <p className={styles.description}>
            Budget Vault helps you upload transactions, organize them into
            categories, review your spending, and set goals for how you want to
            manage your money each month.
          </p>
        </div>

        <div className={styles.sectionList}>
          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 1</span>
            <h2 className={styles.sectionTitle}>Upload your transactions</h2>
            <p className={styles.sectionText}>
              Go to Upload and import a spreadsheet from your bank.
            </p>
            <Link className={styles.linkButton} href="/upload">
              How do I get a spreadsheet from my bank?
            </Link>
          </article>

          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 2</span>
            <h2 className={styles.sectionTitle}>
              Review and categorize your activity
            </h2>
            <p className={styles.sectionText}>
              After upload, review your transactions and assign categories where
              needed. This keeps your spending organized and helps the app apply
              better category matches in the future.
            </p>
          </article>

          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 3</span>
            <h2 className={styles.sectionTitle}>Use the dashboard</h2>
            <p className={styles.sectionText}>
              Open the Dashboard to see how much you spent, earned, and saved in
              the selected date range. Use the date controls to move between
              periods and compare your recent financial activity.
            </p>
          </article>

          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 4</span>
            <h2 className={styles.sectionTitle}>
              Set savings and category goals
            </h2>
            <p className={styles.sectionText}>
              Visit Goals to set a monthly savings target and optional spending
              goals for each category. This gives you a simple way to compare
              your actual spending against the limits you want to follow.
            </p>
          </article>
        </div>

        <div className={styles.tips}>
          <h2 className={styles.tipsTitle}>Helpful tips</h2>
          <ul className={styles.tipList}>
            <li>
              Do not upload overlapping date ranges, or you may create
              duplicates.
            </li>
            <li>
              Review uncategorized transactions regularly to keep reports
              accurate.
            </li>
            <li>
              Your dashboard results depend on the selected date range and pay
              period start.
            </li>
          </ul>
        </div>

        <div className={styles.links}>
          <Link className={styles.linkButton} href="/upload">
            Go to Upload
          </Link>
          <Link className={styles.linkButton} href="/transactions/review">
            Review Transactions
          </Link>
          <Link className={styles.linkButton} href="/dashboard">
            Open Dashboard
          </Link>
          <Link className={styles.linkButton} href="/goals">
            View Goals
          </Link>
        </div>
      </section>
    </main>
  );
}
