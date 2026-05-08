"use client";

import { useState } from "react";
import styles from "./FreeTrialNotice.module.css";

type FreeTrialNoticeProps = {
  active: boolean;
};

export default function FreeTrialNotice({ active }: FreeTrialNoticeProps) {
  const [isClosed, setIsClosed] = useState(false);

  if (!active || isClosed) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        aria-labelledby="free-trial-notice-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Premium Access</span>
          <h1 className={styles.title} id="free-trial-notice-title">
            Thank you for choosing Budget Vault
          </h1>
        </div>

        <p className={styles.description}>
          You now have access to premium features for your first 300
          transactions.
        </p>

        <p className={styles.description}>
          With premium, your transactions can be automatically categorized for
          you, and you can create unlimited categories.
        </p>

        <button
          className={styles.closeButton}
          type="button"
          onClick={() => setIsClosed(true)}
        >
          Close
        </button>
      </section>
    </div>
  );
}
