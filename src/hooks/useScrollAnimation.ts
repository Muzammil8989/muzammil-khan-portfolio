"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useScrollAnimation<T extends HTMLElement = HTMLElement>(
  visibleClass = "visible",
  threshold = 0.15
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Skip if already visible (e.g. hot reload)
    if (el.classList.contains(visibleClass)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(visibleClass);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visibleClass, threshold]);

  return ref;
}
