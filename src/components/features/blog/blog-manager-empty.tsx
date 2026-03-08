"use client";

import { FileText, Plus, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogManager } from "./blog-manager-context";
import { BlogManagerTable } from "./blog-manager-table";

export function BlogManagerEmpty() {
  const {
    state: { searchQuery },
    actions: { setIsCreateOpen },
  } = useBlogManager();

  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-border bg-muted/10 text-center">
      <div className={`rounded-2xl p-5 mb-5 ${searchQuery ? "bg-muted" : "bg-gradient-to-br from-blue-600/10 to-indigo-600/10"}`}>
        {searchQuery
          ? <SearchX className="h-9 w-9 text-muted-foreground" />
          : <FileText className="h-9 w-9 text-indigo-500 dark:text-indigo-400" />
        }
      </div>
      <h3 className="text-base font-bold mb-1.5">
        {searchQuery ? "No results found" : "No blog posts yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        {searchQuery
          ? `No posts matched "${searchQuery}". Try different keywords.`
          : "Create your first blog post to start sharing your knowledge."}
      </p>
      {!searchQuery && (
        <Button
          className="mt-6 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20 font-semibold"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create First Post
        </Button>
      )}
    </div>
  );
}

export function BlogManagerContent() {
  const {
    state: { filteredBlogs },
  } = useBlogManager();

  if (filteredBlogs.length === 0) return <BlogManagerEmpty />;
  return <BlogManagerTable />;
}
