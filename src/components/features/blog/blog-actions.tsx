"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    Play,
    Pause,
    Square,
    Volume2,
    Share2,
    Heart,
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

    useEffect(() => {
        setLikesCount(blog.likes || 0);
    }, [blog.likes]);

    // ── TTS state ──
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isSupported, setIsSupported] = useState(true);

    const isManuallyStopped = useRef(false);
    const chromeBugTimerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<string[]>([]);
    const chunkIndexRef = useRef(0);

    // Pre-load voices
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) {
            setIsSupported(false);
            return;
        }
        const load = () => {
            const v = window.speechSynthesis.getVoices();
            if (v.length > 0) setVoices(v);
        };
        load();
        window.speechSynthesis.addEventListener("voiceschanged", load);
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", load);
            window.speechSynthesis.cancel();
            if (chromeBugTimerRef.current) clearInterval(chromeBugTimerRef.current);
        };
    }, []);

    // Chrome 14-second bug: pause+resume every 10s
    useEffect(() => {
        if (chromeBugTimerRef.current) clearInterval(chromeBugTimerRef.current);
        if (isPlaying && !isPaused) {
            chromeBugTimerRef.current = setInterval(() => {
                if (window.speechSynthesis?.speaking && !window.speechSynthesis.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        }
        return () => {
            if (chromeBugTimerRef.current) clearInterval(chromeBugTimerRef.current);
        };
    }, [isPlaying, isPaused]);

    // Like sync
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
                setLikesCount(prev => prev - 1);
                setHasLiked(false);
            }
        });
    };

    const pickVoice = useCallback((): SpeechSynthesisVoice | null => {
        const v = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
        if (v.length === 0) return null;
        const preferred = ["Google UK English Male", "Google US English", "Microsoft David Desktop", "Microsoft Zira Desktop"];
        return (
            v.find(x => preferred.includes(x.name)) ||
            v.find(x => x.lang === "en-GB") ||
            v.find(x => x.lang.startsWith("en")) ||
            null
        );
    }, [voices]);

    // Split text into chunks that stay under the browser's utterance limit.
    // We split on sentence boundaries (. ! ?) to keep speech natural.
    const splitIntoChunks = useCallback((text: string, maxLen = 3000): string[] => {
        if (text.length <= maxLen) return [text];
        const sentences = text.match(/[^.!?]+[.!?]+[\s]*/g) || [text];
        const result: string[] = [];
        let current = "";
        for (const sentence of sentences) {
            if (current.length + sentence.length > maxLen && current.length > 0) {
                result.push(current.trim());
                current = "";
            }
            current += sentence;
        }
        if (current.trim()) result.push(current.trim());
        return result;
    }, []);

    const speakChunk = useCallback((index: number) => {
        if (isManuallyStopped.current) return;
        const chunks = chunksRef.current;
        if (index >= chunks.length) {
            setIsPlaying(false);
            setIsPaused(false);
            toast.success("Audio finished");
            return;
        }

        chunkIndexRef.current = index;
        const utt = new SpeechSynthesisUtterance(chunks[index]);
        utt.rate = 0.88;
        utt.pitch = 0.95;
        utt.volume = 1.0;
        utt.lang = "en-US";

        const voice = pickVoice();
        if (voice) utt.voice = voice;

        if (index === 0) {
            utt.onstart = () => toast.success("Audio started");
        }
        utt.onend = () => {
            if (!isManuallyStopped.current) {
                speakChunk(index + 1);
            }
        };
        utt.onerror = (event) => {
            if (!isManuallyStopped.current && event.error !== "canceled" && event.error !== "interrupted") {
                toast.error(`Audio error: ${event.error}`);
            }
            setIsPlaying(false);
            setIsPaused(false);
        };

        window.speechSynthesis.speak(utt);
    }, [pickVoice]);

    const handleAudioToggle = () => {
        if (!isSupported || !window.speechSynthesis) return;

        if (isPlaying && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
            toast.info("Audio paused");
            return;
        }
        if (isPaused) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            toast.info("Audio resumed");
            return;
        }

        // ── Start fresh ──
        isManuallyStopped.current = false;
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
        }

        chunksRef.current = splitIntoChunks(contentToRead);
        chunkIndexRef.current = 0;

        setIsPlaying(true);
        setIsPaused(false);
        speakChunk(0);
    };

    const handleStop = () => {
        if (window.speechSynthesis) {
            isManuallyStopped.current = true;
            chunksRef.current = [];
            chunkIndexRef.current = 0;
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            setIsPaused(false);

            toast.info("Audio stopped");
        }
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
            {isSupported && (
                <>
                    <Button
                        onClick={handleAudioToggle}
                        variant={isPlaying ? "default" : "outline"}
                        className="gap-2"
                    >
                        {isPlaying && !isPaused ? (
                            <><Pause className="w-4 h-4" /> Pause Audio</>
                        ) : isPaused ? (
                            <><Play className="w-4 h-4" /> Resume Audio</>
                        ) : (
                            <><Volume2 className="w-4 h-4" /> Listen to Article</>
                        )}
                    </Button>
                    {isPlaying && (
                        <Button onClick={handleStop} variant="outline" size="icon" title="Stop">
                            <Square className="w-4 h-4" />
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
                        <Twitter className="w-4 h-4" /><span>Share on Twitter</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToLinkedIn} className="gap-2 cursor-pointer">
                        <Linkedin className="w-4 h-4" /><span>Share on LinkedIn</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={shareToFacebook} className="gap-2 cursor-pointer">
                        <Facebook className="w-4 h-4" /><span>Share on Facebook</span>
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
