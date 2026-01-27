"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Code2, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";

export function PortfolioCTA() {
  return (
    <div className="relative my-20 overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-slate-900 dark:via-indigo-950/50 dark:to-blue-950/50 shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-white/[0.02] [mask-image:radial-gradient(white,transparent_85%)]" />

      {/* Animated Gradient Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="relative px-8 py-12 md:px-12 md:py-16">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-indigo-200 dark:border-indigo-900/50 shadow-lg mb-6">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Portfolio Showcase
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                Enjoyed this article?
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
                  See what I've built.
                </span>
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                This is just a glimpse of my expertise. Explore my complete portfolio to see real-world projects, case studies, and the technologies I work with.
              </p>
            </div>

            {/* Stats/Highlights */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                <div className="flex justify-center mb-2">
                  <Code2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">10+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Projects</p>
              </div>

              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                <div className="flex justify-center mb-2">
                  <Trophy className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">2+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Years Exp</p>
              </div>

              <div className="text-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-slate-200/50 dark:border-white/5">
                <div className="flex justify-center mb-2">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">3+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tech Stack</p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/#projects" className="group">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-xl shadow-blue-500/25 dark:shadow-blue-500/20 rounded-xl px-8 py-6 text-base font-bold group-hover:scale-105 transition-all duration-300"
                >
                  View My Portfolio
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/#about">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-2 border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 rounded-xl px-8 py-6 text-base font-semibold hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-300"
                >
                  About Me
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="hidden md:block relative">
            <div className="relative">
              {/* Floating Cards Animation */}
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-xl transform hover:scale-105 transition-transform duration-300 animate-float">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Full Stack Development</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">React, Node.js, Next.js</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-11/12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200 dark:border-white/10 shadow-xl transform hover:scale-105 transition-transform duration-300 animate-float-delayed ml-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">UI/UX Design</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Figma, Tailwind CSS</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-10/12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Testimonial/Social Proof */}
        <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-white/10">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 italic">
            "Don't just read about it — see it in action. My portfolio showcases real solutions to real problems."
          </p>
        </div>
      </div>

      {/* Add custom animations to global CSS if not already present */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
}
