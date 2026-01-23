"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Volume2,
    Share2,
    Heart,
    BookOpen,
    Copy,
    Twitter,
    Linkedin,
    Facebook,
    ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useLikeBlog } from "@/app/hooks/useBlogs";
import { Blog } from "@/services/blog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface BlogActionsProps {
    blog: Blog;
    contentToRead: string;
}

export function BlogActions({ blog, contentToRead }: BlogActionsProps) {
    const likeMutation = useLikeBlog();
    const [hasLiked, setHasLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(blog.likes || 0);

    // Sync likes count if blog prop updates
    useEffect(() => {
        setLikesCount(blog.likes || 0);
    }, [blog.likes]);

    // Text-to-speech state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const [isSupported, setIsSupported] = useState(true);
    const isManuallyStopped = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined" && !window.speechSynthesis) {
            setIsSupported(false);
        }
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, []);

    // Sync like status
    useEffect(() => {
        if (blog?._id) {
            const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
            const localLiked = likedBlogs.includes(blog._id);

            if (blog.isLiked && !localLiked) {
                likedBlogs.push(blog._id);
                localStorage.setItem("liked_blogs", JSON.stringify(likedBlogs));
                setHasLiked(true);
            } else {
                setHasLiked(localLiked || blog.isLiked || false);
            }
        }
    }, [blog?._id, blog?.isLiked]);

    const handleLike = () => {
        if (!blog || hasLiked) return;

        // Optimistic update for immediate feedback
        setLikesCount(prev => prev + 1);
        setHasLiked(true);

        likeMutation.mutate(blog._id, {
            onSuccess: () => {
                const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
                if (!likedBlogs.includes(blog._id)) {
                    likedBlogs.push(blog._id);
                    localStorage.setItem("liked_blogs", JSON.stringify(likedBlogs));
                }
            },
            onError: () => {
                // Rollback if error
                setLikesCount(prev => prev - 1);
                setHasLiked(false);
            }
        });
    };

    const handleAudioToggle = () => {
        if (!isSupported) return;

        if (isPlaying && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            toast.info("Audio paused");
        } else if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            toast.info("Audio resumed");
        } else {
            isManuallyStopped.current = false;
            const utterance = new SpeechSynthesisUtterance(contentToRead);
            utteranceRef.current = utterance;
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onstart = () => {
                setIsPlaying(true);
                setIsPaused(false);
                toast.success("Audio started");
            };

            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
                if (!isManuallyStopped.current) {
                    toast.success("Audio finished");
                }
            };

            utterance.onerror = (event) => {
                // Don't show error if manually stopped or cancelled
                if (!isManuallyStopped.current && event.error !== "canceled" && event.error !== "interrupted") {
                    toast.error("Audio playback failed");
                }
                setIsPlaying(false);
                setIsPaused(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            isManuallyStopped.current = true;
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            toast.info("Audio stopped");
        }
    };

    const handleShare = async () => {
        if (!blog) {
            toast.error("Blog data not available");
            return;
        }

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
                if ((err as Error).name !== "AbortError") {
                    copyToLink();
                }
            }
        } else {
            copyToLink();
        }
    };

    const copyToLink = () => {
        if (typeof window === "undefined" || typeof navigator === "undefined") {
            toast.error("Sharing not available");
            return;
        }

        navigator.clipboard.writeText(window.location.href).then(
            () => toast.success("Link copied to clipboard!"),
            () => toast.error("Failed to copy link")
        );
    };

    const shareToTwitter = () => {
        if (!blog || typeof window === "undefined") return;

        const text = encodeURIComponent(`${blog.title || "Check out this article"}`);
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
            {isSupported && (
                <>
                    <Button
                        onClick={handleAudioToggle}
                        variant={isPlaying ? "default" : "outline"}
                        className="gap-2"
                    >
                        {isPlaying && !isPaused ? (
                            <>
                                <Pause className="w-4 h-4" />
                                Pause Audio
                            </>
                        ) : isPaused ? (
                            <>
                                <Play className="w-4 h-4" />
                                Resume Audio
                            </>
                        ) : (
                            <>
                                <Volume2 className="w-4 h-4" />
                                Listen to Article
                            </>
                        )}
                    </Button>
                    {isPlaying && (
                        <Button onClick={handleStop} variant="outline" size="icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <rect x="6" y="4" width="4" height="16" />
                                <rect x="14" y="4" width="4" height="16" />
                            </svg>
                        </Button>
                    )}
                </>
            )}
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
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                    </DropdownMenuItem>
                    {typeof navigator !== "undefined" && navigator.share && (
                        <>
                            <DropdownMenuItem onClick={handleShare} className="gap-2 cursor-pointer">
                                <Share2 className="w-4 h-4" />
                                <span>Share via...</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </>
                    )}
                    <DropdownMenuItem onClick={shareToTwitter} className="gap-2 cursor-pointer">
                        <Twitter className="w-4 h-4" />
                        <span>Share on Twitter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2 cursor-pointer">
                        <Linkedin className="w-4 h-4" />
                        <span>Share on LinkedIn</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
                        <Facebook className="w-4 h-4" />
                        <span>Share on Facebook</span>
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
