import Link from "next/link";
import { redirect } from "next/navigation";
import Button from "@/app/components/ui/Button";
import { requireSession } from "@/lib/auth/auth-helpers";
import db from "@/lib/general/prisma";
import { deletePremiumCode } from "./actions";
import CreatePremiumCodeForm from "./_components/CreatePremiumCodeForm";
import styles from "./page.module.css";

function formatOptionalDate(date: Date | null) {
  if (!date) {
    return "No expiry";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default async function AdminPremiumCodesPage() {
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
      role: true,
    },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/settings");
  }

  const premiumCodes = await db.subscriptionPremiumCodes.findMany({
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      code: true,
      is_active: true,
      expires_at: true,
      created_at: true,
    },
  });
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Premium Codes</h1>
          <p className={styles.description}>
            Create and remove premium access codes available only to admins.
          </p>
        </div>

        <div className={styles.formCard}>
          <h2>Add a New Code</h2>
          <CreatePremiumCodeForm />
        </div>

        <div className={styles.codesSection}>
          <h2>Existing Codes</h2>

          {premiumCodes.length ? (
            <div className={styles.codesList}>
              {premiumCodes.map((premiumCode) => (
                <article className={styles.codeCard} key={premiumCode.id}>
                  <div className={styles.codeDetails}>
                    <p className={styles.codeValue}>{premiumCode.code}</p>
                    <div className={styles.metaList}>
                      <p className={styles.metaItem}>
                        <span className={styles.metaLabel}>Status:</span>{" "}
                        {premiumCode.is_active ? "Active" : "Inactive"}
                      </p>
                      <p className={styles.metaItem}>
                        <span className={styles.metaLabel}>Expires:</span>{" "}
                        {formatOptionalDate(premiumCode.expires_at)}
                      </p>

                      <p className={styles.metaItem}>
                        <span className={styles.metaLabel}>Created:</span>{" "}
                        {formatOptionalDate(premiumCode.created_at)}
                      </p>
                    </div>
                  </div>

                  <form action={deletePremiumCode}>
                    <input
                      name="premium_code_id"
                      type="hidden"
                      value={premiumCode.id}
                    />
                    <Button type="submit" fullWidth>
                      Remove Code
                    </Button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>
              No premium codes have been created yet.
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/settings">
            Back to Settings
          </Link>
        </div>
      </section>
    </main>
  );
}
