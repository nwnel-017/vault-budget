import Link from "next/link";
import LoginForm from "../_components/login-form";
import styles from "../_components/AuthPage.module.css";

export default function Login() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Login</h1>
          <p className={styles.description}>
            Sign in to review spending, upload transactions, and manage your
            budget.
          </p>
        </div>
        <LoginForm />
        <div className={styles.links}>
          <Link href="/signup" className={styles.link}>
            Create account
          </Link>
          <Link href="/" className={styles.link}>
            Home
          </Link>
        </div>
      </section>
    </main>
  );
}
