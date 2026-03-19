"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedHeading({ children, className = "" }: Props) {
  const ref = useScrollAnimation<HTMLHeadingElement>();
  return (
    <h2 ref={ref} className={`section-heading-animate ${className}`}>
      {children}
    </h2>
  );
}
