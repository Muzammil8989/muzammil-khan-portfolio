import { prisma, toMongoDoc } from "@/lib/prisma";
import { BlogInput } from "@/core/validation/blog";
import { AppError } from "@/core/errors/AppError";
import { calculateReadingTime, generateSlug } from "@/lib/blog-utils";
import { Prisma } from "@prisma/client";

// Re-export for backwards compatibility
export { generateSlug };

export class BlogService {
  /**
   * Get all blogs with optional filtering
   */
  static async getAll(filters?: {
    type?: string;
    isPublished?: boolean;
    tag?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  }) {
    const where: Prisma.BlogWhereInput = {};

    if (filters?.type) where.type = filters.type;
    if (filters?.isPublished !== undefined) where.isPublished = filters.isPublished;
    if (filters?.tag) where.tags = { has: filters.tag };
    if (filters?.difficulty) where.difficulty = filters.difficulty;

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return blogs.map(toMongoDoc);
  }

  /**
   * Get blog by slug (published only)
   */
  static async getBySlug(slug: string) {
    const blog = await prisma.blog.findUnique({
      where: { slug, isPublished: true },
    });

    if (!blog) {
      throw new AppError("NOT_FOUND", "Blog post not found", 404);
    }

    return toMongoDoc(blog);
  }

  /**
   * Get blog by ID
   */
  static async getById(id: string) {
    const blog = await prisma.blog.findUnique({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2023") {
        throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
      }
      throw e;
    });

    if (!blog) {
      throw new AppError("NOT_FOUND", "Blog post not found", 404);
    }

    return toMongoDoc(blog);
  }

  /**
   * Search blogs by title, content, or tags (regex, case-insensitive via findRaw)
   */
  static async search(query: string) {
    // Escape regex special characters to prevent ReDoS attacks
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const raw = await prisma.blog.findRaw({
      filter: {
        $or: [
          { title: { $regex: safeQuery, $options: "i" } },
          { content: { $regex: safeQuery, $options: "i" } },
          { tags: { $elemMatch: { $regex: safeQuery, $options: "i" } } },
        ],
        isPublished: true,
      },
      options: { sort: { publishedAt: -1 }, limit: 50 },
    });

    return (raw as unknown as any[]).map((doc) => ({
      ...doc,
      _id: (doc._id as any)?.$oid ?? doc._id,
    }));
  }

  /**
   * Create new blog post
   */
  static async create(data: BlogInput) {
    const existing = await prisma.blog.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new AppError("BAD_REQUEST", "A blog with this slug already exists", 400);
    }

    const now = new Date().toISOString();
    const readingTime = calculateReadingTime(data.content);

    const blog = await prisma.blog.create({
      data: {
        ...data,
        readingTime,
        createdAt: now,
        updatedAt: now,
        likes: 0,
        version: 1,
        likedBy: [],
      },
    });

    return toMongoDoc(blog);
  }

  /**
   * Update existing blog post
   */
  static async update(id: string, data: Partial<BlogInput>) {
    const updateData: Record<string, unknown> = { ...data };

    if (data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }
    updateData.updatedAt = new Date().toISOString();

    const blog = await prisma.blog
      .update({
        where: { id },
        data: {
          ...(updateData as Prisma.BlogUpdateInput),
          version: { increment: 1 },
        },
      })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Blog post not found", 404);
        }
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
        }
        throw e;
      });

    return toMongoDoc(blog);
  }

  /**
   * Delete blog post
   */
  static async delete(id: string) {
    await prisma.blog.delete({ where: { id } }).catch((e: any) => {
      if (e?.code === "P2025") {
        throw new AppError("NOT_FOUND", "Blog post not found", 404);
      }
      if (e?.code === "P2023") {
        throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
      }
      throw e;
    });

    return { success: true };
  }

  /**
   * Publish a draft blog
   */
  static async publish(id: string) {
    const blog = await prisma.blog
      .update({
        where: { id },
        data: {
          isPublished: true,
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: { increment: 1 },
        },
      })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Blog post not found", 404);
        }
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
        }
        throw e;
      });

    return toMongoDoc(blog);
  }

  /**
   * Increment likes with IP-based deduplication
   */
  static async incrementLikes(id: string, userIdentifier: string) {
    const alreadyLiked = await prisma.blog
      .findFirst({ where: { id, likedBy: { has: userIdentifier } } })
      .catch((e: any) => {
        if (e?.code === "P2023") {
          throw new AppError("BAD_REQUEST", "Invalid blog ID format", 400);
        }
        throw e;
      });

    if (alreadyLiked) {
      throw new AppError("BAD_REQUEST", "You have already liked this blog", 400);
    }

    const blog = await prisma.blog
      .update({
        where: { id },
        data: {
          likes: { increment: 1 },
          likedBy: { push: userIdentifier },
        },
      })
      .catch((e: any) => {
        if (e?.code === "P2025") {
          throw new AppError("NOT_FOUND", "Blog post not found", 404);
        }
        throw e;
      });

    return toMongoDoc(blog);
  }

  /**
   * Get all unique tags from published blogs
   */
  static async getAllTags(): Promise<string[]> {
    const result = await prisma.$runCommandRaw({
      distinct: "blogs",
      key: "tags",
      query: { isPublished: true },
    });

    return ((result as any).values ?? []) as string[];
  }

  /**
   * Get featured blogs (most liked)
   */
  static async getFeatured(limit = 3) {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ likes: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    return blogs.map(toMongoDoc);
  }
}
