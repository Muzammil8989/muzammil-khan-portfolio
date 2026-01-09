"use client";

import { useEffect } from "react";
import { useLenis, setupLenisGSAP } from "@/lib/lenis";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * WHY: Centralizes smooth scroll setup
 * PLACEMENT: Inside Providers after ThemeProvider
 * PERFORMANCE: Only runs on client, respects reduced motion
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenis = useLenis();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!lenis) return;

    // Disable smooth scroll if user prefers reduced motion
    if (prefersReducedMotion) {
      lenis.stop();
      return;
    }

    lenis.start();

    // Setup GSAP integration
    if (typeof window !== "undefined" && (window as any).ScrollTrigger) {
      setupLenisGSAP(lenis);
    }
  }, [lenis, prefersReducedMotion]);

  return <>{children}</>;
}
