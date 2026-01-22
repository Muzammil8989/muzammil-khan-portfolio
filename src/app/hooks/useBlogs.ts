import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchBlogs,
  fetchBlogBySlug,
  searchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  publishBlog,
  likeBlog,
  fetchAllTags,
  fetchFeaturedBlogs,
  Blog,
} from "@/services/blog";
import { BlogInput } from "@/core/validation/blog";
import { toast } from "sonner";

/**
 * Fetch all blogs with optional filters
 */
export const useBlogs = (
  filters?: {
    status?: "draft" | "published" | "archived";
    tag?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  },
  options?: { initialData?: Blog[] }
) => {
  return useQuery<Blog[]>({
    queryKey: ["blogs", filters],
    queryFn: () => fetchBlogs(filters),
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch blog by slug
 */
export const useBlogBySlug = (slug: string) => {
  return useQuery<Blog | null>({
    queryKey: ["blog", slug],
    queryFn: () => fetchBlogBySlug(slug),
    enabled: !!slug,
  });
};

/**
 * Search blogs
 */
export const useSearchBlogs = (query: string) => {
  return useQuery<Blog[]>({
    queryKey: ["blogs", "search", query],
    queryFn: () => searchBlogs(query),
    enabled: query.length > 0,
  });
};

/**
 * Fetch all tags
 */
export const useBlogTags = () => {
  return useQuery<string[]>({
    queryKey: ["blogTags"],
    queryFn: fetchAllTags,
  });
};

/**
 * Fetch featured blogs
 */
export const useFeaturedBlogs = (limit?: number) => {
  return useQuery<Blog[]>({
    queryKey: ["blogs", "featured", limit],
    queryFn: () => fetchFeaturedBlogs(limit),
  });
};

/**
 * Create new blog mutation
 */
export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BlogInput) => {
      return await createBlog(data);
    },
    onSuccess: async () => {
      // Invalidate and refetch all blog queries immediately
      await queryClient.invalidateQueries({
        queryKey: ["blogs"],
        refetchType: "active"
      });
      toast.success("Blog created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to create blog");
    },
  });
};

/**
 * Update blog mutation
 */
export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blog: Partial<Blog> & { _id: string }) => {
      return await updateBlog(blog);
    },
    onSuccess: async (data) => {
      // Invalidate and refetch all blog queries immediately
      await queryClient.invalidateQueries({
        queryKey: ["blogs"],
        refetchType: "active"
      });
      await queryClient.invalidateQueries({
        queryKey: ["blog", data.slug],
        refetchType: "active"
      });
      toast.success("Blog updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to update blog");
    },
  });
};

/**
 * Delete blog mutation
 */
export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteBlog(id);
      return id;
    },
    onSuccess: async () => {
      // Invalidate and refetch all blog queries immediately
      await queryClient.invalidateQueries({
        queryKey: ["blogs"],
        refetchType: "active"
      });
      toast.success("Blog deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to delete blog");
    },
  });
};

/**
 * Publish blog mutation
 */
export const usePublishBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await publishBlog(id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", data.slug] });
      toast.success("Blog published successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to publish blog");
    },
  });
};

/**
 * Like blog mutation
 */
export const useLikeBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await likeBlog(id);
    },
    onSuccess: (data) => {
      // Invalidate both lists and detail
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      queryClient.invalidateQueries({ queryKey: ["blog", data.slug] });
      toast.success("Blog liked!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error?.message || "Failed to like blog");
    },
  });
};
