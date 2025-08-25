// components/payment/Tab.tsx
// components/payment/Tab.tsx
"use client";

import React, { useMemo, useRef, useEffect } from "react";

export type TabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

type TabsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
  ariaLabel?: string;
};

export default function Tabs({
  tabs,
  active,
  onChange,
  className,
  ariaLabel = "Membership tabs",
}: TabsProps) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const keys = useMemo(() => tabs.map((t) => t.key), [tabs]);
  const activeIndex = Math.max(0, keys.indexOf(active));

  // Focus the active tab when `active` changes (good for programmatic switches)
  useEffect(() => {
    const k = keys[activeIndex];
    const el = btnRefs.current[k];
    if (el) el.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function isDisabled(idx: number) {
    const t = tabs[idx];
    return !!t?.disabled;
  }

  function nextEnabledIndex(start: number, dir: 1 | -1) {
    const total = tabs.length;
    let i = start;
    for (let step = 0; step < total; step++) {
      i = (i + dir + total) % total;
      if (!isDisabled(i)) return i;
    }
    return start; // fallback
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { key } = e;
    let newIndex = activeIndex;

    if (key === "ArrowRight") {
      e.preventDefault();
      newIndex = nextEnabledIndex(activeIndex, 1);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      newIndex = nextEnabledIndex(activeIndex, -1);
    } else if (key === "Home") {
      e.preventDefault();
      // jump to first enabled
      newIndex = tabs.findIndex((_, i) => !isDisabled(i));
      if (newIndex < 0) newIndex = activeIndex;
    } else if (key === "End") {
      e.preventDefault();
      // jump to last enabled
      for (let i = tabs.length - 1; i >= 0; i--) {
        if (!isDisabled(i)) {
          newIndex = i;
          break;
        }
      }
    } else {
      return;
    }

    const k = keys[newIndex];
    onChange(k);
  }

  return (
    <div className={className ?? ""}>
      <div
        className="d-flex gap-2 border-bottom pb-2 mb-3 flex-wrap"
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          const disabled = !!t.disabled;

          return (
            <button
              key={t.key}
              ref={(el) => { btnRefs.current[t.key] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.key}`}
              aria-disabled={disabled || undefined}
              id={`tab-${t.key}`}
              type="button"
              tabIndex={isActive ? 0 : -1} // roving tabindex
              className={`btn btn-sm ${
                isActive ? "btn-primary" : "btn-outline-primary"
              } ${disabled ? "disabled" : ""}`}
              onClick={() => !disabled && onChange(t.key)}
            >
              {t.icon ? (
                <span className="me-1" aria-hidden>
                  {t.icon}
                </span>
              ) : null}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
