"use client";

import Link from "next/link";
import styles from "./page.module.css";
import { AppLogo } from "@/components/ui/icons/AppLogo";
import { RocketShip } from "@/components/ui/icons/RocketShip";
import PlayIcon from "@/components/ui/icons/PlayIcon";
import Lottie from "lottie-react";
import animationData from "../assets/animations/lottie/call-center-animation.json";
import analyticsAnimationData from "../assets/animations/lottie/analytics.json";
import { APP_NAME } from "@/lib/general/app-name";

export default function LandingPage() {
  const featureCards = [
    {
      title: "Learns your spending habits",
      description: `${APP_NAME} remembers how you categorize transactions so budgeting becomes faster and more automatic over time.`,
    },
    {
      title: "No bank connection required",
      description:
        "Import transaction exports directly from your bank without sharing login credentials or connecting accounts.",
    },
    {
      title: "Build better habits",
      description:
        "Set savings goals and review progress with simple monthly snapshots.",
    },
  ];
  const showcaseCards = [
    {
      title: "Upload your transactions",
      description: "Import a spreadsheet directly from your bank in seconds.",
    },
    {
      title: "Review your spending",
      description: `Create and manage spending categories to track expenses. When you categorize a transaction , ${APP_NAME} learns from your spending and can automatically categorize future spreadsheets`,
    },
    {
      title: "Stay motivated with clear goals",
      description:
        "Keep your budget by setting clear spending goals for each month. ",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.main} id="landing-page">
        <div className={styles.welcomePanel}>
          <div className={styles.panelContent}>
            <div className={styles.logoHero}>
              <AppLogo />
              <h1 className={styles.heroTitle}>{APP_NAME}</h1>
            </div>
            <div className={styles.appDetails}>
              <div className={styles.detailsText}>
                <div>Keep track of your spending, </div>
                <span className={styles.emphasis}>safely.</span>
              </div>
              <p className={styles.subtitle}>
                Track your spending, set goals, and set money habits - all
                without connecting your bank.
              </p>
              <p className={styles.subtitle}></p>
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
        <div className={`${styles.welcomePanel} ${styles.instructionsPanel}`}>
          <div className={styles.instructionsMedia}>
            <div className={styles.animationCard}>
              <Lottie animationData={animationData} loop autoplay />
            </div>
          </div>
          <div className={styles.instructionsContent}>
            <p className={styles.instructionsEyebrow}>Why {APP_NAME}</p>
            <h2 className={styles.instructionsTitle}>
              Track your expenses effortlessly without giving up privacy.
            </h2>
            <p className={styles.instructionsText}>
              {APP_NAME} keeps budgeting simple. Upload your transactions,
              review them quickly, and stay focused on decisions instead of
              spreadsheets.
            </p>
            <div className={styles.featureCardStack}>
              {featureCards.map((card) => (
                <article key={card.title} className={styles.featureCard}>
                  <div className={styles.featureCardAccent}></div>
                  <div className={styles.featureCardBody}>
                    <h3 className={styles.featureCardTitle}>{card.title}</h3>
                    <p className={styles.featureCardText}>{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.finalPage}>
        <div className={`${styles.welcomePanel} ${styles.showcasePanel}`}>
          <div className={styles.showcaseContent}>
            <p className={styles.instructionsEyebrow}>How {APP_NAME} works</p>
            <h2 className={styles.instructionsTitle}>
              A budgeting workflow that stays useful after the first week.
            </h2>
            <p className={styles.instructionsText}>
              {APP_NAME} is designed to help you keep up with budgeting over
              time, not just set it up once. Review transactions, adjust goals,
              and keep your money habits visible in one place.
            </p>
            <div className={styles.showcaseCardGrid}>
              {showcaseCards.map((card) => (
                <article key={card.title} className={styles.showcaseCard}>
                  <h3 className={styles.featureCardTitle}>{card.title}</h3>
                  <p className={styles.featureCardText}>{card.description}</p>
                </article>
              ))}
            </div>
            <Link href="/signup" className={styles.showcaseCta}>
              Start budgeting with {APP_NAME}
            </Link>
          </div>
          <div className={styles.showcaseMedia}>
            <div className={styles.showcaseAnimationSpace}>
              <Lottie animationData={analyticsAnimationData} loop autoplay />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
