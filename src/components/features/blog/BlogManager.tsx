"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogCard } from "./blog-card";
import { BlogForm } from "./blog-form";
import { Blog } from "@/services/blog";
import {
  useBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  useSearchBlogs,
} from "@/app/hooks/useBlogs";

export function BlogManager() {
  // State management
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "Article" | "Case Study" | "Tutorial" | "Deep Dive" | "Quick Tip" | "Guide">("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "draft">("all");

  // Query hooks
  const { data: allBlogs = [], isLoading, refetch } = useBlogs();
  const { data: searchResults = [] } = useSearchBlogs(searchQuery);

  // Mutation hooks
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  // Helper functions
  const resetForm = () => {
    setSelectedBlog(null);
  };

  // Ensure data is always an array
  const blogsArray = Array.isArray(allBlogs) ? allBlogs : [];
  const searchResultsArray = Array.isArray(searchResults) ? searchResults : [];

  // Filter blogs by type and publish status
  const filteredBlogs = searchQuery
    ? searchResultsArray
    : blogsArray.filter((blog) => {
        const matchesType = typeFilter === "all" || blog.type === typeFilter;
        const matchesPublish = publishFilter === "all" ||
          (publishFilter === "published" && blog.isPublished) ||
          (publishFilter === "draft" && !blog.isPublished);
        return matchesType && matchesPublish;
      });

  // Handlers
  const handleCreateSubmit = (data: any) => {
    createBlog.mutate(
      { ...data },
      {
        onSuccess: async () => {
          // Wait for the refetch to complete before closing dialog
          await refetch();
          setIsCreateDialogOpen(false);
          resetForm();
          // Reset filters and search to ensure newly created blog is visible
          setTypeFilter("all");
          setPublishFilter("all");
          setSearchQuery("");
        },
      }
    );
  };

  const handleEditSubmit = (data: any) => {
    if (!selectedBlog) return;

    updateBlog.mutate(
      {
        ...selectedBlog,
        ...data,
      },
      {
        onSuccess: async () => {
          // Wait for the refetch to complete before closing dialog
          await refetch();
          setIsEditDialogOpen(false);
          resetForm();
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedBlog) return;

    deleteBlog.mutate(selectedBlog._id, {
      onSuccess: async () => {
        // Wait for the refetch to complete before closing dialog
        await refetch();
        setIsDeleteDialogOpen(false);
        resetForm();
      },
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Blog Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your programming blog posts
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-300">
              <Plus className="mr-2 h-4 w-4" />
              Create Blog Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={typeFilter}
          onValueChange={(value: any) => setTypeFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
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
          onValueChange={(value: any) => setPublishFilter(value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-sm text-muted-foreground">Total Blogs</p>
          <p className="text-2xl font-bold">{blogsArray.length}</p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-sm text-muted-foreground">Published</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {blogsArray.filter((b) => b.isPublished).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-sm text-muted-foreground">Drafts</p>
          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
            {blogsArray.filter((b) => !b.isPublished).length}
          </p>
        </div>
        <div className="glass-card p-4 rounded-xl border border-slate-200 dark:border-white/10">
          <p className="text-sm text-muted-foreground">Total Likes</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {blogsArray.reduce((acc, b) => acc + (b.likes || 0), 0)}
          </p>
        </div>
      </div>

      {/* Blog List */}
      {filteredBlogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              onEdit={(b) => {
                setSelectedBlog(b);
                setIsEditDialogOpen(true);
              }}
              onDelete={(b) => {
                setSelectedBlog(b);
                setIsDeleteDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-xl border border-slate-200 dark:border-white/10">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {searchQuery
              ? "No blogs found"
              : typeFilter !== "all" || publishFilter !== "all"
                ? `No ${publishFilter !== "all" ? publishFilter : ""} ${typeFilter !== "all" ? typeFilter : ""} blogs`.trim()
                : "No blog posts yet"}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? "Try searching with different keywords"
              : "Get started by creating your first blog post"}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Blog
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog
              post "{selectedBlog?.title}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteBlog.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteBlog.isPending ? "Deleting..." : "Delete Blog"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
