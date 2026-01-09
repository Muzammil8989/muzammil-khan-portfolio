// src/core/validation/education.ts
import { z } from "zod";

export const EducationSchema = z.object({
    id: z.string().optional(),
    school: z.string().min(1, "School is required"),
    href: z.string().url().optional().or(z.literal("")),
    degree: z.string().min(1, "Degree is required"),
    logoUrl: z.string().url().optional().or(z.literal("")),
    start: z.string().min(1, "Start date is required"),
    end: z.string().optional().or(z.literal("")),
});

export type EducationInput = z.infer<typeof EducationSchema>;
