// src/core/validation/work.ts
import { z } from "zod";

export const WorkExperienceSchema = z.object({
    id: z.string().optional(),
    company: z.string().min(1, "Company is required"),
    href: z.string().url().optional().or(z.literal("")),
    badges: z.array(z.string()).default([]),
    location: z.string().min(1, "Location is required"),
    title: z.string().min(1, "Title is required"),
    logoUrl: z.string().url().optional().or(z.literal("")),
    start: z.string().min(1, "Start date is required"),
    end: z.string().optional().or(z.literal("")),
    description: z.string().min(1, "Description is required"),
});

export type WorkExperienceInput = z.infer<typeof WorkExperienceSchema>;
