// components/profile/charts/WorkoutPlan.tsx 
// components/profile/charts/WorkoutPlan.tsx

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar,
  FiClock,
  FiActivity,
  FiHeart,
  FiTrendingUp,
  FiMoon,
  FiTarget,
  FiChevronDown,
  FiCheckCircle,
  FiPrinter,
  FiDownload,
  FiTrash2,
  FiPlus,
} from 'react-icons/fi';

const WorkoutModal = dynamic<{ onClose: () => void }>(
  () => import('@/components/profile/questionnaire/WorkoutModal'),
  { ssr: false }
);

type WorkoutPlan = {
  id: string;
  content: string;
  created_at: string;
};

type Day = {
  label: string;
  name: string;
  items: string[];
  rest?: boolean;
};

type Week = {
  title: string;
  intro?: string;
  days: Day[];
};

type ParsedPlan = { weeks: Week[] };

function splitIntoWeeks(raw: string): string[] {
  const text = raw.replace(/\r\n/g, '\n').trim();
  const parts: string[] = [];
  const weekRegex = /^Week\s+\d+.*$/gim;
  let match: RegExpExecArray | null;
  const headers: { index: number }[] = [];

  while ((match = weekRegex.exec(text)) !== null) {
    headers.push({ index: match.index });
  }

  headers.forEach((h, i) => {
    const next = headers[i + 1]?.index ?? text.length;
    parts.push(text.slice(h.index, next).trim());
  });

  return parts.length ? parts : [text];
}

function parseWeekBlock(block: string): Week {
  const lines = block.split('\n').map((l) => l.trim());
  const title = lines[0] || 'Week';
  const restOf = lines.slice(1).join('\n').trim();
  const normalized = restOf.replace(/(?=Day\s+\d+:)/g, '\n');
  const weekLines = normalized.split('\n').map((l) => l.trim());

  const days: Day[] = [];
  const introLines: string[] = [];
  let current: Day | null = null;

  const dayHeaderRe = /^Day\s+(\d+):\s*(.+)$/i;

  for (const ln of weekLines) {
    if (!ln) continue;

    const m = ln.match(dayHeaderRe);

    if (m) {
      if (current) days.push(current);

      const label = `Day ${m[1]}`;
      const name = m[2].trim();

      current = {
        label,
        name,
        items: [],
        rest: /(^|\s)rest(\s|$)/i.test(name),
      };

      continue;
    }

    if (!current) {
      introLines.push(ln);
      continue;
    }

    if (/^\*|-|\d+\./.test(ln)) {
      current.items.push(ln.replace(/^(\*|-|\d+\.)\s*/, ''));
    } else if (/^rest$/i.test(ln)) {
      current.rest = true;
    } else {
      current.items.push(ln);
    }
  }

  if (current) days.push(current);

  return {
    title,
    intro: introLines.length ? introLines.join(' ') : undefined,
    days,
  };
}

function parsePlan(content: string): ParsedPlan {
  return { weeks: splitIntoWeeks(content).map(parseWeekBlock) };
}

function DayCard({ day }: { day: Day }) {
  const isRest = day.rest || /^rest$/i.test(day.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -4,
        boxShadow: '0 16px 32px rgba(15,23,42,0.09)',
      }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        padding: '1rem',
        borderRadius: 24,
        marginBottom: '0.85rem',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(248,250,252,0.94))',
        border: '1px solid rgba(139,92,246,0.08)',
        boxShadow: '0 10px 24px rgba(15,23,42,0.05)',
      }}
    >
      <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-2">
        <div className="d-flex align-items-center gap-2">
          <span
            style={{
              width: 42,
              height: 42,
              minWidth: 42,
              borderRadius: 15,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isRest
                ? 'linear-gradient(135deg, rgba(148,163,184,0.18), rgba(96,165,250,0.12))'
                : 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(96,165,250,0.12))',
              color: isRest ? '#64748b' : '#8b5cf6',
            }}
          >
            {isRest ? <FiMoon /> : <FiActivity />}
          </span>

          <div>
            <div
              style={{
                color: '#111827',
                fontWeight: 900,
                lineHeight: 1.25,
              }}
            >
              {day.label}: {day.name}
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 700,
                marginTop: 3,
              }}
            >
              {isRest ? 'Recovery and reset' : 'Training session'}
            </div>
          </div>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.35rem 0.65rem',
            borderRadius: 999,
            background: isRest
              ? 'rgba(148,163,184,0.12)'
              : 'rgba(139,92,246,0.10)',
            color: isRest ? '#64748b' : '#8b5cf6',
            fontWeight: 850,
            fontSize: '0.75rem',
          }}
        >
          {isRest ? 'Rest Day' : 'Training'}
        </span>
      </div>

      {day.items.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0.8rem 0 0',
            display: 'grid',
            gap: '0.55rem',
          }}
        >
          {day.items.map((it, i) => {
            const isCardio = /cardio|cycling|elliptical|treadmill/i.test(it);
            const isProgress = /increase|add an extra set|deload|reduce/i.test(it);

            return (
              <li
                key={i}
                className="d-flex align-items-start"
                style={{ gap: '0.6rem', color: '#475569', lineHeight: 1.65 }}
              >
                <span
                  style={{
                    marginTop: 3,
                    color: isCardio
                      ? '#db2777'
                      : isProgress
                      ? '#2563eb'
                      : '#8b5cf6',
                    minWidth: 18,
                  }}
                >
                  {isCardio ? (
                    <FiHeart />
                  ) : isProgress ? (
                    <FiTrendingUp />
                  ) : (
                    <FiCheckCircle />
                  )}
                </span>
                <span>{it}</span>
              </li>
            );
          })}
        </ul>
      )}
    </motion.div>
  );
}

function CollapsibleWeek({
  week,
  open,
  onToggle,
  weekRef,
}: {
  week: Week;
  open: boolean;
  onToggle: () => void;
  weekRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={weekRef}
      layout
      style={{
        borderRadius: 28,
        marginBottom: '1rem',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(248,250,252,0.92))',
        border: open
          ? '1px solid rgba(139,92,246,0.18)'
          : '1px solid rgba(139,92,246,0.08)',
        boxShadow: open
          ? '0 18px 42px rgba(15,23,42,0.10)'
          : '0 12px 28px rgba(15,23,42,0.05)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          border: 'none',
          background: open
            ? 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(96,165,250,0.11))'
            : 'rgba(255,255,255,0.58)',
          padding: '1rem',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div className="d-flex align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3" style={{ minWidth: 0 }}>
            <span
              style={{
                width: 48,
                height: 48,
                minWidth: 48,
                borderRadius: 18,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(96,165,250,0.12))',
                color: '#8b5cf6',
              }}
            >
              <FiTarget />
            </span>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: '#111827',
                  fontWeight: 950,
                  lineHeight: 1.25,
                }}
              >
                {week.title}
              </div>

              {week.intro && (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    marginTop: 3,
                  }}
                >
                  {week.intro}
                </div>
              )}
            </div>
          </div>

          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: 14,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: open
                ? 'rgba(139,92,246,0.12)'
                : 'rgba(148,163,184,0.10)',
              color: open ? '#8b5cf6' : '#64748b',
            }}
          >
            <FiChevronDown />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div style={{ padding: '1rem' }}>
              {week.days.length === 0 ? (
                <div style={{ color: '#64748b', fontWeight: 700 }}>
                  No days listed.
                </div>
              ) : (
                week.days.map((d, i) => <DayCard key={`${d.label}-${i}`} day={d} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function WorkoutPlan() {
  const [latestPlan, setLatestPlan] = useState<WorkoutPlan | null>(null);
  const [parsed, setParsed] = useState<ParsedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

  const [openStates, setOpenStates] = useState<boolean[]>([]);
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const weekRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedOpenStatesRef = useRef<boolean[] | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setErr('Missing token');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/ai/my-workout-plans', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const data = await res.json();
        const plan = (data.workout_plans && data.workout_plans[0]) || null;

        if (plan) {
          setLatestPlan(plan);

          const p = parsePlan(plan.content || '');
          setParsed(p);
          setOpenStates(p.weeks.map((_, i) => i === 0));
          setActiveWeek(0);
        }
      } catch (e) {
        console.error(e);
        setErr('Unable to fetch plan.');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  useEffect(() => {
    const handler = () => {
      if (savedOpenStatesRef.current) {
        setOpenStates(savedOpenStatesRef.current);
        savedOpenStatesRef.current = null;
      }
    };

    window.addEventListener('afterprint', handler);

    return () => window.removeEventListener('afterprint', handler);
  }, []);

  const updatedAt = useMemo(() => {
    if (!latestPlan?.created_at) return null;

    try {
      let raw = latestPlan.created_at;

      if (!raw.endsWith('Z') && !raw.includes('+')) {
        raw += 'Z';
      }

      const d = new Date(raw);

      if (isNaN(d.getTime())) return latestPlan.created_at;

      return d.toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        hour12: true,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return latestPlan.created_at;
    }
  }, [latestPlan?.created_at]);

  function handlePillClick(i: number) {
    setActiveWeek(i);
    setOpenStates((prev) => prev.map((_, idx) => idx === i));

    const el = weekRefs.current[i];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleToggleWeek(i: number) {
    setOpenStates((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  async function handleDelete() {
    try {
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert('Missing token, please log in again.');
        return;
      }

      const res = await fetch(
        `http://localhost:5000/api/ai/delete-workout-plan/${latestPlan?.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error('Failed to delete plan');

      setLatestPlan(null);
      setParsed(null);
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('Could not delete plan.');
    }
  }

  function handleGenerate() {
    setShowQuestionnaire(true);
  }

  function handleDownload() {
    if (!latestPlan) return;

    const blob = new Blob([latestPlan.content], {
      type: 'text/markdown;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'workout-plan.md';
    a.click();

    URL.revokeObjectURL(url);
  }

  if (showQuestionnaire) {
    return <WorkoutModal onClose={() => setShowQuestionnaire(false)} />;
  }

  if (loading) {
    return (
      <section
        style={{
          width: '100%',
          borderRadius: 38,
          padding: '1.5rem',
          background:
            'linear-gradient(135deg, #faf7ff 0%, #f5f3ff 36%, #eef7ff 72%, #fdfcff 100%)',
          boxShadow: '0 18px 45px rgba(15,23,42,0.07)',
        }}
      >
        <div className="placeholder-wave">
          <div className="placeholder col-7 mb-2" />
          <div className="placeholder col-4 mb-2" />
          <div className="placeholder col-6 mb-2" />
        </div>
      </section>
    );
  }

  if (err) {
    return (
      <section
        style={{
          borderRadius: 28,
          padding: '1rem',
          background: 'rgba(239,68,68,0.10)',
          border: '1px solid rgba(239,68,68,0.16)',
          color: '#b91c1c',
          fontWeight: 800,
        }}
      >
        {err}
      </section>
    );
  }

  if (!latestPlan || !parsed) {
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
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.45rem 0.8rem',
            borderRadius: 999,
            background: 'rgba(139,92,246,0.10)',
            color: '#8b5cf6',
            fontWeight: 850,
            fontSize: '0.78rem',
            marginBottom: '1rem',
          }}
        >
          No Plan Yet
        </span>

        <h2
          style={{
            color: '#111827',
            fontWeight: 950,
            letterSpacing: '-0.04em',
            fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
          }}
        >
          No workout plan available
        </h2>

        <p
          style={{
            maxWidth: 620,
            margin: '0.75rem auto 1.5rem',
            color: '#64748b',
            lineHeight: 1.75,
          }}
        >
          Generate a personalized plan based on your goals, experience, and
          current fitness routine.
        </p>

        <button
          type="button"
          onClick={handleGenerate}
          style={{
            minHeight: 46,
            padding: '0.85rem 1.1rem',
            borderRadius: 16,
            border: '1px solid transparent',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            color: '#ffffff',
            fontWeight: 900,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
          }}
        >
          <FiPlus />
          Generate Plan
        </button>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
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
                display: 'inline-block',
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
              Workout Plan
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
              Your personalized training plan
            </h2>

            {updatedAt && (
              <p
                style={{
                  margin: '0.65rem 0 0',
                  color: '#64748b',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <FiClock />
                Last Updated: {updatedAt}
              </p>
            )}
          </div>

          <div className="d-flex flex-wrap" style={{ gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                minHeight: 42,
                padding: '0.75rem 0.95rem',
                borderRadius: 14,
                border: '1px solid rgba(239,68,68,0.16)',
                background: 'rgba(254,242,242,0.90)',
                color: '#dc2626',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <FiTrash2 />
              Delete
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              style={{
                minHeight: 42,
                padding: '0.75rem 0.95rem',
                borderRadius: 14,
                border: '1px solid rgba(148,163,184,0.24)',
                background: '#ffffff',
                color: '#475569',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <FiPrinter />
              Print
            </button>

            <button
              type="button"
              onClick={handleDownload}
              style={{
                minHeight: 42,
                padding: '0.75rem 0.95rem',
                borderRadius: 14,
                border: '1px solid transparent',
                background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                color: '#ffffff',
                fontWeight: 850,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                boxShadow: '0 12px 26px rgba(139,92,246,0.18)',
              }}
            >
              <FiDownload />
              Download
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.55rem',
            overflowX: 'auto',
            paddingBottom: '0.7rem',
            marginBottom: '1rem',
          }}
        >
          {parsed.weeks.map((w, i) => (
            <button
              key={w.title + i}
              type="button"
              onClick={() => handlePillClick(i)}
              style={{
                flex: '0 0 auto',
                whiteSpace: 'nowrap',
                minHeight: 40,
                borderRadius: 999,
                padding: '0.65rem 0.9rem',
                border:
                  i === activeWeek
                    ? '1px solid rgba(139,92,246,0.24)'
                    : '1px solid rgba(148,163,184,0.18)',
                background:
                  i === activeWeek
                    ? 'linear-gradient(135deg, rgba(139,92,246,0.16), rgba(96,165,250,0.12))'
                    : 'rgba(255,255,255,0.74)',
                color: i === activeWeek ? '#7c3aed' : '#475569',
                fontWeight: 850,
                boxShadow:
                  i === activeWeek ? '0 10px 22px rgba(139,92,246,0.10)' : 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
              }}
            >
              <FiCalendar />
              Week {i + 1}
            </button>
          ))}
        </div>

        <div>
          {parsed.weeks.map((w, i) => (
            <CollapsibleWeek
              key={w.title + i}
              week={w}
              open={openStates[i]}
              onToggle={() => handleToggleWeek(i)}
              weekRef={(el) => {
                weekRefs.current[i] = el;
              }}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}