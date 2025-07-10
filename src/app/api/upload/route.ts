import { NextResponse } from "next/server";
import { handleUpload } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Convert to base64 (Edge compatible)
    const base64String = arrayBufferToBase64(arrayBuffer);
    const dataUri = `data:${file.type};base64,${base64String}`;

    // Upload to Cloudinary
    const result = await handleUpload(dataUri, {
      folder: "portfolio",
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Helper function for Edge runtime
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
