"use client";

import { useBlogManager } from "./blog-manager-context";

export function BlogManagerStats() {
  const {
    state: { stats },
  } = useBlogManager();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card px-4 py-4 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-start justify-between">
            <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <span className={`text-3xl font-black tabular-nums leading-none ${color}`}>
              {value}
            </span>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
