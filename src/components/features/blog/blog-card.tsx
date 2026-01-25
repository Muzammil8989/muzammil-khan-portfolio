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
import { getTypeColorClasses, getDifficultyColorClasses, getPublishStatusColorClasses } from "@/lib/blog-colors";

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


  return (
    <Card className="group relative h-full flex flex-col overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm shadow-lg dark:shadow-2xl transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_20px_50px_0_rgba(0,0,0,0.5)] hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1">

      <CardHeader className="p-7 pb-0 space-y-6">
        <div className="flex items-center justify-between">
          {showActions ? (
            <div className="flex gap-2">
              <Badge className={`${getTypeColorClasses(blog.type)} border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                {blog.type}
              </Badge>
              <Badge className={`${getPublishStatusColorClasses(blog.isPublished)} border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                {blog.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-colors" style={{
              backgroundColor: 'var(--surface-overlay)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}>
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
              {blog.type}
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
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 tracking-tight leading-tight line-clamp-2">
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

      <CardFooter className="p-7 pt-0 relative z-10">
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
          <Link href={`/blog/${blog.slug}`} className="w-full group/link">
            <div className="w-full px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-colors duration-200 flex items-center justify-center gap-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm">
              Read Article
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform duration-200" />
            </div>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
