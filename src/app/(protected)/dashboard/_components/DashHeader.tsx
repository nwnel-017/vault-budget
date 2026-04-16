"use client";

import { useState } from "react";
import { formatFunds } from "@/utils/funds";
import styles from "./DashHeader.module.css";

type TopCategory = {
  categoryName: string;
  amountSpent: number;
};

export default function DashHeader({
  totalSpent,
  totalEarned,
  topCategory,
  savingsGoal,
}: {
  totalSpent: number;
  totalEarned: number;
  topCategory: TopCategory | null;
  savingsGoal: number | null;
}) {
  const totalSaved = totalEarned + totalSpent;
  const goalDifference = savingsGoal === null ? null : totalSaved - savingsGoal;
  const cards = [
    {
      id: "total-saved",
      content: (
        <div className={styles.totalSavedCard}>
          {goalDifference !== null ? (
            <span
              className={`${styles.goalDifference} ${
                goalDifference > 0 ? styles.aboveGoal : styles.belowGoal
              }`}
            >
              {`${goalDifference >= 0 ? "+" : "-"}${formatFunds(
                Math.abs(goalDifference),
              )} ${goalDifference >= 0 ? "above" : "below"} goal`}
            </span>
          ) : null}
          <span className={styles.totalSavedLabel}>Total Saved</span>
          <span className={styles.totalSavedAmount}>
            {formatFunds(totalSaved)}
          </span>
        </div>
      ),
    },
    {
      id: "total-earned",
      content: `Total earned: ${formatFunds(totalEarned)}`,
    },
    {
      id: "total-spent",
      content: `Total spent: ${formatFunds(totalSpent)}`,
    },
    {
      id: "top-category",
      content: topCategory
        ? `Top category: ${topCategory.categoryName}`
        : "Top category: None",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const isFirstCard = activeIndex === 0;
  const isLastCard = activeIndex === cards.length - 1;

  // TO DO - fix this slop
  return (
    <div className={styles.header}>
      <div className={styles.carouselViewport}>
        <div
          className={`${styles.headerStrip} ${
            activeIndex === 0
              ? styles.shift0
              : activeIndex === 1
                ? styles.shift1
                : activeIndex === 2
                  ? styles.shift2
                  : styles.shift3
          }`}
        >
          {cards.map((card) => (
            <div className={styles.boxContainer} key={card.id}>
              <div className={styles.categoryBox}>{card.content}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        <button
          className={styles.navButton}
          type="button"
          onClick={() => setActiveIndex((currentIndex) => currentIndex - 1)}
          disabled={isFirstCard}
        >
          Previous
        </button>
        <span className={styles.status}>
          {activeIndex + 1} / {cards.length}
        </span>
        <button
          className={styles.navButton}
          type="button"
          onClick={() => setActiveIndex((currentIndex) => currentIndex + 1)}
          disabled={isLastCard}
        >
          Next
        </button>
      </div>
    </div>
  );
}
