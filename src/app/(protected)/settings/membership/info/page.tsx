import Link from "next/link";
import styles from "./page.module.css";

const premiumFeatures = [
  {
    title: "Unlimited categories",
    description:
      "Create unlimited categories to manage and track your expenses.",
  },
  {
    title: "Automated categorization",
    description:
      "Everytime you select a category for a transaction, vault budget learns from your spending and will auto-categorize similar transactions in the future.",
  },
  {
    title: "Spending goals",
    description:
      "Set an overall spending goal or individually for spending categories. See analytics each month on how you have met your goals.",
  },
];

// Reviewed
export default function MembershipInfoPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Premium Membership</h1>
          <p className={styles.description}>
            Premium is designed for users who want more room to manage
            transactions, maintain cleaner categories, and budget with fewer
            limits.
          </p>
        </div>

        <div className={styles.featureList}>
          {premiumFeatures.map((feature) => (
            <article className={styles.featureCard} key={feature.title}>
              <h2 className={styles.featureTitle}>{feature.title}</h2>
              <p className={styles.featureText}>{feature.description}</p>
            </article>
          ))}
        </div>

        <div className={styles.actions}>
          <Link
            className={styles.primaryLink}
            href="/settings/membership/upgrade"
          >
            Upgrade Your Account
          </Link>
          <Link className={styles.secondaryLink} href="/settings/membership">
            Back to Membership
          </Link>
        </div>
      </section>
    </main>
  );
}
