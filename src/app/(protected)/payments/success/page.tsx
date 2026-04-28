import Link from "next/link";
import styles from "./page.module.css";

export default function PaymentSuccess() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Premium</h1>
          <p className={styles.description}>
            Thanks for joining premium. Your payment was successful.
          </p>
        </div>

        <div className={styles.messageBlock}>
          <p className={styles.message}>
            Your account is ready to use with premium membership features.
          </p>
        </div>

        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
