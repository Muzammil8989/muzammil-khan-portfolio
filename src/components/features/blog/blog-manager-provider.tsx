"use client";

import { useMemo, useCallback, useRef, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Heart,
  CheckCircle2,
  Circle,
  FileText,
  Linkedin,
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
import { BlogManagerCtx, type ViewMode, type StatItem } from "./blog-manager-context";
import { BlogManagerSkeleton } from "./blog-manager-skeleton";

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

  if (isLoading) return <BlogManagerSkeleton />;

  return (
    <BlogManagerCtx.Provider
      value={{
        state: {
          filteredBlogs,
          blogsArray,
          stats,
          linkedInStatus,
          viewMode,
          searchQuery,
          typeFilter,
          publishFilter,
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
