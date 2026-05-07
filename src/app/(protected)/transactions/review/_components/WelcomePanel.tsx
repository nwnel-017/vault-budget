"use client";

import { useState } from "react";
import { APP_NAME } from "@/lib/app-name";
import styles from "./WelcomePanel.module.css";

// Reviewed
export default function WelcomePanel({ active }: { active: boolean }) {
  const [closePanel, setClosePanel] = useState(false);

  if (!active || closePanel) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        aria-labelledby="transactions-welcome-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Welcome</span>
          <h1 className={styles.title} id="transactions-welcome-title">
            Review your uploaded transactions
          </h1>
        </div>
        <p className={styles.description}>
          This page is where you review the transactions you uploaded and place
          them into the right categories. Select the category column to add it
          to a category. Please visit the categories page to add your
          categories.
        </p>
        <p className={styles.description}>
          Each time you put a transaction into a category, {APP_NAME} learns
          that preference so it can auto-categorize similar transactions in the
          future.
        </p>
        <p className={styles.description}>
          <strong>Note:</strong> It is recommended that you review your
          transactions here before uploading more. This way, {APP_NAME} can
          learn your preferences and auto-categorize more of your transactions
          in the future.
        </p>
        <button
          className={styles.closeButton}
          type="button"
          onClick={() => setClosePanel(true)}
        >
          Got it
        </button>
      </section>
    </div>
  );
}
