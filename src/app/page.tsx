"use client";

import React, { useCallback } from "react";
import { CldImage } from "next-cloudinary";
import useCloudinaryUpload from "./hooks/useCloudinaryUpload";

interface CloudinaryUploaderProps {
  onSuccess?: (result: any) => void;
  folder?: string;
  className?: string;
}

const CloudinaryUploader: React.FC<CloudinaryUploaderProps> = ({
  onSuccess,
  folder = "portfolio",
  className = "",
}) => {
  const { upload, loading, error, result } = useCloudinaryUpload();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await upload(file);
        if (result && onSuccess) {
          onSuccess(result);
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    },
    [upload, onSuccess, result]
  );

  return (
    <div className={`space-y-4 ${className}`}>
      <label className="block">
        <span className="sr-only">Choose file</span>
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
      </label>

      {loading && <p className="text-gray-500">Uploading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="mt-4">
          <CldImage
            width={result.width}
            height={result.height}
            src={result.public_id}
            alt="Uploaded content"
            className="rounded-md shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

export default CloudinaryUploader;
