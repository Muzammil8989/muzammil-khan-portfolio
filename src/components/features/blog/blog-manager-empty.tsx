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
      <div
        className="rounded-2xl p-5 mb-5"
        style={searchQuery ? undefined : { background: "rgba(255,185,2,0.1)", border: "1px solid rgba(255,185,2,0.2)" }}
      >
        {searchQuery
          ? <SearchX className="h-9 w-9 text-muted-foreground" />
          : <FileText className="h-9 w-9" style={{ color: "#FFB902" }} />
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
          className="mt-6 gap-2 font-bold transition-opacity hover:opacity-85"
          style={{ background: "#FFB902", color: "#04061a" }}
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
  return (
    <div className="w-full">
      <BlogManagerTable />
    </div>
  );
}
