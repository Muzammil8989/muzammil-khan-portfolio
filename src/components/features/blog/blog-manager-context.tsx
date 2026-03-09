"use client";

import { createContext, use } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Blog } from "@/services/blog";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "table";

export interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export interface BlogManagerState {
  filteredBlogs: Blog[];
  blogsArray: Blog[];
  stats: StatItem[];
  linkedInStatus: { connected: boolean; name?: string } | undefined;
  viewMode: ViewMode;
  searchQuery: string;
  typeFilter: "all" | Blog["type"];
  publishFilter: "all" | "published" | "draft";
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

export interface BlogManagerActions {
  setViewMode: (v: ViewMode) => void;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  setTypeFilter: (t: "all" | Blog["type"]) => void;
  setPublishFilter: (p: "all" | "published" | "draft") => void;
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

// ─── Context ──────────────────────────────────────────────────────────────────

export const BlogManagerCtx = createContext<{
  state: BlogManagerState;
  actions: BlogManagerActions;
} | null>(null);

export function useBlogManager() {
  const ctx = use(BlogManagerCtx);
  if (!ctx) throw new Error("useBlogManager must be inside BlogManagerProvider");
  return ctx;
}
