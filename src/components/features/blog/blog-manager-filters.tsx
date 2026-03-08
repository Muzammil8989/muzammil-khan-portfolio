"use client";

import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBlogManager } from "./blog-manager-context";

export function BlogManagerFilters() {
  const {
    state: { searchQuery, typeFilter, publishFilter, filteredBlogs, blogsArray },
    actions: { setSearchQuery, setTypeFilter, setPublishFilter },
  } = useBlogManager();

  const hasFilters = searchQuery || typeFilter !== "all" || publishFilter !== "all";

  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm px-4 py-3.5 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-2.5">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title, tags, content…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-background border-border/60 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
            <SelectTrigger className="w-full sm:w-36 h-9 bg-background border-border/60 text-sm">
              <Filter className="h-3 w-3 mr-1.5 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="Case Study">Case Study</SelectItem>
              <SelectItem value="Tutorial">Tutorial</SelectItem>
              <SelectItem value="Deep Dive">Deep Dive</SelectItem>
              <SelectItem value="Quick Tip">Quick Tip</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
            </SelectContent>
          </Select>

          <Select value={publishFilter} onValueChange={(v: any) => setPublishFilter(v)}>
            <SelectTrigger className="w-full sm:w-32 h-9 bg-background border-border/60 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-2.5 text-muted-foreground hover:text-foreground text-xs shrink-0"
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setPublishFilter("all");
              }}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {hasFilters && (
        <p className="text-[11px] text-muted-foreground mt-2.5 font-medium">
          Showing{" "}
          <span className="text-foreground font-semibold">{filteredBlogs.length}</span> of{" "}
          <span className="text-foreground font-semibold">{blogsArray.length}</span> posts
          {searchQuery && (
            <span className="text-indigo-500"> matching &ldquo;{searchQuery}&rdquo;</span>
          )}
        </p>
      )}
    </div>
  );
}
