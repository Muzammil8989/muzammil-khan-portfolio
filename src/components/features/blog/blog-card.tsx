"use client";

import { useState, useEffect } from "react";
import { Heart, Clock, ArrowUpRight } from "lucide-react";
import { Blog } from "@/services/blog";
import Link from "next/link";

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  cardNumber?: number;
}

const DIFFICULTY_BARS: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

const TYPE_EMOJI: Record<string, string> = {
  Tutorial: "⚡",
  Article: "📖",
  Guide: "🚀",
  "Deep Dive": "🎯",
  "Case Study": "📊",
  "Quick Tip": "💡",
};

export function BlogCard({ blog, cardNumber }: BlogCardProps) {
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (blog?._id) {
      const liked = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
      setHasLiked(liked.includes(blog._id));
    }
  }, [blog?._id]);

  useEffect(() => {
    setLikesCount(blog.likes || 0);
  }, [blog.likes]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!blog?._id || hasLiked || isLiking) return;
    setLikesCount((p) => p + 1);
    setHasLiked(true);
    setIsLiking(true);
    try {
      await fetch(`/api/blogs/${blog._id}/like`, { method: "POST" });
      const liked = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
      if (!liked.includes(blog._id)) {
        liked.push(blog._id);
        localStorage.setItem("liked_blogs", JSON.stringify(liked));
      }
    } catch {
      setLikesCount((p) => p - 1);
      setHasLiked(false);
    } finally {
      setIsLiking(false);
    }
  };

  const bars = DIFFICULTY_BARS[blog.difficulty] ?? 1;
  const emoji = TYPE_EMOJI[blog.type] ?? "📝";
  const stack = [...(blog.languages || []), ...(blog.frameworks || [])].slice(0, 4);

  return (
    <Link href={`/blog/${blog.slug}`} className="group block h-full focus-visible:outline-none">
      <article
        className="relative h-full flex flex-col rounded-[22px] overflow-hidden p-6 sm:p-7 cursor-pointer
          transition-all duration-300 hover:-translate-y-1.5
          bg-white/[0.03] dark:bg-white/[0.028]
          border border-white/[0.07] dark:border-white/[0.07]
          hover:border-[rgba(255,185,2,0.22)] dark:hover:border-[rgba(255,185,2,0.22)]
          hover:shadow-[0_24px_60px_rgba(0,0,0,0.35),0_0_40px_rgba(255,185,2,0.05)]
          backdrop-blur-2xl"
      >
        {/* Bottom glow line on hover */}
        <div
          className="absolute bottom-0 left-[10%] right-[10%] h-px scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #FFB902, transparent)" }}
        />

        {/* Background card number */}
        {cardNumber !== undefined && (
          <span
            className="absolute top-4 right-5 text-[3.2rem] font-black leading-none pointer-events-none select-none"
            style={{ color: "rgba(255,185,2,0.06)" }}
          >
            {String(cardNumber).padStart(2, "0")}
          </span>
        )}

        {/* Type badge + meta */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-[5px] rounded-[8px] text-[10px] font-black uppercase tracking-[0.06em]"
            style={{
              border: "1px solid rgba(255,185,2,0.35)",
              color: "#FFB902",
              background: "rgba(255,185,2,0.07)",
            }}
          >
            {emoji} {blog.type}
          </span>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {blog.readingTime || 5} min
            </span>
            <button
              onClick={handleLike}
              disabled={hasLiked || isLiking}
              aria-label="Like this post"
              className={`flex items-center gap-1 transition-colors duration-200 ${
                hasLiked ? "text-rose-400" : "hover:text-rose-400"
              }`}
            >
              <Heart className={`w-3 h-3 transition-transform ${hasLiked ? "fill-rose-400 scale-125" : ""}`} />
              <span className="tabular-nums">{likesCount}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-[15px] font-extrabold leading-snug line-clamp-2 mb-2.5 transition-colors duration-200 group-hover:text-white"
          style={{ color: "var(--text-primary)" }}
        >
          {blog.title}
        </h3>

        {/* Excerpt */}
        <p
          className="text-[13px] leading-relaxed line-clamp-3 flex-1 mb-4"
          style={{ color: "var(--text-secondary)" }}
        >
          {blog.excerpt}
        </p>

        {/* Stack tags */}
        {stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {stack.map((item) => (
              <span
                key={item}
                className="px-2.5 py-1 rounded-[7px] text-[11px] font-medium transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "#6070a0",
                }}
              >
                {item}
              </span>
            ))}
          </div>
        )}

        {/* Footer: level bars + read button */}
        <div className="mt-auto pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-[3px]">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-[18px] h-1 rounded-sm transition-colors duration-200"
                    style={{ background: n <= bars ? "#FFB902" : "rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-semibold capitalize" style={{ color: "var(--text-secondary)" }}>
                {blog.difficulty}
              </span>
            </div>

            <span
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] text-[12px] font-bold
                transition-all duration-200
                group-hover:bg-[#FFB902] group-hover:text-[#04061a] group-hover:border-[#FFB902]"
              style={{
                background: "rgba(255,185,2,0.1)",
                border: "1px solid rgba(255,185,2,0.25)",
                color: "#FFB902",
              }}
            >
              Read
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
