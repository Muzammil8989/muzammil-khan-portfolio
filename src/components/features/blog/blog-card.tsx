"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Heart, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Blog } from "@/services/blog";
import { useLikeBlog } from "@/app/hooks/useBlogs";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

interface BlogCardProps {
  blog: Blog;
  onEdit?: (blog: Blog) => void;
  onDelete?: (blog: Blog) => void;
  showActions?: boolean;
}

export function BlogCard({
  blog,
  onEdit,
  onDelete,
  showActions = true,
}: BlogCardProps) {
  const queryClient = useQueryClient();
  const likeMutation = useLikeBlog();
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes || 0);

  useEffect(() => {
    if (blog?._id) {
      const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
      setHasLiked(likedBlogs.includes(blog._id));
    }
  }, [blog?._id]);

  useEffect(() => {
    setLikesCount(blog.likes || 0);
  }, [blog.likes]);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!blog?._id || hasLiked) return;

    // Optimistic update
    setLikesCount(prev => prev + 1);
    setHasLiked(true);

    likeMutation.mutate(blog._id, {
      onSuccess: () => {
        const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
        if (!likedBlogs.includes(blog._id)) {
          likedBlogs.push(blog._id);
          localStorage.setItem("liked_blogs", JSON.stringify(likedBlogs));
        }
        // Invalidate queries to sync with other components
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
      },
      onError: () => {
        // Rollback
        setLikesCount(prev => prev - 1);
        setHasLiked(false);
      }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400";
      case "advanced":
        return "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
      case "draft":
        return "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400";
      case "archived":
        return "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";
      default:
        return "";
    }
  };

  return (
    <Card className="hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 h-full flex flex-col group border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden rounded-3xl">
      <CardHeader className="p-6 pb-2 space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={`${getStatusColor(blog.status)} border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}>
            {blog.status}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-slate-400 font-medium whitespace-nowrap">
            {blog.publishedAt && (
              <span className="flex items-center gap-1.5 font-bold tracking-tighter uppercase">
                {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {blog.readingTime || 5}m
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <button
              onClick={handleLike}
              disabled={hasLiked || likeMutation.isPending}
              className={`flex items-center gap-1 transition-colors ${hasLiked
                  ? "text-red-500 font-bold"
                  : "hover:text-red-500"
                }`}
            >
              <Heart className={`h-3.5 w-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
              {likesCount}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {showActions ? (
            <h3 className="text-xl font-extrabold line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
              {blog.title}
            </h3>
          ) : (
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="text-xl font-extrabold line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-colors tracking-tight">
                {blog.title}
              </h3>
            </Link>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-6 py-4 flex-grow flex flex-col gap-6">
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-light">
          {blog.excerpt}
        </p>

        <div className="space-y-4 mt-auto">
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blog.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] font-bold text-indigo-500/80 dark:text-blue-400/80 uppercase tracking-tighter">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Languages & Frameworks */}
          <div className="flex flex-wrap gap-1.5">
            {blog.languages?.slice(0, 2).map((lang) => (
              <Badge key={lang} variant="secondary" className="bg-slate-100 dark:bg-white/5 text-[10px] border-none px-2.5 py-0.5 rounded-lg text-slate-600 dark:text-slate-400">
                {lang}
              </Badge>
            ))}
            {blog.frameworks?.slice(0, 2).map((framework) => (
              <Badge key={framework} variant="secondary" className="bg-slate-100 dark:bg-white/5 text-[10px] border-none px-2.5 py-0.5 rounded-lg text-slate-600 dark:text-slate-400">
                {framework}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      {showActions ? (
        <CardFooter className="p-6 pt-0 flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(blog)}
            className="flex-1 rounded-xl border-slate-200 dark:border-white/10 hover:bg-indigo-50 dark:hover:bg-blue-500/10 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(blog)}
            className="flex-1 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border-none transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="p-6 pt-0">
          <Link href={`/blog/${blog.slug}`} className="w-full">
            <Button variant="default" className="w-full group/btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl h-11 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-slate-200 dark:shadow-none font-bold">
              Read Article
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
