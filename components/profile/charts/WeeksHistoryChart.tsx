// components/profile/charts/WeeksHistoryChart.tsx
// components/profile/charts/WeeksHistoryChart.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { FiBarChart2, FiClock, FiInfo } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type DayPoint = {
  label: string;
  minutes: number;
  sessions: number;
  workouts?: string[];
  exercises?: { name: string; sessions: number; minutes: number }[];
};

type WeekBucket = {
  week_start: string;
  points: DayPoint[];
};

type WeeksHistoryResponse = {
  weeks: WeekBucket[];
};

type Props = {
  apiBase?: string;
  tz?: string;
  weeks?: number;
};

export default function WeeksHistoryChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  tz = 'America/Chicago',
  weeks = 8,
}: Props) {
  const [data, setData] = useState<WeeksHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [n, setN] = useState<number>(weeks);
  const [isMobile, setIsMobile] = useState(false);

  const chartRef = useRef<ChartJS<'bar'> | null>(null);
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);

  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWeeks = async (count: number) => {
    setLoading(true);
    setErr(null);

    try {
      const url = new URL(`${base}/api/workout_sessions/history/weeks`);
      url.searchParams.set('tz', tz);
      url.searchParams.set('n', String(count));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Weeks history fetch failed: ${res.status}`);

      const json: WeeksHistoryResponse = await res.json();
      setData(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setErr('No token. Log in again.');
      setLoading(false);
      return;
    }

    fetchWeeks(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, n, tz, base]);

  const rows = useMemo(() => {
    if (!data?.weeks) return [];

    return data.weeks.map((w) => {
      const totalMinutes = w.points.reduce(
        (sum, p) => sum + (p.minutes || 0),
        0
      );

      return {
        week_start: w.week_start,
        label: format(parseISO(w.week_start), 'MMM d'),
        totalMinutes,
        days: w.points,
      };
    });
  }, [data]);

  const totalMinutesAllWeeks = rows.reduce(
    (sum, row) => sum + row.totalMinutes,
    0
  );

  const averageMinutes =
    rows.length > 0 ? Math.round(totalMinutesAllWeeks / rows.length) : 0;

  const bestWeek = rows.reduce(
    (best, row) => (row.totalMinutes > best.totalMinutes ? row : best),
    { label: '—', totalMinutes: 0 }
  );

  const barData: ChartData<'bar', number[], string> = useMemo(() => {
    return {
      labels: rows.map((r) => r.label),
      datasets: [
        {
          label: 'Total Minutes',
          data: rows.map((r) => r.totalMinutes),
          borderRadius: 12,
          borderSkipped: false,
          backgroundColor: (ctx: ScriptableContext<'bar'>) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;

            if (!chartArea) return '#8b5cf6';

            const gradient = canvasCtx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );

            gradient.addColorStop(0, 'rgba(96,165,250,0.88)');
            gradient.addColorStop(1, 'rgba(139,92,246,0.94)');

            return gradient;
          },
        },
      ],
    };
  }, [rows]);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0;
            const wk = rows[idx];

            if (!wk) return '';

            const start = format(parseISO(wk.week_start), 'MMMM d, yyyy');
            return `Week of ${start}`;
          },
          label: (item: TooltipItem<'bar'>) => {
            const idx = item.dataIndex ?? 0;
            const wk = rows[idx];

            if (!wk) return '';

            const parts = wk.days.map((d) => `${d.label} ${d.minutes}m`);
            return [`Total: ${wk.totalMinutes} min`, ...parts];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 30, color: '#64748b' },
        grid: { color: 'rgba(148,163,184,0.16)' },
        border: { display: false },
      },
      x: {
        ticks: {
          autoSkip: false,
          maxRotation: isMobile ? 35 : 0,
          color: '#64748b',
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  return (
    <section
      style={{
        width: '100%',
        borderRadius: 38,
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
        boxShadow:
          '0 18px 45px rgba(15,23,42,0.07), inset 0 0 0 1px rgba(255,255,255,0.45)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 28%), radial-gradient(circle at bottom left, rgba(96,165,250,0.08), transparent 26%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: 'clamp(1rem, 3vw, 1.5rem)',
        }}
      >
        <div
          className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start"
          style={{ gap: '1rem', marginBottom: '1.25rem' }}
        >
          <div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0.4rem 0.75rem',
                borderRadius: 999,
                background: 'rgba(139,92,246,0.10)',
                color: '#8b5cf6',
                fontWeight: 800,
                fontSize: '0.76rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '0.7rem',
              }}
            >
              <FiBarChart2 />
              Weekly History
            </span>

            <h2
              style={{
                margin: 0,
                color: '#111827',
                fontSize: 'clamp(1.55rem, 3vw, 2.35rem)',
                fontWeight: 950,
                letterSpacing: '-0.04em',
              }}
            >
              Workout minutes over time
            </h2>

            <p
              style={{
                margin: '0.55rem 0 0',
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              Review your weekly training volume and track consistency across
              your recent workout history.
            </p>
          </div>

          <div
            className="d-flex align-items-center"
            style={{
              gap: '0.65rem',
              padding: '0.65rem 0.8rem',
              borderRadius: 18,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 10px 24px rgba(15,23,42,0.04)',
            }}
          >
            <label
              style={{
                color: '#64748b',
                fontWeight: 800,
                fontSize: '0.84rem',
              }}
            >
              Show
            </label>

            <select
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              style={{
                minHeight: 38,
                borderRadius: 14,
                border: '1px solid rgba(139,92,246,0.14)',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 800,
                padding: '0 0.75rem',
                outline: 'none',
              }}
            >
              <option value={4}>4 weeks</option>
              <option value={8}>8 weeks</option>
              <option value={12}>12 weeks</option>
              <option value={24}>24 weeks</option>
            </select>
          </div>
        </div>

        {!loading && !err && (
          <div
            className="row g-3"
            style={{
              marginBottom: '1rem',
            }}
          >
            {[
              {
                label: `Last ${n} weeks`,
                value: `${totalMinutesAllWeeks}m`,
                icon: <FiClock />,
              },
              {
                label: 'Weekly average',
                value: `${averageMinutes}m`,
                icon: <FiBarChart2 />,
              },
              {
                label: 'Best week',
                value: `${bestWeek.label}`,
                icon: <FiInfo />,
              },
            ].map((item) => (
              <div key={item.label} className="col-12 col-md-4">
                <div
                  style={{
                    height: '100%',
                    borderRadius: 24,
                    padding: '1rem',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.92))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    boxShadow: '0 12px 28px rgba(15,23,42,0.05)',
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
                      fontSize: '1.4rem',
                      fontWeight: 950,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {item.value}
                  </div>

                  <div
                    style={{
                      color: '#64748b',
                      fontWeight: 750,
                      fontSize: '0.88rem',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div
            style={{
              height: isMobile ? 300 : 360,
              borderRadius: 30,
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.85), rgba(255,255,255,0.55))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          />
        )}

        {err && !loading && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 22,
              background: 'rgba(239,68,68,0.10)',
              border: '1px solid rgba(239,68,68,0.16)',
              color: '#b91c1c',
              fontWeight: 800,
            }}
          >
            {err}
          </div>
        )}

        {!loading && !err && (
          <motion.div
            key={`weeks-${n}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              borderRadius: 30,
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
              padding: isMobile ? '1rem 0.75rem' : '1.25rem',
              overflowX: isMobile ? 'auto' : 'hidden',
            }}
          >
            <div
              style={{
                width: '100%',
                minWidth: isMobile ? 720 : 'auto',
                height: isMobile ? 330 : 380,
              }}
            >
              <Bar ref={chartRef} data={barData} options={options} />
            </div>

            <div
              style={{
                marginTop: '1rem',
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                lineHeight: 1.6,
              }}
            >
              <FiInfo />
              <span>
                Tip: hover a bar to see the Mon–Sun breakdown for that week.
                {isMobile ? ' Swipe horizontally to view the full chart.' : ''}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
{/*
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

            <div className="mt-3 text-muted" style={{ fontSize: ".9rem" }}>
              Tip: hover a bar to see the Mon–Sun breakdown for that week.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

*/}