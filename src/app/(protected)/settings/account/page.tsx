import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-helpers";
import Button from "@/app/components/ui/Button";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import DeleteAccountSection from "./_components/DeleteAccountSection";
import styles from "./page.module.css";

// Reviewed
export default async function AccountSettingsPage() {
  const sessionResult = await requireSession();
  const user = sessionResult.session?.user;

  if (sessionResult.error || !user?.email) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <p className={styles.description}>
            Review your account details and manage your password or account
            access.
          </p>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Email</h2>
            <p className={styles.sectionDescription}>
              This is the email address currently linked to your account.
            </p>
          </div>
          <p className={styles.emailValue}>{user.email}</p>
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Change password</h2>
            <p className={styles.sectionDescription}>
              Update your password to keep your account secure.
            </p>
          </div>
          <ChangePasswordForm />
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Delete account</h2>
            <p className={styles.sectionDescription}>
              Permanently remove your account and stored app data.
            </p>
          </div>
          <DeleteAccountSection />
        </div>

        <Link href="/settings">
          <Button fullWidth type="button">
            Back to Settings
          </Button>
        </Link>
      </section>
    </main>
  );
}
