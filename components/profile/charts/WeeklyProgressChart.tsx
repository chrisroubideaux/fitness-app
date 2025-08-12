// WeeklyProgressChart.tsx

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
import { format, parseISO } from "date-fns";

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
  tz?: string;      // still used for API query only
};

type ChartKind =
  | "weekly"
  | "weeksHistory"
  | "monthlySummary"
  | "exerciseTrend"
  | "typeBreakdown";

export default function WeeklyProgressChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  tz = "America/Chicago",
}: Props) {
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [weeksBack, setWeeksBack] = useState<number>(0);
  const [chartKind, setChartKind] = useState<ChartKind>("weekly");
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  // sanitize base (avoid trailing slash)
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchWeekly = async (wb: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/weekly`);
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
    if (chartKind === "weekly") {
      fetchWeekly(weeksBack);
    } else {
      // placeholders for other charts (no fetch yet)
      setLoading(false);
      setErr(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, weeksBack, chartKind]);

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
            if (!chartArea) return "#4A90E2"; // initial layout pass
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

  const weekStartPretty = useMemo(() => {
    if (!data?.week_start) return "--";
    return format(parseISO(data.week_start), "MMMM d, yyyy");
  }, [data?.week_start]);

  // --- placeholder card for future charts ---
  const Placeholder = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card shadow-sm chart-gradient"
      style={{ borderRadius: 16 }}
    >
      <div className="card-body">
        <h5 className="mb-1">{title}</h5>
        <p className="text-muted mb-0">{subtitle}</p>
        <div
          className="w-100 mt-3"
          style={{ height: 280, borderRadius: 12, background: "rgba(255,255,255,0.35)" }}
        />
      </div>
    </motion.div>
  );

  // --- chart renderer ---
  const renderChart = () => {
    switch (chartKind) {
      case "weekly":
        return (
          <motion.div
            key={data?.week_start ?? "chart"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card shadow-sm chart-gradient"
            style={{ borderRadius: 16 }}
          >
            <div className="card-body">
              <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
                Week starting <strong>{weekStartPretty}</strong>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <Bar ref={chartRef} data={barData} options={options} />
              </div>

          
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
        );

      case "weeksHistory":
        return (
          <Placeholder
            title="Weeks History"
            subtitle="Shows multiple past weeks with per-day minutes and exercises. (Coming soon)"
          />
        );
      case "monthlySummary":
        return (
          <Placeholder
            title="Monthly Summary"
            subtitle="Aggregated minutes & sessions per month. (Coming soon)"
          />
        );
      case "exerciseTrend":
        return (
          <Placeholder
            title="Exercise Trend"
            subtitle="Track weight/reps over time for a chosen exercise. (Coming soon)"
          />
        );
      case "typeBreakdown":
        return (
          <Placeholder
            title="Workout Type Breakdown"
            subtitle="Distribution of Strength/Cardio/Yoga/HIIT over a period. (Coming soon)"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-100">
    
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Progress</h3>
          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            {chartKind === "weekly" ? "Weekly Progress" : "Explore other views"}
          </div>
        </div>

       
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group" role="group" aria-label="Week navigation">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setWeeksBack((w) => Math.min(52, w + 1))}
              disabled={loading || chartKind !== "weekly"}
              title="Previous week"
            >
              ◀ Prev
            </button>
            <button
              className={`btn btn-sm ${weeksBack === 0 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setWeeksBack(0)}
              disabled={loading || chartKind !== "weekly"}
              title="This week"
            >
              This Week
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
              disabled={loading || weeksBack === 0 || chartKind !== "weekly"}
              title="Next week"
            >
              Next ▶
            </button>
          </div>

         
          <div className="gradient-select-wrapper ms-2">
            <select
              className="form-select form-select-sm gradient-select"
              style={{ width: "auto" }}
              value={chartKind}
              onChange={(e) => setChartKind(e.target.value as ChartKind)}
              aria-label="Select chart"
              disabled={loading}
              title="Select chart"
            >
              <option value="weekly">Weekly</option>
              <option value="weeksHistory">Weeks History</option>
              <option value="monthlySummary">Monthly</option>
              <option value="exerciseTrend">Exercise Trend</option>
              <option value="typeBreakdown">Type Breakdown</option>
            </select>
            </div>

        </div>
      </div>

     
      {loading && (
        <div
          className="w-100"
          style={{ height: 280, borderRadius: 16, background: "rgba(0,0,0,0.04)" }}
        />
      )}
      {err && !loading && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && renderChart()}
    </div>
  );
}






/*


// WeeklyProgressChart.tsx

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
import { format, parseISO } from "date-fns";

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
  tz?: string;      // still used for API query only
};

type ChartKind =
  | "weekly"
  | "weeksHistory"
  | "monthlySummary"
  | "exerciseTrend"
  | "typeBreakdown";

export default function WeeklyProgressChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000",
  tz = "America/Chicago",
}: Props) {
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [weeksBack, setWeeksBack] = useState<number>(0);
  const [chartKind, setChartKind] = useState<ChartKind>("weekly");
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  // sanitize base (avoid trailing slash)
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const fetchWeekly = async (wb: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/weekly`);
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
    if (chartKind === "weekly") {
      fetchWeekly(weeksBack);
    } else {
      // placeholders for other charts (no fetch yet)
      setLoading(false);
      setErr(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, weeksBack, chartKind]);

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
            if (!chartArea) return "#4A90E2"; // initial layout pass
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

  const weekStartPretty = useMemo(() => {
    if (!data?.week_start) return "--";
    return format(parseISO(data.week_start), "MMMM d, yyyy");
  }, [data?.week_start]);

  // --- placeholder card for future charts ---
  const Placeholder = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="card shadow-sm chart-gradient"
      style={{ borderRadius: 16 }}
    >
      <div className="card-body">
        <h5 className="mb-1">{title}</h5>
        <p className="text-muted mb-0">{subtitle}</p>
        <div
          className="w-100 mt-3"
          style={{ height: 280, borderRadius: 12, background: "rgba(255,255,255,0.35)" }}
        />
      </div>
    </motion.div>
  );

  // --- chart renderer ---
  const renderChart = () => {
    switch (chartKind) {
      case "weekly":
        return (
          <motion.div
            key={data?.week_start ?? "chart"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card shadow-sm chart-gradient"
            style={{ borderRadius: 16 }}
          >
            <div className="card-body">
              <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
                Week starting <strong>{weekStartPretty}</strong>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <Bar ref={chartRef} data={barData} options={options} />
              </div>

          
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
        );

      case "weeksHistory":
        return (
          <Placeholder
            title="Weeks History"
            subtitle="Shows multiple past weeks with per-day minutes and exercises. (Coming soon)"
          />
        );
      case "monthlySummary":
        return (
          <Placeholder
            title="Monthly Summary"
            subtitle="Aggregated minutes & sessions per month. (Coming soon)"
          />
        );
      case "exerciseTrend":
        return (
          <Placeholder
            title="Exercise Trend"
            subtitle="Track weight/reps over time for a chosen exercise. (Coming soon)"
          />
        );
      case "typeBreakdown":
        return (
          <Placeholder
            title="Workout Type Breakdown"
            subtitle="Distribution of Strength/Cardio/Yoga/HIIT over a period. (Coming soon)"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-100">
    
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-3">
        <div>
          <h3 className="mb-1">Progress</h3>
          <div className="text-muted" style={{ fontSize: ".9rem" }}>
            {chartKind === "weekly" ? "Weekly Progress" : "Explore other views"}
          </div>
        </div>

       
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="btn-group" role="group" aria-label="Week navigation">
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setWeeksBack((w) => Math.min(52, w + 1))}
              disabled={loading || chartKind !== "weekly"}
              title="Previous week"
            >
              ◀ Prev
            </button>
            <button
              className={`btn btn-sm ${weeksBack === 0 ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => setWeeksBack(0)}
              disabled={loading || chartKind !== "weekly"}
              title="This week"
            >
              This Week
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
              disabled={loading || weeksBack === 0 || chartKind !== "weekly"}
              title="Next week"
            >
              Next ▶
            </button>
          </div>

         
          <div className="gradient-select-wrapper ms-2">
            <select
              className="form-select form-select-sm gradient-select"
              style={{ width: "auto" }}
              value={chartKind}
              onChange={(e) => setChartKind(e.target.value as ChartKind)}
              aria-label="Select chart"
              disabled={loading}
              title="Select chart"
            >
              <option value="weekly">Weekly</option>
              <option value="weeksHistory">Weeks History</option>
              <option value="monthlySummary">Monthly</option>
              <option value="exerciseTrend">Exercise Trend</option>
              <option value="typeBreakdown">Type Breakdown</option>
            </select>
            </div>

        </div>
      </div>

     
      {loading && (
        <div
          className="w-100"
          style={{ height: 280, borderRadius: 16, background: "rgba(0,0,0,0.04)" }}
        />
      )}
      {err && !loading && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && renderChart()}
    </div>
  );
}






*/