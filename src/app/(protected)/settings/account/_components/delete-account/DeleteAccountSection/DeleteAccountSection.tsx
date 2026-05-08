"use client";

import { useState } from "react";
import CancellationFeedback from "../CancellationFeedback/CancellationFeedback";
import ConfirmDelete from "../ConfirmDelete/ConfirmDelete";
import styles from "./DeleteAccountSection.module.css";

const MAX_FEEDBACK_LENGTH = 500;

export default function DeleteAccountSection() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [feedback, setFeedback] = useState("");

  function openDeleteFlow() {
    setShowConfirmDelete(false);
    setShowFeedback(true);
  }

  function closeFeedback() {
    setShowFeedback(false);
  }

  function continueToDeleteConfirmation() {
    setShowFeedback(false);
    setShowConfirmDelete(true);
  }

  return (
    <div className={styles.section}>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={openDeleteFlow}
      >
        Delete Account
      </button>
      <p className={styles.warning}>
        This permanently removes your account and app data.
      </p>
      {showFeedback ? (
        <CancellationFeedback
          feedback={feedback}
          maxLength={MAX_FEEDBACK_LENGTH}
          onCancel={closeFeedback}
          onContinue={continueToDeleteConfirmation}
          onChange={setFeedback}
        />
      ) : null}
      {showConfirmDelete ? (
        <ConfirmDelete
          feedback={feedback}
          onCancel={() => setShowConfirmDelete(false)}
        />
      ) : null}
    </div>
  );
}
