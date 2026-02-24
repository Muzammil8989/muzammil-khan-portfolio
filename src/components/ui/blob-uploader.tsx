"use client";

import React, { useCallback, useId } from "react";
import { useBlobUpload } from "@/app/hooks/useBlobUpload";

interface UploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

interface BlobUploaderProps {
  onSuccess?: (result: UploadResult) => void;
  onError?: (error: string) => void;
  folder?: string;
  className?: string;
  accept?: string;
  disabled?: boolean;
  label?: string;
  buttonText?: string;
  loadingText?: string;
}

export const BlobUploader: React.FC<BlobUploaderProps> = ({
  onSuccess,
  onError,
  folder = "uploads",
  className = "",
  accept = "image/*",
  disabled = false,
  label = "Choose file",
  buttonText = "Upload",
  loadingText = "Uploading...",
}) => {
  const { upload, loading, error } = useBlobUpload();
  const uid = useId();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const response = await upload(file, folder);
        if (response && onSuccess) {
          onSuccess(response);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        console.error("Upload error:", errorMessage);
        if (onError) {
          onError(errorMessage);
        }
      }
    },
    [upload, folder, onSuccess, onError]
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled || loading}
            className="hidden"
            id={uid}
          />
          <label
            htmlFor={uid}
            className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
              disabled || loading
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {buttonText}
          </label>
          {loading && (
            <span className="text-sm text-gray-500">{loadingText}</span>
          )}
        </div>
      </label>

      {error && (
        <p className="text-sm text-red-500">
          {typeof error === "string" ? error : "Upload failed"}
        </p>
      )}
    </div>
  );
};
