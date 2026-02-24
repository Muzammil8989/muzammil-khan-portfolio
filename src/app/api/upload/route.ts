import { NextResponse } from "next/server";
import crypto from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
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
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = "nodejs";
