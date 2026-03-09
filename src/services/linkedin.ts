import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// ── Token encryption (AES-256-GCM) ────────────────────────────────────────────
// Key is derived from NEXTAUTH_SECRET so no extra env var is needed.
// Encrypted format: "enc:<iv_hex>:<ciphertext_hex>:<tag_hex>"
// Plain values (pre-encryption) are handled transparently for backward compat.

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET must be configured");
  return crypto.createHash("sha256").update(`linkedin-token:${secret}`).digest();
}

function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `enc:${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

function decryptToken(value: string): string {
  if (!value.startsWith("enc:")) return value; // backward compat
  const parts = value.split(":");
  if (parts.length !== 4) throw new Error("Invalid encrypted token format");
  const [, ivHex, encHex, tagHex] = parts;
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(encHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
// ──────────────────────────────────────────────────────────────────────────────

const LINKEDIN_API = "https://api.linkedin.com/v2";
const LINKEDIN_UPLOAD_API = "https://api.linkedin.com/v2/assets?action=registerUpload";

export interface LinkedInToken {
  userId: string;
  accessToken: string;
  personId: string;
  name: string;
  profileImage?: string;
  expiresAt: Date;
  connectedAt: Date;
}

export interface LinkedInPostResult {
  postId: string;
  postUrl: string;
}

/**
 * Save LinkedIn OAuth token to database
 */
export async function saveLinkedInToken(token: LinkedInToken): Promise<void> {
  await prisma.linkedinToken.upsert({
    where: { userId: token.userId },
    create: {
      userId: token.userId,
      accessToken: encryptToken(token.accessToken),
      personId: token.personId,
      name: token.name,
      profileImage: token.profileImage,
      expiresAt: token.expiresAt,
      connectedAt: token.connectedAt,
    },
    update: {
      accessToken: encryptToken(token.accessToken),
      personId: token.personId,
      name: token.name,
      profileImage: token.profileImage,
      expiresAt: token.expiresAt,
      connectedAt: token.connectedAt,
    },
  });
}

/**
 * Get LinkedIn token by userId
 */
export async function getLinkedInToken(userId: string): Promise<LinkedInToken | null> {
  const token = await prisma.linkedinToken.findUnique({ where: { userId } });
  if (!token) return null;
  return {
    ...(token as unknown as LinkedInToken),
    accessToken: decryptToken(token.accessToken),
  };
}

/**
 * Delete LinkedIn token
 */
export async function deleteLinkedInToken(userId: string): Promise<void> {
  await prisma.linkedinToken.delete({ where: { userId } }).catch(() => {
    // Ignore not-found errors on disconnect
  });
}

/**
 * Check if LinkedIn token is still valid
 */
export function isTokenValid(token: LinkedInToken): boolean {
  return new Date(token.expiresAt) > new Date();
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  expires_in: number;
}> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI!,
  });

  const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn token exchange failed: ${err}`);
  }

  return res.json();
}

/**
 * Get LinkedIn user profile using OpenID Connect userinfo endpoint
 */
export async function getLinkedInProfile(accessToken: string): Promise<{
  sub: string;
  name: string;
  picture?: string;
}> {
  const res = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn profile fetch failed: ${err}`);
  }

  return res.json();
}

/**
 * Register an image upload with LinkedIn and get the upload URL + asset URN
 */
async function registerImageUpload(
  accessToken: string,
  personId: string,
): Promise<{ uploadUrl: string; assetUrn: string }> {
  const res = await fetch(LINKEDIN_UPLOAD_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      registerUploadRequest: {
        recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
        owner: `urn:li:person:${personId}`,
        serviceRelationships: [
          {
            relationshipType: "OWNER",
            identifier: "urn:li:userGeneratedContent",
          },
        ],
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn image registration failed: ${err}`);
  }

  const data = await res.json();
  const uploadMechanism =
    data.value.uploadMechanism[
      "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
    ];

  return {
    uploadUrl: uploadMechanism.uploadUrl,
    assetUrn: data.value.asset,
  };
}

/**
 * Upload a single image buffer to LinkedIn, returns the LinkedIn asset URN
 */
async function uploadImageToLinkedIn(
  accessToken: string,
  personId: string,
  imageBuffer: Buffer,
  mimeType: string,
): Promise<string> {
  const { uploadUrl, assetUrn } = await registerImageUpload(accessToken, personId);

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": mimeType,
    },
    body: new Uint8Array(imageBuffer),
  });

  if (!uploadRes.ok && uploadRes.status !== 201) {
    const err = await uploadRes.text();
    throw new Error(`LinkedIn image upload failed: ${err}`);
  }

  return assetUrn;
}

/**
 * Upload multiple images to LinkedIn, returns array of asset URNs
 */
export async function uploadImagesToLinkedIn(
  accessToken: string,
  personId: string,
  images: { buffer: Buffer; mimeType: string }[],
): Promise<string[]> {
  const assetUrns: string[] = [];
  for (const img of images) {
    const urn = await uploadImageToLinkedIn(
      accessToken,
      personId,
      img.buffer,
      img.mimeType,
    );
    assetUrns.push(urn);
  }
  return assetUrns;
}

/**
 * Publish a LinkedIn post.
 * If imageAssetUrns provided → IMAGE post with images + text containing the blog URL.
 * If no images → ARTICLE post with direct blog link preview.
 */
export async function publishLinkedInPost(
  accessToken: string,
  personId: string,
  postText: string,
  blogUrl: string,
  blogTitle: string,
  blogExcerpt: string,
  imageAssetUrns: string[] = [],
): Promise<LinkedInPostResult> {
  const author = `urn:li:person:${personId}`;

  let specificContent: object;

  if (imageAssetUrns.length > 0) {
    const textWithUrl = postText.includes(blogUrl)
      ? postText
      : `${postText}\n\nRead the full article: ${blogUrl}`;

    specificContent = {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: textWithUrl },
        shareMediaCategory: "IMAGE",
        media: imageAssetUrns.map((urn, i) => ({
          status: "READY",
          media: urn,
          title: {
            attributes: [],
            text: i === 0 ? blogTitle : `${blogTitle} (${i + 1})`,
          },
        })),
      },
    };
  } else {
    specificContent = {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: postText },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            originalUrl: blogUrl,
            title: { attributes: [], text: blogTitle },
            description: { attributes: [], text: blogExcerpt },
          },
        ],
      },
    };
  }

  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent,
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const res = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LinkedIn post creation failed: ${err}`);
  }

  const postId = res.headers.get("x-restli-id") || "";
  const postUrl = postId
    ? `https://www.linkedin.com/feed/update/${postId}`
    : `https://www.linkedin.com/in/${personId}/recent-activity/shares/`;

  return { postId, postUrl };
}

/**
 * Delete a LinkedIn UGC post by its post ID (URN)
 */
export async function deleteLinkedInPost(
  accessToken: string,
  postId: string,
): Promise<void> {
  const encodedId = encodeURIComponent(postId);
  const res = await fetch(`${LINKEDIN_API}/ugcPosts/${encodedId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "X-Restli-Protocol-Version": "2.0.0",
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    throw new Error(`LinkedIn post deletion failed: ${err}`);
  }
}
