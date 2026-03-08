import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { getLinkedInToken, isTokenValid, deleteLinkedInPost } from "@/services/linkedin";

/**
 * DELETE /api/linkedin/delete-post?blogId=...
 * Deletes the LinkedIn post linked to the given blog and clears it from the blog document.
 */
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get("blogId");

    if (!blogId) {
      return NextResponse.json(
        { success: false, error: "blogId is required" },
        { status: 400 },
      );
    }

    const blog = await prisma.blog.findUnique({ where: { id: blogId } });

    if (!blog) {
      return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
    }

    if (!blog.linkedinPost?.postId) {
      return NextResponse.json(
        { success: false, error: "No LinkedIn post linked to this blog" },
        { status: 400 },
      );
    }

    const linkedInToken = await getLinkedInToken(token.id as string);
    if (!linkedInToken || !isTokenValid(linkedInToken)) {
      return NextResponse.json(
        { success: false, error: "LinkedIn not connected or token expired" },
        { status: 401 },
      );
    }

    // Delete from LinkedIn
    await deleteLinkedInPost(linkedInToken.accessToken, blog.linkedinPost.postId);

    // Clear linkedinPost from blog document
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        linkedinPost: { unset: true },
        updatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("LinkedIn delete post error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete LinkedIn post" },
      { status: 500 },
    );
  }
}
