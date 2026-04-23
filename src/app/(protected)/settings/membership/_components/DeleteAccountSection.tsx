"use client";

import { useState } from "react";
import ConfirmDelete from "./ConfirmDelete";
import styles from "./DeleteAccountSection.module.css";

export default function DeleteAccountSection() {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  return (
    <div className={styles.section}>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={() => setShowConfirmDelete(true)}
      >
        Delete Account
      </button>
      <p className={styles.warning}>
        This permanently removes your account and app data.
      </p>

      {showConfirmDelete ? (
        <ConfirmDelete onCancel={() => setShowConfirmDelete(false)} />
      ) : null}
    </div>
  );
}
