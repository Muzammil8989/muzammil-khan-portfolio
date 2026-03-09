import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  exchangeCodeForToken,
  getLinkedInProfile,
  saveLinkedInToken,
} from "@/services/linkedin";

/**
 * GET /api/linkedin/callback
 * LinkedIn redirects here after the user authorizes the app.
 * Exchanges code → access token, fetches profile, saves to MongoDB.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const dashboardUrl = `${siteUrl}/dashboard`;

  if (error) {
    return NextResponse.redirect(
      `${dashboardUrl}?linkedin=error&reason=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${dashboardUrl}?linkedin=error&reason=missing_params`);
  }

  try {
    // Decode and CSRF-verify state
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    const { userId, nonce, sig } = decoded;

    if (!userId || !nonce || !sig) {
      throw new Error("Invalid state parameter");
    }

    const expectedSig = crypto
      .createHmac("sha256", process.env.NEXTAUTH_SECRET!)
      .update(JSON.stringify({ userId, nonce }))
      .digest("hex");

    const sigBuf = Buffer.from(sig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      throw new Error("State signature mismatch - possible CSRF attack");
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get LinkedIn profile
    const profile = await getLinkedInProfile(tokenData.access_token);

    // Save token to MongoDB
    await saveLinkedInToken({
      userId,
      accessToken: tokenData.access_token,
      personId: profile.sub,
      name: profile.name,
      profileImage: profile.picture,
      expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      connectedAt: new Date(),
    });

    return NextResponse.redirect(`${dashboardUrl}?linkedin=connected`);
  } catch (err) {
    console.error("LinkedIn callback error:", err);
    return NextResponse.redirect(`${dashboardUrl}?linkedin=error&reason=server_error`);
  }
}
