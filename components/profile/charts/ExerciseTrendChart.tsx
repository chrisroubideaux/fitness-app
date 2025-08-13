// components/profile/charts/ExerciseTrendChart.tsx
// components/profile/charts/ExerciseTrendChart.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type TooltipItem,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";
import { format, parseISO } from "date-fns";

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

/** ---- API types ---- */
type TrendPoint = {
  bucket: string;
  value: number;
  max_weight: number;
  total_reps: number;
  total_volume: number;
};

type ExerciseTrendResponse = {
  exercise: string;
  metric: "1rm" | "max_weight" | "avg_weight" | "total_volume" | "total_reps";
  group_by: "day" | "week" | "month";
  points: TrendPoint[];
};

type Props = {
  apiBase?: string;
  tz?: string;
  defaultMetric?: ExerciseTrendResponse["metric"];
  defaultGroupBy?: ExerciseTrendResponse["group_by"];
  height?: number;
};

export default function ExerciseTrendChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  tz = "America/Chicago",
  defaultMetric = "1rm",
  defaultGroupBy = "day",
  height = 360,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Controls
  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [exercise, setExercise] = useState<string>("");
  const [metric, setMetric] = useState<ExerciseTrendResponse["metric"]>(defaultMetric);
  const [groupBy, setGroupBy] = useState<ExerciseTrendResponse["group_by"]>(defaultGroupBy);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [trend, setTrend] = useState<ExerciseTrendResponse | null>(null);

  // Properly typed ref for react-chartjs-2
  const chartRef = useRef<ChartJS<"polarArea"> | null>(null);

  /** ---- Fetchers ---- */
  const fetchExerciseNames = async () => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/exercise/names`);
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token ?? ""}` } });
      if (!res.ok) throw new Error(`Names fetch failed: ${res.status}`);
      const json: { exercises: string[] } = await res.json();
      setExerciseNames(json.exercises || []);
      if (!exercise && json.exercises?.length) setExercise(json.exercises[0]);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load exercise names");
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseTrend = async () => {
    if (!exercise) return;
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/exercise/trend`);
      url.searchParams.set("exercise", exercise);
      url.searchParams.set("metric", metric);
      url.searchParams.set("group_by", groupBy);
      url.searchParams.set("tz", tz);
      if (fromDate) url.searchParams.set("from", fromDate);
      if (toDate) url.searchParams.set("to", toDate);

      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token ?? ""}` } });
      if (!res.ok) throw new Error(`Trend fetch failed: ${res.status}`);
      const json: ExerciseTrendResponse = await res.json();
      setTrend(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load exercise trend");
    } finally {
      setLoading(false);
    }
  };

  /** ---- Effects ---- */
  useEffect(() => {
    if (!token) {
      setErr("No token. Log in again.");
      setLoading(false);
      return;
    }
    fetchExerciseNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, base]);

  useEffect(() => {
    if (!exercise) return;
    fetchExerciseTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, metric, groupBy, fromDate, toDate, tz, base]);

  /** ---- Labels & dataset (Polar Area) ---- */
  const labels = useMemo(() => {
    if (!trend?.points) return [];
    return trend.points.map((p) => {
      if (groupBy === "month") return format(parseISO(p.bucket), "MMM yyyy");
      if (groupBy === "week") return `Week of ${format(parseISO(p.bucket), "MMM d")}`;
      return format(parseISO(p.bucket), "MMM d");
    });
  }, [trend?.points, groupBy]);

  const segmentColors = useMemo(() => {
    const n = labels.length || 1;
    return Array.from({ length: n }, (_, i) => {
      const hue = Math.round((360 * i) / n);
      return `hsl(${hue} 75% 60% / 0.85)`;
    });
  }, [labels]);

  const data = useMemo<ChartData<"polarArea">>(() => {
    const vals = (trend?.points || []).map((p) => p.value ?? 0);
    return {
      labels,
      datasets: [
        {
          label:
            metric === "1rm" ? "1RM (lbs)" :
            metric === "max_weight" ? "Max Weight (lbs)" :
            metric === "avg_weight" ? "Avg Weight (lbs)" :
            metric === "total_volume" ? "Total Volume (lbs)" :
            "Total Reps",
          data: vals,
          backgroundColor: segmentColors,
          borderWidth: 1,
        },
      ],
    };
  }, [trend?.points, labels, metric, segmentColors]);

  const options = useMemo<ChartOptions<"polarArea">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "right" },
        tooltip: {
          callbacks: {
            label: (ctx: TooltipItem<"polarArea">) => {
              const v = Number(ctx.parsed);
              if (metric === "total_reps") return `Reps: ${v}`;
              if (metric === "total_volume") return `Volume: ${v} lbs`;
              if (metric === "avg_weight") return `Avg: ${v} lbs`;
              if (metric === "max_weight") return `Max: ${v} lbs`;
              return `1RM: ${v} lbs`;
            },
          },
        },
      },
      scales: {
        r: { beginAtZero: true, ticks: { showLabelBackdrop: false }, grid: { circular: true } },
      },
      animation: { animateRotate: true, animateScale: true },
    }),
    [metric]
  );

  /** ---- UI ---- */
  return (
    <div className="w-100">
      {/* Controls */}
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div className="d-flex flex-wrap align-items-end gap-2">
          <div className="gradient-select-wrapper">
            <label className="form-label mb-1">Exercise</label>
            <select
              className="form-select form-select-sm gradient-select"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              disabled={loading || exerciseNames.length === 0}
              style={{ minWidth: 200 }}
              aria-label="Select exercise"
            >
              {exerciseNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="gradient-select-wrapper">
            <label className="form-label mb-1">Metric</label>
            <select
              className="form-select form-select-sm gradient-select"
              value={metric}
              onChange={(e) => setMetric(e.target.value as typeof metric)}
              aria-label="Select metric"
            >
              <option value="1rm">1RM</option>
              <option value="max_weight">Max Weight</option>
              <option value="avg_weight">Avg Weight</option>
              <option value="total_volume">Total Volume</option>
              <option value="total_reps">Total Reps</option>
            </select>
          </div>

          <div className="gradient-select-wrapper">
            <label className="form-label mb-1">Group By</label>
            <select
              className="form-select form-select-sm gradient-select"
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
              aria-label="Select grouping"
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
            </select>
          </div>

          <div>
            <label className="form-label mb-1">From</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="form-label mb-1">To</label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="w-100" style={{ height, borderRadius: 16, background: "rgba(0,0,0,0.04)" }} />
      )}
      {err && !loading && <div className="alert alert-danger">{err}</div>}

      {!loading && !err && (
        <motion.div
          key={`${exercise}-${metric}-${groupBy}-${fromDate}-${toDate}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="card shadow-sm chart-gradient"
          style={{ borderRadius: 16 }}
        >
          <div className="card-body">
            <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
              {exercise
                ? <>Showing <strong>{exercise}</strong> • <strong>{metric}</strong> • <strong>{groupBy}</strong></>
                : "Pick an exercise"}
            </div>

            <div style={{ width: "100%", height }}>
              {trend?.points?.length ? (
                <PolarArea ref={chartRef} data={data} options={options} />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center w-100 h-100 text-muted"
                  style={{ background: "rgba(255,255,255,0.35)", borderRadius: 12 }}
                >
                  {exercise ? "No data for the selected range." : "Pick an exercise to see the trend."}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
