// hooks/useEducation.ts
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchEducations,
  createEducation,
  updateEducation,
  deleteEducation,
  Education,
} from "@/services/educations";
import { toast } from "sonner";

/** Fetch all education items */
export const useEducations = () => {
  const query = useQuery({
    queryKey: ["educations"],
    queryFn: fetchEducations,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch education items", {
        description: (query.error as Error)?.message,
      });
    }
  }, [query.isError, query.error]);

  return query; // { data, isLoading, isError, ... }
};

/** Create */
export const useCreateEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createEducation, // (data: Omit<Education, "_id">)
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item created successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to create education item", {
        description: error?.message ?? "Unknown error",
      });
    },
  });
};

/** Update by id
 *  Usage: mutate({ id, data })
 */
export const useUpdateEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<Education, "_id">> }) =>
      updateEducation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update education item", {
        description: error?.message ?? "Unknown error",
      });
    },
  });
};

/** Delete by id
 *  Usage: mutate(id)
 */
export const useDeleteEducation = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEducation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["educations"] });
      toast.success("Education item deleted successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to delete education item", {
        description: error?.message ?? "Unknown error",
      });
    },
  });
};
