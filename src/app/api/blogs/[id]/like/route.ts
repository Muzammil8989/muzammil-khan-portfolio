import { NextRequest } from "next/server";
import { apiWrapper } from "@/lib/api-utils";
import { BlogService } from "@/services/blog-service";

export async function POST(
  request: NextRequest,
  context: any
) {
  return apiWrapper(async () => {
    const { id } = await context.params;
    
    // Get user IP for tracking
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : request.nextUrl.hostname || "anonymous";

    const blog = await BlogService.incrementLikes(id, ip);
    return blog;
  });
}
