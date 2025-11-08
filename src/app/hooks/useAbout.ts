import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAbout,
  createAbout,
  updateAbout,
  deleteAbout,
} from "@/services/about";
import { toast } from "sonner";

export const useAbout = () => {
  const query = useQuery({
    queryKey: ["about"],
    queryFn: fetchAbout,
  });

  useEffect(() => {
    if (query.isError) {
      toast.error("Failed to fetch about section", {
        description: query.error.message,
      });
    }
  }, [query.isError, query.error]);

  return query;
};

export const useCreateAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create about section", {
        description: error.message,
      });
    },
  });
};

export const useUpdateAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update about section", {
        description: error.message,
      });
    },
  });
};

export const useDeleteAbout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAbout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about"] });
      toast.success("About section deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete about section", {
        description: error.message,
      });
    },
  });
};