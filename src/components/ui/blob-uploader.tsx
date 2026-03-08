"use client";

import React, { useCallback, useId } from "react";
import { useBlobUpload } from "@/app/hooks/useBlobUpload";

// ── Upload limits (matching Cloudinary plan) ──────────────────────────────────
const LIMITS = {
  image:  { bytes: 10  * 1024 * 1024, label: "10 MB",  maxMp: 25_000_000, maxMpLabel: "25 MP" },
  video:  { bytes: 100 * 1024 * 1024, label: "100 MB" },
  raw:    { bytes: 10  * 1024 * 1024, label: "10 MB"  },
} as const;

async function validateFile(file: File): Promise<string | null> {
  const { type, size } = file;

  if (type.startsWith("image/")) {
    if (size > LIMITS.image.bytes)
      return `Image too large. Max size is ${LIMITS.image.label}.`;

    // Check megapixels
    const mp: number = await new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img.width * img.height); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(0); };
      img.src = url;
    });
    if (mp > LIMITS.image.maxMp)
      return `Image resolution too high. Max is ${LIMITS.image.maxMpLabel} (${(mp / 1_000_000).toFixed(1)} MP detected).`;

    return null;
  }

  if (type.startsWith("video/")) {
    if (size > LIMITS.video.bytes)
      return `Video too large. Max size is ${LIMITS.video.label}.`;
    return null;
  }

  // PDF / raw
  if (size > LIMITS.raw.bytes)
    return `File too large. Max size is ${LIMITS.raw.label}.`;
  return null;
}

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
  const { upload, loading, error: uploadError } = useBlobUpload();
  const uid = useId();
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setValidationError(null);

      const err = await validateFile(file);
      if (err) {
        setValidationError(err);
        if (onError) onError(err);
        e.target.value = "";
        return;
      }

      try {
        const response = await upload(file, folder);
        if (response && onSuccess) {
          onSuccess(response);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Upload failed";
        console.error("Upload error:", errorMessage);
        if (onError) onError(errorMessage);
      }
    },
    [upload, folder, onSuccess, onError]
  );

  const displayError = validationError || (typeof uploadError === "string" ? uploadError : uploadError ? "Upload failed" : null);

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

      {displayError && (
        <p className="text-sm text-red-500">{displayError}</p>
      )}
    </div>
  );
};
