import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function handleUpload(
  dataUri: string,
  options?: UploadApiOptions
): Promise<UploadApiResponse> {
  try {
    return await cloudinary.uploader.upload(dataUri, {
      ...options,
      resource_type: "auto",
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}
