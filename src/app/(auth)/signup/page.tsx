import Link from "next/link";
import SignupForm from "../_components/signup-form";
import styles from "../_components/AuthPage.module.css";

export default function Signup() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Signup</h1>
          <p className={styles.description}>
            Create your account to start tracking transactions and savings
            goals.
          </p>
        </div>
        <SignupForm />
        <div className={styles.links}>
          <Link href="/login" className={styles.link}>
            Already have an account?
          </Link>
          <Link href="/" className={styles.link}>
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
