// components/profile/charts/WeeksHistoryChart.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type ScriptableContext,
  type TooltipItem,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/** API types (match your /history/weeks response) */
type DayPoint = {
  label: string;      // Mon..Sun
  minutes: number;    // total minutes that day
  sessions: number;
  workouts?: string[];
  exercises?: { name: string; sessions: number; minutes: number }[];
};

type WeekBucket = {
  week_start: string; // YYYY-MM-DD (Monday)
  points: DayPoint[]; // 7 items Mon..Sun
};

type WeeksHistoryResponse = {
  weeks: WeekBucket[];
};

type Props = {
  apiBase?: string;     // defaults to NEXT_PUBLIC_API_BASE_URL or http://localhost:5000
  tz?: string;          // defaults to America/Chicago
  weeks?: number;       // how many weeks to fetch (default 8)
};

export default function WeeksHistoryChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  tz = "America/Chicago",
  weeks = 8,
}: Props) {
  const [data, setData] = useState<WeeksHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState<number>(weeks);

  const chartRef = useRef<ChartJS<"bar"> | null>(null);
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchWeeks = async (count: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/history/weeks`);
      url.searchParams.set("tz", tz);
      url.searchParams.set("n", String(count));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error(`Weeks history fetch failed: ${res.status}`);
      const json: WeeksHistoryResponse = await res.json();
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
    fetchWeeks(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, n, tz, base]);

  /** Flatten to rows: one per week */
  const rows = useMemo(() => {
    if (!data?.weeks) return [];
    return data.weeks.map((w) => {
      const totalMinutes = w.points.reduce((sum, p) => sum + (p.minutes || 0), 0);
      return {
        week_start: w.week_start,                         // YYYY-MM-DD
        label: format(parseISO(w.week_start), "MMM d"),   // e.g., "Aug 5"
        totalMinutes,
        days: w.points,                                   // keep full breakdown for tooltip
      };
    });
  }, [data]);

  /** Chart.js dataset with gradient */
  const barData: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: rows.map((r) => r.label),
      datasets: [
        {
          label: "Total Minutes",
          data: rows.map((r) => r.totalMinutes),
          borderRadius: 8,
          backgroundColor: (ctx: ScriptableContext<"bar">) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return "#4A90E2";
            const gradient = canvasCtx.createLinearGradient(
              0, chartArea.bottom, 0, chartArea.top
            );
            gradient.addColorStop(0, "rgba(74,144,226,0.85)");
            gradient.addColorStop(1, "rgba(123,237,159,0.95)");
            return gradient;
          },
        },
      ],
    };
  }, [rows]);

  /** Custom tooltip: show Mon..Sun breakdown for each bar */
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0;
            const wk = rows[idx];
            if (!wk) return "";
            const end = format(
              // end of week is +6 days; we only have week_start ISO, so just show start date
              parseISO(wk.week_start),
              "MMMM d, yyyy"
            );
            return `Week of ${end}`;
          },
          label: (item: TooltipItem<"bar">) => {
            const idx = item.dataIndex ?? 0;
            const wk = rows[idx];
            if (!wk) return "";
            // Build a compact breakdown line: "Mon 35m, Tue 20m, ..."
            const parts = wk.days.map((d) => `${d.label} ${d.minutes}m`);
            return [`Total: ${wk.totalMinutes} min`, ...parts];
          },
        },
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 30 } },
      x: { ticks: { autoSkip: false, maxRotation: 0 } },
    },
  };

  return (
    <div className="w-100">
      {/* Header + controls */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Weeks History</h3>
          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            Last <strong>{n}</strong> week(s)
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <label className="text-muted me-1" style={{ fontSize: ".85rem" }}>
            Show
          </label>
          <div className="gradient-select-wrapper">
            <select
              className="form-select form-select-sm gradient-select"
              style={{ width: "auto" }}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
            >
              <option value={4}>4 weeks</option>
              <option value={8}>8 weeks</option>
              <option value={12}>12 weeks</option>
              <option value={24}>24 weeks</option>
            </select>
          </div>
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
          key={`weeks-${n}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card shadow-sm chart-gradient"
          style={{ borderRadius: 16 }}
        >
          <div className="card-body">
            <div style={{ width: "100%", height: 340 }}>
              <Bar ref={chartRef} data={barData} options={options} />
            </div>

            {/* Tiny legend / info */}
            <div className="mt-3 text-muted" style={{ fontSize: ".9rem" }}>
              Tip: hover a bar to see the Mon–Sun breakdown for that week.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
