"use client";

import { Badge } from "@/components/ui/badge";
import { CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import React from "react";
import BlurText from "./react-bit/blur-text";

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

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    if (description) {
      e.preventDefault();
      setIsExpanded((prev) => !prev);
    }
  };

  // Title: first three words + "..."
  const words = title.trim().split(/\s+/);
  const isTruncatedTitle = words.length > 3;
  const shortTitle = isTruncatedTitle
    ? `${words.slice(0, 3).join(" ")}...`
    : title;

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
              {/* ===== Top row: Left (title/badges) + Right (chevron) ===== */}
              <div className="flex items-start min-w-0">
                {/* LEFT: title + badges (mobile below, desktop inline) */}
                <div className="flex-1 min-w-0">
                  {/* Title + inline badges on sm+ */}
                  <h3 className="flex items-center gap-1.5 font-semibold leading-tight text-[15.5px] sm:text-[17px] md:text-[18px] text-foreground min-w-0">
                    <TooltipProvider delayDuration={150}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="truncate block min-w-0"
                            aria-label={title}
                            title={isTruncatedTitle ? "" : undefined}
                          >
                            <BlurText
                              text={shortTitle}
                              delay={120}
                              animateBy="words"
                              direction="top"
                              stepDuration={0.35}
                              className="inline"
                            />
                          </span>
                        </TooltipTrigger>
                        {isTruncatedTitle && (
                          <TooltipContent
                            side="top"
                            align="start"
                            className="max-w-[380px] break-words"
                          >
                            {title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>

                    {/* Inline badges ONLY on sm+ */}
                    {badges && badges.length > 0 && (
                      <span className="hidden sm:flex flex-wrap gap-1 ml-1 sm:ml-2">
                        {badges.map((badge, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[11px] sm:text-[12px] md:text-[12.5px]"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </h3>

                  {/* Badges BELOW title ONLY on mobile */}
                  {badges && badges.length > 0 && (
                    <div className="flex sm:hidden flex-wrap gap-1 mt-1">
                      {badges.map((badge, i) => (
                        <Badge key={i} variant="secondary" className="text-[11px]">
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* RIGHT: chevron pinned to far right */}
                {description && (
                  <div className="flex-none self-center ml-2">
                    <motion.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="block"
                    >
                      <ChevronRightIcon className="size-4 text-emerald-400" />
                    </motion.span>
                  </div>
                )}
              </div>

              {/* Subtitle + period row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 sm:mt-2 min-w-0">
                {subtitle && (
                  <div className="text-[13.5px] sm:text-[15.5px] md:text-[16px] text-foreground/80 line-clamp-2 min-w-0">
                    <BlurText
                      text={subtitle}
                      delay={160}
                      animateBy="words"
                      direction="top"
                      stepDuration={0.28}
                    />
                  </div>
                )}
                <div className="text-[13.5px] sm:text-[15.5px] md:text-[16px] text-foreground/75 whitespace-nowrap sm:ml-2">
                  {period}
                </div>
              </div>
            </CardHeader>

            {/* Expandable description */}
            <AnimatePresence initial={false}>
              {isExpanded && description && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden text-[14.5px] sm:text-[16px] md:text-[16.5px] text-foreground/85 leading-[1.75] mt-2 sm:mt-2.5 text-justify"
                >
                  <div className="border-l-2 border-emerald-400/60 pl-2 sm:pl-3">
                    <BlurText
                      text={description}
                      delay={200}
                      animateBy="words"
                      direction="top"
                      stepDuration={0.32}
                      className="block"
                    />
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
