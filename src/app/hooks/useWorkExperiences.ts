import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchWorkExperiences,
  createWorkExperience,
  updateWorkExperience,
  deleteWorkExperience,
} from "@/services/work";
import { toast } from "sonner";

/** Fetch all work experiences */
export const useWorkExperiences = () => {
  const query = useQuery({
    queryKey: ["workExperiences"],
    queryFn: fetchWorkExperiences,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch work experiences", {
        description: (query.error as Error)?.message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

/** Create new work experience */
export const useCreateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create work experience", {
        description: error.message,
      });
    },
  });
};

/** Update existing work experience */
export const useUpdateWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update work experience", {
        description: error.message,
      });
    },
  });
};

/** Delete a work experience */
export const useDeleteWorkExperience = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workExperiences"] });
      toast.success("Work experience deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete work experience", {
        description: error.message,
      });
    },
  });
};
