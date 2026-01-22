"use client";

import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const toggleTheme = async () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    // Skip animation if user prefers reduced motion or browser doesn't support View Transitions
    if (!ref.current || !("startViewTransition" in document) || prefersReducedMotion) {
      setTheme(nextTheme);
      return;
    }

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    await document.startViewTransition?.(() => {
      flushSync(() => {
        setTheme(nextTheme);
      });
    })?.ready;

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500, // 500ms transition duration
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      type="button"
      size="icon"
      className="px-2"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <SunIcon className="h-[1.2rem] w-[1.2rem] text-neutral-800 dark:hidden dark:text-neutral-200" />
      <MoonIcon className="hidden h-[1.2rem] w-[1.2rem] text-neutral-800 dark:block dark:text-neutral-200" />
    </Button>
  );
}
