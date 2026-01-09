import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects } from "@/services/project";
import {
    createProjectAction,
    updateProjectAction,
    deleteProjectAction,
} from "@/actions/project-actions";
import { toast } from "sonner";

/** Fetch all projects */
export const useProjects = () => {
    return useQuery({
        queryKey: ["projects"],
        queryFn: fetchProjects,
    });
};

/** Create new project */
export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const result = await createProjectAction(data);
            if (!result.success) throw new Error(result.error?.message || "Failed to create project");
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project created successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create project");
        },
    });
};

/** Update existing project */
export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: any) => {
            const { _id, ...rest } = data;
            const result = await updateProjectAction(_id, rest);
            if (!result.success) throw new Error(result.error?.message || "Failed to update project");
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update project");
        },
    });
};

/** Delete a project */
export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deleteProjectAction(id);
            if (!result.success) throw new Error(result.error?.message || "Failed to delete project");
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            toast.success("Project deleted successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete project");
        },
    });
};
