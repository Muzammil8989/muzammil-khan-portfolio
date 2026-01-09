"use client";

import { motion, Transition, Easing } from "motion/react";
import { useEffect, useRef, useState, useMemo } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type BlurTextProps = {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;

  // NEW: emphasize keywords (supports multi-word phrases)
  emphasizeKeywords?: string[];
  emphasizeClassName?: string;
};

// Escape user phrases safely for regex
const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Split text into segments: matched phrases vs normal text
const splitByKeywords = (
  text: string,
  keywords: string[]
): Array<{ text: string; emphasize: boolean }> => {
  if (!text || !keywords?.length) return [{ text, emphasize: false }];

  // Sort by length desc so longer phrases match before subparts
  const sorted = [...keywords].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");

  const segments: Array<{ text: string; emphasize: boolean }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    const end = pattern.lastIndex;

    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), emphasize: false });
    }
    segments.push({ text: text.slice(start, end), emphasize: true });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), emphasize: false });
  }

  return segments;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([
    ...Object.keys(from),
    ...steps.flatMap((s) => Object.keys(s)),
  ]);

  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText: React.FC<BlurTextProps> = ({
  text = "",
  delay = 200,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  animationFrom,
  animationTo,
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.4,
  emphasizeKeywords = [],
  emphasizeClassName = "font-bold underline underline-offset-2 decoration-gray-700",
}) => {
  const useEmphasis = Array.isArray(emphasizeKeywords) && emphasizeKeywords.length > 0;
  const prefersReducedMotion = useReducedMotion();

  // Build elements: if emphasis is requested, split by phrases; else by words/letters
  const elements = useMemo(() => {
    if (!useEmphasis) {
      return (animateBy === "words" ? text.split(" ") : text.split("")).map(
        (t) => ({ text: t, emphasize: false })
      );
    }
    // Keep original spacing/punctuation by segmenting on phrases
    return splitByKeywords(text, emphasizeKeywords);
  }, [text, animateBy, useEmphasis, emphasizeKeywords]);

  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current as Element);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Use marginTop instead of translateY for inline justification stability
  const defaultFrom = useMemo(
    () =>
      prefersReducedMotion
        ? { filter: "blur(0px)", opacity: 0, marginTop: 0 }
        : direction === "top"
        ? { filter: "blur(6px)", opacity: 0, marginTop: -14 }
        : { filter: "blur(6px)", opacity: 0, marginTop: 14 },
    [direction, prefersReducedMotion]
  );

  const defaultTo = useMemo(
    () =>
      prefersReducedMotion
        ? [{ filter: "blur(0px)", opacity: 1, marginTop: 0 }]
        : [
            {
              filter: "blur(3px)",
              opacity: 0.5,
              marginTop: direction === "top" ? 4 : -4,
            },
            { filter: "blur(0px)", opacity: 1, marginTop: 0 },
          ],
    [direction, prefersReducedMotion]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times =
    stepCount === 1
      ? [0]
      : Array.from({ length: stepCount }, (_, i) => i / (stepCount - 1));

  return (
    <p
      ref={ref}
      className={`blur-text ${className}`}
      style={{
        textAlign: "justify",
        textJustify: "inter-word",
        hyphens: "auto",
      }}
    >
      {elements.map((segment, index) => {
        const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

        const spanTransition: Transition = {
          duration: prefersReducedMotion ? 0.1 : totalDuration,
          times,
          delay: prefersReducedMotion ? 0 : (index * delay) / 1000,
          ease: easing,
        };

        return (
          <motion.span
            key={index}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
            style={{
              display: "inline",
              willChange: "filter, opacity, margin-top",
            }}
            className={segment.emphasize ? emphasizeClassName : undefined}
          >
            {segment.text}
            {/* If you're animating by words and NOT using phrase splitting,
                manually insert spaces between words */}
            {!useEmphasis &&
              animateBy === "words" &&
              index < elements.length - 1 &&
              " "}
          </motion.span>
        );
      })}
    </p>
  );
};

export default BlurText;
