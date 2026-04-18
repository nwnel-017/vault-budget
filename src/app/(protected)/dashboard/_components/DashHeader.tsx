"use client";

import { useState } from "react";
import { formatFunds } from "@/utils/funds";
import styles from "./DashHeader.module.css";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import type { ChartOptions, TooltipItem } from "chart.js";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

type CategorySpending = {
  id: string;
  categoryName: string;
  totalSpent: number;
};

type SavedHistory = {
  monthStart: string;
  totalSaved: number;
};

// TO DO - fix css
// total saved card should be same size as the others
// content inside total saved should fit nicely

// TO DO - this is going to need a rewrite
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

  const recentSavedHistory = savedHistory.slice(-3);
  const pieColors = [
    "#e34e4e",
    "#f97316",
    "#f59e0b",
    "#84cc16",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
  ];
  const categoryChartColors = topCategories.map((category, index) =>
    category.categoryName === "Uncategorized"
      ? "#9ca3af"
      : pieColors[index % pieColors.length],
  );

  // TO DO - move these charts to separate components
  const savedHistoryChartData = {
    labels: recentSavedHistory.map((entry) =>
      new Date(entry.monthStart).toLocaleDateString("en-US", {
        month: "short",
      }),
    ),
    datasets: [
      {
        data: recentSavedHistory.map((entry) => entry.totalSaved),
        borderColor: "#2cb3d1",
        backgroundColor: "rgba(15, 118, 110, 0.15)",
        fill: true,
        pointRadius: 0.25,
        pointHoverRadius: 0.35,
      },
    ],
  };

  const savedHistoryChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(tooltipItem: TooltipItem<"line">) {
            return formatFunds(tooltipItem.parsed.y ?? 0);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
      y: {
        display: false,
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const categoryChartData = {
    labels: topCategories.map((category) => category.categoryName),
    datasets: [
      {
        data: topCategories.map((category) => category.totalSpent),
        backgroundColor: categoryChartColors,
        borderColor: "var(--background)",
        borderWidth: 2,
      },
    ],
  };

  const categoryChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label(tooltipItem: TooltipItem<"pie">) {
            const label = tooltipItem.label ?? "Category";
            return `${label}: ${formatFunds(tooltipItem.parsed ?? 0)}`;
          },
        },
      },
    },
  };

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
                )} ${goalDifference >= 0 ? "above" : "below"} goal`}
              </span>
            ) : null}
          </div>
          <div className={styles.totalSavedChart}>
            <Line
              data={savedHistoryChartData}
              options={savedHistoryChartOptions}
            />
          </div>
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
      id: "category-breakdown",
      content:
        topCategories.length > 0 ? (
          <div className={styles.pieCard}>
            <span className={styles.pieTitle}>Category Spending</span>
            <div className={styles.pieChart}>
              <Pie data={categoryChartData} options={categoryChartOptions} />
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
        {/* these dots let the user jump to a specific panel */}
        {cards.map((card, index) => (
          <button
            key={card.id}
            className={`${styles.dotButton} ${
              activeIndex === index ? styles.activeDot : ""
            }`}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={`Go to panel ${index + 1}`}
            aria-pressed={activeIndex === index}
          >
            •
          </button>
        ))}
      </div>
    </div>
  );
}
