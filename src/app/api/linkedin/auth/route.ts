import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";

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

  // Build CSRF-protected state: userId + nonce + HMAC signature
  const nonce = crypto.randomBytes(16).toString("hex");
  const statePayload = { userId: token.id, nonce };
  const stateJson = JSON.stringify(statePayload);
  const sig = crypto
    .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
    .update(stateJson)
    .digest("hex");
  const state = Buffer.from(JSON.stringify({ ...statePayload, sig })).toString("base64url");

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
