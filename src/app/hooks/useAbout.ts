import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAbout } from "@/services/about";
import { upsertAboutAction, deleteAboutAction } from "@/actions/about-actions";
import { toast } from "sonner";

export const useAbout = (options?: { initialData?: any }) => {
  return useQuery({
    queryKey: ["about"],
    queryFn: fetchAbout,
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await upsertAboutAction(data);
      if (!result.success) throw new Error(result.error?.message || "Failed to save about section");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save about section");
    },
  });
};

export const useUpdateAbout = () => {
  return useCreateAbout(); // Logic is identical for upsert
};

export const useDeleteAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await deleteAboutAction();
      if (!result.success) throw new Error(result.error?.message || "Failed to delete about section");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete about section");
    },
  });
};
