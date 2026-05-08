import styles from "./page.module.css";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { RocketShip } from "@/components/ui/icons/RocketShip";
import PlayIcon from "@/components/ui/icons/PlayIcon";
import { auth } from "@/lib/auth/auth";
import App from "next/app";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="page">
      <div className={styles.main}>
        <div className={styles.welcomePanel}>
          <div className={styles.panelContent}>
            <div className={styles.logoHero}>
              <AppLogo />
              <h1 className={styles.heroTitle}>Vaultra</h1>
            </div>
            <div className={styles.appDetails}>
              <div className={styles.detailsText}>
                <span>Keep track of your spending, </span>
                <span className={styles.emphasis}>organized.</span>
              </div>
              {/* <div className={styles.subtitle}>
                Track your spending, set goals, and build better money habits -
                all in one place.
              </div> */}
              <div className={styles.heroBtnContainer}>
                <Link href="/signup" className={styles.heroBtn}>
                  <RocketShip />
                  Get Started
                </Link>
                <Link href="/learn-more" className={styles.heroBtnSecondary}>
                  <PlayIcon />
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
