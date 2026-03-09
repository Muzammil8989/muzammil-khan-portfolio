"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

interface BlogFilterProps {
  initialDifficulty?: string;
  initialSearch?: string;
  allTags?: string[];
  initialTag?: string;
}

const DIFFICULTY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

export function BlogFilter({ initialDifficulty = "all", initialSearch = "" }: BlogFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [focused, setFocused] = useState(false);

  const updateFilters = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    startTransition(() => {
      router.push(`/blog?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const timeoutId = setTimeout(() => {
      updateFilters({ search: value });
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const activeDifficulty = initialDifficulty || "all";

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
      {/* Search box */}
      <div
        className="flex items-center gap-3 px-5 py-3.5 rounded-[14px] transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${focused || searchValue ? "rgba(255,185,2,0.4)" : "rgba(255,185,2,0.18)"}`,
        }}
      >
        <Search
          className={`h-4 w-4 flex-shrink-0 transition-all duration-200 ${isPending ? "animate-pulse" : ""}`}
          style={{ color: "#FFB902" }}
        />
        <input
          type="text"
          placeholder="Search articles, tutorials, guides..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-600 dark:placeholder:text-slate-600"
          style={{ color: "var(--text-primary)" }}
        />
        {searchValue && (
          <button
            onClick={() => { setSearchValue(""); updateFilters({ search: null }); }}
            className="text-xs font-bold hover:text-white transition-colors duration-200"
            style={{ color: "#6070a0" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Difficulty pill buttons */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-[11px] font-bold uppercase tracking-widest mr-1" style={{ color: "#3a4060" }}>
          Filter:
        </span>
        {DIFFICULTY_OPTIONS.map((opt) => {
          const active = activeDifficulty === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updateFilters({ difficulty: opt.value })}
              className="px-4 py-1.5 rounded-[10px] text-[13px] transition-all duration-200 hover:border-[rgba(255,185,2,0.3)]"
              style={{
                background: active ? "#FFB902" : "rgba(255,255,255,0.03)",
                border: `1px solid ${active ? "#FFB902" : "rgba(255,255,255,0.07)"}`,
                color: active ? "#04061a" : "var(--text-secondary)",
                fontWeight: active ? 800 : 600,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
