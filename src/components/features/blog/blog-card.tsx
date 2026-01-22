"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Heart, Clock, BookOpen, ArrowRight } from "lucide-react";
import { Blog } from "@/services/blog";
import Link from "next/link";

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
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (blog?._id) {
      const likedBlogs = JSON.parse(localStorage.getItem("liked_blogs") || "[]");
      setHasLiked(likedBlogs.includes(blog._id));
    }
  }, [blog?._id]);

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
    <Card className="hover:shadow-lg transition-all duration-300 h-full flex flex-col group">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {showActions ? (
              <h3 className="text-lg font-bold line-clamp-2 text-[#FFB902]">
                {blog.title}
              </h3>
            ) : (
              <Link
                href={`/blog/${blog.slug}`}
                className="text-lg font-bold line-clamp-2 text-[#FFB902] hover:underline"
              >
                {blog.title}
              </Link>
            )}
          </div>

          <Badge className={getStatusColor(blog.status)}>
            {blog.status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={getDifficultyColor(blog.difficulty)} variant="outline">
            {blog.difficulty}
          </Badge>

          {blog.readingTime && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {blog.readingTime} min
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-grow space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {blog.excerpt}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{blog.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Languages & Frameworks */}
        <div className="flex flex-wrap gap-1">
          {blog.languages?.slice(0, 2).map((lang) => (
            <Badge key={lang} variant="outline" className="text-xs">
              {lang}
            </Badge>
          ))}
          {blog.frameworks?.slice(0, 2).map((framework) => (
            <Badge key={framework} variant="outline" className="text-xs">
              {framework}
            </Badge>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
          {showActions && (
            <div className={`flex items-center gap-1 ${hasLiked ? 'text-red-500' : ''}`}>
              <Heart className={`h-3 w-3 ${hasLiked ? 'fill-red-500' : ''}`} />
              <span>{blog.likes || 0}</span>
            </div>
          )}
          {blog.codeBlocks && blog.codeBlocks.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {blog.codeBlocks.length} code block{blog.codeBlocks.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Author & Date */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>By {blog.author}</p>
          {blog.publishedAt && (
            <p>
              Published: {new Date(blog.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      {showActions ? (
        <CardFooter className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(blog)}
            className="flex-1"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(blog)}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </CardFooter>
      ) : (
        <CardFooter className="pt-4 border-t">
          <Link href={`/blog/${blog.slug}`} className="w-full">
            <Button variant="default" className="w-full group/btn">
              <BookOpen className="mr-2 h-4 w-4" />
              Read Full Article
              <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
