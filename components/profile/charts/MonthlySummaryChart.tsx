"use client";

import { useMemo, useRef } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement,
  Tooltip, Legend, type ChartOptions, type ScriptableContext, type ChartData,
} from "chart.js";
import { Chart as MixedChart } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export type MonthlyRow = { monthIso: string; label: string; minutes: number; sessions: number; };
type Props = { rows: MonthlyRow[]; height?: number; };

export default function MonthlySummaryChart({ rows, height = 340 }: Props) {
  const chartRef = useRef<ChartJS<"bar" | "line"> | null>(null);

  const data = useMemo<ChartData<"bar" | "line">>(() => ({
    labels: rows.map(r => r.label),
    datasets: [
      {
        type: "bar",
        label: "Minutes",
        data: rows.map(r => r.minutes),
        yAxisID: "y",
        borderRadius: 8,
        backgroundColor: (ctx: ScriptableContext<"bar">) => {
          const { ctx: c, chartArea } = ctx.chart;
          if (!chartArea) return "#4A90E2";
          const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          g.addColorStop(0, "rgba(74,144,226,0.85)");
          g.addColorStop(1, "rgba(123,237,159,0.95)");
          return g;
        },
      },
      { type: "line", label: "Sessions", data: rows.map(r => r.sessions), yAxisID: "y1", tension: 0.35, pointRadius: 3, pointHoverRadius: 5 },
    ],
  }), [rows]);

  const options = useMemo<ChartOptions<"bar" | "line">>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: true },
      tooltip: { callbacks: { label: (it: import("chart.js").TooltipItem<"bar" | "line">) => {
        const ds = it.dataset.label || ""; const v = it.parsed?.y;
        return ds === "Minutes" ? `Minutes: ${v} min` : `Sessions: ${v}`;
      }}},
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: "Minutes" }, ticks: { stepSize: 60 } },
      y1: { beginAtZero: true, position: "right", grid: { drawOnChartArea: false }, title: { display: true, text: "Sessions" } },
      x: { ticks: { maxRotation: 0 } },
    },
  }), []);

  return <div style={{ width: "100%", height }}><MixedChart ref={chartRef} type="bar" data={data} options={options} /></div>;
}
