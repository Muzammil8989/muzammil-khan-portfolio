import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Generate a unique filename with folder prefix
    const timestamp = Date.now();
    const filename = `${folder}/${timestamp}-${file.name}`;

    // Upload to Vercel Blob
    // Uses MUHAMMAD_MUZAMMIL_BLOB_READ_WRITE_TOKEN from environment variables
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
      token: process.env.MUHAMMAD_MUZAMMIL_BLOB_READ_WRITE_TOKEN,
    });

    // Return response in Cloudinary-compatible format for backward compatibility
    return NextResponse.json({
      url: blob.url,
      secure_url: blob.url,
      public_id: blob.pathname,
      asset_id: blob.pathname,
      format: file.type.split("/")[1],
      resource_type: file.type.startsWith("image/") ? "image" : "raw",
      bytes: file.size,
      created_at: new Date().toISOString(),
      // Vercel Blob specific fields
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
