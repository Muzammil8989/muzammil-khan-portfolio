import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { deleteLinkedInToken } from "@/services/linkedin";

/**
 * DELETE /api/linkedin/disconnect
 * Removes the LinkedIn OAuth token for the current admin user.
 */
export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  await deleteLinkedInToken(token.id as string);

  return NextResponse.json({ success: true, data: { disconnected: true } });
}
