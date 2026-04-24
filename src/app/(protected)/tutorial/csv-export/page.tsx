"use client";

import Link from "next/link";
import styles from "../page.module.css";

const steps = [
  "Log in to your bank's website (desktop is usually easier than mobile).",
  "Navigate to your account activity or transactions page.",
  "Select the account you want (checking, savings, or credit card).",
  "Choose a date range (for example, last month or a custom range).",
  'Look for a button like "Download", "Export", or "Statements".',
  "Select CSV as the file format.",
  "Download the file and upload it here.",
];

export default function CsvExportTutorialPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            How to Download a CSV of Your Transactions
          </h1>
          <p className={styles.description}>
            Most banks let you export transaction history as a CSV file. The
            exact button names may vary, but the general process is usually the
            same.
          </p>
        </div>

        <div className={styles.sectionList}>
          {steps.map((step, index) => (
            <article className={styles.sectionCard} key={step}>
              <span className={styles.stepLabel}>Step {index + 1}</span>
              <p className={styles.sectionText}>{step}</p>
            </article>
          ))}
        </div>

        <div className={styles.tips}>
          <h2 className={styles.tipsTitle}>Helpful note</h2>
          <ul className={styles.tipList}>
            <li>
              Some banks only show the CSV export option on desktop or in the
              full website view.
            </li>
            <li>
              If you do not see CSV, check for export options inside statements
              or account activity tools.
            </li>
            <li>
              When selecting starting and ending dates for your spreadsheet, it
              is important to not select overlapping dates. For example: instead
              of choosing 12/1 to 1/1, choose 12/1 to 12/31. This helps prevent
              duplicate transactions and helps you budget accurately.
            </li>
          </ul>
        </div>

        <div className={styles.links}>
          <Link className={styles.linkButton} href="/upload">
            Go to Upload
          </Link>
          <Link className={styles.linkButton} href="/tutorial">
            Back to Tutorial
          </Link>
        </div>
      </section>
    </main>
  );
}
