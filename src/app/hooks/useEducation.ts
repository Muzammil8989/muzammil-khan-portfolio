import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchEducations, Education } from "@/services/education";
import {
  createEducationAction,
  updateEducationAction,
  deleteEducationAction
} from "@/actions/education-actions";
import { toast } from "sonner";

/** Fetch all education items */
export const useEducations = () => {
  return useQuery<Education[]>({
    queryKey: ["educations"],
    queryFn: fetchEducations,
  });
};

/** Create */
export const useCreateEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const result = await createEducationAction(data);
      if (!result.success) throw new Error(result.error?.message || "Failed to create education item");
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create education item");
    },
  });
};

/** Update */
export const useUpdateEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const result = await updateEducationAction(id, data);
      if (!result.success) throw new Error(result.error?.message || "Failed to update education item");
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update education item");
    },
  });
};

/** Delete */
export const useDeleteEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteEducationAction(id);
      if (!result.success) throw new Error(result.error?.message || "Failed to delete education item");
      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete education item");
    },
  });
};
