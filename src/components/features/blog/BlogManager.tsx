"use client";

import {
  createContext,
  use,
  useMemo,
  useCallback,
  useRef,
  useState,
  Suspense,
} from "react";
import type { Dispatch, SetStateAction } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type Table,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Plus,
  Search,
  FileText,
  Linkedin,
  Unlink,
  Edit,
  Trash2,
  Heart,
  Clock,
  CheckCircle2,
  Circle,
  Filter,
  LayoutGrid,
  List,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "./blog-card";
import { BlogForm } from "./blog-form";
import { LinkedInPostDialog } from "./LinkedInPostDialog";
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

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ViewMode = "grid" | "table";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

// ─────────────────────────────────────────────
// Context — state / actions (Vercel composition pattern)
// ─────────────────────────────────────────────
interface BlogManagerState {
  filteredBlogs: Blog[];
  blogsArray: Blog[];
  stats: StatItem[];
  linkedInStatus: { connected: boolean; name?: string } | undefined;
  table: Table<Blog>;
  viewMode: ViewMode;
  searchQuery: string;
  typeFilter: "all" | Blog["type"];
  publishFilter: "all" | "published" | "draft";
  sorting: SortingState;
  selectedBlog: Blog | null;
  linkedInBlog: Blog | null;
  unlinkBlog: Blog | null;
  isCreateOpen: boolean;
  isEditOpen: boolean;
  isDeleteOpen: boolean;
  isUnlinkOpen: boolean;
  createBlog: { isPending: boolean };
  updateBlog: { isPending: boolean };
  deleteBlog: { isPending: boolean };
  deleteLinkedInPost: { isPending: boolean };
  disconnectLinkedIn: { mutate: () => void; isPending: boolean };
}

interface BlogManagerActions {
  setViewMode: (v: ViewMode) => void;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setTypeFilter: (t: "all" | Blog["type"]) => void;
  setPublishFilter: (p: "all" | "published" | "draft") => void;
  setSorting: Dispatch<SetStateAction<SortingState>>;
  setSelectedBlog: (b: Blog | null) => void;
  setLinkedInBlog: (b: Blog | null) => void;
  setUnlinkBlog: (b: Blog | null) => void;
  setIsCreateOpen: (o: boolean) => void;
  setIsEditOpen: (o: boolean) => void;
  setIsDeleteOpen: (o: boolean) => void;
  setIsUnlinkOpen: (o: boolean) => void;
  handlePublishRow: (id: string) => void;
  handleLinkedInRow: (b: Blog) => void;
  handleEditRow: (b: Blog) => void;
  handleDeleteRow: (b: Blog) => void;
  handleUnlinkLinkedIn: (b: Blog) => void;
  handleCreateSubmit: (data: any) => void;
  handleEditSubmit: (data: any) => void;
  handleDelete: () => void;
  handleUnlinkPost: () => void;
}

const BlogManagerCtx = createContext<{
  state: BlogManagerState;
  actions: BlogManagerActions;
} | null>(null);

function useBlogManager() {
  const ctx = use(BlogManagerCtx);
  if (!ctx) throw new Error("useBlogManager must be inside BlogManagerProvider");
  return ctx;
}

// ─────────────────────────────────────────────
// Module-level column helper (stable reference)
// ─────────────────────────────────────────────
const columnHelper = createColumnHelper<Blog>();

// ─────────────────────────────────────────────
// Sortable column header
// ─────────────────────────────────────────────
function SortHeader({
  label,
  isSorted,
  toggle,
}: {
  label: string;
  isSorted: false | "asc" | "desc";
  toggle: ((e: unknown) => void) | undefined;
}) {
  return (
    <button
      className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors group"
      onClick={toggle}
    >
      {label}
      {isSorted === "asc" ? (
        <ArrowUp className="h-3 w-3 text-foreground" />
      ) : isSorted === "desc" ? (
        <ArrowDown className="h-3 w-3 text-foreground" />
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity" />
      )}
    </button>
  );
}

// ─────────────────────────────────────────────
// Skeleton (loading + Suspense fallback)
// ─────────────────────────────────────────────
function BlogManagerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Provider — all state, mutations, derived values
// typeFilter / publishFilter / viewMode are URL-backed (persist on refresh)
// searchQuery is local (transient, no need to persist)
// ─────────────────────────────────────────────
function BlogManagerProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // ── URL-backed filter / view state ──────────
  const typeFilter = (searchParams.get("type") ?? "all") as
    | "all"
    | Blog["type"];
  const publishFilter = (searchParams.get("status") ?? "all") as
    | "all"
    | "published"
    | "draft";
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

  const setViewMode = useCallback(
    (v: ViewMode) => updateParam("view", v),
    [updateParam]
  );
  const setTypeFilter = useCallback(
    (t: string) => updateParam("type", t),
    [updateParam]
  );
  const setPublishFilter = useCallback(
    (p: string) => updateParam("status", p),
    [updateParam]
  );

  // ── Local state ──────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [linkedInBlog, setLinkedInBlog] = useState<Blog | null>(null);
  const [unlinkBlog, setUnlinkBlog] = useState<Blog | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUnlinkOpen, setIsUnlinkOpen] = useState(false);

  // ── Data hooks ───────────────────────────────
  const { data: allBlogs, isLoading } = useBlogs();
  const { data: searchResults } = useSearchBlogs(searchQuery);
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();
  const publishBlog = usePublishBlog();
  const { data: linkedInStatus } = useLinkedInStatus();
  const disconnectLinkedIn = useLinkedInDisconnect();
  const deleteLinkedInPost = useLinkedInDeletePost();

  // Stable ref prevents column recreation when mutation state changes
  const publishMutateRef = useRef(publishBlog.mutate);
  publishMutateRef.current = publishBlog.mutate;

  // ── Derived data ─────────────────────────────
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

  // ── Stable action callbacks ──────────────────
  const handlePublishRow = useCallback((id: string) => {
    publishMutateRef.current(id);
  }, []);

  const handleLinkedInRow = useCallback(
    (blog: Blog) => setLinkedInBlog(blog),
    []
  );
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

  // ── Table columns ────────────────────────────
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
                  <span
                    key={tag}
                    className="text-blue-500/60 hidden sm:inline"
                  >
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
          const da = new Date(
            a.original.publishedAt || a.original.createdAt
          ).getTime();
          const db = new Date(
            b.original.publishedAt || b.original.createdAt
          ).getTime();
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
                  <TooltipContent side="top">
                    Delete LinkedIn post
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-500"
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

// ─────────────────────────────────────────────
// Sub-components — each uses context via use() (React 19)
// ─────────────────────────────────────────────

function BlogManagerHeader() {
  const {
    state: { blogsArray, viewMode, isCreateOpen, createBlog },
    actions: { setViewMode, setIsCreateOpen, handleCreateSubmit },
  } = useBlogManager();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Blog Manager</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {blogsArray.length} total ·{" "}
          {blogsArray.filter((b) => b.isPublished).length} published
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-1">
          <button
            aria-label="Table view"
            onClick={() => setViewMode("table")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "table"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            aria-label="Grid view"
            onClick={() => setViewMode("grid")}
            className={`rounded-md p-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new blog post
              </DialogDescription>
            </DialogHeader>
            <BlogForm
              onSubmit={handleCreateSubmit}
              isSubmitting={createBlog.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function BlogManagerStats() {
  const {
    state: { stats },
  } = useBlogManager();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm"
        >
          <div className={`rounded-lg p-2 shrink-0 ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
              className={`text-xl font-bold leading-none mt-0.5 tabular-nums ${color}`}
            >
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogManagerLinkedIn() {
  const {
    state: { linkedInStatus, disconnectLinkedIn },
  } = useBlogManager();

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-xl border px-5 py-4 shadow-sm transition-colors ${
        linkedInStatus?.connected
          ? "border-[#0077B5]/30 bg-[#0077B5]/5"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`rounded-xl p-2.5 ${
            linkedInStatus?.connected ? "bg-[#0077B5]" : "bg-muted"
          }`}
        >
          <Linkedin
            className={`h-5 w-5 ${
              linkedInStatus?.connected
                ? "text-white"
                : "text-muted-foreground"
            }`}
          />
        </div>
        <div>
          {linkedInStatus?.connected ? (
            <>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">LinkedIn Connected</p>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Posting as{" "}
                <span className="text-[#0077B5] font-medium">
                  {linkedInStatus.name}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold">Connect LinkedIn</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Publish blog posts directly to your LinkedIn audience
              </p>
            </>
          )}
        </div>
      </div>

      {linkedInStatus?.connected ? (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
          onClick={() => disconnectLinkedIn.mutate()}
          disabled={disconnectLinkedIn.isPending}
        >
          <Unlink className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      ) : (
        <Button
          size="sm"
          className="gap-2 bg-[#0077B5] hover:bg-[#006097] text-white shrink-0 shadow-sm"
          onClick={() => (window.location.href = "/api/linkedin/auth")}
        >
          <Linkedin className="h-3.5 w-3.5" />
          Connect
        </Button>
      )}
    </div>
  );
}

function BlogManagerFilters() {
  const {
    state: {
      searchQuery,
      typeFilter,
      publishFilter,
      filteredBlogs,
      blogsArray,
    },
    actions: { setSearchQuery, setTypeFilter, setPublishFilter },
  } = useBlogManager();

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by title, tags, content…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v: any) => setTypeFilter(v)}
          >
            <SelectTrigger className="w-40 bg-card">
              <Filter className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
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

          <Select
            value={publishFilter}
            onValueChange={(v: any) => setPublishFilter(v)}
          >
            <SelectTrigger className="w-36 bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(searchQuery || typeFilter !== "all" || publishFilter !== "all") && (
        <p className="text-xs text-muted-foreground -mt-2">
          Showing {filteredBlogs.length} of {blogsArray.length} posts
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      )}
    </>
  );
}

function BlogManagerTable() {
  const {
    state: { table, sorting },
    actions: { setSorting },
  } = useBlogManager();

  const parentRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 65,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm flex flex-col flex-1 min-h-0">
      <div
        ref={parentRef}
        className="flex-1 min-h-0 overflow-y-scroll"
        style={{ willChange: "transform" }}
      >
        <TableUI>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="bg-muted/40 hover:bg-muted/40 border-b border-border sticky top-0 z-10"
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-4 first:pl-5 last:pr-5"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {paddingTop > 0 && (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  style={{ height: paddingTop }}
                />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3.5 first:pl-5 last:pr-5"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  style={{ height: paddingBottom }}
                />
              </tr>
            )}
          </TableBody>
        </TableUI>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span>
          {rows.length} row{rows.length !== 1 ? "s" : ""}
        </span>
        {sorting.length > 0 && (
          <button
            onClick={() => setSorting([])}
            className="hover:text-foreground transition-colors"
          >
            Clear sort
          </button>
        )}
      </div>
    </div>
  );
}

function BlogManagerGrid() {
  const {
    state: { filteredBlogs, linkedInStatus },
    actions: {
      setSelectedBlog,
      setIsEditOpen,
      setIsDeleteOpen,
      setLinkedInBlog,
    },
  } = useBlogManager();

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <BlogCard
            key={blog._id}
            blog={blog}
            onEdit={(b) => {
              setSelectedBlog(b);
              setIsEditOpen(true);
            }}
            onDelete={(b) => {
              setSelectedBlog(b);
              setIsDeleteOpen(true);
            }}
            onLinkedIn={
              linkedInStatus?.connected && blog.isPublished
                ? (b) => setLinkedInBlog(b)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

function BlogManagerEmpty() {
  const {
    state: { searchQuery },
    actions: { setIsCreateOpen },
  } = useBlogManager();

  return (
    <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-border bg-muted/10 text-center">
      <div className="rounded-2xl bg-muted p-5 mb-5">
        <FileText className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">
        {searchQuery ? "No results found" : "No blog posts yet"}
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        {searchQuery
          ? "Try different keywords or clear the filters"
          : "Create your first post to get started"}
      </p>
      {!searchQuery && (
        <Button
          className="mt-5 gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Create First Post
        </Button>
      )}
    </div>
  );
}

function BlogManagerContent() {
  const {
    state: { filteredBlogs, viewMode },
  } = useBlogManager();

  if (filteredBlogs.length === 0) return <BlogManagerEmpty />;
  return viewMode === "table" ? <BlogManagerTable /> : <BlogManagerGrid />;
}

function BlogManagerDialogs() {
  const {
    state: {
      selectedBlog,
      linkedInBlog,
      unlinkBlog,
      isEditOpen,
      isDeleteOpen,
      isUnlinkOpen,
      updateBlog,
      deleteBlog,
      deleteLinkedInPost,
    },
    actions: {
      setIsEditOpen,
      setIsDeleteOpen,
      setIsUnlinkOpen,
      setLinkedInBlog,
      handleEditSubmit,
      handleDelete,
      handleUnlinkPost,
    },
  } = useBlogManager();

  return (
    <>
      {/* Edit */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to your blog post
            </DialogDescription>
          </DialogHeader>
          {selectedBlog && (
            <BlogForm
              blog={selectedBlog}
              onSubmit={handleEditSubmit}
              isSubmitting={updateBlog.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                "{selectedBlog?.title}"
              </span>
              . This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBlog.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBlog.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlink LinkedIn */}
      <AlertDialog open={isUnlinkOpen} onOpenChange={setIsUnlinkOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete LinkedIn post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the LinkedIn post for{" "}
              <span className="font-semibold text-foreground">
                "{unlinkBlog?.title}"
              </span>
              . The blog will remain on your portfolio but the post will be
              removed from LinkedIn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlinkPost}
              disabled={deleteLinkedInPost.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLinkedInPost.isPending
                ? "Deleting…"
                : "Delete from LinkedIn"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* LinkedIn post dialog */}
      {linkedInBlog && (
        <LinkedInPostDialog
          blog={linkedInBlog}
          open={!!linkedInBlog}
          onOpenChange={(open) => {
            if (!open) setLinkedInBlog(null);
          }}
        />
      )}
    </>
  );
}

// ─────────────────────────────────────────────
// Main export
// Suspense wraps provider so useSearchParams is safe in Next.js App Router
// ─────────────────────────────────────────────
export function BlogManager() {
  return (
    <Suspense fallback={<BlogManagerSkeleton />}>
      <BlogManagerProvider>
        <div className="flex flex-col flex-1 min-h-0 gap-6">
          <BlogManagerHeader />
          <BlogManagerStats />
          <BlogManagerLinkedIn />
          <BlogManagerFilters />
          <div className="flex-1 min-h-0 flex flex-col">
            <BlogManagerContent />
          </div>
          <BlogManagerDialogs />
        </div>
      </BlogManagerProvider>
    </Suspense>
  );
}
