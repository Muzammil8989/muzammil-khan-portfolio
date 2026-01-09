import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfiles, Profile } from "@/services/profile";
import { createProfileAction, updateProfileAction } from "@/actions/profile-actions";
import { toast } from "sonner";

export const useProfiles = () => {
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createProfileAction(data);
      if (!result.success) throw new Error(result.error?.message || "Failed to create profile");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create profile");
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await updateProfileAction(data);
      if (!result.success) throw new Error(result.error?.message || "Failed to update profile");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
};

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // In this app, profiles are usually tied to the user, but we can pass ID for the API
      const res = await fetch(`/api/profile?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message || "Delete failed");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Profile deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete profile");
    },
  });
};
