"use client";

import { useState } from "react";
import { formatFunds } from "@/utils/funds";
import styles from "./DashHeader.module.css";
import ArrowDown from "@/app/components/ui/ArrowDown";
import ArrowUp from "@/app/components/ui/ArrowUp";
import type { SavedHistory } from "@/types/dashboard";
import CategorySpendingChart from "./CategorySpendingChart";
import SavedHistoryChart from "./SavedHistoryChart";

type CategorySpending = {
  id: string;
  categoryName: string;
  totalSpent: number;
};

// reviewed
export default function DashHeader({
  totalSpent,
  totalEarned,
  topCategories,
  savingsGoal,
  savedHistory,
}: {
  totalSpent: number;
  totalEarned: number;
  topCategories: CategorySpending[];
  savingsGoal: number | null;
  savedHistory: SavedHistory[];
}) {
  const totalSaved = totalEarned + totalSpent;
  const goalDifference = savingsGoal === null ? null : totalSaved - savingsGoal;

  const cards = [
    {
      id: "total-saved",
      content: (
        <div className={styles.totalSavedCard}>
          <div className={styles.savingsDetail}>
            <div className={styles.savings}>
              <span className={styles.totalSavedLabel}>Total Saved</span>
              <span className={styles.totalSavedAmount}>
                {formatFunds(totalSaved)}
              </span>
            </div>
            {goalDifference !== null ? (
              <span
                className={`${styles.goalDifference} ${
                  goalDifference > 0 ? styles.aboveGoal : styles.belowGoal
                }`}
              >
                {`${goalDifference >= 0 ? "+" : "-"}${formatFunds(
                  Math.abs(goalDifference),
                )} ${goalDifference >= 0 ? "above" : "under"} goal`}
              </span>
            ) : null}
          </div>
          <div className={styles.totalSavedChart}>
            <SavedHistoryChart savedHistory={savedHistory} />
          </div>
        </div>
      ),
    },
    {
      id: "total-earned",
      content: (
        <div className={styles.totalSavedCard}>
          <div className={styles.savingsDetail}>
            <div className={styles.savingsAmount}>
              <span className={styles.totalSavedLabel}>Total earned:</span>
              <span
                className={`${styles.totalSavedAmount} ${styles.amount} ${styles.aboveGoal}`}
              >
                <span className={styles.funds}>
                  <ArrowUp />
                  {formatFunds(totalEarned)}
                </span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "total-spent",
      content: (
        <div className={styles.totalSavedCard}>
          <div className={styles.savingsDetail}>
            <div className={styles.savingsAmount}>
              <span className={styles.totalSavedLabel}>Total spent:</span>
              <span
                className={`${styles.totalSavedAmount} ${styles.amount} ${styles.belowGoal}`}
              >
                <span className={styles.funds}>
                  <ArrowDown />
                  {formatFunds(totalSpent)}
                </span>
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "category-breakdown",
      content:
        topCategories.length > 0 ? (
          <div className={styles.pieCard}>
            <span className={styles.pieTitle}>Category Spending</span>
            <div className={styles.pieChart}>
              <CategorySpendingChart topCategories={topCategories} />
            </div>
          </div>
        ) : (
          <div className={styles.pieCard}>
            <span className={styles.pieTitle}>Category Spending</span>
            <span className={styles.emptyState}>No spending data yet</span>
          </div>
        ),
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const shiftClasses = [
    styles.shift0,
    styles.shift1,
    styles.shift2,
    styles.shift3,
  ];
  const activeShiftClass = shiftClasses[activeIndex] ?? styles.shift0;

  return (
    <div className={styles.header}>
      <div className={styles.carouselViewport}>
        <div className={`${styles.headerStrip} ${activeShiftClass}`}>
          {cards.map((card) => (
            <div className={styles.boxContainer} key={card.id}>
              <div className={styles.categoryBox}>{card.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
