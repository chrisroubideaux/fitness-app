// components/profile/charts/WeeklyProgressChart.tsx
// components/profile/charts/WeeklyProgressChart.tsx

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
  type ScriptableContext,
  type TooltipItem,
  type ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, parseISO } from 'date-fns';
import MonthlySummaryChart, { type MonthlyRow } from './MonthlySummaryChart';
import ExerciseTrendChart from './ExerciseTrendChart';
import {
  FiBarChart2,
  FiChevronLeft,
  FiChevronRight,
  FiInfo,
} from 'react-icons/fi';

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
  week_start: string;
  points: DayPoint[];
};

type WeekBucket = {
  week_start: string;
  points: DayPoint[];
};

type WeeksHistoryResponse = {
  weeks: WeekBucket[];
};

type MonthlyBucket = {
  month: string;
  minutes: number;
  sessions: number;
};

type MonthlyResponse = {
  months: MonthlyBucket[];
};

type Props = {
  apiBase?: string;
  tz?: string;
};

type ChartKind =
  | 'weekly'
  | 'weeksHistory'
  | 'monthlySummary'
  | 'exerciseTrend'
  | 'typeBreakdown';

export default function WeeklyProgressChart({
  apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000',
  tz = 'America/Chicago',
}: Props) {
  const [chartKind, setChartKind] = useState<ChartKind>('weekly');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const chartRef = useRef<ChartJS<'bar'> | null>(null);

  const [weeklyData, setWeeklyData] = useState<WeeklyResponse | null>(null);
  const [weeksBack, setWeeksBack] = useState<number>(0);

  const [weeksHistory, setWeeksHistory] = useState<WeeksHistoryResponse | null>(null);
  const [weeksCount, setWeeksCount] = useState<number>(8);

  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | null>(null);
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [isMobile, setIsMobile] = useState(false);

  const base = useMemo(() => apiBase.replace(/\/+$/, ''), [apiBase]);
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWeekly = async (wb: number) => {
    setLoading(true);
    setErr(null);

    try {
      const url = new URL(`${base}/api/workout_sessions/weekly`);
      url.searchParams.set('tz', tz);
      if (wb > 0) url.searchParams.set('weeks_back', String(wb));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Weekly fetch failed: ${res.status}`);

      const json: WeeklyResponse = await res.json();
      setWeeklyData(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeksHistory = async (n: number) => {
    setLoading(true);
    setErr(null);

    try {
      const url = new URL(`${base}/api/workout_sessions/history/weeks`);
      url.searchParams.set('tz', tz);
      url.searchParams.set('n', String(n));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Weeks history fetch failed: ${res.status}`);

      const json: WeeksHistoryResponse = await res.json();
      setWeeksHistory(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (m: number) => {
    setLoading(true);
    setErr(null);

    try {
      const url = new URL(`${base}/api/workout_sessions/summary/monthly`);
      url.searchParams.set('tz', tz);
      url.searchParams.set('months', String(m));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) throw new Error(`Monthly summary fetch failed: ${res.status}`);

      const json: MonthlyResponse = await res.json();
      setMonthlyData(json);
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

    if (chartKind === 'weekly') {
      fetchWeekly(weeksBack);
    } else if (chartKind === 'weeksHistory') {
      fetchWeeksHistory(weeksCount);
    } else if (chartKind === 'monthlySummary') {
      fetchMonthlySummary(monthsCount);
    } else {
      setLoading(false);
      setErr(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chartKind, weeksBack, weeksCount, monthsCount, tz, base]);

  const weeklyRows = useMemo(() => {
    const d = weeklyData;
    if (!d?.points) return [];

    return d.points.map((p) => ({
      label: p.label,
      Minutes: p.minutes,
      sessions: p.sessions,
      workouts: p.workouts ?? [],
    }));
  }, [weeklyData]);

  const weeklyTotalMinutes = weeklyRows.reduce((sum, d) => sum + d.Minutes, 0);
  const weeklyTotalSessions = weeklyRows.reduce((sum, d) => sum + d.sessions, 0);

  const weeklyBarData: ChartData<'bar', number[], string> = useMemo(() => {
    return {
      labels: weeklyRows.map((d) => d.label),
      datasets: [
        {
          label: 'Minutes',
          data: weeklyRows.map((d) => d.Minutes),
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
  }, [weeklyRows]);

  const weeklyOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        backgroundColor: 'rgba(15,23,42,0.92)',
        padding: 12,
        cornerRadius: 12,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => `${context.parsed.y} min`,
        },
      },
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 20, color: '#64748b' },
        grid: { color: 'rgba(148,163,184,0.16)' },
        border: { display: false },
      },
      x: {
        ticks: { color: '#64748b' },
        grid: { display: false },
        border: { display: false },
      },
    },
  };

  const weekStartPretty = useMemo(() => {
    const d = weeklyData?.week_start;
    if (!d) return '--';
    return format(parseISO(d), 'MMMM d, yyyy');
  }, [weeklyData?.week_start]);

  const historyRows = useMemo(() => {
    if (!weeksHistory?.weeks) return [];

    return weeksHistory.weeks.map((w) => {
      const totalMinutes = w.points.reduce(
        (sum, p) => sum + (p.minutes || 0),
        0
      );

      return {
        week_start_iso: w.week_start,
        label: format(parseISO(w.week_start), 'MMM d'),
        totalMinutes,
        days: w.points,
      };
    });
  }, [weeksHistory]);

  const historyBarData: ChartData<'bar', number[], string> = useMemo(() => {
    return {
      labels: historyRows.map((r) => r.label),
      datasets: [
        {
          label: 'Total Minutes',
          data: historyRows.map((r) => r.totalMinutes),
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
  }, [historyRows]);

  const historyOptions: ChartOptions<'bar'> = {
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
            const wk = historyRows[idx];

            if (!wk) return '';

            const startNice = format(parseISO(wk.week_start_iso), 'MMMM d, yyyy');
            return `Week of ${startNice}`;
          },
          label: (item: TooltipItem<'bar'>) => {
            const idx = item.dataIndex ?? 0;
            const wk = historyRows[idx];

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

  const monthlyRows: MonthlyRow[] = useMemo(() => {
    if (!monthlyData?.months) return [];

    return monthlyData.months.map((m) => {
      const jsDate = new Date(`${m.month}-01`);

      return {
        monthIso: m.month,
        label: format(jsDate, 'MMM yyyy'),
        minutes: m.minutes,
        sessions: m.sessions,
      };
    });
  }, [monthlyData]);

  const Placeholder = ({
    title,
    subtitle,
  }: {
    title: string;
    subtitle: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        borderRadius: 30,
        padding: '1.25rem',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
        border: '1px solid rgba(139,92,246,0.08)',
        boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
      }}
    >
      <h3
        style={{
          margin: 0,
          color: '#111827',
          fontWeight: 950,
          letterSpacing: '-0.03em',
        }}
      >
        {title}
      </h3>

      <p style={{ margin: '0.5rem 0 1rem', color: '#64748b', lineHeight: 1.7 }}>
        {subtitle}
      </p>

      <div
        style={{
          height: 280,
          borderRadius: 24,
          background:
            'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(96,165,250,0.08))',
          border: '1px solid rgba(139,92,246,0.08)',
        }}
      />
    </motion.div>
  );

  const renderChart = () => {
    switch (chartKind) {
      case 'weekly':
        return (
          <motion.div
            key={weeklyData?.week_start ?? 'chart-weekly'}
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
              overflowX: isMobile ? 'auto' : 'hidden',
            }}
          >
            <div
              style={{
                marginBottom: '0.85rem',
                color: '#64748b',
                fontSize: '0.92rem',
                fontWeight: 750,
              }}
            >
              Week starting <strong>{weeklyRows.length ? weekStartPretty : '--'}</strong>
            </div>

            <div
              style={{
                width: '100%',
                minWidth: isMobile ? 680 : 'auto',
                height: isMobile ? 320 : 360,
              }}
            >
              <Bar ref={chartRef} data={weeklyBarData} options={weeklyOptions} />
            </div>

            <div className="row g-3 mt-2">
              {[
                { label: 'Total minutes', value: `${weeklyTotalMinutes}m` },
                { label: 'Sessions', value: weeklyTotalSessions },
                { label: 'Week', value: weeksBack === 0 ? 'Current' : `${weeksBack} back` },
              ].map((item) => (
                <div key={item.label} className="col-12 col-md-4">
                  <div
                    style={{
                      borderRadius: 20,
                      padding: '0.95rem',
                      background: 'rgba(255,255,255,0.72)',
                      border: '1px solid rgba(139,92,246,0.08)',
                    }}
                  >
                    <div
                      style={{
                        color: '#111827',
                        fontWeight: 950,
                        fontSize: '1.35rem',
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        color: '#64748b',
                        fontWeight: 750,
                        fontSize: '0.85rem',
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '0.65rem', marginTop: '1rem' }}>
              {weeklyRows.map((d) => (
                <motion.div
                  key={`row-${d.label}`}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    borderRadius: 18,
                    padding: '0.8rem 0.9rem',
                    background: 'rgba(255,255,255,0.72)',
                    border: '1px solid rgba(139,92,246,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <span
                    style={{
                      width: 56,
                      textAlign: 'center',
                      padding: '0.3rem 0.5rem',
                      borderRadius: 999,
                      background: 'rgba(139,92,246,0.10)',
                      color: '#8b5cf6',
                      fontWeight: 850,
                      fontSize: '0.8rem',
                    }}
                  >
                    {d.label}
                  </span>

                  <span style={{ color: '#64748b', fontWeight: 750 }}>
                    {d.sessions} session{d.sessions === 1 ? '' : 's'} • {d.Minutes} min
                  </span>

                  <div className="d-flex flex-wrap" style={{ gap: '0.4rem' }}>
                    {(d.workouts ?? []).map((w) => (
                      <span
                        key={`${d.label}-${w}`}
                        style={{
                          padding: '0.25rem 0.55rem',
                          borderRadius: 999,
                          background: 'rgba(148,163,184,0.10)',
                          color: '#475569',
                          fontSize: '0.78rem',
                          fontWeight: 750,
                        }}
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'weeksHistory':
        return (
          <motion.div
            key={`weeks-${weeksCount}`}
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
              overflowX: isMobile ? 'auto' : 'hidden',
            }}
          >
            <div
              style={{
                color: '#64748b',
                fontSize: '0.92rem',
                fontWeight: 750,
                marginBottom: '0.85rem',
              }}
            >
              Last <strong>{weeksCount}</strong> week(s)
            </div>

            <div
              style={{
                width: '100%',
                minWidth: isMobile ? 720 : 'auto',
                height: isMobile ? 330 : 380,
              }}
            >
              <Bar ref={chartRef} data={historyBarData} options={historyOptions} />
            </div>

            <div
              style={{
                marginTop: '1rem',
                color: '#64748b',
                fontSize: '0.9rem',
                fontWeight: 750,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiInfo />
              Hover a bar to see the Mon–Sun breakdown.
              {isMobile ? ' Swipe horizontally to view more.' : ''}
            </div>
          </motion.div>
        );

      case 'monthlySummary':
        return (
          <motion.div
            key={`months-${monthsCount}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              borderRadius: 30,
              padding: '1.25rem',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.94))',
              border: '1px solid rgba(139,92,246,0.08)',
              boxShadow: '0 14px 36px rgba(15,23,42,0.06)',
            }}
          >
            <div
              style={{
                color: '#64748b',
                fontSize: '0.92rem',
                fontWeight: 750,
                marginBottom: '0.85rem',
              }}
            >
              Last <strong>{monthsCount}</strong> month(s)
            </div>

            <MonthlySummaryChart rows={monthlyRows} />
          </motion.div>
        );

      case 'exerciseTrend':
        return <ExerciseTrendChart apiBase={apiBase} tz={tz} />;

      case 'typeBreakdown':
        return (
          <Placeholder
            title="Workout Type Breakdown"
            subtitle="Distribution of Strength/Cardio/Yoga/HIIT over a period. Coming soon."
          />
        );

      default:
        return null;
    }
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
          className="d-flex flex-column flex-xl-row justify-content-between align-items-xl-start"
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
              Progress
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
              Training analytics
            </h2>

            <p
              style={{
                margin: '0.55rem 0 0',
                color: '#64748b',
                lineHeight: 1.7,
                maxWidth: 720,
              }}
            >
              Track your workout minutes, sessions, history, and long-term
              consistency across different progress views.
            </p>
          </div>

          <div
            className="d-flex flex-wrap align-items-center"
            style={{ gap: '0.65rem' }}
          >
            <button
              type="button"
              onClick={() => setWeeksBack((w) => Math.min(52, w + 1))}
              disabled={loading || chartKind !== 'weekly'}
              style={{
                minHeight: 40,
                padding: '0.65rem 0.85rem',
                borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.22)',
                background: '#ffffff',
                color: chartKind === 'weekly' ? '#475569' : '#94a3b8',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor: loading || chartKind !== 'weekly' ? 'not-allowed' : 'pointer',
              }}
            >
              <FiChevronLeft />
              Prev
            </button>

            <button
              type="button"
              onClick={() => setWeeksBack(0)}
              disabled={loading || chartKind !== 'weekly'}
              style={{
                minHeight: 40,
                padding: '0.65rem 0.85rem',
                borderRadius: 14,
                border:
                  weeksBack === 0
                    ? '1px solid rgba(139,92,246,0.24)'
                    : '1px solid rgba(148,163,184,0.22)',
                background:
                  weeksBack === 0
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(96,165,250,0.12))'
                    : '#ffffff',
                color: weeksBack === 0 ? '#7c3aed' : '#475569',
                fontWeight: 850,
                cursor: loading || chartKind !== 'weekly' ? 'not-allowed' : 'pointer',
              }}
            >
              This Week
            </button>

            <button
              type="button"
              onClick={() => setWeeksBack((w) => Math.max(0, w - 1))}
              disabled={loading || weeksBack === 0 || chartKind !== 'weekly'}
              style={{
                minHeight: 40,
                padding: '0.65rem 0.85rem',
                borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.22)',
                background: '#ffffff',
                color:
                  loading || weeksBack === 0 || chartKind !== 'weekly'
                    ? '#94a3b8'
                    : '#475569',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                cursor:
                  loading || weeksBack === 0 || chartKind !== 'weekly'
                    ? 'not-allowed'
                    : 'pointer',
              }}
            >
              Next
              <FiChevronRight />
            </button>

            <select
              value={chartKind}
              onChange={(e) => setChartKind(e.target.value as ChartKind)}
              disabled={loading}
              aria-label="Select chart"
              title="Select chart"
              style={{
                minHeight: 40,
                borderRadius: 14,
                border: '1px solid rgba(139,92,246,0.14)',
                background: '#ffffff',
                color: '#334155',
                fontWeight: 850,
                padding: '0 0.75rem',
                outline: 'none',
              }}
            >
              <option value="weekly">Weekly</option>
              <option value="weeksHistory">Weeks History</option>
              <option value="monthlySummary">Monthly</option>
              <option value="exerciseTrend">Exercise Trend</option>
              <option value="typeBreakdown">Type Breakdown</option>
            </select>

            {chartKind === 'weeksHistory' && (
              <select
                value={weeksCount}
                onChange={(e) => setWeeksCount(Number(e.target.value))}
                disabled={loading}
                aria-label="Weeks count"
                title="How many weeks"
                style={{
                  minHeight: 40,
                  borderRadius: 14,
                  border: '1px solid rgba(139,92,246,0.14)',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 850,
                  padding: '0 0.75rem',
                  outline: 'none',
                }}
              >
                <option value={4}>4 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
                <option value={24}>24 weeks</option>
              </select>
            )}

            {chartKind === 'monthlySummary' && (
              <select
                value={monthsCount}
                onChange={(e) => setMonthsCount(Number(e.target.value))}
                disabled={loading}
                aria-label="Months count"
                title="How many months"
                style={{
                  minHeight: 40,
                  borderRadius: 14,
                  border: '1px solid rgba(139,92,246,0.14)',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 850,
                  padding: '0 0.75rem',
                  outline: 'none',
                }}
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
              </select>
            )}
          </div>
        </div>

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

        {!loading && !err && renderChart()}
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
  type ScriptableContext,
  type TooltipItem,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { format, parseISO } from "date-fns";
import MonthlySummaryChart, { type MonthlyRow } from "./MonthlySummaryChart";
import ExerciseTrendChart from "./ExerciseTrendChart";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);


type DayPoint = {
  label: string; // Mon..Sun
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

type WeekBucket = {
  week_start: string; // YYYY-MM-DD (Monday)
  points: DayPoint[]; // 7 days Mon..Sun
};

type WeeksHistoryResponse = {
  weeks: WeekBucket[];
};

type MonthlyBucket = {
  month: string; // YYYY-MM
  minutes: number;
  sessions: number;
};
type MonthlyResponse = {
  months: MonthlyBucket[];
};

type Props = {
  apiBase?: string; // default http://localhost:5000 (via NEXT_PUBLIC_API_BASE_URL)
  tz?: string; // used for API query only
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
  // global
  const [chartKind, setChartKind] = useState<ChartKind>("weekly");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  // Ref for bar charts rendered in this file
  const chartRef = useRef<ChartJS<"bar"> | null>(null);

  // weekly
  const [weeklyData, setWeeklyData] = useState<WeeklyResponse | null>(null);
  const [weeksBack, setWeeksBack] = useState<number>(0);

  // weeks history
  const [weeksHistory, setWeeksHistory] = useState<WeeksHistoryResponse | null>(null);
  const [weeksCount, setWeeksCount] = useState<number>(8);

  // monthly summary
  const [monthlyData, setMonthlyData] = useState<MonthlyResponse | null>(null);
  const [monthsCount, setMonthsCount] = useState<number>(6);

  // sanitize base (avoid trailing slash)
  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase]);
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

 
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
      setWeeklyData(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeksHistory = async (n: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/history/weeks`);
      url.searchParams.set("tz", tz);
      url.searchParams.set("n", String(n));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error(`Weeks history fetch failed: ${res.status}`);
      const json: WeeksHistoryResponse = await res.json();
      setWeeksHistory(json);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlySummary = async (m: number) => {
    setLoading(true);
    setErr(null);
    try {
      const url = new URL(`${base}/api/workout_sessions/summary/monthly`);
      url.searchParams.set("tz", tz);
      url.searchParams.set("months", String(m));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token ?? ""}` },
      });
      if (!res.ok) throw new Error(`Monthly summary fetch failed: ${res.status}`);
      const json: MonthlyResponse = await res.json();
      setMonthlyData(json);
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
    } else if (chartKind === "weeksHistory") {
      fetchWeeksHistory(weeksCount);
    } else if (chartKind === "monthlySummary") {
      fetchMonthlySummary(monthsCount);
    } else {
      // placeholders for others
      setLoading(false);
      setErr(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, chartKind, weeksBack, weeksCount, monthsCount, tz, base]);


  const weeklyRows = useMemo(() => {
    const d = weeklyData;
    if (!d?.points) return [];
    return d.points.map((p) => ({
      label: p.label,
      Minutes: p.minutes,
      sessions: p.sessions,
      workouts: p.workouts ?? [],
    }));
  }, [weeklyData]);

  const weeklyBarData: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: weeklyRows.map((d) => d.label),
      datasets: [
        {
          label: "Minutes",
          data: weeklyRows.map((d) => d.Minutes),
          borderRadius: 8,
          backgroundColor: (ctx: ScriptableContext<"bar">) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return "#4A90E2";
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
  }, [weeklyRows]);

  const weeklyOptions: ChartOptions<"bar"> = {
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
    const d = weeklyData?.week_start;
    if (!d) return "--";
    return format(parseISO(d), "MMMM d, yyyy");
  }, [weeklyData?.week_start]);


  const historyRows = useMemo(() => {
    if (!weeksHistory?.weeks) return [];
    return weeksHistory.weeks.map((w) => {
      const totalMinutes = w.points.reduce((sum, p) => sum + (p.minutes || 0), 0);
      return {
        week_start_iso: w.week_start,
        label: format(parseISO(w.week_start), "MMM d"),
        totalMinutes,
        days: w.points,
      };
    });
  }, [weeksHistory]);

  const historyBarData: ChartData<"bar", number[], string> = useMemo(() => {
    return {
      labels: historyRows.map((r) => r.label),
      datasets: [
        {
          label: "Total Minutes",
          data: historyRows.map((r) => r.totalMinutes),
          borderRadius: 8,
          backgroundColor: (ctx: ScriptableContext<"bar">) => {
            const chart = ctx.chart;
            const { ctx: canvasCtx, chartArea } = chart;
            if (!chartArea) return "#4A90E2";
            const gradient = canvasCtx.createLinearGradient(
              0,
              chartArea.bottom,
              0,
              chartArea.top
            );
            gradient.addColorStop(0, "rgba(74,144,226,0.85)");
            gradient.addColorStop(1, "rgba(123,237,159,0.95)");
            return gradient;
          },
        },
      ],
    };
  }, [historyRows]);

  const historyOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const idx = items[0]?.dataIndex ?? 0;
            const wk = historyRows[idx];
            if (!wk) return "";
            const startNice = format(parseISO(wk.week_start_iso), "MMMM d, yyyy");
            return `Week of ${startNice}`;
          },
          label: (item: TooltipItem<"bar">) => {
            const idx = item.dataIndex ?? 0;
            const wk = historyRows[idx];
            if (!wk) return "";
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

  
  const monthlyRows: MonthlyRow[] = useMemo(() => {
    if (!monthlyData?.months) return [];
    return monthlyData.months.map((m) => {
      const jsDate = new Date(`${m.month}-01`); // YYYY-MM -> Date
      return {
        monthIso: m.month,
        label: format(jsDate, "MMM yyyy"),
        minutes: m.minutes,
        sessions: m.sessions,
      };
    });
  }, [monthlyData]);

  
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

 
  const renderChart = () => {
    switch (chartKind) {
      case "weekly":
        return (
          <motion.div
            key={weeklyData?.week_start ?? "chart-weekly"}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card shadow-sm chart-gradient"
            style={{ borderRadius: 16 }}
          >
            <div className="card-body">
              <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
                Week starting <strong>{weeklyRows.length ? weekStartPretty : "--"}</strong>
              </div>

              <div style={{ width: "100%", height: 320 }}>
                <Bar ref={chartRef} data={weeklyBarData} options={weeklyOptions} />
              </div>

             
              <div className="mt-3">
                {weeklyRows.map((d) => (
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
          <motion.div
            key={`weeks-${weeksCount}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card shadow-sm chart-gradient"
            style={{ borderRadius: 16 }}
          >
            <div className="card-body">
              <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
                Last <strong>{weeksCount}</strong> week(s)
              </div>

              <div style={{ width: "100%", height: 340 }}>
                <Bar ref={chartRef} data={historyBarData} options={historyOptions} />
              </div>

              <div className="mt-3 text-muted" style={{ fontSize: ".9rem" }}>
                Tip: hover a bar to see the Mon–Sun breakdown for that week.
              </div>
            </div>
          </motion.div>
        );

      case "monthlySummary":
        return (
          <motion.div
            key={`months-${monthsCount}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="card shadow-sm chart-gradient"
            style={{ borderRadius: 16 }}
          >
            <div className="card-body">
              <div className="text-muted mb-2" style={{ fontSize: ".9rem" }}>
                Last <strong>{monthsCount}</strong> month(s)
              </div>

              <MonthlySummaryChart rows={monthlyRows} />
            </div>
          </motion.div>
        );

      case "exerciseTrend":
        return (
        <ExerciseTrendChart apiBase={apiBase} tz={tz} 
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
            {chartKind === "weekly"
              ? "Weekly Progress"
              : chartKind === "weeksHistory"
              ? "Weeks History"
              : chartKind === "monthlySummary"
              ? "Monthly Summary"
              : "Explore other views"}
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

          {chartKind === "weeksHistory" && (
            <div className="gradient-select-wrapper ms-2">
              <select
                className="form-select form-select-sm gradient-select"
                style={{ width: "auto" }}
                value={weeksCount}
                onChange={(e) => setWeeksCount(Number(e.target.value))}
                aria-label="Weeks count"
                disabled={loading}
                title="How many weeks"
              >
                <option value={4}>4 weeks</option>
                <option value={8}>8 weeks</option>
                <option value={12}>12 weeks</option>
                <option value={24}>24 weeks</option>
              </select>
            </div>
          )}

          {chartKind === "monthlySummary" && (
            <div className="gradient-select-wrapper ms-2">
              <select
                className="form-select form-select-sm gradient-select"
                style={{ width: "auto" }}
                value={monthsCount}
                onChange={(e) => setMonthsCount(Number(e.target.value))}
                aria-label="Months count"
                disabled={loading}
                title="How many months"
              >
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={9}>9 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="w-100" style={{ height: 280, borderRadius: 16, background: "rgba(0,0,0,0.04)" }} />
      )}
      {err && !loading && <div className="alert alert-danger">{err}</div>}
      {!loading && !err && renderChart()}
    </div>
  );
}

*/}
