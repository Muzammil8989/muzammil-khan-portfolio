"use client";

import { useState, useEffect } from "react";
import { Heart, Clock, ArrowUpRight } from "lucide-react";
import { Blog } from "@/services/blog";
import { useLikeBlog } from "@/app/hooks/useBlogs";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
}

// Accent colors per difficulty
const difficultyConfig: Record<string, { label: string; from: string; to: string; text: string; dot: string }> = {
  beginner:     { label: "Beginner",     from: "from-emerald-500", to: "to-teal-400",    text: "text-emerald-600 dark:text-emerald-400",  dot: "bg-emerald-500" },
  intermediate: { label: "Intermediate", from: "from-violet-500",  to: "to-indigo-400",  text: "text-violet-600 dark:text-violet-400",    dot: "bg-violet-500"  },
  advanced:     { label: "Advanced",     from: "from-orange-500",  to: "to-rose-400",    text: "text-orange-600 dark:text-orange-400",    dot: "bg-orange-500"  },
};

const typeColors: Record<string, string> = {
  "Tutorial":   "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20",
  "Article":    "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10",
  "Case Study": "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
  "Deep Dive":  "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20",
  "Quick Tip":  "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/20",
  "Guide":      "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20",
};

export function BlogCard({ blog, showActions = false }: BlogCardProps) {
  const queryClient = useQueryClient();
  const likeMutation = useLikeBlog();
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  useEffect(() => {
    if (blog?._id) {
      const liked = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
      setHasLiked(liked.includes(blog._id));
    }
  }, [blog?._id]);

  useEffect(() => {
    setLikesCount(blog.likes || 0);
  }, [blog.likes]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!blog?._id || hasLiked) return;
    setLikesCount((p) => p + 1);
    setHasLiked(true);
    likeMutation.mutate(blog._id, {
      onSuccess: () => {
        const liked = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
        if (!liked.includes(blog._id)) {
          liked.push(blog._id);
          localStorage.setItem("liked_blogs", JSON.stringify(liked));
        }
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      },
      onError: () => {
        setLikesCount((p) => p - 1);
        setHasLiked(false);
      },
    });
  };

  const diff = difficultyConfig[blog.difficulty] ?? difficultyConfig.beginner;
  const typeClass = typeColors[blog.type] ?? typeColors["Article"];
  const stack = [...(blog.languages || []), ...(blog.frameworks || [])].slice(0, 4);

  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl">
      <article
        className="relative h-full flex flex-col rounded-2xl overflow-hidden
          bg-white dark:bg-[#0d0d2b]
          border border-slate-200/70 dark:border-white/[0.07]
          shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]
          hover:shadow-[0_12px_40px_rgba(79,70,229,0.15)] dark:hover:shadow-[0_16px_48px_rgba(79,70,229,0.2)]
          hover:-translate-y-2
          transition-all duration-300 ease-out
        "
      >
        {/* ── Top gradient strip (visible always, bolder on hover) ── */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${diff.from} ${diff.to} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 p-5 gap-4">

          {/* Row 1 — type badge + meta */}
          <div className="flex items-center justify-between gap-2">
            <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-[0.18em] px-2.5 py-[3px] rounded-full border ${typeClass}`}>
              {blog.type}
            </span>

            <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {blog.readingTime || 5} min
              </span>

              <button
                onClick={handleLike}
                disabled={hasLiked || likeMutation.isPending}
                aria-label="Like this post"
                className={`flex items-center gap-1 transition-all duration-200 rounded-full ${
                  hasLiked
                    ? "text-rose-500"
                    : "hover:text-rose-400"
                }`}
              >
                <Heart className={`w-3 h-3 transition-all ${hasLiked ? "fill-rose-500 scale-125" : ""}`} />
                <span className="tabular-nums">{likesCount}</span>
              </button>
            </div>
          </div>

          {/* Row 2 — title */}
          <h3 className="text-base font-bold leading-snug tracking-tight
            text-slate-900 dark:text-white
            group-hover:text-indigo-600 dark:group-hover:text-indigo-400
            transition-colors duration-200 line-clamp-2"
          >
            {blog.title}
          </h3>

          {/* Row 3 — excerpt */}
          <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-light flex-1">
            {blog.excerpt}
          </p>

          {/* Row 4 — stack chips */}
          {stack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {stack.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide
                    bg-slate-50 dark:bg-white/[0.04]
                    text-slate-600 dark:text-slate-400
                    border border-slate-100 dark:border-white/[0.07]
                    group-hover:border-indigo-200 dark:group-hover:border-indigo-500/25
                    transition-colors duration-200"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Row 5 — footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.05] mt-auto">
            {/* difficulty pill */}
            <span className={`flex items-center gap-1.5 text-[11px] font-bold ${diff.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${diff.dot} animate-pulse`} />
              {diff.label}
            </span>

            {/* CTA */}
            <span className="flex items-center gap-1 text-[12px] font-bold
              text-indigo-600 dark:text-indigo-400
              group-hover:text-indigo-700 dark:group-hover:text-indigo-300
              transition-colors duration-200"
            >
              Read article
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </span>
          </div>
        </div>

        {/* ── Hover shimmer overlay ─────────────────────────────── */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.03) 0%, transparent 60%)" }}
        />
      </article>
    </Link>
  );
}
