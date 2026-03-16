import { NextRequest } from "next/server";
import { BlogService } from "@/services/blog-service";
import { BlogSchema } from "@/core/validation/blog";
import { apiWrapper } from "@/lib/api-utils";
import { AppError } from "@/core/errors/AppError";
import { getToken } from "next-auth/jwt";

/**
 * GET /api/blogs - Get all blogs with optional filters
 * Query params: type, isPublished, tag, difficulty, search, slug
 */
export async function GET(request: NextRequest) {
  return apiWrapper(async () => {
    const { searchParams } = new URL(request.url);

    const slug = searchParams.get("slug");
    const search = searchParams.get("search");
    const type = searchParams.get("type") as "Article" | "Case Study" | "Tutorial" | "Deep Dive" | "Quick Tip" | "Guide" | null;
    const isPublishedParam = searchParams.get("isPublished");
    const isPublished = isPublishedParam === "true" ? true : isPublishedParam === "false" ? false : undefined;
    const tag = searchParams.get("tag");
    const difficulty = searchParams.get("difficulty") as "beginner" | "intermediate" | "advanced" | null;

    // Get user IP for tracking
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.nextUrl.hostname || "anonymous";

    const transformBlog = (blog: any) => ({
      ...blog,
      isLiked: blog.likedBy?.includes(ip) || false,
      // Don't leak all IPs to the client
      likedBy: undefined,
    });

    // Get blog by slug
    if (slug) {
      const blog = await BlogService.getBySlug(slug);
      return transformBlog(blog);
    }

    // Search blogs (max query length + capped results)
    if (search) {
      if (search.length > 100) {
        throw new AppError("BAD_REQUEST", "Search query too long", 400);
      }
      const blogs = await BlogService.search(search);
      return blogs.slice(0, 50).map(transformBlog);
    }

    // Get all blogs with filters
    const filters: any = {};
    if (type) filters.type = type;
    if (isPublished !== undefined) filters.isPublished = isPublished;
    if (tag) filters.tag = tag;
    if (difficulty) filters.difficulty = difficulty;

    const blogs = await BlogService.getAll(filters);
    return blogs.map(transformBlog);
  });
}

/**
 * POST /api/blogs - Create a new blog post (Protected)
 */
export async function POST(request: NextRequest) {
  return apiWrapper(async () => {
    // Check authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to create blog posts",
        401
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = BlogSchema.parse(body);

    // Create blog, track who created it
    const createdBy = (token.email || token.name || token.sub || "unknown") as string;
    const blog = await BlogService.create(validatedData, createdBy);

    return blog;
  }, 201);
}

/**
 * PUT /api/blogs - Update a blog post (Protected)
 * Query params: id (required)
 */
export async function PUT(request: NextRequest) {
  return apiWrapper(async () => {
    // Check authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to update blog posts",
        401
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new AppError(
        "BAD_REQUEST",
        "Blog ID is required",
        400
      );
    }

    const body = await request.json();

    // Strip invalid enum values — null, undefined, or unrecognised strings from old DB docs
    const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];
    const VALID_TYPES = ["Article", "Case Study", "Tutorial", "Deep Dive", "Quick Tip", "Guide"];
    if (!VALID_DIFFICULTIES.includes(body.difficulty)) delete body.difficulty;
    if (!VALID_TYPES.includes(body.type)) delete body.type;

    // Validate partial data
    const validatedData = BlogSchema.partial().parse(body);

    // Update blog
    const blog = await BlogService.update(id, validatedData);

    return blog;
  });
}

/**
 * DELETE /api/blogs - Delete a blog post (Protected)
 * Query params: id (required)
 */
export async function DELETE(request: NextRequest) {
  return apiWrapper(async () => {
    // Check authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to delete blog posts",
        401
      );
    }

    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      throw new AppError(
        "BAD_REQUEST",
        "Blog ID is required",
        400
      );
    }

    // Delete blog
    await BlogService.delete(id);

    return { message: "Blog post deleted successfully" };
  });
}
