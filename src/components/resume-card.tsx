"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
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

  const truncateTitle = (text: string, maxWords = 3) => {
    const words = text.split(" ").filter(Boolean);
    return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "…" : text;
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (description) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <Link href={href || "#"} className="block cursor-pointer" onClick={handleClick}>
      <Card className="border-none shadow-none p-3 sm:p-4 hover:bg-accent/50 transition-colors duration-300">
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Responsive circular image */}
          <img
            src={logoUrl}
            alt={altText}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover bg-muted flex-shrink-0"
          />

          {/* Allow text to shrink/wrap properly */}
          <div className="flex-grow min-w-0">
            <CardHeader className="p-0">
              {/* Stack on mobile, split on larger screens */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                {/* Title + badges + chevron */}
                <div className="min-w-0">
                  <h3 className="flex items-center gap-1 font-semibold leading-none text-[14px] sm:text-[15.5px] min-w-0">
                    <span className="truncate">{truncateTitle(title)}</span>

                    {/* Badges wrap nicely on small screens */}
                    {badges && badges.length > 0 && (
                      <span className="flex flex-wrap gap-1 ml-1 sm:ml-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] sm:text-[12px] leading-none"
                        >
                          {badges[0]}
                        </Badge>
                        {badges.slice(1).map((badge, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-[10px] sm:text-[12px] leading-none"
                          >
                            {badge}
                          </Badge>
                        ))}
                      </span>
                    )}

                    <ChevronRightIcon
                      className={cn(
                        "ml-1 size-4 shrink-0 transition-transform duration-300 ease-out",
                        isExpanded ? "rotate-90" : "rotate-0"
                      )}
                    />
                  </h3>

                  {subtitle && (
                    <div className="font-sans text-[12.5px] sm:text-[15.5px] text-muted-foreground mt-1 line-clamp-1 sm:line-clamp-none">
                      {subtitle}
                    </div>
                  )}
                </div>

                {/* Period readable, capped at 15.5px */}
                <div className="text-[12.5px] sm:text-[15.5px] tabular-nums text-muted-foreground whitespace-nowrap sm:ml-2 shrink-0">
                  {period}
                </div>
              </div>
            </CardHeader>

            {description && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? "auto" : 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 text-[13px] sm:text-[15.5px] text-muted-foreground"
              >
                {description}
              </motion.div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
