import Link from "next/link";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { requireSession } from "@/lib/auth-helpers";
import Button from "@/app/components/ui/Button";
import DeleteAccountSection from "../account/_components/DeleteAccountSection";
import CancelMembershipForm from "./_components/CancelMembershipForm";
import styles from "./page.module.css";

function getPlan(accountTier: "FREE" | "PREMIUM") {
  if (accountTier === "PREMIUM") {
    return {
      planName: "Premium",
      planDetail: "Your account currently has access to premium membership.",
    };
  }

  return {
    planName: "Free",
    planDetail:
      "Your account is currently on the free plan. Upgrade to unlock premium membership.",
  };
}

export default async function MembershipPage() {
  const sessionResult = await requireSession();
  const userId = sessionResult.session?.user.id;

  if (sessionResult.error || !userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      accountTier: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const { planName, planDetail } = getPlan(user.accountTier);
  const isPremium = user.accountTier === "PREMIUM";

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Membership</h1>
          <p className={styles.description}>
            Review your current account plan and manage membership actions.
          </p>
        </div>

        <div className={styles.summary}>
          <span className={styles.summaryLabel}>Current Plan</span>
          <span className={styles.planName}>{planName}</span>
          <p className={styles.planDetail}>{planDetail}</p>
        </div>

        <div className={styles.actions}>
          {isPremium ? (
            <>
              <CancelMembershipForm />
            </>
          ) : (
            <>
              <Link
                className={styles.secondaryLink}
                href="/settings/membership/upgrade"
              >
                Upgrade to Premium
              </Link>
              <p className={styles.note}>
                Premium membership is billed monthly through Stripe.
                <Link href="/settings/membership/info" className="text-link">
                  Click here to learn more about premium
                </Link>
              </p>
              <DeleteAccountSection />
            </>
          )}

          <Link href="/settings">
            <Button fullWidth type="button">
              Back to Settings
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
