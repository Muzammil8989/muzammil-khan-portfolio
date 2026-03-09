"use client";

import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlogForm } from "./blog-form";
import { useBlogManager } from "./blog-manager-context";

export function BlogManagerHeader() {
  const {
    state: { blogsArray, isCreateOpen, createBlog },
    actions: { setIsCreateOpen, handleCreateSubmit },
  } = useBlogManager();

  const published = blogsArray.filter((b) => b.isPublished).length;
  const drafts = blogsArray.length - published;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-xl shrink-0" style={{ background: "#FFB902" }}>
          <BookOpen className="w-5 h-5" style={{ color: "#04061a" }} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Blog Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
            <span className="text-foreground font-semibold">{blogsArray.length}</span> posts &nbsp;·&nbsp;
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{published}</span> live &nbsp;·&nbsp;
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{drafts}</span> drafts
          </p>
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogTrigger asChild>
          <Button
            className="gap-2 w-full sm:w-auto font-bold transition-opacity hover:opacity-85"
            style={{ background: "#FFB902", color: "#04061a" }}
          >
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-3xl p-0 flex flex-col max-h-[90vh]">
          <div className="flex-none px-6 pt-6 pb-4 border-b border-border">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new blog post
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-5">
            <BlogForm
              onSubmit={handleCreateSubmit}
              isSubmitting={createBlog.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
