import Link from "next/link";
import styles from "./page.module.css";

export default function PaymentCancelled() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Payment Cancelled</h1>
          <p className={styles.description}>
            Your payment was cancelled before checkout was completed.
          </p>
        </div>

        <div className={styles.messageBlock}>
          <p className={styles.message}>
            No premium membership charge was made. You can return when you are
            ready to upgrade.
          </p>
        </div>

        <div className={styles.actions}>
          <Link
            className={styles.primaryLink}
            href="/settings/membership/upgrade"
          >
            Upgrade Again
          </Link>
          <Link className={styles.secondaryLink} href="/settings/membership">
            Back to Membership
          </Link>
        </div>
      </section>
    </main>
  );
}
