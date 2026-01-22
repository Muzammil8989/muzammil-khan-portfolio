import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchWorkExperiences, WorkExperience } from "@/services/work";
import {
  createWorkAction,
  updateWorkAction,
  deleteWorkAction
} from "@/actions/work-actions";
import { toast } from "sonner";

/** Fetch all work experiences */
export const useWorkExperiences = (options?: { initialData?: WorkExperience[] }) => {
  return useQuery<WorkExperience[]>({
    queryKey: ["workExperiences"],
    queryFn: fetchWorkExperiences,
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000,
  });
};

/** Create new work experience */
export const useCreateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createWorkAction(data);
      if (!result.success) throw new Error(result.error?.message || "Failed to create work experience");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create work experience");
    },
  });
};

/** Update existing work experience */
export const useUpdateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { _id, ...rest } = data;
      const result = await updateWorkAction(_id, rest);
      if (!result.success) throw new Error(result.error?.message || "Failed to update work experience");
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update work experience");
    },
  });
};

/** Delete a work experience */
export const useDeleteWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteWorkAction(id);
      if (!result.success) throw new Error(result.error?.message || "Failed to delete work experience");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete work experience");
    },
  });
};
