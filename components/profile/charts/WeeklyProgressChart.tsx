// WeeklyProgressChart.tsx
// components/profile/charts/WeeklyProgressChart.tsx
"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ScriptableContext,
  type TooltipItem,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type DayPoint = {
  label: string;
  minutes: number;
  sessions: number;
  workouts?: string[];
  exercises?: { name: string; sessions: number; minutes: number }[];
};

type WeeklyResponse = {
  user_id: string;
  week_start: string; // YYYY-MM-DD
  points: DayPoint[];
};

type Props = {
  apiBase?: string; // default http://localhost:5000
  tz?: string;      // default America/Chicago
};

export default function WeeklyProgressChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  tz = "America/Chicago",
}: Props) {
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [weeksBack, setWeeksBack] = useState<number>(0);
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchWeekly = async (wb: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${apiBase}/api/workout_sessions/weekly`);
      url.searchParams.set("tz", tz);
      if (wb > 0) url.searchParams.set("weeks_back", String(wb));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error(`Weekly fetch failed: ${res.status}`);
      const json: WeeklyResponse = await res.json();
      setData(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setErr("No token. Log in again.");
      setLoading(false);
      return;
    }
    fetchWeekly(weeksBack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, weeksBack]);

  const rows = useMemo(() => {
    if (!data?.points) return [];
    return data.points.map((p) => ({
      label: p.label,
      Minutes: p.minutes,
      sessions: p.sessions,
      workouts: p.workouts ?? [],
    }));
  }, [data]);

  const barData: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: rows.map((d) => d.label),
      datasets: [
        {
          label: "Minutes",
          data: rows.map((d) => d.Minutes),
          borderRadius: 8,
          backgroundColor: (ctx: ScriptableContext<"bar">) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return "#4A90E2"; // during initial layout
            const gradient = canvasCtx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(74, 144, 226, 0.8)");
            gradient.addColorStop(1, "rgba(123, 237, 159, 0.9)");
            return gradient;
          },
        },
      ],
    };
  }, [rows]);

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<"bar">) => `${context.parsed.y} min`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 20 } },
    },
  };

  return (
    <div className="w-100">
      {/* Header + Controls */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Weekly Progress</h3>
          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            Week starting <strong>{data?.week_start ?? "--"}</strong> • {tz}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setWeeksBack((w) => Math.min(52, w + 1))}
            disabled={loading}
          >
            ◀ Prev
          </button>
          <button
            className={`btn btn-sm ${
              weeksBack === 0 ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setWeeksBack(0)}
            disabled={loading}
          >
            This Week
          </button>
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
            disabled={loading || weeksBack === 0}
          >
            Next ▶
          </button>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div
          className="w-100"
          style={{ height: 280, borderRadius: 16, background: "rgba(0,0,0,0.04)" }}
        />
      )}
      {err && !loading && <div className="alert alert-danger">{err}</div>}

      {!loading && !err && (
        <motion.div
          key={data?.week_start ?? "chart"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card shadow-sm"
          style={{ borderRadius: 16 }}
        >
          <div className="card-body">
            <div style={{ width: "100%", height: 320 }}>
              <Bar ref={chartRef} data={barData} options={options} />
            </div>

            {/* badges below chart */}
            <div className="mt-3">
              {rows.map((d) => (
                <motion.div
                  key={`row-${d.label}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="d-flex align-items-center flex-wrap gap-2 mb-2"
                >
                  <span className="badge text-bg-secondary" style={{ width: 56 }}>
                    {d.label}
                  </span>
                  <span className="text-muted" style={{ fontSize: ".9rem" }}>
                    {d.sessions} session{d.sessions === 1 ? "" : "s"} • {d.Minutes} min
                  </span>
                  <div className="d-flex flex-wrap gap-1">
                    {(d.workouts ?? []).map((w) => (
                      <span key={`${d.label}-${w}`} className="badge text-bg-light border">
                        {w}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
