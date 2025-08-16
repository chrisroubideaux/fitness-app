// Workout Plan Chart
/* components/profile/charts/WorkoutPlan.tsx */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  FiPrinter,
  FiDownload,
} from "react-icons/fi";

/** ---------- Types ---------- */
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

/** ---------- Parsing ---------- */
function splitIntoWeeks(raw: string): string[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  const parts: string[] = [];
  const weekRegex = /^Week\s+\d+.*$/gmi;
  let match: RegExpExecArray | null;
  const headers: { index: number }[] = [];
  while ((match = weekRegex.exec(text)) !== null) headers.push({ index: match.index });
  headers.forEach((h, i) => {
    const next = headers[i + 1]?.index ?? text.length;
    parts.push(text.slice(h.index, next).trim());
  });
  return parts.length ? parts : [text];
}

function parseWeekBlock(block: string): Week {
  const lines = block.split("\n").map((l) => l.trim());
  const title = lines[0] || "Week";
  const restOf = lines.slice(1).join("\n").trim();
  const normalized = restOf.replace(/(?=Day\s+\d+:)/g, "\n");
  const weekLines = normalized.split("\n").map((l) => l.trim());

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
      current = { label, name, items: [], rest: /(^|\s)rest(\s|$)/i.test(name) };
      continue;
    }
    if (!current) { introLines.push(ln); continue; }
    if (/^\*|-|\d+\./.test(ln)) current.items.push(ln.replace(/^(\*|-|\d+\.)\s*/, ""));
    else if (/^rest$/i.test(ln)) current.rest = true;
    else current.items.push(ln);
  }
  if (current) days.push(current);

  return {
    title,
    intro: introLines.length ? introLines.join(" ") : undefined,
    days,
  };
}

function parsePlan(content: string): ParsedPlan {
  return { weeks: splitIntoWeeks(content).map(parseWeekBlock) };
}

/** ---------- UI Bits ---------- */
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
          {isRest ? <FiMoon className="bio-icon" /> : <FiActivity className="bio-icon" />}
          <strong>{day.label}: {day.name}</strong>
        </div>
        {isRest ? (
          <span className="badge rounded-pill text-bg-light border">Rest Day</span>
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
                  {isCardio ? <FiHeart className="bio-icon" /> : isProgress ? <FiTrendingUp className="bio-icon" /> : <FiCheckCircle className="bio-icon" />}
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
    <motion.div ref={weekRef} layout className="card shadow-sm mb-3" style={{ borderRadius: 14 }}>
      <button
        type="button"
        className="d-flex align-items-center justify-content-between w-100 text-start p-3"
        onClick={onToggle}
        style={{
          background: "linear-gradient(135deg, rgba(126,142,241,0.15), rgba(91,209,215,0.15))",
          border: 0,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <FiTarget className="bio-icon" />
          <div>
            <div className="fw-semibold">{week.title}</div>
            {week.intro && <div className="text-muted small">{week.intro}</div>}
          </div>
        </div>
        <FiChevronDown
          className="bio-icon"
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

  // Navbar + collapsible control
  const [openStates, setOpenStates] = useState<boolean[]>([]);
  const [activeWeek, setActiveWeek] = useState<number>(0);
  const weekRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedOpenStatesRef = useRef<boolean[] | null>(null);

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
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const plan = (data.workout_plans && data.workout_plans[0]) || null;
        if (!plan) setErr("No workout plans found.");
        else {
          setLatestPlan(plan);
          const p = parsePlan(plan.content || "");
          setParsed(p);
          setOpenStates(p.weeks.map((_, i) => i === 0)); 
          setActiveWeek(0);
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

  // Print: open all -> print -> restore
  useEffect(() => {
    const handler = () => {
      if (savedOpenStatesRef.current) {
        setOpenStates(savedOpenStatesRef.current);
        savedOpenStatesRef.current = null;
      }
    };
    window.addEventListener("afterprint", handler);
    return () => window.removeEventListener("afterprint", handler);
  }, []);

  const updatedAt = useMemo(() => {
    if (!latestPlan?.created_at) return null;
    try {
      return new Date(latestPlan.created_at).toLocaleString();
    } catch {
      return latestPlan.created_at;
    }
  }, [latestPlan?.created_at]);

  function handlePillClick(i: number) {
    setActiveWeek(i);
    setOpenStates((prev) => prev.map((_, idx) => idx === i)); 
    const el = weekRefs.current[i];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleToggleWeek(i: number) {
    setOpenStates((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  function handlePrint() {
    if (!parsed) return;
    savedOpenStatesRef.current = [...openStates];
    setOpenStates(parsed.weeks.map(() => true));
    setTimeout(() => window.print(), 50);
  }

  function buildMarkdown(): string {
    if (!parsed || !latestPlan) return latestPlan?.content || "";
    const lines: string[] = [];
    lines.push(`# Your Workout Plan`);
    if (latestPlan.created_at) lines.push(`_Last Updated: ${updatedAt}_`);
    lines.push("");

    parsed.weeks.forEach((w) => {
      lines.push(`## ${w.title}`);
      if (w.intro) lines.push(w.intro);
      w.days.forEach((d) => {
        lines.push(`- **${d.label}: ${d.name}**`);
        d.items.forEach((it) => lines.push(`  - ${it}`));
        if (d.items.length === 0) lines.push(`  - (No items listed)`);
      });
      lines.push("");
    });
    return lines.join("\n");
  }

  function handleDownload() {
    const md = buildMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateSlug = updatedAt ? updatedAt.replace(/[^\d]+/g, "") : "";
    a.href = url;
    a.download = `workout-plan${dateSlug ? "-" + dateSlug : ""}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

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

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!latestPlan || !parsed) return null;

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
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
        <h5 className="mb-0 d-flex align-items-center gap-2">
          <span role="img" aria-label="clipboard">📋</span> Your Workout Plan
        </h5>
        <div className="d-flex align-items-center gap-2">
          {updatedAt && (
            <div className="text-muted small d-flex align-items-center gap-2 me-2">
              <FiClock className="bio-icon" /> Last Updated: {updatedAt}
            </div>
          )}
          <button className="btn btn-sm btn-outline-secondary" onClick={handlePrint}>
            <FiPrinter style={{ marginTop: -2 }} /> Print
          </button>
          <button className="btn btn-sm btn-primary" onClick={handleDownload}>
            <FiDownload style={{ marginTop: -2 }} /> Download
          </button>
        </div>
      </div>

      {/* Week navbar (pills) */}
      <div
        className="mt-3 mb-2"
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {parsed.weeks.map((w, i) => (
          <button
            key={w.title + i}
            type="button"
            onClick={() => handlePillClick(i)}
            className="btn btn-sm"
            style={{
              whiteSpace: "nowrap",
              borderRadius: 999,
              border: "1px solid rgba(0,0,0,0.08)",
              background:
                i === activeWeek
                  ? "linear-gradient(135deg, rgba(126,142,241,0.35), rgba(91,209,215,0.35))"
                  : "rgba(255,255,255,0.8)",
              boxShadow: i === activeWeek ? "0 6px 14px rgba(0,0,0,.08)" : "none",
            }}
          >
            <FiCalendar className="bio-icon" style={{ marginTop: -2 }} />&nbsp;Week {i + 1}
          </button>
        ))}
      </div>

      {/* Weeks */}
      <div className="mt-2">
        {parsed.weeks.map((w, i) => (
          <CollapsibleWeek
            key={w.title + i}
            week={w}
            open={openStates[i]}
            onToggle={() => handleToggleWeek(i)}
            weekRef={(el) => (weekRefs.current[i] = el)}
          />
        ))}
      </div>
    </motion.div>
  );
}
