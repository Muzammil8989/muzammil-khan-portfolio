import { z } from "zod";

export const SkillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
    category: z.string().optional().default("General"),
    icon: z.string().optional().or(z.literal("")),
});

export const SkillsArraySchema = z.array(z.string());

export type SkillInput = z.infer<typeof SkillSchema>;
