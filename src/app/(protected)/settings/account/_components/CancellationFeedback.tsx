"use client";

import Button from "@/app/components/ui/Button";
import styles from "./CancellationFeedback.module.css";

type CancellationFeedbackProps = {
  feedback: string;
  maxLength: number;
  onCancel: () => void;
  onContinue: () => void;
  onChange: (value: string) => void;
};

export default function CancellationFeedback({
  feedback,
  maxLength,
  onCancel,
  onContinue,
  onChange,
}: CancellationFeedbackProps) {
  const remainingCharacters = maxLength - feedback.length;

  return (
    <div className={styles.overlay}>
      <section
        className={styles.modal}
        aria-labelledby="cancellation-feedback-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Cancellation feedback</span>
          <h2 className={styles.title} id="cancellation-feedback-title">
            Tell us why you are cancelling
          </h2>
          <p className={styles.description}>
            Your feedback helps us understand what is not working well.
          </p>
        </div>

        <div className={styles.feedbackSection}>
          <label className={styles.label} htmlFor="cancellation-feedback">
            Feedback
          </label>
          <textarea
            className={styles.textarea}
            id="cancellation-feedback"
            value={feedback}
            maxLength={maxLength}
            onChange={(event) => onChange(event.target.value)}
          />
          <p className={styles.counter}>
            {remainingCharacters} characters remaining
          </p>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <Button fullWidth type="button" onClick={onContinue}>
            Continue
          </Button>
        </div>
      </section>
    </div>
  );
}
