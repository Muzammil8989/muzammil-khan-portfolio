"use client";

import { useState, useEffect } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// 4 brand-aligned colors matching the 60-30-10 palette
const palette = [
  'bg-blue-400',    // brand blue  (#60a5fa dark / #3b82f6 light)
  'bg-indigo-500',  // brand indigo (#4f46e5)
  'bg-violet-400',  // decorative muted purple
  'bg-amber-400',   // brand gold  (~#FFB902)
];

export function SkillBadges({ skills }: { skills: string[] }) {
  const [colors, setColors] = useState<string[]>([]);
  const containerRef = useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    setColors(skills.map(() => palette[Math.floor(Math.random() * palette.length)]));
  }, [skills.length]);

  return (
    <div ref={containerRef} className="badges-container flex flex-wrap gap-3">
      {skills.map((skill, i) => (
        <span
          key={skill}
          className="badge-animate px-5 py-2.5 rounded-2xl bg-white dark:bg-transparent border border-slate-100 dark:border-white/10 shadow-sm text-slate-600 dark:text-white font-medium flex items-center gap-2 hover:shadow-md dark:hover:scale-105 transition-all glass-card"
          style={{ '--badge-i': i } as React.CSSProperties}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors[i] ?? 'bg-slate-400'} dark:shadow-[0_0_10px_currentColor]`}></span>
          {skill}
        </span>
      ))}
    </div>
  );
}
