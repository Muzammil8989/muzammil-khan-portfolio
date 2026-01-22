"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Heart, Clock, ArrowRight } from "lucide-react";
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
    <Card className="group relative h-full flex flex-col overflow-hidden rounded-[2rem] border-slate-100 dark:border-white/5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.15)] dark:hover:shadow-[0_20px_50px_rgba(59,130,246,0.1)] hover:-translate-y-1.5">
      {/* Premium Gradient Top Border */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 dark:via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <CardHeader className="p-7 pb-0 space-y-6">
        <div className="flex items-center justify-between">
          {showActions ? (
            <Badge className={`${getStatusColor(blog.status)} border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
              {blog.status}
            </Badge>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 dark:group-hover:text-blue-400 transition-colors">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-blue-500 animate-pulse" />
              Article
            </div>
          )}

          <div className="flex items-center gap-2.5 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {blog.readingTime || 5} min
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <button
              onClick={handleLike}
              disabled={hasLiked || likeMutation.isPending}
              className={`flex items-center gap-1 transition-all duration-300 ${hasLiked
                  ? "text-red-500 font-bold scale-110"
                  : "hover:text-red-500 hover:scale-105"
                }`}
            >
              <Heart className={`w-3.5 h-3.5 ${hasLiked ? "fill-red-500" : ""}`} />
              {likesCount}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {showActions ? (
            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {blog.title}
            </h3>
          ) : (
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-blue-400 transition-all duration-300 tracking-tight leading-tight line-clamp-2">
                {blog.title}
              </h3>
            </Link>
          )}
          <p className="text-[15px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed font-light">
            {blog.excerpt}
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-7 flex-grow flex flex-col justify-end">
        <div className="space-y-5">
          {/* Tags with more professional look */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {blog.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1 group-hover:text-indigo-400/80 dark:group-hover:text-blue-400/80 transition-colors">
                  <span className="text-indigo-500/50 dark:text-blue-500/50 font-black">#</span>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Languages & Frameworks */}
          <div className="flex flex-wrap gap-2">
            {[...(blog.languages || []), ...(blog.frameworks || [])].slice(0, 4).map((item) => (
              <span key={item} className="px-3 py-1 rounded-lg bg-slate-50 dark:bg-white/5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/10 group-hover:border-indigo-100 dark:group-hover:border-blue-500/20 transition-colors">
                {item}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-7 pt-0">
        {showActions ? (
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(blog)}
              className="flex-1 rounded-xl border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-blue-500/5 transition-all font-bold text-xs h-10"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(blog)}
              className="flex-1 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border-none transition-all font-bold text-xs h-10"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        ) : (
          <Link href={`/blog/${blog.slug}`} className="w-full">
            <Button className="w-full group/btn bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.25rem] h-12 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/10 dark:shadow-none font-black text-sm uppercase tracking-widest">
              Explore Article
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
