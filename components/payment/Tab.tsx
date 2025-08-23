// components/ui/Tab.tsx
"use client";


type TabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type TabsProps = {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  className?: string;
};

export default function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={className ?? ""}>
      <div
        className="d-flex gap-2 border-bottom pb-2 mb-3 flex-wrap"
        role="tablist"
        aria-label="Membership tabs"
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              type="button"
              className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => onChange(t.key)}
            >
              {t.icon ? <span className="me-1" aria-hidden>{t.icon}</span> : null}
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
