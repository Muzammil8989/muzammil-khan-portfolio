"use client";

import { ArrowRight, Briefcase, Code2, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

export function PortfolioCTA() {
  return (
    <div
      className="relative my-20 overflow-hidden rounded-[28px]"
      style={{
        background: "linear-gradient(135deg, rgba(255,185,2,0.08) 0%, rgba(255,185,2,0.03) 50%, transparent 100%)",
        border: "1px solid rgba(255,185,2,0.2)",
      }}
    >
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #FFB902, transparent)" }} />

      {/* Gold orbs */}
      <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,185,2,0.07)" }} />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,185,2,0.05)" }} />

      <div className="relative px-8 py-12 md:px-12 md:py-14">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.15em] mb-6"
          style={{ background: "rgba(255,185,2,0.12)", border: "1px solid rgba(255,185,2,0.3)", color: "#FFB902" }}
        >
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          Portfolio Showcase
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-black leading-tight mb-4" style={{ color: "var(--text-primary)" }}>
                Enjoyed this article?
                <br />
                <span style={{ color: "#FFB902" }}>See what I've built.</span>
              </h3>
              <p className="text-base leading-relaxed font-light" style={{ color: "var(--text-secondary)" }}>
                This is just a glimpse of my expertise. Explore my complete portfolio to see real-world projects, case studies, and the technologies I work with.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Code2, value: "10+", label: "Projects" },
                { icon: Trophy, value: "2+", label: "Years Exp" },
                { icon: Briefcase, value: "3+", label: "Tech Stack" },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="text-center p-3 rounded-[14px]"
                  style={{ background: "rgba(255,185,2,0.06)", border: "1px solid rgba(255,185,2,0.15)" }}
                >
                  <div className="flex justify-center mb-2">
                    <Icon className="h-4 w-4" style={{ color: "#FFB902" }} />
                  </div>
                  <p className="text-xl font-black" style={{ color: "#FFB902" }}>{value}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link href="/#projects">
                <span
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[12px] text-[14px] font-black transition-opacity duration-200 hover:opacity-85 cursor-pointer"
                  style={{ background: "#FFB902", color: "#04061a" }}
                >
                  View My Portfolio
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/#about">
                <span
                  className="inline-flex items-center px-7 py-3.5 rounded-[12px] text-[14px] font-semibold transition-all duration-200 hover:border-[rgba(255,185,2,0.4)] cursor-pointer"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "var(--text-secondary)",
                  }}
                >
                  About Me
                </span>
              </Link>
            </div>
          </div>

          {/* Right — floating skill cards */}
          <div className="hidden md:block">
            <div className="space-y-4">
              {[
                { icon: Code2, title: "Full Stack Development", sub: "React, Node.js, Next.js", width: "91.67%" },
                { icon: Briefcase, title: "UI/UX Design", sub: "Figma, Tailwind CSS", width: "83.33%", indent: true },
              ].map(({ icon: Icon, title, sub, width, indent }) => (
                <div
                  key={title}
                  className={`p-5 rounded-[18px] transition-transform duration-300 hover:-translate-y-1${indent ? " ml-8" : ""}`}
                  style={{ background: "rgba(255,185,2,0.06)", border: "1px solid rgba(255,185,2,0.18)" }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-[10px] flex items-center justify-center" style={{ background: "rgba(255,185,2,0.15)", border: "1px solid rgba(255,185,2,0.25)" }}>
                      <Icon className="h-4 w-4" style={{ color: "#FFB902" }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</p>
                      <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{sub}</p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "rgba(255,185,2,0.12)" }}>
                    <div className="h-full rounded-full" style={{ width, background: "#FFB902" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "rgba(255,185,2,0.1)" }}>
          <p className="text-center text-xs italic" style={{ color: "#3a4060" }}>
            "Don't just read about it — see it in action. My portfolio showcases real solutions to real problems."
          </p>
        </div>
      </div>
    </div>
  );
}
