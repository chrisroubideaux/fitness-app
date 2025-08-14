// Workout Plan Chart
/* components/profile/charts/WorkoutPlan.tsx */
"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/fi";

/** ---------- Types ---------- */
type WorkoutPlan = {
  id: string;
  content: string;       // markdown-ish block you showed
  created_at: string;
};

type Day = {
  label: string;         // "Day 1"
  name: string;          // "Chest & Triceps" (may be "Rest")
  items: string[];       // exercises / notes
  rest?: boolean;
};

type Week = {
  title: string;         // "Week 1 - Foundation Week"
  intro?: string;        // Week description lines before first Day
  days: Day[];
};

type ParsedPlan = {
  weeks: Week[];
};

/** ---------- Helpers (Parsing) ---------- */
/**
 * Split the whole content into week blocks based on headings like:
 * "Week 1 - Foundation Week" / "Week 2 - Intensity Week"
 */
function splitIntoWeeks(raw: string): string[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const parts: string[] = [];
  const weekRegex = /^Week\s+\d+.*$/gmi;
  let match: RegExpExecArray | null;

  const headers: { index: number }[] = [];
  while ((match = weekRegex.exec(text)) !== null) {
    headers.push({ index: match.index });
  }
  headers.forEach((h, i) => {
    const next = headers[i + 1]?.index ?? text.length;
    parts.push(text.slice(h.index, next).trim());
  });
  if (parts.length === 0) {
    // no "Week" headers found -> treat entire block as a single "Week 1"
    return [text];
  }
  return parts;
}

/**
 * Parse one week block into a Week structure.
 * Handles both multi-line days and compressed lines (e.g. "Day 1: ... Day 2: ...").
 */
function parseWeekBlock(block: string): Week {
  const lines = block.split("\n").map((l) => l.trim());
  const title = lines[0] || "Week";
  const restOf = lines.slice(1).join("\n").trim();

  // Split rest of the week into Day chunks even if multiple days are on one line
  // We’ll inject line breaks before each "Day X:" token to simplify parsing.
  const normalized = restOf.replace(/(?=Day\s+\d+:)/g, "\n");
  const weekLines = normalized.split("\n").map((l) => l.trim());

  const days: Day[] = [];
  const introLines: string[] = [];
  let current: Day | null = null;

  const dayHeaderRe = /^Day\s+(\d+):\s*(.+)$/i;

  for (const ln of weekLines) {
    if (!ln) continue;

    const dayMatch = ln.match(dayHeaderRe);
    if (dayMatch) {
      // Push the previous day
      if (current) days.push(current);
      const dayLabel = `Day ${dayMatch[1]}`;
      const dayName = dayMatch[2].trim();
      current = {
        label: dayLabel,
        name: dayName,
        items: [],
        rest: /(^|\s)rest(\s|$)/i.test(dayName),
      };
      continue;
    }

    // If we haven’t started days yet, lines are intro/notes
    if (!current) {
      introLines.push(ln);
      continue;
    }

    // Within a day — gather items
    if (/^\*|-|\d+\./.test(ln)) {
      // bullet/numbered lines -> strip list marker
      const item = ln.replace(/^(\*|-|\d+\.)\s*/, "");
      current.items.push(item);
    } else if (/^rest$/i.test(ln)) {
      current.rest = true;
    } else {
      // Plain sentence = exercise/note line
      current.items.push(ln);
    }
  }
  if (current) days.push(current);

  // Final polish: if week had compressed single-line days but no items,
  // we’ll at least keep the day headers as cards.
  return {
    title,
    intro: introLines.length ? introLines.join(" ") : undefined,
    days,
  };
}

/** Main parser: whole plan -> weeks */
function parsePlan(content: string): ParsedPlan {
  const blocks = splitIntoWeeks(content);
  const weeks = blocks.map(parseWeekBlock);
  return { weeks };
}

/** ---------- UI Bits ---------- */

function GradientHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div
      className="p-3 rounded-3 mb-2"
      style={{
        background:
          "linear-gradient(135deg, rgba(126,142,241,0.25), rgba(91,209,215,0.25))",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="d-flex align-items-center gap-2">
        <FiCalendar />
        <h6 className="m-0">{title}</h6>
      </div>
      {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
    </div>
  );
}

function DayCard({ day }: { day: Day }) {
  const isRest = day.rest || /^rest$/i.test(day.name);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-3 mb-2"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
        <div className="d-flex align-items-center gap-2">
          {isRest ? <FiMoon /> : <FiActivity />}
          <strong>
            {day.label}: {day.name}
          </strong>
        </div>
        {isRest ? (
          <span className="badge rounded-pill text-bg-light border">
            Rest Day
          </span>
        ) : (
          <span className="badge rounded-pill" style={{ background: "rgba(126,142,241,.15)", color: "#6b7cff" }}>
            Training
          </span>
        )}
      </div>

      {day.items.length > 0 && (
        <ul className="m-0 ps-3 small" style={{ listStyle: "none" }}>
          {day.items.map((it, i) => {
            const isCardio = /cardio|cycling|elliptical|treadmill/i.test(it);
            const isProgress = /increase|add an extra set|deload|reduce/i.test(it);
            return (
              <li key={i} className="d-flex align-items-start gap-2 mb-1">
                <span style={{ lineHeight: 1.2, marginTop: 2 }}>
                  {isCardio ? <FiHeart /> : isProgress ? <FiTrendingUp /> : <FiCheckCircle />}
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
  defaultOpen = true,
}: {
  week: Week;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.div layout className="card shadow-sm mb-3" style={{ borderRadius: 14 }}>
      <button
        type="button"
        className="d-flex align-items-center justify-content-between w-100 text-start p-3"
        onClick={() => setOpen((v) => !v)}
        style={{
          background:
            "linear-gradient(135deg, rgba(126,142,241,0.15), rgba(91,209,215,0.15))",
          border: 0,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <FiTarget  className="bio-icon"/>
          <div>
            <div className="fw-semibold">{week.title}</div>
            {week.intro && <div className="text-muted small">{week.intro}</div>}
          </div>
        </div>
        <FiChevronDown
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s ease",
          }}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-3 pt-2">
              {week.days.length === 0 ? (
                <div className="text-muted small">No days listed.</div>
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

/** ---------- Main Component ---------- */
export default function WorkoutPlan() {
  const [latestPlan, setLatestPlan] = useState<WorkoutPlan | null>(null);
  const [parsed, setParsed] = useState<ParsedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setErr("Missing token");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/ai/my-workout-plans", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const plan = (data.workout_plans && data.workout_plans[0]) || null;
        if (!plan) {
          setErr("No workout plans found.");
        } else {
          setLatestPlan(plan);
          setParsed(parsePlan(plan.content || ""));
        }
      } catch (e) {
        console.error(e);
        setErr("Unable to fetch plan.");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const updatedAt = useMemo(() => {
    if (!latestPlan?.created_at) return null;
    try {
      return new Date(latestPlan.created_at).toLocaleString();
    } catch {
      return latestPlan.created_at;
    }
  }, [latestPlan?.created_at]);

  if (loading) {
    return (
      <div className="p-3">
        <div className="placeholder-wave">
          <div className="placeholder col-7 mb-2"></div>
          <div className="placeholder col-4 mb-2"></div>
          <div className="placeholder col-6 mb-2"></div>
        </div>
      </div>
    );
  }

  if (err) {
    return <div className="alert alert-danger">{err}</div>;
  }

  if (!latestPlan) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="workout-plan-viewer p-3 shadow-sm"
      style={{
        borderRadius: 16,
        background:
          "linear-gradient(234deg, rgba(249,248,252,1) 0%, rgba(205,205,225,0.5) 50%, rgba(253,253,255,1) 100%)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h5 className="mb-0">📋 Your Workout Plan</h5>
        {updatedAt && (
          <div className="text-muted small d-flex align-items-center gap-2">
            <FiClock />
            Last Updated: {updatedAt}
          </div>
        )}
      </div>

      {/* If parsing succeeded, show the structured UI; otherwise fallback to raw text */}
      {parsed?.weeks?.length ? (
        <div className="mt-3">
          {parsed.weeks.map((w, idx) => (
            <CollapsibleWeek key={`${w.title}-${idx}`} week={w} defaultOpen={idx === 0} />
          ))}
        </div>
      ) : (
        <div className="mt-3 small">
          <GradientHeader title="Plan" subtitle="(Raw view)" />
          <pre className="m-0" style={{ whiteSpace: "pre-wrap" }}>
            {latestPlan.content}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
