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
} from "lucide-react";
import { toast } from "sonner";
import { useLikeBlog } from "@/app/hooks/useBlogs";
import { Blog } from "@/services/blog";

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
                toast.success("Audio finished");
            };

            utterance.onerror = () => {
                setIsPlaying(false);
                setIsPaused(false);
                toast.error("Audio playback failed");
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);
            toast.info("Audio stopped");
        }
    };

    const handleShare = async () => {
        const shareData = {
            title: blog.title,
            text: blog.excerpt,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success("Shared successfully!");
            } catch (err) {
                if ((err as Error).name !== "AbortError") copyToLink();
            }
        } else {
            copyToLink();
        }
    };

    const copyToLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
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
            <Button onClick={handleShare} variant="outline" className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
            </Button>

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
