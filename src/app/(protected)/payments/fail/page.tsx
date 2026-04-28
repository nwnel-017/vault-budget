import Link from "next/link";
import styles from "./page.module.css";

export default function PaymentFailed() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Payment Failed</h1>
          <p className={styles.description}>
            Your payment could not be completed, so premium membership was not
            activated.
          </p>
        </div>

        <div className={styles.messageBlock}>
          <p className={styles.message}>
            Please try again or review your payment details before submitting
            another payment.
          </p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/settings/membership">
            Back to Membership
          </Link>
        </div>
      </section>
    </main>
  );
}
