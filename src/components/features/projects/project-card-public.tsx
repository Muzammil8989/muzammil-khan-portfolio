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
    link,
    image,
    video,
    links,
    className,
}: Props) {
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Card
            className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-500 ease-out h-full",
                "bg-card border border-border backdrop-blur-xl",
                "hover:shadow-[0_15px_40px_-10px_rgba(0,0,0,0.25)] hover:border-primary/50 hover:-translate-y-1",
                "dark:shadow-[0_0_20px_rgba(255,255,255,0.04)]",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl" />

            {/* Image Section with Overlay */}
            <Link
                href={href || "#"}
                className={cn("relative block overflow-hidden bg-muted", className)}
            >
                <div className="relative h-40 sm:h-44 w-full overflow-hidden bg-muted">
                    {video && video.trim() !== '' && !video.includes('localhost') ? (
                        <video
                            src={video}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="pointer-events-none w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : image && image.trim() !== '' && !imageError ? (
                        <>
                            <Image
                                src={image}
                                alt={title}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                onError={(e) => {
                                    console.error('Image failed to load:', image, e);
                                    setImageError(true);
                                }}
                                loading="lazy"
                            />
                            {/* Image Overlay on Hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-5xl font-bold text-primary/40 mb-2">
                                    {title.charAt(0)}
                                </div>
                                <div className="text-xs text-muted-foreground font-medium">
                                    No Preview
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Corner Badge */}
                    <div className="absolute top-2 right-2 bg-card/95 backdrop-blur-sm px-1.5 py-1 rounded-md shadow-lg border border-border">
                        <ExternalLink className="w-2.5 h-2.5 text-primary" />
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <CardHeader className="relative px-3 sm:px-4 pt-3 pb-2 bg-card">
                <div className="space-y-1.5">
                    {/* Title with gradient on hover */}
                    <CardTitle className="text-lg sm:text-xl font-bold leading-tight line-clamp-2 text-card-foreground group-hover:text-primary transition-colors duration-300">
                        {title}
                    </CardTitle>

                    {/* Date with icon */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        <time className="font-sans text-sm text-muted-foreground font-medium">
                            {dates}
                        </time>
                    </div>

                    {/* Description with better styling */}
                    <div className="prose max-w-full text-pretty font-sans text-sm sm:text-base text-muted-foreground dark:prose-invert line-clamp-2 leading-relaxed">
                        <Markdown>
                            {description}
                        </Markdown>
                    </div>
                </div>
            </CardHeader>

            {/* Tags Section */}
            <CardContent className="mt-auto flex flex-col px-3 sm:px-4 pb-2 bg-card">
                {tags && tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {tags?.map((tag, index) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className={cn(
                                    "px-2 py-0.5 text-[10px] sm:text-xs font-semibold",
                                    "bg-secondary text-secondary-foreground border border-border",
                                    "hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300",
                                    "cursor-default"
                                )}
                                style={{
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}
            </CardContent>

            {/* Links Section with Enhanced Styling */}
            <CardFooter className="px-3 sm:px-4 pb-3 pt-2 border-t border-border bg-card">
                {links && links.length > 0 && (
                    <div className="flex flex-row flex-wrap items-center gap-2 w-full">
                        {links?.map((link, idx) => (
                            <Link
                                href={link.href}
                                key={idx}
                                target="_blank"
                                className="group/link"
                            >
                                <Badge
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1 text-xs sm:text-sm font-semibold",
                                        "bg-card text-card-foreground border border-border",
                                        "hover:bg-primary hover:text-primary-foreground hover:border-primary",
                                        "transition-all duration-300 cursor-pointer",
                                        "shadow-sm hover:shadow-md"
                                    )}
                                >
                                    <span className="group-hover/link:scale-110 transition-transform duration-300">
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
