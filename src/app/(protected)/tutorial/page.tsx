import Link from "next/link";
import { APP_NAME } from "@/lib/general/app-name";
import styles from "./page.module.css";

export default function TutorialPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>How to Use {APP_NAME}</h1>
          <p className={styles.description}>
            {APP_NAME} helps you upload transactions, organize them into
            categories, review your spending, and set goals for how you want to
            manage your money each month.
          </p>
        </div>

        <div className={styles.sectionList}>
          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 1</span>
            <h2 className={styles.sectionTitle}>Upload your transactions</h2>
            <p className={styles.sectionText}>
              Go to the add a spreadsheet page and upload a CSV file exported
              from your bank.
            </p>
            <Link className={styles.linkButton} href="/tutorial/csv-export">
              How do I get a spreadsheet?
            </Link>
          </article>

          <article className={styles.sectionCard}>
            <span className={styles.stepLabel}>Step 2</span>
            <h2 className={styles.sectionTitle}>
              Review and categorize your activity
            </h2>
            <p className={styles.sectionText}>
              After upload, review your transactions and assign categories where
              needed. To add a category, visit the categories page and add them
              there. This keeps your spending organized and helps the app apply
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
              View the savings goals page to set your goals for each month. You
              can set goals of how much you want to spend for each category, or
              for the total savings you want to have each month. This gives you
              a simple way to compare your actual spending against the limits
              you want to follow.
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
