import axios from "axios";
import { BlogInput, CodeBlock, BlogSeo } from "@/core/validation/blog";

const API_URL = "/api/blogs";

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  codeBlocks?: CodeBlock[];
  languages?: string[];
  frameworks?: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  author: string;
  tags: string[];
  seo?: BlogSeo;
  type: "Article" | "Case Study" | "Tutorial" | "Deep Dive" | "Quick Tip" | "Guide";
  isPublished: boolean;
  publishedAt?: string;
  likes: number;
  likedBy?: string[];
  isLiked?: boolean;
  readingTime?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all blogs with optional filters
 */
export const fetchBlogs = async (filters?: {
  isPublished?: boolean;
  type?: "Article" | "Case Study" | "Tutorial" | "Deep Dive" | "Quick Tip" | "Guide";
  tag?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}): Promise<Blog[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());
    if (filters?.type) params.append("type", filters.type);
    if (filters?.tag) params.append("tag", filters.tag);
    if (filters?.difficulty) params.append("difficulty", filters.difficulty);

    const url = params.toString() ? `${API_URL}?${params}` : API_URL;
    const res = await axios.get(url);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    if (axios.isAxiosError(error)) {
      console.error("Response error:", error.response?.data);
    }
    return [];
  }
};

/**
 * Fetch blog by slug
 */
export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
  try {
    const res = await axios.get(`${API_URL}?slug=${slug}`);
    return res.data?.data || null;
  } catch (error) {
    console.error("Error fetching blog by slug:", error);
    return null;
  }
};

/**
 * Search blogs
 */
export const searchBlogs = async (query: string): Promise<Blog[]> => {
  try {
    const res = await axios.get(`${API_URL}?search=${encodeURIComponent(query)}`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error searching blogs:", error);
    return [];
  }
};

/**
 * Create new blog
 */
export const createBlog = async (data: BlogInput): Promise<Blog> => {
  const res = await axios.post(API_URL, data);
  return res.data?.data || res.data;
};

/**
 * Update blog
 */
export const updateBlog = async (blog: Partial<Blog> & { _id: string }): Promise<Blog> => {
  const { _id, ...rest } = blog;
  const res = await axios.put(`${API_URL}?id=${_id}`, rest);
  return res.data?.data || res.data;
};

/**
 * Delete blog
 */
export const deleteBlog = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}?id=${id}`);
};

/**
 * Publish blog
 */
export const publishBlog = async (id: string): Promise<Blog> => {
  const res = await axios.post(`${API_URL}/publish?id=${id}`);
  return res.data?.data || res.data;
};

/**
 * Get all unique tags
 */
export const fetchAllTags = async (): Promise<string[]> => {
  try {
    const res = await axios.get(`${API_URL}/tags`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching tags:", error);
    return [];
  }
};

/**
 * Get featured blogs
 */
export const fetchFeaturedBlogs = async (limit: number = 3): Promise<Blog[]> => {
  try {
    const res = await axios.get(`${API_URL}/featured?limit=${limit}`);
    return res.data?.data || [];
  } catch (error) {
    console.error("Error fetching featured blogs:", error);
    return [];
  }
};
/**
 * Like a blog post
 */
export const likeBlog = async (id: string): Promise<Blog> => {
  const res = await axios.post(`${API_URL}/${id}/like`);
  return res.data?.data || res.data;
};
