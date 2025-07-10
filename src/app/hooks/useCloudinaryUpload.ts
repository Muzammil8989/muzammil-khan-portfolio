import { useState } from "react";

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

interface UseCloudinaryUploadReturn {
  upload: (file: File) => Promise<void>;
  loading: boolean;
  error: string | null;
  result: UploadResult | null;
  reset: () => void;
}

export default function useCloudinaryUpload(): UseCloudinaryUploadReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const upload = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.result) {
        throw new Error("No result returned from server");
      }

      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return { upload, loading, error, result, reset };
}
