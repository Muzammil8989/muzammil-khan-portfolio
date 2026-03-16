"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Heart, Copy, ChevronDown } from "lucide-react";

// Brand icons — lucide deprecated Twitter/Linkedin/Facebook; use canonical SVGs instead
const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);
import { toast } from "sonner";
import { useLikeBlog } from "@/app/hooks/useBlogs";
import { Blog } from "@/services/blog";
import { safeGet, safeSet } from "@/lib/like-token";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface BlogActionsProps {
    blog: Blog;
}

const LIKED_KEY = "liked_blogs";

export function BlogActions({ blog }: BlogActionsProps) {
    const likeMutation = useLikeBlog();
    const [hasLiked, setHasLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(blog.likes || 0);

    // Sync likes count when prop updates
    useEffect(() => {
        setLikesCount(blog.likes || 0);
    }, [blog.likes]);

    // Merge server-side isLiked flag with localStorage — whichever says "liked" wins.
    // UUID token may differ from IP used for SSR check on first visit,
    // so we trust localStorage as the primary source of truth on the client.
    useEffect(() => {
        if (!blog?._id) return;
        const liked: string[] = JSON.parse(safeGet(LIKED_KEY));
        const localLiked = liked.includes(blog._id);

        if (blog.isLiked && !localLiked) {
            // Server says liked but localStorage doesn't know — sync it
            liked.push(blog._id);
            safeSet(LIKED_KEY, JSON.stringify(liked));
        }
        setHasLiked(localLiked || blog.isLiked || false);
    }, [blog?._id, blog?.isLiked]);

    const handleLike = () => {
        if (!blog || hasLiked || likeMutation.isPending) return;

        // Optimistic update
        setLikesCount((prev) => prev + 1);
        setHasLiked(true);

        likeMutation.mutate(blog._id, {
            onSuccess: () => {
                const liked: string[] = JSON.parse(safeGet(LIKED_KEY));
                if (!liked.includes(blog._id)) {
                    liked.push(blog._id);
                    safeSet(LIKED_KEY, JSON.stringify(liked));
                }
            },
            onError: () => {
                setLikesCount((prev) => prev - 1);
                setHasLiked(false);
            },
        });
    };

    // ── Share handlers ──
    const handleShare = async () => {
        if (!blog) { toast.error("Blog data not available"); return; }
        const shareData = {
            title: blog.title || "Check out this blog post",
            text: blog.excerpt || blog.title || "Interesting article",
            url: typeof window !== "undefined" ? window.location.href : "",
        };
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } catch (err) {
                if ((err as Error).name !== "AbortError") copyToLink();
            }
        } else { copyToLink(); }
    };

    const copyToLink = () => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
            toast.error("Sharing not available"); return;
        }
        navigator.clipboard.writeText(window.location.href).then(
            () => toast.success("Link copied to clipboard!"),
            () => toast.error("Failed to copy link")
        );
    };

    const shareToTwitter = () => {
        if (!blog || typeof window === "undefined") return;
        const text = encodeURIComponent(blog.title || "Check out this article");
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };
    const shareToLinkedIn = () => {
        if (typeof window === "undefined") return;
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    };
    const shareToFacebook = () => {
        if (typeof window === "undefined") return;
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    };

    return (
        <div className="flex flex-wrap items-center gap-3 mt-8">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Share2 className="w-4 h-4" />
                        Share
                        <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={copyToLink} className="gap-2 cursor-pointer">
                        <Copy className="w-4 h-4" /><span>Copy Link</span>
                    </DropdownMenuItem>
                    {typeof navigator !== "undefined" && "share" in navigator && (
                        <>
                            <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                                <Share2 className="w-4 h-4" /><span>Share via...</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
                        <XIcon className="w-4 h-4" /><span>Share on X</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2 cursor-pointer">
                        <LinkedInIcon className="w-4 h-4" /><span>Share on LinkedIn</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
                        <FacebookIcon className="w-4 h-4" /><span>Share on Facebook</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                onClick={handleLike}
                disabled={likeMutation.isPending || hasLiked}
                variant="outline"
                className={`gap-2 transition-all duration-300 ${hasLiked
                    ? "text-red-500 border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30"
                    : "hover:text-red-500 hover:border-red-500"
                    }`}
            >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {likesCount} {hasLiked ? 'Liked' : 'Likes'}
            </Button>
        </div>
    );
}
