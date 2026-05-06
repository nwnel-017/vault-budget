"use client";

import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Pie } from "react-chartjs-2";
import { formatFunds } from "@/utils/funds";

ChartJS.register(ArcElement, Tooltip);

type CategorySpending = {
  id: string;
  categoryName: string;
  totalSpent: number;
};

// const pieColors = [
//   "#e34e4e",
//   "#f97316",
//   "#f59e0b",
//   "#84cc16",
//   "#10b981",
//   "#14b8a6",
//   "#06b6d4",
//   "#3b82f6",
//   "#6366f1",
//   "#8b5cf6",
//   "#ec4899",
//   "#f43f5e",
// ];

const pieColors = [
  "#6EA8FE",
  "#5BC0BE",
  "#7BC47F",
  "#E9B872",
  "#E27D60",
  "#A78BFA",
  "#94A3B8",
  "#7DD3FC",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
];
export default function CategorySpendingChart({
  topCategories,
}: {
  topCategories: CategorySpending[];
}) {
  // Keep uncategorized gray so it is easy to spot.
  const categoryChartColors = topCategories.map((category, index) =>
    category.categoryName === "Uncategorized"
      ? "#9ca3af"
      : pieColors[index % pieColors.length],
  );

  const chartData = {
    labels: topCategories.map((category) => category.categoryName),
    datasets: [
      {
        data: topCategories.map((category) => category.totalSpent),
        backgroundColor: categoryChartColors,
        borderColor: `var(--accent)`,
        borderWidth: 2,
      },
    ],
  };

  const chartOptions: ChartOptions<"pie"> = {
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

  return <Pie data={chartData} options={chartOptions} />;
}
