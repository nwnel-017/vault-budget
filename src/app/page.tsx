import styles from "./page.module.css";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { auth } from "@/lib/auth";
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
            <AppLogo />
            {/* <div className={styles.textWrap}> */}
            <h1 className={styles.heroTitle}>Vaultra</h1>
            <div className={styles.subtitle}>Keep track of your spending</div>
            {/* <button className={styles.heroBtn}>Get Started</button>
            <button className={styles.heroBtnSecondary}>Learn More</button> */}
            {/* </div> */}
          </div>
        </div>
        <div className={styles.heroBtnContainer}>
          <Link href="/signup" className={styles.heroBtn}>
            Get Started
          </Link>
          <Link href="/learn-more" className={styles.heroBtnSecondary}>
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}
