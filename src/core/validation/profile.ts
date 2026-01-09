// src/core/validation/profile.ts
import { z } from "zod";

export const ProfileSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    avatarUrl: z.string().url().optional().or(z.literal("")),
    initials: z.string().max(3).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;
