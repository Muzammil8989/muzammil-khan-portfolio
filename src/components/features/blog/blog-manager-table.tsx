"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Heart,
  Clock,
  LucideLinkedin,
  Unlink,
  Edit,
  Trash2,
  Eye,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  ExternalLink,
  ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useBlogManager } from "./blog-manager-context";
import { getTypeColorClasses } from "@/lib/blog-colors";
import type { Blog } from "@/services/blog";

// ─── Sort header ──────────────────────────────────────────────────────────────
type SortDir = "asc" | "desc" | false;

function SortHeader({
  label, col, active, dir, onToggle,
}: {
  label: string; col: string; active: boolean; dir: SortDir; onToggle: (col: string) => void;
}) {
  return (
    <button
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group"
      onClick={() => onToggle(col)}
    >
      {label}
      {active && dir === "asc" ? (
        <ArrowUp className="h-3 w-3 text-foreground" />
      ) : active && dir === "desc" ? (
        <ArrowDown className="h-3 w-3 text-foreground" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </button>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────
export function BlogManagerTable() {
  const {
    state: { filteredBlogs },
    actions: { handlePublishRow, handleLinkedInRow, handleEditRow, handleDeleteRow, handleUnlinkLinkedIn },
  } = useBlogManager();

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Reset to first page when data or sort changes
  useEffect(() => { setPage(0); }, [filteredBlogs, sortCol, sortDir, pageSize]);

  const toggleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else setSortCol(null);
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return filteredBlogs;
    return [...filteredBlogs].sort((a, b) => {
      let aVal: any, bVal: any;
      if (sortCol === "title")       { aVal = a.title.toLowerCase(); bVal = b.title.toLowerCase(); }
      else if (sortCol === "type")   { aVal = a.type; bVal = b.type; }
      else if (sortCol === "difficulty") { aVal = a.difficulty; bVal = b.difficulty; }
      else if (sortCol === "isPublished") { aVal = Number(a.isPublished); bVal = Number(b.isPublished); }
      else if (sortCol === "likes")  { aVal = a.likes || 0; bVal = b.likes || 0; }
      else if (sortCol === "date")   {
        aVal = new Date(a.publishedAt || a.createdAt).getTime();
        bVal = new Date(b.publishedAt || b.createdAt).getTime();
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredBlogs, sortCol, sortDir]);

  const totalRows   = sortedRows.length;
  const totalPages  = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage    = Math.min(page, totalPages - 1);
  const start       = safePage * pageSize;
  const end         = Math.min(start + pageSize, totalRows);
  const pageRows    = sortedRows.slice(start, end);

  // Page number buttons (max 5 visible)
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(0, safePage - delta);
      i <= Math.min(totalPages - 1, safePage + delta);
      i++
    ) range.push(i);
    return range;
  }, [safePage, totalPages]);

  const sh = (label: string, col: string) => (
    <SortHeader label={label} col={col} active={sortCol === col} dir={sortCol === col ? sortDir : false} onToggle={toggleSort} />
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-muted/30 hover:bg-muted/50 dark:hover:bg-muted/30">
              <TableHead className="h-10 px-4 pl-5">{sh("Post", "title")}</TableHead>
              <TableHead className="h-10 px-4">{sh("Type", "type")}</TableHead>
              <TableHead className="h-10 px-4">{sh("Level", "difficulty")}</TableHead>
              <TableHead className="h-10 px-4">{sh("Status", "isPublished")}</TableHead>
              <TableHead className="h-10 px-4">{sh("Likes", "likes")}</TableHead>
              <TableHead className="h-10 px-4">{sh("Date", "date")}</TableHead>
              <TableHead className="h-10 px-4 pr-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((blog) => (
                <TableRow
                  key={blog._id}
                  className="border-b border-border/50 hover:bg-muted/20 dark:hover:bg-white/[0.03] transition-colors duration-150"
                >
                  <TableCell className="px-4 py-3.5 pl-5"><TitleCell blog={blog} /></TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getTypeColorClasses(blog.type)}`}>
                      {blog.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5"><DifficultyBadge difficulty={blog.difficulty} /></TableCell>
                  <TableCell className="px-4 py-3.5"><StatusBadge live={blog.isPublished} /></TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
                      <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      {blog.likes || 0}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {blog.publishedAt || blog.createdAt
                        ? new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3.5 pr-5">
                    <ActionsCell
                      blog={blog}
                      onPublish={handlePublishRow}
                      onLinkedIn={handleLinkedInRow}
                      onEdit={handleEditRow}
                      onDelete={handleDeleteRow}
                      onUnlink={handleUnlinkLinkedIn}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination footer ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-border bg-muted/20">

        {/* Left: count + rows-per-page */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
          <span>
            Showing{" "}
            <span className="text-foreground font-semibold">{totalRows === 0 ? 0 : start + 1}</span>
            {" – "}
            <span className="text-foreground font-semibold">{end}</span>
            {" of "}
            <span className="text-foreground font-semibold">{totalRows}</span>
            {" rows"}
          </span>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline">Rows per page</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-7 w-16 text-xs border-border/60 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Right: page navigation */}
        <div className="flex items-center gap-1">
          {/* First */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPage(0)}
            disabled={safePage === 0}
          >
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Prev */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>

          {/* Page number pills */}
          {pageNumbers[0] > 0 && (
            <>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(0)}>1</Button>
              {pageNumbers[0] > 1 && <span className="px-1 text-[11px] text-muted-foreground">…</span>}
            </>
          )}

          {pageNumbers.map((n) => (
            <Button
              key={n}
              variant={n === safePage ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              style={n === safePage ? { background: "#FFB902", color: "#04061a" } : undefined}
              onClick={() => setPage(n)}
            >
              {n + 1}
            </Button>
          ))}

          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                <span className="px-1 text-[11px] text-muted-foreground">…</span>
              )}
              <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-xs" onClick={() => setPage(totalPages - 1)}>
                {totalPages}
              </Button>
            </>
          )}

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          {/* Last */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => setPage(totalPages - 1)}
            disabled={safePage >= totalPages - 1}
          >
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function LinkedInPreviewCard({ blog }: { blog: Blog }) {
  const liPost = blog.linkedinPost!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const blogUrl = `${siteUrl}/blog/${blog.slug}`;
  const postedDate = liPost.postedAt
    ? new Date(liPost.postedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "Recently";

  return (
    <div className="w-80 rounded-xl overflow-hidden border border-border shadow-lg bg-background">
      {/* LinkedIn-style header */}
      <div className="bg-[#0077B5] px-4 py-2 flex items-center gap-2">
        <LucideLinkedin className="h-4 w-4 text-white" />
        <span className="text-white text-xs font-semibold">LinkedIn Post Preview</span>
      </div>

      {/* Post card */}
      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-[#0077B5] flex items-center justify-center shrink-0 text-white text-sm font-bold">
            MK
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">Muhammad Muzammil Khan</p>
            <p className="text-[11px] text-muted-foreground leading-tight truncate">Full Stack Developer</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{postedDate} · 🌐</p>
          </div>
        </div>

        {/* Post text */}
        <div className="text-sm text-foreground leading-relaxed mb-3 line-clamp-4 whitespace-pre-line">
          {blog.excerpt}
          {"\n\nFull article link in the comments 👇"}
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <p className="text-xs text-[#0077B5] mb-3 line-clamp-1">
            {blog.tags.slice(0, 4).map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}
          </p>
        )}

        {/* Image count indicator */}
        {liPost.imageCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5 mb-3">
            <ImageIcon className="h-3 w-3" />
            <span>{liPost.imageCount} image{liPost.imageCount > 1 ? "s" : ""} attached</span>
          </div>
        )}

        {/* Auto-comment indicator */}
        <div className="bg-[#0077B5]/10 border border-[#0077B5]/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-[10px] font-semibold text-[#0077B5] mb-1">📌 First Comment (auto-posted)</p>
          <p className="text-[11px] text-muted-foreground break-all leading-snug">
            Read the full article here: <span className="text-[#0077B5]">{blogUrl}</span>
          </p>
        </div>

        {/* Reaction bar */}
        <div className="flex items-center justify-between border-t border-border pt-2.5">
          {[
            { icon: ThumbsUp, label: "Like" },
            { icon: MessageSquare, label: "Comment" },
            { icon: Repeat2, label: "Repost" },
            { icon: Send, label: "Send" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[#0077B5] transition-colors px-1 py-0.5 rounded"
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View on LinkedIn button */}
      <div className="px-4 pb-4">
        <a
          href={liPost.postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View on LinkedIn
        </a>
      </div>
    </div>
  );
}

function TitleCell({ blog }: { blog: Blog }) {
  const liPost = blog.linkedinPost;
  return (
    <div className="min-w-0 max-w-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground truncate leading-tight">{blog.title}</span>
        {liPost && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className="shrink-0 text-[#0077B5] hover:text-[#005f8e] transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Preview LinkedIn post"
              >
                <LucideLinkedin className="h-3.5 w-3.5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-0 shadow-none" side="bottom" align="start" sideOffset={8}>
              <LinkedInPreviewCard blog={blog} />
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {blog.readingTime || 5} min
        </span>
        {blog.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="hidden sm:inline" style={{ color: "rgba(255,185,2,0.6)" }}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string | undefined }) {
  const style =
    difficulty === "beginner"
      ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400"
      : difficulty === "intermediate"
      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400"
      : "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${style}`}>
      {difficulty}
    </span>
  );
}

function StatusBadge({ live }: { live: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
      live
        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
        : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
      {live ? "Live" : "Draft"}
    </span>
  );
}

function ActionsCell({
  blog, onPublish, onLinkedIn, onEdit, onDelete, onUnlink,
}: {
  blog: Blog;
  onPublish: (id: string) => void;
  onLinkedIn: (b: Blog) => void;
  onEdit: (b: Blog) => void;
  onDelete: (b: Blog) => void;
  onUnlink: (b: Blog) => void;
}) {
  const liPost = blog.linkedinPost;
  return (
    <div className="flex items-center gap-0.5">
      {blog.isPublished && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={`/blog/${blog.slug}`} target="_blank">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="top">View live post</TooltipContent>
        </Tooltip>
      )}
      {!blog.isPublished && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-500" onClick={() => onPublish(blog._id)}>
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Publish</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 transition-colors ${!liPost ? "text-muted-foreground hover:text-[#0077B5]" : "text-[#0077B5] hover:text-[#005f8e]"}`}
            disabled={!blog.isPublished}
            onClick={() => onLinkedIn(blog)}
          >
            <LucideLinkedin className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {!blog.isPublished ? "Publish post first" : liPost ? "Re-post to LinkedIn" : "Post to LinkedIn"}
        </TooltipContent>
      </Tooltip>
      {liPost && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[#0077B5] hover:text-red-500" onClick={() => onUnlink(blog)}>
              <Unlink className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Delete LinkedIn post</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-[#FFB902]" onClick={() => onEdit(blog)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Edit post</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500" onClick={() => onDelete(blog)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">Delete post</TooltipContent>
      </Tooltip>
    </div>
  );
}
