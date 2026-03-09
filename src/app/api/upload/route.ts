import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getToken } from "next-auth/jwt";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/svg+xml",
  "video/mp4", "video/webm", "video/ogg",
  "application/pdf",
]);

const FOLDER_REGEX = /^[a-zA-Z0-9/_-]{1,100}$/;

export async function POST(request: NextRequest) {
  // Auth check - only authenticated users can upload
  const token = await getToken({ req: request });
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const rawFolder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate and sanitize folder name
    const folder = rawFolder.replace(/\\/g, "/");
    if (!FOLDER_REGEX.test(folder)) {
      return NextResponse.json({ error: "Invalid folder name" }, { status: 400 });
    }

    // Validate MIME type against whitelist
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: "File type not allowed" }, { status: 415 });
    }

    // ── Size limits ───────────────────────────────────────────────────────────
    const MB = 1024 * 1024;
    if (file.type.startsWith("image/") && file.size > 10 * MB) {
      return NextResponse.json({ error: "Image exceeds 10 MB limit." }, { status: 413 });
    }
    if (file.type.startsWith("video/") && file.size > 100 * MB) {
      return NextResponse.json({ error: "Video exceeds 100 MB limit." }, { status: 413 });
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/") && file.size > 10 * MB) {
      return NextResponse.json({ error: "File exceeds 10 MB limit." }, { status: 413 });
    }

    const timestamp = Math.round(Date.now() / 1000);

    // Sign the request: params must be alphabetical, no api_key/file/signature
    const signatureString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    // PDFs must go to the "raw" resource type; images use "image"
    const resourceType =
      file.type === "application/pdf" ? "raw" : "image";

    const cloudinaryForm = new FormData();
    cloudinaryForm.append("file", file);
    cloudinaryForm.append("folder", folder);
    cloudinaryForm.append("timestamp", String(timestamp));
    cloudinaryForm.append("api_key", API_KEY);
    cloudinaryForm.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      { method: "POST", body: cloudinaryForm }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    // Cloudinary already returns secure_url, public_id, etc.
    return NextResponse.json(data);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export const runtime = "nodejs";
