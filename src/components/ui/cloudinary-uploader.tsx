import React, { useState, useCallback } from "react";
import useCloudinaryUpload from "@/app/hooks/useCloudinaryUpload";
import { CldImage } from "next-cloudinary";

interface CloudinaryUploaderProps {
  onSuccess?: (result: any) => void;
  folder?: string;
}

const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onSuccess,
  folder = "portfolio",
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { upload, loading, error, result } = useCloudinaryUpload();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      await upload(file);
      if (result && onSuccess) {
        onSuccess(result);
      }
    },
    [upload, onSuccess, result]
  );

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={loading}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {loading && <p>Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {preview && !result && (
        <div className="mt-4">
          <p className="mb-2">Preview:</p>
          <img src={preview} alt="Preview" className="max-w-xs rounded-md" />
        </div>
      )}

      {result && (
        <div className="mt-4">
          <p className="mb-2">Uploaded Image:</p>
          <CldImage
            width="400"
            height="300"
            src={result.public_id}
            alt="Uploaded content"
            className="rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
