"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import { useState } from "react";
import { ExternalLink } from "lucide-react";

interface Props {
  title: string;
  href?: string;
  description: string;
  dates: string;
  tags: readonly string[];
  link?: string;
  image?: string;
  video?: string;
  links?: readonly {
    icon: React.ReactNode;
    type: string;
    href: string;
  }[];
  className?: string;
}

export function ProjectCardPublic({
  title,
  href,
  description,
  dates,
  tags,
  image,
  video,
  links,
  className,
}: Props) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 ease-out",
        // base styling
        "bg-card border border-border/60 backdrop-blur-sm",
        // hover
        "hover:shadow-xl hover:border-primary/60 hover:-translate-y-1.5",
        "dark:shadow-[0_0_25px_rgba(255,255,255,0.05)]",
        // make card naturally compact
        "min-h-[220px]",
        className
      )}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

      {/* Image Section */}
      <Link
        href={href || "#"}
        className={cn(
          "relative block overflow-hidden bg-muted",
          // smaller height for more compact card
          "h-32 sm:h-36"
        )}
      >
        <div className="relative w-full h-full overflow-hidden bg-muted">
          {video && video.trim() !== "" && !video.includes("localhost") ? (
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="pointer-events-none w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : image && image.trim() !== "" && !imageError ? (
            <>
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  console.error("Image failed to load:", image, e);
                  setImageError(true);
                }}
                loading="lazy"
              />
              {/* Image Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-semibold text-primary/50 mb-1.5">
                  {title.charAt(0)}
                </div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                  No preview
                </div>
              </div>
            </div>
          )}

          {/* Corner Badge */}
          <div className="absolute top-2 right-2 bg-card/95 backdrop-blur-sm px-1.5 py-1 rounded-md shadow-md border border-border/70">
            <ExternalLink className="w-3 h-3 text-primary" />
          </div>
        </div>
      </Link>

      {/* Content Section */}
      <CardHeader className="relative px-3 sm:px-4 pt-2.5 pb-1.5 bg-card">
        <div className="space-y-1">
          <CardTitle className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
            {title}
          </CardTitle>

          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-primary" />
            <time className="font-sans text-[11px] text-muted-foreground/90 font-medium">
              {dates}
            </time>
          </div>

          <div className="prose max-w-full text-pretty font-sans text-[11px] sm:text-xs text-muted-foreground dark:prose-invert line-clamp-2 leading-relaxed">
            <Markdown>{description}</Markdown>
          </div>
        </div>
      </CardHeader>

      {/* Tags Section */}
      <CardContent className="mt-auto flex flex-col px-3 sm:px-4 pb-2 bg-card">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.25">
            {tags.map((tag, index) => (
              <Badge
                key={tag}
                variant="secondary"
                className={cn(
                  "px-1.5 py-0.5 text-[10px] sm:text-[11px] font-medium",
                  "bg-secondary/60 text-secondary-foreground border border-border/80",
                  "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                  "transition-all duration-200 cursor-default shadow-sm"
                )}
                style={{
                  animationDelay: `${index * 40}ms`,
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {/* Links Section */}
      <CardFooter className="px-3 sm:px-4 pb-2 pt-1.5 border-t border-border/50 bg-card">
        {links && links.length > 0 && (
          <div className="flex flex-row flex-wrap items-center gap-1.5 w-full">
            {links.map((link, idx) => (
              <Link
                href={link.href}
                key={idx}
                target="_blank"
                className="group/link"
              >
                <Badge
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 text-[10px] sm:text-xs font-medium",
                    "bg-muted/60 text-foreground border border-border/70",
                    "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                    "transition-all duration-200 cursor-pointer",
                    "shadow-sm hover:shadow-md hover:scale-105"
                  )}
                >
                  <span className="group-hover/link:scale-110 transition-transform duration-200">
                    {link.icon}
                  </span>
                  <span>{link.type}</span>
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
