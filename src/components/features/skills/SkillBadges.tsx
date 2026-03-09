"use client";

import { useState, useEffect } from "react";

const palette = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-400', 'bg-indigo-500',
  'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-rose-500', 'bg-emerald-500', 'bg-violet-500',
  'bg-amber-500', 'bg-red-500', 'bg-sky-500', 'bg-lime-500',
];

export function SkillBadges({ skills }: { skills: string[] }) {
  const [colors, setColors] = useState<string[]>([]);

  useEffect(() => {
    setColors(skills.map(() => palette[Math.floor(Math.random() * palette.length)]));
  }, [skills.length]);

  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill, i) => (
        <span
          key={skill}
          className="px-5 py-2.5 rounded-2xl bg-white dark:bg-transparent border border-slate-100 dark:border-white/10 shadow-sm text-slate-600 dark:text-white font-medium flex items-center gap-2 hover:shadow-md dark:hover:scale-105 transition-all glass-card"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${colors[i] ?? 'bg-slate-400'} dark:shadow-[0_0_10px_currentColor]`}></span>
          {skill}
        </span>
      ))}
    </div>
  );
}
