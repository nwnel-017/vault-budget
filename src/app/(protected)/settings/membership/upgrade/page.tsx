import UpgradeMembershipForm from "./_components/UpgradeMembershipForm";
import styles from "./_components/UpgradeMembershipForm.module.css";

// Reviewed
function getMonthlyRateLabel() {
  const configuredRate =
    process.env.NEXT_STRIPE_PREMIUM_MEMBERSHIP_RATE ?? "3.99";

  // Show the current premium price on the page until the app stores this
  // in Stripe or the database in a richer format.
  if (!configuredRate) {
    return "$5 / month";
  }

  return `$${configuredRate} / month`;
}

export default function UpgradeMembershipPage() {
  const monthlyRateLabel = getMonthlyRateLabel();

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upgrade Membership</h1>
          <p className={styles.description}>
            Upgrade to premium to unlock full membership features and continue
            growing your budget workflow.
          </p>
        </div>

        <UpgradeMembershipForm monthlyRateLabel={monthlyRateLabel} />
      </section>
    </main>
  );
}
