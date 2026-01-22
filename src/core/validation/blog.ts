import { z } from "zod";

// Code Block Schema
export const CodeBlockSchema = z.object({
  language: z.string().min(1, "Language is required"),
  code: z.string().min(1, "Code is required"),
  filename: z.string().optional(),
  highlightedLines: z.array(z.number()).optional(),
});

// SEO Schema
export const SeoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  canonicalUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

// Blog Schema
export const BlogSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required").max(300, "Excerpt must be less than 300 characters"),
  content: z.string().min(1, "Content is required"),
  codeBlocks: z.array(CodeBlockSchema).optional().default([]),
  languages: z.array(z.string()).optional().default([]),
  frameworks: z.array(z.string()).optional().default([]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  author: z.string().default("Muhammad Muzammil Khan"),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  seo: SeoSchema.optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z.string().optional(),
  likes: z.number().default(0),
  readingTime: z.number().optional(),
  version: z.number().default(1),
});

export type BlogInput = z.infer<typeof BlogSchema>;
export type CodeBlock = z.infer<typeof CodeBlockSchema>;
export type BlogSeo = z.infer<typeof SeoSchema>;
