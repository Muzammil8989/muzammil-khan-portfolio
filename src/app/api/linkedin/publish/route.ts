import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import {
  getLinkedInToken,
  isTokenValid,
  uploadImagesToLinkedIn,
  publishLinkedInPost,
} from "@/services/linkedin";

/**
 * POST /api/linkedin/publish
 * Publishes a blog post to LinkedIn with optional multiple images.
 *
 * Body: multipart/form-data
 *   - blogId: string
 *   - postText: string
 *   - images: File[] (optional, up to 9)
 */
export async function POST(request: NextRequest) {
  // Auth check
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Parse form data
    const formData = await request.formData();
    const blogId = formData.get("blogId") as string;
    const postText = formData.get("postText") as string;
    const imageFiles = formData.getAll("images") as File[];

    if (!blogId || !postText) {
      return NextResponse.json(
        { success: false, error: "blogId and postText are required" },
        { status: 400 },
      );
    }

    if (imageFiles.length > 9) {
      return NextResponse.json(
        { success: false, error: "Maximum 9 images allowed" },
        { status: 400 },
      );
    }

    // Get LinkedIn token
    const linkedInToken = await getLinkedInToken(token.id as string);
    if (!linkedInToken || !isTokenValid(linkedInToken)) {
      return NextResponse.json(
        { success: false, error: "LinkedIn not connected or token expired" },
        { status: 401 },
      );
    }

    // Get blog from database
    const blog = await prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    // Build blog URL
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const blogUrl = `${siteUrl}/blog/${blog.slug}`;

    // Upload images to LinkedIn (if any)
    let assetUrns: string[] = [];
    if (imageFiles.length > 0) {
      const imageBuffers = await Promise.all(
        imageFiles.map(async (file) => ({
          buffer: Buffer.from(await file.arrayBuffer()),
          mimeType: file.type || "image/jpeg",
        })),
      );
      assetUrns = await uploadImagesToLinkedIn(
        linkedInToken.accessToken,
        linkedInToken.personId,
        imageBuffers,
      );
    }

    // Publish post to LinkedIn
    const result = await publishLinkedInPost(
      linkedInToken.accessToken,
      linkedInToken.personId,
      postText,
      blogUrl,
      blog.title,
      blog.excerpt || "",
      assetUrns,
    );

    // Save LinkedIn post info back to the blog document
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        linkedinPost: {
          set: {
            postId: result.postId,
            postUrl: result.postUrl,
            postedAt: new Date().toISOString(),
            imageCount: imageFiles.length,
          },
        },
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        postId: result.postId,
        postUrl: result.postUrl,
        blogUrl,
        imageCount: imageFiles.length,
      },
    });
  } catch (err: any) {
    console.error("LinkedIn publish error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to publish to LinkedIn" },
      { status: 500 },
    );
  }
}
