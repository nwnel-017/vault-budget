import styles from "./page.module.css";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { RocketShip } from "@/components/ui/icons/RocketShip";
import PlayIcon from "@/components/ui/icons/PlayIcon";
import { auth } from "@/lib/auth/auth";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className={styles.page}>
      <div className={styles.main} id="landing-page">
        <div className={styles.welcomePanel}>
          <div className={styles.panelContent}>
            <div className={styles.logoHero}>
              <AppLogo />
              <h1 className={styles.heroTitle}>Vaultra</h1>
            </div>
            <div className={styles.appDetails}>
              <div className={styles.detailsText}>
                <div>Keep track of your spending, </div>
                <span className={styles.emphasis}>safely.</span>
              </div>
              <p className={styles.subtitle}>
                Track your spending, set goals, and set money habits - all in
                one place.
              </p>
              <p className={styles.subtitle}>
                Manage your expenses easily - all without connecting to your
                bank account.
              </p>
              {/* <p className={styles.subtitle}>
                {" "}
                and set money habits - all in one place.
              </p> */}
              <div className={styles.heroBtnContainer}>
                <Link href="/signup" className={styles.heroBtn}>
                  <RocketShip />
                  Get Started
                </Link>
                <Link
                  href="#instructions-page"
                  className={styles.heroBtnSecondary}
                >
                  <PlayIcon />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.main} id="instructions-page">
        <div>Instructions</div>
      </div>
    </div>
  );
}
