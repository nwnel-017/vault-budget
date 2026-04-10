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
}: {
  totalSpent: number;
  totalEarned: number;
  topCategory: TopCategory | null;
}) {
  const cards = [
    `Total Saved: ${formatFunds(totalEarned + totalSpent)}`,
    `Total earned: ${formatFunds(totalEarned)}`,
    `Total spent: ${formatFunds(totalSpent)}`,
    topCategory
      ? `Top category: ${topCategory.categoryName} (${formatFunds(topCategory.amountSpent)})`
      : "Top category: None",
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const isFirstCard = activeIndex === 0;
  const isLastCard = activeIndex === cards.length - 1;

  return (
    <div className={styles.header}>
      <div className={styles.carouselViewport}>
        <div
          className={styles.headerStrip}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {cards.map((card) => (
            <div className={styles.boxContainer} key={card}>
              <div className={styles.categoryBox}>{card}</div>
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
