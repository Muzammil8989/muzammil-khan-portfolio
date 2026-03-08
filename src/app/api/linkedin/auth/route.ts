import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * GET /api/linkedin/auth
 * Initiates the LinkedIn OAuth flow.
 * Admin must be signed in first.
 */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { success: false, error: "LinkedIn credentials not configured" },
      { status: 500 }
    );
  }

  // State encodes the userId so we can link the token after callback
  const state = Buffer.from(JSON.stringify({ userId: token.id })).toString("base64url");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "openid profile w_member_social",
    state,
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;

  return NextResponse.redirect(authUrl);
}
