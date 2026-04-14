// components/profile/charts/MonthlySummaryChart.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ScriptableContext,
  type ChartData,
} from 'chart.js';
import { Chart as MixedChart } from 'react-chartjs-2';
import { FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend
);

export type MonthlyRow = {
  monthIso: string;
  label: string;
  minutes: number;
  sessions: number;
};

type Props = {
  rows: MonthlyRow[];
  height?: number;
};

export default function MonthlySummaryChart({ rows, height = 340 }: Props) {
  const chartRef = useRef<ChartJS<'bar' | 'line'> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0);
  const totalSessions = rows.reduce((sum, row) => sum + row.sessions, 0);
  const bestMonth = rows.reduce(
    (best, row) => (row.minutes > best.minutes ? row : best),
    { label: '—', minutes: 0, sessions: 0, monthIso: '' }
  );

  const data = useMemo<ChartData<'bar' | 'line'>>(
    () => ({
      labels: rows.map((r) => r.label),
      datasets: [
        {
          type: 'bar',
          label: 'Minutes',
          data: rows.map((r) => r.minutes),
          yAxisID: 'y',
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: (ctx: ScriptableContext<'bar'>) => {
            const { ctx: c, chartArea } = ctx.chart;
            if (!chartArea) return '#8b5cf6';

            const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            g.addColorStop(0, 'rgba(96,165,250,0.88)');
            g.addColorStop(1, 'rgba(139,92,246,0.94)');
            return g;
          },
        },
        {
          type: 'line',
          label: 'Sessions',
          data: rows.map((r) => r.sessions),
          yAxisID: 'y1',
          tension: 0.35,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderColor: '#ec4899',
          backgroundColor: 'rgba(236,72,153,0.12)',
          pointBackgroundColor: '#ec4899',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    }),
    [rows]
  );

  const options = useMemo<ChartOptions<'bar' | 'line'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#475569',
            usePointStyle: true,
            boxWidth: 8,
            font: {
              weight: 700,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(15,23,42,0.92)',
          padding: 12,
          cornerRadius: 12,
          callbacks: {
            label: (
              it: import('chart.js').TooltipItem<'bar' | 'line'>
            ) => {
              const ds = it.dataset.label || '';
              const v = it.parsed?.y;
              return ds === 'Minutes' ? `Minutes: ${v} min` : `Sessions: ${v}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Minutes', color: '#64748b' },
          ticks: { stepSize: 60, color: '#64748b' },
          grid: { color: 'rgba(148,163,184,0.16)' },
          border: { display: false },
        },
        y1: {
          beginAtZero: true,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Sessions', color: '#64748b' },
          ticks: { color: '#64748b' },
          border: { display: false },
        },
        x: {
          ticks: {
            maxRotation: isMobile ? 35 : 0,
            color: '#64748b',
          },
          grid: { display: false },
          border: { display: false },
        },
      },
    }),
    [isMobile]
  );

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 30,
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
        border: '1px solid rgba(139,92,246,0.08)',
        boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
        padding: 'clamp(1rem, 3vw, 1.25rem)',
      }}
    >
      <div className="row g-3 mb-3">
        {[
          {
            label: 'Total minutes',
            value: `${totalMinutes}m`,
            icon: <FiClock />,
          },
          {
            label: 'Sessions',
            value: totalSessions,
            icon: <FiTrendingUp />,
          },
          {
            label: 'Best month',
            value: bestMonth.label,
            icon: <FiCalendar />,
          },
        ].map((item) => (
          <div key={item.label} className="col-12 col-md-4">
            <div
              style={{
                height: '100%',
                borderRadius: 22,
                padding: '1rem',
                background: 'rgba(255,255,255,0.72)',
                border: '1px solid rgba(139,92,246,0.08)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 15,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg, rgba(139,92,246,0.14), rgba(96,165,250,0.12))',
                  color: '#8b5cf6',
                  marginBottom: '0.75rem',
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  color: '#111827',
                  fontWeight: 950,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.04em',
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  color: '#64748b',
                  fontWeight: 750,
                  fontSize: '0.86rem',
                }}
              >
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          width: '100%',
          overflowX: isMobile ? 'auto' : 'hidden',
          borderRadius: 24,
          background: 'rgba(255,255,255,0.62)',
          border: '1px solid rgba(139,92,246,0.06)',
          padding: isMobile ? '0.75rem' : '1rem',
        }}
      >
        <div
          style={{
            width: '100%',
            minWidth: isMobile ? 720 : 'auto',
            height: isMobile ? Math.max(height, 330) : height,
          }}
        >
          <MixedChart ref={chartRef} type="bar" data={data} options={options} />
        </div>
      </div>
    </section>
  );
}

{/*
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

*/}
