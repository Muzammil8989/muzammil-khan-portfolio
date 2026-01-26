import { z } from "zod";

export const ProjectLinkSchema = z.object({
    type: z.string(),
    href: z.string().url(),
});

export const ProjectSchema = z.object({
    title: z.string().min(1, "Title is required"),
    href: z.string().url().optional().or(z.literal("")),
    dates: z.string().min(1, "Dates are required"),
    active: z.boolean().default(true),
    description: z.string().min(1, "Description is required"),
    technologies: z.array(z.string()).min(1, "At least one technology is required"),
    links: z.array(ProjectLinkSchema).default([]),
    image: z.string().optional().or(z.literal("")),
    projectUrl: z.string().url().optional().or(z.literal("")),
    githubUrl: z.string().url().optional().or(z.literal("")),
    caseStudyUrl: z.string().url().optional().or(z.literal("")),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
