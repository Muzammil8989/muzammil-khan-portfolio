"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
  logoUrl: string;
  altText: string;
  title: string;
  subtitle?: string;
  href?: string;
  badges?: readonly string[];
  period: string;
  description?: string;
}

export const ResumeCard = ({
  logoUrl,
  altText,
  title,
  subtitle,
  href,
  badges,
  period,
  description,
}: ResumeCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    }
  };

  return (
    <Link
      href={href || "#"}
      onClick={handleClick}
      className="block cursor-pointer group"
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={cn(
          "border border-transparent bg-transparent backdrop-blur-md p-4 sm:p-5 md:p-6",
          "hover:shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:border-emerald-400/40",
          isExpanded &&
            "shadow-[0_0_25px_rgba(34,197,94,0.5)] border-emerald-400/60"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo */}
          <img
            src={logoUrl}
            alt={altText}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover bg-muted flex-shrink-0"
          />

          <div className="flex-grow min-w-0">
            <CardHeader className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
                <div className="min-w-0">
                  {/* Title + badges + chevron */}
                  <h3 className="flex items-center gap-1.5 font-semibold leading-tight text-[15.5px] sm:text-[17px] md:text-[18px] text-foreground min-w-0">
                    <span className="truncate">{title}</span>

                    {badges && badges.length > 0 && (
                      <span className="flex flex-wrap gap-1 ml-1 sm:ml-2">
                        {badges.map((badge, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[11px] sm:text-[12px] md:text-[12.5px] leading-none"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    )}

                    {/* Chevron: appears only on hover/focus, stays visible when expanded */}
                    {description && (
                      <span className="ml-1 inline-flex w-4 justify-center">
                        <motion.span
                          animate={{ rotate: isExpanded ? 90 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          className={cn(
                            "transition-opacity duration-200",
                            isExpanded
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 group-focus-visible:opacity-100"
                          )}
                        >
                          <ChevronRightIcon className="size-4 shrink-0 text-emerald-400" />
                        </motion.span>
                      </span>
                    )}
                  </h3>

                  {subtitle && (
                    <div className="font-sans text-[13.5px] sm:text-[15.5px] md:text-[16px] text-foreground/80 mt-1 line-clamp-1 sm:line-clamp-none">
                      {subtitle}
                    </div>
                  )}
                </div>

                <div className="text-[13.5px] sm:text-[15.5px] md:text-[16px] tabular-nums text-foreground/75 whitespace-nowrap sm:ml-2 shrink-0">
                  {period}
                </div>
              </div>
            </CardHeader>

            {/* Description expand animation */}
            <AnimatePresence initial={false}>
              {isExpanded && description && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden text-[14.5px] sm:text-[16px] md:text-[16.5px] text-foreground/85 leading-[1.75] mt-2 sm:mt-2.5"
                >
                  <div className="border-l-2 border-emerald-400/60 pl-3 sm:pl-3.5">
                    {description}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
