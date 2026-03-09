"use client";

import { useMemo, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heart,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Linkedin,
  Unlink,
  Edit,
  Trash2,
  Eye,
  Zap,
} from "lucide-react";
import { Blog } from "@/services/blog";
import {
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  useSearchBlogs,
  usePublishBlog,
} from "@/app/hooks/useBlogs";
import {
  useLinkedInStatus,
  useLinkedInDisconnect,
  useLinkedInDeletePost,
} from "@/app/hooks/useLinkedIn";
import { getTypeColorClasses } from "@/lib/blog-colors";
import Link from "next/link";
import { BlogManagerCtx, type ViewMode, type StatItem } from "./blog-manager-context";
import { BlogManagerSkeleton } from "./blog-manager-skeleton";
import { SortHeader } from "./blog-manager-table";

// ─── Module-level column helper ───────────────────────────────────────────────
const columnHelper = createColumnHelper<Blog>();

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BlogManagerProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── URL-backed filter / view state ────────────
  const typeFilter = (searchParams.get("type") ?? "all") as "all" | Blog["type"];
  const publishFilter = (searchParams.get("status") ?? "all") as "all" | "published" | "draft";
  const viewMode = (searchParams.get("view") ?? "table") as ViewMode;

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "") params.delete(key);
      else params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setViewMode = useCallback((v: ViewMode) => updateParam("view", v), [updateParam]);
  const setTypeFilter = useCallback((t: string) => updateParam("type", t), [updateParam]);
  const setPublishFilter = useCallback((p: string) => updateParam("status", p), [updateParam]);

  // ── Local state ────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [linkedInBlog, setLinkedInBlog] = useState<Blog | null>(null);
  const [unlinkBlog, setUnlinkBlog] = useState<Blog | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

  // ── Data hooks ─────────────────────────────────
  const { data: allBlogs, isLoading } = useBlogs();
  const { data: searchResults } = useSearchBlogs(searchQuery);
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();
  const publishBlog = usePublishBlog();
  const { data: linkedInStatus } = useLinkedInStatus();
  const disconnectLinkedIn = useLinkedInDisconnect();
  const deleteLinkedInPost = useLinkedInDeletePost();

  const publishMutateRef = useRef(publishBlog.mutate);
  publishMutateRef.current = publishBlog.mutate;

  // ── Derived data ───────────────────────────────
  const blogsArray = useMemo(
    () => (Array.isArray(allBlogs) ? allBlogs : []),
    [allBlogs]
  );
  const searchResultsArray = useMemo(
    () => (Array.isArray(searchResults) ? searchResults : []),
    [searchResults]
  );

  const filteredBlogs = useMemo(() => {
    if (searchQuery) return searchResultsArray;
    return blogsArray.filter((b) => {
      const matchesType = typeFilter === "all" || b.type === typeFilter;
      const matchesStatus =
        publishFilter === "all" ||
        (publishFilter === "published" && b.isPublished) ||
        (publishFilter === "draft" && !b.isPublished);
      return matchesType && matchesStatus;
    });
  }, [searchQuery, searchResultsArray, blogsArray, typeFilter, publishFilter]);

  const stats = useMemo<StatItem[]>(
    () => [
      {
        label: "Total",
        value: blogsArray.length,
        icon: FileText,
        color: "text-slate-600 dark:text-slate-300",
        bg: "bg-slate-100 dark:bg-slate-800",
      },
      {
        label: "Published",
        value: blogsArray.filter((b) => b.isPublished).length,
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
      },
      {
        label: "Drafts",
        value: blogsArray.filter((b) => !b.isPublished).length,
        icon: Circle,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-900/30",
      },
      {
        label: "Likes",
        value: blogsArray.reduce((acc, b) => acc + (b.likes || 0), 0),
        icon: Heart,
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-900/30",
      },
      {
        label: "On LinkedIn",
        value: blogsArray.filter((b) => b.linkedinPost).length,
        icon: Linkedin,
        color: "text-[#0077B5]",
        bg: "bg-[#0077B5]/10",
      },
    ],
    [blogsArray]
  );

  // ── Action callbacks ───────────────────────────
  const handlePublishRow = useCallback((id: string) => {
    publishMutateRef.current(id);
  }, []);

  const handleLinkedInRow = useCallback((blog: Blog) => setLinkedInBlog(blog), []);
  const handleEditRow = useCallback((blog: Blog) => {
    setSelectedBlog(blog);
    setIsEditOpen(true);
  }, []);
  const handleDeleteRow = useCallback((blog: Blog) => {
    setSelectedBlog(blog);
    setIsDeleteOpen(true);
  }, []);
  const handleUnlinkLinkedIn = useCallback((blog: Blog) => {
    setUnlinkBlog(blog);
    setIsUnlinkOpen(true);
  }, []);

  const handleCreateSubmit = useCallback(
    (data: any) => {
      createBlog.mutate(data, {
        onSuccess: () => {
          setIsCreateOpen(false);
          setTypeFilter("all");
          setPublishFilter("all");
          setSearchQuery("");
        },
      });
    },
    [createBlog, setTypeFilter, setPublishFilter]
  );

  const handleEditSubmit = useCallback(
    (data: any) => {
      if (!selectedBlog) return;
      updateBlog.mutate(
        { ...selectedBlog, ...data },
        {
          onSuccess: () => {
            setIsEditOpen(false);
            setSelectedBlog(null);
          },
        }
      );
    },
    [selectedBlog, updateBlog]
  );

  const handleDelete = useCallback(() => {
    if (!selectedBlog) return;
    deleteBlog.mutate(selectedBlog._id, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedBlog(null);
      },
    });
  }, [selectedBlog, deleteBlog]);

  const handleUnlinkPost = useCallback(() => {
    if (!unlinkBlog) return;
    deleteLinkedInPost.mutate(
      { blogId: unlinkBlog._id },
      {
        onSuccess: () => {
          setIsUnlinkOpen(false);
          setUnlinkBlog(null);
        },
      }
    );
  }, [unlinkBlog, deleteLinkedInPost]);

  // ── Table columns ──────────────────────────────
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: ({ column }) => (
          <SortHeader
            label="Post"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ row }) => {
          const blog = row.original;
          const liPost = blog.linkedinPost;
          return (
            <div className="min-w-0 max-w-sm">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate leading-tight">
                  {blog.title}
                </span>
                {liPost && (
                  <a
                    href={liPost.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on LinkedIn"
                    className="shrink-0 text-[#0077B5] hover:text-[#005f8e] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
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
        },
        enableSorting: true,
      }),

      columnHelper.accessor("type", {
        header: ({ column }) => (
          <SortHeader
            label="Type"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ getValue }) => (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${getTypeColorClasses(getValue())}`}
          >
            {getValue()}
          </span>
        ),
        enableSorting: true,
      }),

      columnHelper.accessor("difficulty", {
        header: ({ column }) => (
          <SortHeader
            label="Level"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ getValue }) => {
          const d = getValue();
          const style =
            d === "beginner"
              ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-400"
              : d === "intermediate"
              ? "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400"
              : "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400";
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${style}`}
            >
              {d}
            </span>
          );
        },
        enableSorting: true,
      }),

      columnHelper.accessor("isPublished", {
        header: ({ column }) => (
          <SortHeader
            label="Status"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ getValue }) => {
          const live = getValue();
          return (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap ${
                live
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  live ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              {live ? "Live" : "Draft"}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (a, b) =>
          Number(a.original.isPublished) - Number(b.original.isPublished),
      }),

      columnHelper.accessor("likes", {
        header: ({ column }) => (
          <SortHeader
            label="Likes"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ getValue }) => (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground tabular-nums">
            <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            {getValue() || 0}
          </span>
        ),
        enableSorting: true,
      }),

      columnHelper.accessor("publishedAt", {
        header: ({ column }) => (
          <SortHeader
            label="Date"
            isSorted={column.getIsSorted()}
            toggle={column.getToggleSortingHandler()}
          />
        ),
        cell: ({ getValue, row }) => {
          const date = getValue() || row.original.createdAt;
          return (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"}
            </span>
          );
        },
        enableSorting: true,
        sortingFn: (a, b) => {
          const da = new Date(a.original.publishedAt || a.original.createdAt).getTime();
          const db = new Date(b.original.publishedAt || b.original.createdAt).getTime();
          return da - db;
        },
      }),

      columnHelper.display({
        id: "actions",
        header: () => (
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Actions
          </span>
        ),
        cell: ({ row }) => {
          const blog = row.original;
          const liPost = blog.linkedinPost;
          return (
            <div className="flex items-center gap-0.5">
              {blog.isPublished && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/blog/${blog.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-emerald-500"
                      onClick={() => handlePublishRow(blog._id)}
                    >
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
                    className={`h-8 w-8 p-0 transition-colors ${
                      !liPost
                        ? "text-muted-foreground hover:text-[#0077B5]"
                        : "text-[#0077B5] hover:text-[#005f8e]"
                    }`}
                    disabled={!blog.isPublished}
                    onClick={() => handleLinkedInRow(blog)}
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  {!blog.isPublished
                    ? "Publish post first"
                    : liPost
                    ? "Re-post to LinkedIn"
                    : "Post to LinkedIn"}
                </TooltipContent>
              </Tooltip>
              {liPost && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-[#0077B5] hover:text-red-500"
                      onClick={() => handleUnlinkLinkedIn(blog)}
                    >
                      <Unlink className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Delete LinkedIn post</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-[#FFB902]"
                    onClick={() => handleEditRow(blog)}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Edit post</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                    onClick={() => handleDeleteRow(blog)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Delete post</TooltipContent>
              </Tooltip>
            </div>
          );
        },
      }),
    ],
    [
      handlePublishRow,
      handleLinkedInRow,
      handleEditRow,
      handleDeleteRow,
      handleUnlinkLinkedIn,
      linkedInStatus?.connected,
    ]
  );

  const table = useReactTable({
    data: filteredBlogs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <BlogManagerSkeleton />;

  return (
    <BlogManagerCtx.Provider
      value={{
        state: {
          filteredBlogs,
          blogsArray,
          stats,
          linkedInStatus,
          table,
          viewMode,
          searchQuery,
          typeFilter,
          publishFilter,
          sorting,
          selectedBlog,
          linkedInBlog,
          unlinkBlog,
          isCreateOpen,
          isEditOpen,
          isDeleteOpen,
          isUnlinkOpen,
          createBlog,
          updateBlog,
          deleteBlog,
          deleteLinkedInPost,
          disconnectLinkedIn,
        },
        actions: {
          setViewMode,
          setSearchQuery,
          setTypeFilter,
          setPublishFilter,
          setSorting,
          setSelectedBlog,
          setLinkedInBlog,
          setUnlinkBlog,
          setIsCreateOpen,
          setIsEditOpen,
          setIsDeleteOpen,
          setIsUnlinkOpen,
          handlePublishRow,
          handleLinkedInRow,
          handleEditRow,
          handleDeleteRow,
          handleUnlinkLinkedIn,
          handleCreateSubmit,
          handleEditSubmit,
          handleDelete,
          handleUnlinkPost,
        },
      }}
    >
      {children}
    </BlogManagerCtx.Provider>
  );
}
