import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
} from "@/services/profile";
import { toast } from "sonner";

export const useProfiles = () => {
  const query = useQuery({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch profiles", {
        description: query.error.message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create profile", {
        description: error.message,
      });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile", {
        description: error.message,
      });
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete profile", {
        description: error.message,
      });
    },
  });
};
