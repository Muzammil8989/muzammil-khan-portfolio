import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProfiles, Profile } from "@/services/profile";
import { createProfileAction, updateProfileAction, deleteProfileAction } from "@/actions/profile-actions";
import { toast } from "sonner";

export const useProfiles = (options?: { initialData?: Profile[] }) => {
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: fetchProfiles,
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 mins
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
        onError: (err: any) => {
            toast.error(err.message || "Failed to create profile");
        }
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
        onError: (err: any) => {
            toast.error(err.message || "Failed to update profile");
        }
    });
};

export const useDeleteProfile = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteProfileAction(id);
            if (!result.success) throw new Error(result.error?.message || "Failed to delete profile");
            return result;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ["profiles"] });
             toast.success("Profile deleted successfully");
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to delete profile");
        }
    });
};
