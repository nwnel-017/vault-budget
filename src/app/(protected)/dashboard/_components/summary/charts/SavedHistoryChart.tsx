"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Line } from "react-chartjs-2";
import { formatFunds } from "@/utils/funds";
import type { SavedHistory } from "@/types/dashboard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

export default function SavedHistoryChart({
  savedHistory,
}: {
  savedHistory: SavedHistory[];
}) {
  const recentSavedHistory = savedHistory.slice(-3);

  const chartData = {
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

  const chartOptions: ChartOptions<"line"> = {
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

  return <Line data={chartData} options={chartOptions} />;
}
