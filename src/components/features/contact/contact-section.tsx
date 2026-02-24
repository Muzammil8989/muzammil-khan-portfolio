"use client";

import { ContactForm } from "./contact-form";
import { Mail, MapPin, Phone } from "lucide-react";
import { DATA } from "@/data/resume";

export function ContactSection() {
  return (
    <section id="contact" className="py-20 scroll-mt-20">
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 items-start">
          {/* Left Column - Section Header & Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="sticky top-10 space-y-6">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-slate-900 dark:text-white">
                  Let's Connect
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mt-3 font-light text-sm leading-relaxed">
                  I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent hover:border-indigo-500/30 dark:hover:border-blue-500/30 transition-all group">
                  <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400 group-hover:bg-indigo-500/20 dark:group-hover:bg-blue-500/20 transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-0.5">Email</p>
                    <a
                      href={`mailto:${DATA.contact.email}`}
                      className="text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-blue-400 transition-colors truncate block"
                    >
                      {DATA.contact.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent hover:border-indigo-500/30 dark:hover:border-blue-500/30 transition-all group">
                  <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400 group-hover:bg-indigo-500/20 dark:group-hover:bg-blue-500/20 transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-0.5">Phone</p>
                    <a
                      href={`tel:${DATA.contact.tel}`}
                      className="text-sm text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {DATA.contact.tel}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent hover:border-indigo-500/30 dark:hover:border-blue-500/30 transition-all group">
                  <div className="p-2 rounded-lg bg-indigo-500/10 dark:bg-blue-500/10 text-indigo-600 dark:text-blue-400 group-hover:bg-indigo-500/20 dark:group-hover:bg-blue-500/20 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-0.5">Location</p>
                    <p className="text-sm text-slate-900 dark:text-white">
                      Remote Worldwide
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-500 mb-3">Connect on social</p>
                <div className="flex gap-2">
                  <a
                    href={DATA.contact.social.GitHub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent hover:border-indigo-500 dark:hover:border-blue-500 hover:bg-indigo-50 dark:hover:bg-blue-500/10 transition-all group"
                    aria-label="GitHub"
                  >
                    <svg className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    href={DATA.contact.social.LinkedIn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent hover:border-indigo-500 dark:hover:border-blue-500 hover:bg-indigo-50 dark:hover:bg-blue-500/10 transition-all group"
                    aria-label="LinkedIn"
                  >
                    <svg className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Response Time Badge */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 border border-indigo-100 dark:border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Available for work</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Typically responds within 24-48 hours
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="md:col-span-2">
            <div className="p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl shadow-lg">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
