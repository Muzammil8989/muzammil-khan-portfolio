import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog-service";
import { apiWrapper } from "@/lib/api-utils";
import { AppError } from "@/core/errors/AppError";
import { getToken } from "next-auth/jwt";

/**
 * POST /api/blogs/publish - Publish a draft blog (Protected)
 * Query params: id (required)
 */
export async function POST(request: NextRequest) {
  return apiWrapper(async () => {
    // Check authentication
    const token = await getToken({ req: request as any });
    if (!token) {
      throw new AppError(
        "UNAUTHORIZED",
        "You must be logged in to publish blog posts",
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

    // Publish blog
    const blog = await BlogService.publish(id);

    return NextResponse.json({
      success: true,
      data: blog,
      message: "Blog published successfully",
    });
  });
}
