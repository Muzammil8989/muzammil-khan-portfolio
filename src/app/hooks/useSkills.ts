import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchSkills } from "@/services/skill";
import { updateSkillsAction } from "@/actions/skill-actions";
import { toast } from "sonner";

export const useSkills = () => {
    return useQuery({
        queryKey: ["skills"],
        queryFn: fetchSkills,
    });
};

export const useUpdateSkills = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (skills: string[]) => {
            const result = await updateSkillsAction(skills);
            if (!result.success) throw new Error(result.error?.message || "Failed to update skills");
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["skills"] });
            toast.success("Skills updated successfully");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update skills");
        },
    });
};
