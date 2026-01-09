// src/core/validation/about.ts
import { z } from "zod";

export const AboutSchema = z.object({
    message: z.string().min(1, "Message is required"),
});

export type AboutInput = z.infer<typeof AboutSchema>;
