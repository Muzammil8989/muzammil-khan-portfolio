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
import Image from "next/image";
import React from "react";
import BlurText from "@/components/react-bit/blur-text";

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

export const ResumeCard = React.memo(({
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
  // increments only when expanding (opening), used to re-trigger animation on reopen
  const [openCount, setOpenCount] = React.useState(0);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded((prev) => {
        const next = !prev;
        if (next) setOpenCount((c) => c + 1); // bump when opening
        return next;
      });
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
          "p-4 sm:p-5 md:p-6",
          "transition-all duration-300"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 ring-2 ring-border shadow-md">
            <Image
              src={logoUrl}
              alt={altText}
              fill
              sizes="(max-width: 640px) 56px, 64px"
              className="object-cover"
            />
          </div>

          <div className="flex-grow min-w-0">
            <CardHeader className="p-0">
              {/* ===== Top row: Left (title/badges) + Right (chevron) ===== */}
              <div className="flex items-start min-w-0">
                {/* LEFT: title + badges (mobile below, desktop inline) */}
                <div className="flex-1 min-w-0">
                  {/* Title + inline badges on sm+ */}
                  <h3 className="flex items-center gap-2 font-bold leading-tight text-base sm:text-lg lg:text-xl text-foreground min-w-0">
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
                      <span className="hidden sm:flex flex-wrap gap-1.5 ml-2">
                        {badges.map((badge, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs font-medium px-2 py-0.5"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    )}
                  </h3>

                  {/* Badges BELOW title ONLY on mobile */}
                  {badges && badges.length > 0 && (
                    <div className="flex sm:hidden flex-wrap gap-1.5 mt-2">
                      {badges.map((badge, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="text-xs font-medium px-2 py-0.5"
                        >
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
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 22,
                      }}
                      className="block"
                    >
                      <ChevronRightIcon className="size-4 text-emerald-400" />
                    </motion.span>
                  </div>
                )}
              </div>

              {/* Subtitle + period row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 sm:mt-3 gap-1.5 sm:gap-2 min-w-0">
                {subtitle && (
                  <div className="text-sm sm:text-base text-muted-foreground font-medium line-clamp-2 min-w-0">
                    <BlurText
                      text={subtitle}
                      delay={160}
                      animateBy="words"
                      direction="top"
                      stepDuration={0.28}
                    />
                  </div>
                )}
                <div className="text-xs sm:text-sm text-muted-foreground/80 font-medium whitespace-nowrap tabular-nums">
                  {period}
                </div>
              </div>
            </CardHeader>

            {/* Expandable description */}
            <AnimatePresence initial={false}>
              {isExpanded && description && (
                <motion.div
                  key={`desc-wrap-${isExpanded}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden text-sm sm:text-base text-foreground/85 leading-relaxed mt-3 sm:mt-4"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="border-l-4 border-primary/60 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-4 bg-muted/30 rounded-r-md"
                  >
                    <p className="text-sm sm:text-base text-foreground/90 leading-relaxed text-justify">{description}</p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </Link>
  );
});

ResumeCard.displayName = 'ResumeCard';
