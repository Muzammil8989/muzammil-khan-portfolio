import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getLinkedInToken, isTokenValid } from "@/services/linkedin";

/**
 * GET /api/linkedin/status
 * Returns whether the current admin user has a valid LinkedIn connection.
 */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const linkedInToken = await getLinkedInToken(token.id as string);

  if (!linkedInToken || !isTokenValid(linkedInToken)) {
    return NextResponse.json({
      success: true,
      data: { connected: false },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      connected: true,
      name: linkedInToken.name,
      profileImage: linkedInToken.profileImage,
      connectedAt: linkedInToken.connectedAt,
      expiresAt: linkedInToken.expiresAt,
    },
  });
}
