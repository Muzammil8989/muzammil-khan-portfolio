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
          "border border-transparent bg-transparent backdrop-blur-md p-3 sm:p-4",
          "hover:shadow-[0_0_15px_rgba(34,197,94,0.35)] hover:border-emerald-400/40",
          isExpanded && "shadow-[0_0_25px_rgba(34,197,94,0.5)] border-emerald-400/60"
        )}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Logo */}
          <img
            src={logoUrl}
            alt={altText}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover bg-muted flex-shrink-0"
          />

          <div className="flex-grow min-w-0">
            <CardHeader className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <div className="min-w-0">
                  {/* Title + badges + chevron */}
                  <h3 className="flex items-center gap-1 font-semibold leading-none text-[14px] sm:text-[15.5px] min-w-0">
                    <span className="truncate">{title}</span>

                    {badges && badges.length > 0 && (
                      <span className="flex flex-wrap gap-1 ml-1 sm:ml-2">
                        {badges.map((badge, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px] sm:text-[12px] leading-none"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    )}

                    <motion.span
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="ml-1"
                    >
                      <ChevronRightIcon className="size-4 shrink-0 text-emerald-400" />
                    </motion.span>
                  </h3>

                  {subtitle && (
                    <div className="font-sans text-[12.5px] sm:text-[15.5px] text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
                      {subtitle}
                    </div>
                  )}
                </div>

                <div className="text-[12.5px] sm:text-[15.5px] tabular-nums text-muted-foreground whitespace-nowrap sm:ml-2 shrink-0">
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
      className="overflow-hidden text-[13px] sm:text-[15px] text-muted-foreground leading-relaxed mt-2 text-justify"
    >
      <div className="border-l-2 border-emerald-400/50 pl-3">
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
