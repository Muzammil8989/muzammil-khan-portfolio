import { Variants, Transition } from "motion/react";

/**
 * WHY: Centralized, reusable motion configs
 * PERFORMANCE: Consistent easing and durations across app
 * ACCESSIBILITY: All animations respect reduced-motion (handled in hook)
 */

// Easing functions
export const EASINGS = {
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  spring: { type: "spring", stiffness: 400, damping: 30 },
} as const;

// Fade up from bottom
export const fadeUp: Variants = {
  initial: {
    opacity: 0,
    y: 24,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -24,
  },
};

// Simple fade
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

// Slide from left
export const slideLeft: Variants = {
  initial: {
    opacity: 0,
    x: -24,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 24,
  },
};

// Scale + fade (cards)
export const scaleIn: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
  },
};

// Stagger children
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Default transition
export const defaultTransition: Transition = {
  duration: 0.5,
  ease: EASINGS.easeOut,
};

// Page transition
export const pageTransition: Transition = {
  duration: 0.3,
  ease: EASINGS.easeInOut,
};
