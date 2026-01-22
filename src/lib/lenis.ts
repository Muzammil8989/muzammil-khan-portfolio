"use client";

import Lenis from "@studio-freight/lenis";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * WHY: Lenis provides buttery smooth momentum scrolling
 * PERFORMANCE: RAF loop is more efficient than scroll events
 * APP ROUTER SAFE: Cleanup on unmount + route change
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.5, // Smooth scroll duration (increased for smoother feel)
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom easing
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
      syncTouch: true, // Enable touch device sync
      syncTouchLerp: 0.1, // Smooth touch scrolling
    });

    lenisRef.current = lenis;

    // RAF loop for smooth scroll
    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]); // Re-init on route change

  return lenisRef.current;
}

/**
 * GSAP ScrollTrigger integration
 * WHY: Syncs GSAP animations with Lenis scroll
 */
export function setupLenisGSAP(lenis: Lenis | null) {
  if (!lenis || typeof window === "undefined") return;

  lenis.on("scroll", () => {
    // Update ScrollTrigger when Lenis scrolls
    if ((window as any).ScrollTrigger) {
      (window as any).ScrollTrigger.update();
    }
  });

  // Tell ScrollTrigger to use Lenis for scroll position
  if ((window as any).ScrollTrigger) {
    (window as any).ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (arguments.length && value !== undefined) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
  }
}
