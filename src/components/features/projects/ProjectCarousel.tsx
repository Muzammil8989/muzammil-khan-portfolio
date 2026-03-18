"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string | null;
  technologies?: string[];
  projectUrl?: string | null;
  githubUrl?: string | null;
  caseStudyUrl?: string | null;
  dates?: string;
}

export function ProjectCarousel({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [overlayProject, setOverlayProject] = useState<Project | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const n = projects.length;

  const prev = useCallback(() => setActive(a => (a - 1 + n) % n), [n]);
  const next = useCallback(() => setActive(a => (a + 1) % n), [n]);

  const openOverlay = (project: Project) => {
    setOverlayProject(project);
    setTimeout(() => setOverlayVisible(true), 10);
  };

  const closeOverlay = () => {
    setOverlayVisible(false);
    setTimeout(() => setOverlayProject(null), 300);
  };

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative w-full select-none">

      {/* Cards viewport */}
      <div className="relative overflow-hidden" style={{ height: 'clamp(480px, 60vw, 560px)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          {projects.map((project, i) => {
            const d = ((i - active + n) % n);
            const isActive = d === 0;
            const isRight = d === 1 && n > 1;
            const isLeft = d === n - 1 && n > 1;
            const isVisible = isActive || isRight || isLeft;

            return (
              <div
                key={project._id}
                onClick={() => !isActive && (isRight ? next() : prev())}
                className="absolute transition-all duration-500 ease-out"
                style={{
                  width: 'min(380px, 82vw)',
                  transform: isActive
                    ? 'translateX(0) scale(1)'
                    : isRight
                    ? 'translateX(108%) scale(0.84)'
                    : isLeft
                    ? 'translateX(-108%) scale(0.84)'
                    : 'translateX(0) scale(0.6)',
                  opacity: isActive ? 1 : isVisible ? 0.42 : 0,
                  zIndex: isActive ? 20 : isVisible ? 10 : 0,
                  cursor: isVisible && !isActive ? 'pointer' : 'default',
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                {/* Card */}
                <div
                  className={`rounded-2xl overflow-hidden bg-white dark:bg-[#0a0f32] transition-all duration-300 border-2 ${
                    isActive
                      ? 'border-[rgba(255,185,2,0.35)]'
                      : 'border-slate-200 dark:border-white/10'
                  }`}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onTouchStart={() => setHoveredCard(i)}
                  onTouchEnd={() => setHoveredCard(null)}
                >
                  {/* Image */}
                  <div className="relative aspect-video overflow-hidden bg-white dark:bg-[#0a0f32]">
                    {project.image ? (
                      <>
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className={`object-cover transition-opacity duration-500 ease-in-out ${hoveredCard === i ? 'opacity-0' : 'opacity-100'}`}
                          sizes="(max-width: 768px) 82vw, 380px"
                        />
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className={`object-contain transition-opacity duration-500 ease-in-out ${hoveredCard === i ? 'opacity-100' : 'opacity-0'}`}
                          sizes="(max-width: 768px) 82vw, 380px"
                        />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                        <span className="text-3xl opacity-30">🚀</span>
                      </div>
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent transition-opacity duration-300 ${hoveredCard === i ? 'opacity-100' : 'opacity-0'}`} />
                    {project.dates && (
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
                        {project.dates}
                      </div>
                    )}
                  </div>

                  {/* Content — no scroll */}
                  <div className="p-3 sm:p-5 space-y-2 sm:space-y-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {project.title}
                    </h3>

                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify line-clamp-2">
                        {project.description}
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); openOverlay(project); }}
                        className="text-xs font-semibold text-[#FFB902] hover:underline mt-1"
                      >
                        Read More
                      </button>
                    </div>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies?.map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-0.5 text-xs font-medium bg-[#FFB902]/10 text-[#FFB902] rounded border border-[#FFB902]/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action links */}
                    {isActive && (() => {
                      const btns = [
                        project.projectUrl && { href: project.projectUrl, label: 'Live Demo', icon: <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> },
                        project.githubUrl && { href: project.githubUrl, label: 'GitHub', icon: <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
                        project.caseStudyUrl && { href: project.caseStudyUrl, label: 'Case Study', icon: null },
                      ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

                      return btns.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                          {btns.map((btn, idx) => (
                            <Link
                              key={btn.label}
                              href={btn.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:scale-105 ${
                                idx === 0
                                  ? 'text-black bg-[#FFB902] hover:bg-[#e6a702]'
                                  : 'text-[#FFB902] bg-transparent border border-[#FFB902] hover:bg-[#FFB902]/10'
                              }`}
                            >
                              {btn.icon}
                              {btn.label}
                            </Link>
                          ))}
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-5">
        <button onClick={prev} aria-label="Previous project" className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-[#FFB902] hover:text-[#FFB902] transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {projects.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Go to project ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${i === active ? 'w-5 h-2 bg-[#FFB902]' : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'}`}
            />
          ))}
        </div>
        <button onClick={next} aria-label="Next project" className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-900/60 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-300 hover:border-[#FFB902] hover:text-[#FFB902] transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Description Overlay */}
      {overlayProject && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${overlayVisible ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeOverlay}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className={`relative w-full max-w-lg bg-white dark:bg-[#0a0f32] rounded-2xl shadow-2xl border-2 border-[rgba(255,185,2,0.35)] overflow-hidden transition-all duration-300 ${overlayVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'}`}
            onClick={e => e.stopPropagation()}
          >
            {/* Image */}
            {overlayProject.image && (
              <div className="relative aspect-video w-full">
                <Image src={overlayProject.image} alt={overlayProject.title} fill className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h2 className="text-lg font-bold text-white leading-tight">{overlayProject.title}</h2>
                  {overlayProject.dates && <p className="text-xs text-[#FFB902] font-medium mt-0.5">{overlayProject.dates}</p>}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="p-5 space-y-3 max-h-[50vh] overflow-y-auto">
              {!overlayProject.image && (
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{overlayProject.title}</h2>
              )}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                {overlayProject.description}
              </p>
              {overlayProject.technologies && overlayProject.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {overlayProject.technologies.map(tech => (
                    <span key={tech} className="px-2 py-0.5 text-xs font-medium bg-[#FFB902]/10 text-[#FFB902] rounded border border-[#FFB902]/30">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Close button */}
            <button
              onClick={closeOverlay}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-[#FFB902] hover:text-black transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
