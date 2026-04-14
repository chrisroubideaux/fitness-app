// components/profile/charts/ExerciseTrendChart.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
  type TooltipItem,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import { FiActivity, FiFilter, FiInfo, FiTarget } from 'react-icons/fi';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type TrendPoint = {
  bucket: string;
  value: number;
  max_weight: number;
  total_reps: number;
  total_volume: number;
};

type ExerciseTrendResponse = {
  exercise: string;
  metric: '1rm' | 'max_weight' | 'avg_weight' | 'total_volume' | 'total_reps';
  group_by: 'day' | 'week' | 'month';
  points: TrendPoint[];
};

type Props = {
  apiBase?: string;
  tz?: string;
  defaultMetric?: ExerciseTrendResponse['metric'];
  defaultGroupBy?: ExerciseTrendResponse['group_by'];
  height?: number;
};

const metricLabels: Record<ExerciseTrendResponse['metric'], string> = {
  '1rm': '1RM',
  max_weight: 'Max Weight',
  avg_weight: 'Avg Weight',
  total_volume: 'Total Volume',
  total_reps: 'Total Reps',
};

export default function ExerciseTrendChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  tz = 'America/Chicago',
  defaultMetric = '1rm',
  defaultGroupBy = 'day',
  height = 360,
}: Props) {
  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [exerciseNames, setExerciseNames] = useState<string[]>([]);
  const [exercise, setExercise] = useState<string>('');
  const [metric, setMetric] =
    useState<ExerciseTrendResponse['metric']>(defaultMetric);
  const [groupBy, setGroupBy] =
    useState<ExerciseTrendResponse['group_by']>(defaultGroupBy);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const [trend, setTrend] = useState<ExerciseTrendResponse | null>(null);
  const chartRef = useRef<ChartJS<'polarArea'> | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchExerciseNames = async () => {
    setLoading(true);
    setErr(null);

    try {
      const url = new URL(`${base}/api/workout_sessions/exercise/names`);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Names fetch failed: ${res.status}`);

      const json: { exercises: string[] } = await res.json();
      setExerciseNames(json.exercises || []);

      if (!exercise && json.exercises?.length) {
        setExercise(json.exercises[0]);
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load exercise names');
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
      url.searchParams.set('exercise', exercise);
      url.searchParams.set('metric', metric);
      url.searchParams.set('group_by', groupBy);
      url.searchParams.set('tz', tz);

      if (fromDate) url.searchParams.set('from', fromDate);
      if (toDate) url.searchParams.set('to', toDate);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Trend fetch failed: ${res.status}`);

      const json: ExerciseTrendResponse = await res.json();
      setTrend(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load exercise trend');
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

    fetchExerciseNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, base]);

  useEffect(() => {
    if (!exercise) return;

    fetchExerciseTrend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise, metric, groupBy, fromDate, toDate, tz, base]);

  const labels = useMemo(() => {
    if (!trend?.points) return [];

    return trend.points.map((p) => {
      if (groupBy === 'month') return format(parseISO(p.bucket), 'MMM yyyy');
      if (groupBy === 'week') {
        return `Week of ${format(parseISO(p.bucket), 'MMM d')}`;
      }
      return format(parseISO(p.bucket), 'MMM d');
    });
  }, [trend?.points, groupBy]);

  const segmentColors = useMemo(() => {
    const palette = [
      'rgba(139,92,246,0.82)',
      'rgba(96,165,250,0.82)',
      'rgba(236,72,153,0.78)',
      'rgba(34,197,94,0.76)',
      'rgba(245,158,11,0.78)',
      'rgba(14,165,233,0.78)',
      'rgba(168,85,247,0.80)',
      'rgba(244,114,182,0.76)',
    ];

    const n = labels.length || 1;
    return Array.from({ length: n }, (_, i) => palette[i % palette.length]);
  }, [labels]);

  const data = useMemo<ChartData<'polarArea'>>(() => {
    const vals = (trend?.points || []).map((p) => p.value ?? 0);

    return {
      labels,
      datasets: [
        {
          label:
            metric === '1rm'
              ? '1RM (lbs)'
              : metric === 'max_weight'
              ? 'Max Weight (lbs)'
              : metric === 'avg_weight'
              ? 'Avg Weight (lbs)'
              : metric === 'total_volume'
              ? 'Total Volume (lbs)'
              : 'Total Reps',
          data: vals,
          backgroundColor: segmentColors,
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,0.78)',
        },
      ],
    };
  }, [trend?.points, labels, metric, segmentColors]);

  const options = useMemo<ChartOptions<'polarArea'>>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: isMobile ? 'bottom' : 'right',
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
            label: (ctx: TooltipItem<'polarArea'>) => {
              const v = Number(ctx.parsed);
              if (metric === 'total_reps') return `Reps: ${v}`;
              if (metric === 'total_volume') return `Volume: ${v} lbs`;
              if (metric === 'avg_weight') return `Avg: ${v} lbs`;
              if (metric === 'max_weight') return `Max: ${v} lbs`;
              return `1RM: ${v} lbs`;
            },
          },
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          ticks: {
            showLabelBackdrop: false,
            color: '#64748b',
          },
          grid: {
            circular: true,
            color: 'rgba(148,163,184,0.18)',
          },
          angleLines: {
            color: 'rgba(148,163,184,0.18)',
          },
        },
      },
      animation: { animateRotate: true, animateScale: true },
    }),
    [metric, isMobile]
  );

  const totalValue = trend?.points?.reduce((sum, p) => sum + (p.value || 0), 0) ?? 0;
  const bestPoint = trend?.points?.reduce<TrendPoint | null>(
    (best, p) => (!best || p.value > best.value ? p : best),
    null
  );

  const bestLabel = bestPoint
    ? groupBy === 'month'
      ? format(parseISO(bestPoint.bucket), 'MMM yyyy')
      : groupBy === 'week'
      ? `Week of ${format(parseISO(bestPoint.bucket), 'MMM d')}`
      : format(parseISO(bestPoint.bucket), 'MMM d')
    : '—';

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
        <div style={{ marginBottom: '1.25rem' }}>
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
            <FiActivity />
            Exercise Trend
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
            Exercise performance breakdown
          </h2>

          <p
            style={{
              margin: '0.55rem 0 0',
              color: '#64748b',
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            Compare strength, reps, and volume trends for a selected exercise
            across days, weeks, or months.
          </p>
        </div>

        <div
          style={{
            borderRadius: 30,
            padding: '1rem',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.92))',
            border: '1px solid rgba(139,92,246,0.08)',
            boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            marginBottom: '1rem',
          }}
        >
          <div
            className="d-flex align-items-center mb-3"
            style={{ gap: '0.55rem', color: '#475569', fontWeight: 850 }}
          >
            <FiFilter color="#8b5cf6" />
            Filters
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
              <label style={labelStyle}>Exercise</label>
              <select
                value={exercise}
                onChange={(e) => setExercise(e.target.value)}
                disabled={loading || exerciseNames.length === 0}
                aria-label="Select exercise"
                style={inputStyle}
              >
                {exerciseNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-xl-2">
              <label style={labelStyle}>Metric</label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as typeof metric)}
                aria-label="Select metric"
                style={inputStyle}
              >
                <option value="1rm">1RM</option>
                <option value="max_weight">Max Weight</option>
                <option value="avg_weight">Avg Weight</option>
                <option value="total_volume">Total Volume</option>
                <option value="total_reps">Total Reps</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-xl-2">
              <label style={labelStyle}>Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
                aria-label="Select grouping"
                style={inputStyle}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-xl-2">
              <label style={labelStyle}>From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="col-12 col-md-6 col-xl-2">
              <label style={labelStyle}>To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {!loading && !err && (
          <div className="row g-3 mb-3">
            {[
              {
                label: 'Exercise',
                value: exercise || '—',
                icon: <FiTarget />,
              },
              {
                label: 'Metric',
                value: metricLabels[metric],
                icon: <FiActivity />,
              },
              {
                label: 'Best period',
                value: bestLabel,
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
                      fontWeight: 950,
                      fontSize: '1.15rem',
                      letterSpacing: '-0.03em',
                      wordBreak: 'break-word',
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
        )}

        {loading && (
          <div
            style={{
              height: isMobile ? 320 : height,
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
            key={`${exercise}-${metric}-${groupBy}-${fromDate}-${toDate}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              borderRadius: 30,
              padding: isMobile ? '1rem 0.75rem' : '1.25rem',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
              overflowX: 'hidden',
            }}
          >
            <div
              style={{
                color: '#64748b',
                fontSize: '0.92rem',
                fontWeight: 750,
                marginBottom: '0.85rem',
                lineHeight: 1.6,
              }}
            >
              {exercise ? (
                <>
                  Showing <strong>{exercise}</strong> •{' '}
                  <strong>{metricLabels[metric]}</strong> •{' '}
                  <strong>{groupBy}</strong>
                </>
              ) : (
                'Pick an exercise'
              )}
            </div>

            <div
              style={{
                width: '100%',
                minHeight: isMobile ? 360 : height,
                height: isMobile ? 420 : height,
              }}
            >
              {trend?.points?.length ? (
                <PolarArea ref={chartRef} data={data} options={options} />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center text-center"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 24,
                    background:
                      'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(96,165,250,0.08))',
                    border: '1px solid rgba(139,92,246,0.08)',
                    color: '#64748b',
                    fontWeight: 800,
                    padding: '1rem',
                  }}
                >
                  {exercise
                    ? 'No data for the selected range.'
                    : 'Pick an exercise to see the trend.'}
                </div>
              )}
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
                Total selected value: <strong>{totalValue}</strong>. Use filters
                above to narrow the trend.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  color: '#475569',
  fontSize: '0.82rem',
  fontWeight: 800,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 42,
  borderRadius: 14,
  border: '1px solid rgba(139,92,246,0.14)',
  background: '#ffffff',
  color: '#334155',
  fontWeight: 800,
  padding: '0 0.75rem',
  outline: 'none',
};


{/*
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

 
  return (
    <div className="w-100">
    
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

*/}