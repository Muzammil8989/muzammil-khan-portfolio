import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const BASE = "/api/linkedin";

export interface LinkedInStatus {
  connected: boolean;
  name?: string;
  profileImage?: string;
  connectedAt?: string;
  expiresAt?: string;
}

export interface PublishPayload {
  blogId: string;
  postText: string;
  images: File[];
}

export interface PublishResult {
  postId: string;
  postUrl: string;
  blogUrl: string;
  imageCount: number;
}

/**
 * Fetch LinkedIn connection status
 */
export const useLinkedInStatus = () => {
  return useQuery<LinkedInStatus>({
    queryKey: ["linkedin", "status"],
    queryFn: async () => {
      const res = await axios.get(`${BASE}/status`);
      return res.data?.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false,
  });
};

/**
 * Disconnect LinkedIn account
 */
export const useLinkedInDisconnect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.delete(`${BASE}/disconnect`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["linkedin", "status"] });
      toast.success("LinkedIn disconnected");
    },
    onError: () => {
      toast.error("Failed to disconnect LinkedIn");
    },
  });
};

/**
 * Publish a blog post to LinkedIn with optional images
 */
export const useLinkedInPublish = () => {
  const queryClient = useQueryClient();

  return useMutation<PublishResult, Error, PublishPayload>({
    mutationFn: async ({ blogId, postText, images }) => {
      const formData = new FormData();
      formData.append("blogId", blogId);
      formData.append("postText", postText);
      images.forEach((img) => formData.append("images", img));

      const res = await axios.post(`${BASE}/publish`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data;
    },
    onSuccess: (data) => {
      // Invalidate blogs so the LinkedIn badge updates
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("Posted to LinkedIn!", {
        action: {
          label: "View Post",
          onClick: () => window.open(data.postUrl, "_blank"),
        },
      });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err.message || "Failed to post to LinkedIn";
      toast.error(message);
    },
  });
};

/**
 * Delete a LinkedIn post linked to a blog
 */
export const useLinkedInDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { blogId: string }>({
    mutationFn: async ({ blogId }) => {
      await axios.delete(`${BASE}/delete-post`, { params: { blogId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      toast.success("LinkedIn post deleted");
    },
    onError: (err: any) => {
      const message = err?.response?.data?.error || err.message || "Failed to delete LinkedIn post";
      toast.error(message);
    },
  });
};
