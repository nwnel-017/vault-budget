"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./FreeTierExpired.module.css";

type FreeTierExpiredProps = {
  active: boolean;
};

export default function FreeTierExpired({ active }: FreeTierExpiredProps) {
  const [isClosed, setIsClosed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function closePanel() {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("freeTierLimitReached");

    const nextQuery = params.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    setIsClosed(true);
    router.replace(nextUrl);
  }

  if (!active || isClosed) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.panel}
        aria-labelledby="free-tier-expired-title"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.header}>
          <span className={styles.eyebrow}>Free Tier Limit Reached</span>
          <h1 className={styles.title} id="free-tier-expired-title">
            You have reached your 300 transaction free tier limit
          </h1>
        </div>

        <p className={styles.description}>
          Your uploaded transactions were saved, but you have used all 300 free
          tier transactions.
        </p>

        <p className={styles.description}>
          Upgrade to premium if you want continued access to premium features.
        </p>

        <div className={styles.actions}>
          <Link
            className={styles.upgradeLink}
            href="/settings/membership/upgrade"
          >
            Upgrade to Premium
          </Link>
          <button
            className={styles.closeButton}
            type="button"
            onClick={closePanel}
          >
            Ok
          </button>
        </div>
      </section>
    </div>
  );
}
