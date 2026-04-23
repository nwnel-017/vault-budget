import Link from "next/link";
import styles from "./WelcomePanel.module.css";

export default function WelcomePanel() {
  return (
    <div className="page">
      <section
        className={styles.panel}
        aria-labelledby="welcome-panel-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Welcome to Budget Vault</span>
          <h1 className={styles.title} id="welcome-panel-title">
            Welcome to Budget Vault
          </h1>
        </div>
        <p className={styles.description}>
          Budget Vault helps you review spending, organize transactions by
          category, and track how much you save during each pay period.
        </p>
        <p className={styles.description}>
          Start with the tutorial to learn how uploads, categories, goals, and
          dashboard summaries work together.
        </p>
        <Link className={styles.tutorialLink} href="/tutorial">
          View Tutorial
        </Link>
      </section>
    </div>
  );
}
