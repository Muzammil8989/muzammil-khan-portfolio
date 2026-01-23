"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Blog } from "@/services/blog";
import { BlogInput } from "@/core/validation/blog";
import { generateSlug } from "@/lib/blog-utils";
import { toast } from "sonner";
import { CodeBlockEditor } from "./code-block-editor";

interface BlogFormProps {
  blog?: Blog;
  onSubmit: (data: BlogInput) => void;
  isSubmitting: boolean;
}

export function BlogForm({ blog, onSubmit, isSubmitting }: BlogFormProps) {
  const [formData, setFormData] = useState<BlogInput>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    codeBlocks: [],
    languages: [],
    frameworks: [],
    difficulty: "beginner",
    author: "Muhammad Muzammil Khan",
    tags: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
    },
    type: "Article",
    isPublished: false,
    publishedAt: "",
    likes: 0,
    version: 1,
  });

  const [tagInput, setTagInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [frameworkInput, setFrameworkInput] = useState("");

  // Populate form when editing
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        codeBlocks: blog.codeBlocks || [],
        languages: blog.languages || [],
        frameworks: blog.frameworks || [],
        difficulty: blog.difficulty,
        author: blog.author,
        tags: blog.tags,
        seo: blog.seo || {
          metaTitle: "",
          metaDescription: "",
          canonicalUrl: "",
        },
        type: blog.type,
        isPublished: blog.isPublished,
        publishedAt: blog.publishedAt,
        likes: blog.likes || 0,
        version: blog.version || 1,
      });
    }
  }, [blog]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !blog) {
      const autoSlug = generateSlug(formData.title);
      setFormData((prev) => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title, blog]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddLanguage = () => {
    if (
      languageInput.trim() &&
      !formData.languages?.includes(languageInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...(prev.languages || []), languageInput.trim()],
      }));
      setLanguageInput("");
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages?.filter((l) => l !== lang) || [],
    }));
  };

  const handleAddFramework = () => {
    if (
      frameworkInput.trim() &&
      !formData.frameworks?.includes(frameworkInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        frameworks: [...(prev.frameworks || []), frameworkInput.trim()],
      }));
      setFrameworkInput("");
    }
  };

  const handleRemoveFramework = (framework: string) => {
    setFormData((prev) => ({
      ...prev,
      frameworks: prev.frameworks?.filter((f) => f !== framework) || [],
    }));
  };

  const handleFillDummyData = () => {
    const dummyData: BlogInput = {
      title: "Building a Modern Full-Stack Blog with Next.js 15 and MongoDB",
      slug: "building-modern-fullstack-blog-nextjs-mongodb",
      excerpt:
        "Learn how to build a production-ready blog system with Next.js 15, React 19, MongoDB, and TypeScript. Complete with code syntax highlighting and markdown support.",
      content: `# Introduction

In this comprehensive guide, we'll build a modern, full-stack blog system using the latest web technologies. This tutorial covers everything from database design to deployment strategy.

## Why Next.js 15?

Next.js 15 brings significant improvements to the developer experience and application performance. We leverage React Server Components to reduce client-side bundle size and use the new App Router for robust, nested layouts.

## Project Architecture

Our blog system is built on a modular architecture:

1. **Database Layer** - We use MongoDB for flexible document storage, allowing us to store complex blog objects with metadata and code blocks.
2. **API Routes** - Clean, RESTful endpoints handle all CRUD operations securely.
3. **Frontend** - A high-performance React interface built with TypeScript for type safety.
4. **Styling** - Tailwind CSS provides a utility-first approach for premium aesthetics.

## Setting Up the Database

Data integrity starts with strict validation. We implement a master schema that defines the structure of every blog post, including validation rules for titles, slugs, and status states.

## Creating API Endpoints

Next.js allows us to define server-side logic close to our data. By creating dedicated route handlers, we can fetch, filter, and serve our blog posts with high efficiency and built-in caching.

## Adding Code Highlighting

To provide a premium developer experience, we integrate advanced syntax highlighting. This allows users to read and copy code snippets with the same clarity they get in their IDE.

---

### Implementation Details
For the complete technical implementation, including the schemas, API logic, and UI components, please refer to the **Code Lab** section below.`,
      codeBlocks: [
        {
          language: "typescript",
          code: `import { z } from "zod";

export const BlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  author: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  likes: z.number().default(0),
});`,
          filename: "src/core/validation/blog.ts",
          highlightedLines: [3, 10, 11],
        },
        {
          language: "typescript",
          code: `import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/services/blog-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as any;
    
    const blogs = await BlogService.getAll({ 
      status: status || "published" 
    });
    
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}`,
          filename: "src/app/api/blogs/route.ts",
          highlightedLines: [4, 11, 14],
        },
        {
          language: "tsx",
          code: `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function CodeBlock({ code, language, filename }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl">
      <div className="bg-slate-800/50 px-4 py-3 border-b flex justify-between">
        <span className="text-xs font-mono">{language}</span>
        {filename && <span className="text-xs italic">{filename}</span>}
      </div>
      <SyntaxHighlighter language={language} style={vscDarkPlus}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}`,
          filename: "src/components/shared/code-block.tsx",
          highlightedLines: [1, 11],
        },
      ],
      languages: ["TypeScript", "JavaScript"],
      frameworks: ["Next.js", "React", "MongoDB", "Tailwind CSS"],
      difficulty: "intermediate",
      author: "Muhammad Muzammil Khan",
      tags: [
        "Next.js",
        "React",
        "MongoDB",
        "TypeScript",
        "Tutorial",
        "Full-Stack",
      ],
      seo: {
        metaTitle:
          "Build a Modern Blog with Next.js 15 and MongoDB | Complete Guide",
        metaDescription:
          "Step-by-step tutorial on building a production-ready blog system with Next.js 15, React 19, MongoDB, and TypeScript. Includes code syntax highlighting and markdown support.",
        canonicalUrl: "",
      },
      type: "Tutorial",
      isPublished: false,
      publishedAt: "",
      likes: 0,
      version: 1,
    };

    setFormData(dummyData);
    toast.success("Dummy data filled! Review and publish when ready.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error("Excerpt is required");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }

    if (formData.tags.length === 0) {
      toast.error("At least one tag is required");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fill Dummy Data Button - For Testing */}
      {!blog && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleFillDummyData}
            className="gap-2"
          >
            <span className="text-lg">🎲</span>
            Fill Dummy Data (For Testing)
          </Button>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="How to Build a Modern Web App with Next.js"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="how-to-build-modern-web-app-nextjs"
          />
          <p className="text-xs text-muted-foreground">
            URL-friendly version (auto-generated from title)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt *</Label>
          <Textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows={2}
            placeholder="A brief summary of your blog post (1-2 sentences)"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground">
            {formData.excerpt.length}/300 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="author">Author</Label>
          <Input
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Muhammad Muzammil Khan"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Content</h3>

        <div className="space-y-2">
          <Label htmlFor="content">Blog Content (Markdown) *</Label>
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={15}
            placeholder="Write your blog content in Markdown format..."
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Supports Markdown syntax
          </p>
        </div>

        {/* Code Blocks */}
        <CodeBlockEditor
          codeBlocks={formData.codeBlocks || []}
          onChange={(blocks) =>
            setFormData((prev) => ({ ...prev, codeBlocks: blocks }))
          }
        />
      </div>

      {/* Categories & Tags */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Categories & Tags</h3>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
              setFormData((prev) => ({ ...prev, difficulty: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags *</Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add a tag and press Enter"
            />
            <Button type="button" onClick={handleAddTag} variant="secondary">
              Add
            </Button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <Label>Programming Languages (optional)</Label>
          <div className="flex gap-2">
            <Input
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLanguage();
                }
              }}
              placeholder="e.g., JavaScript, Python"
            />
            <Button
              type="button"
              onClick={handleAddLanguage}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {formData.languages && formData.languages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.languages.map((lang) => (
                <Badge key={lang} variant="outline" className="pr-1">
                  {lang}
                  <button
                    type="button"
                    onClick={() => handleRemoveLanguage(lang)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Frameworks */}
        <div className="space-y-2">
          <Label>Frameworks/Libraries (optional)</Label>
          <div className="flex gap-2">
            <Input
              value={frameworkInput}
              onChange={(e) => setFrameworkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFramework();
                }
              }}
              placeholder="e.g., React, Next.js"
            />
            <Button
              type="button"
              onClick={handleAddFramework}
              variant="secondary"
            >
              Add
            </Button>
          </div>
          {formData.frameworks && formData.frameworks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.frameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="pr-1">
                  {framework}
                  <button
                    type="button"
                    onClick={() => handleRemoveFramework(framework)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SEO Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">SEO Settings (optional)</h3>

        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            name="metaTitle"
            value={formData.seo?.metaTitle || ""}
            onChange={handleSeoChange}
            placeholder="Leave empty to use blog title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            name="metaDescription"
            value={formData.seo?.metaDescription || ""}
            onChange={handleSeoChange}
            rows={3}
            placeholder="Leave empty to use excerpt"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="canonicalUrl">Canonical URL</Label>
          <Input
            id="canonicalUrl"
            name="canonicalUrl"
            type="url"
            value={formData.seo?.canonicalUrl || ""}
            onChange={handleSeoChange}
            placeholder="https://yoursite.com/blog/slug"
          />
        </div>
      </div>

      {/* Publishing Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Publishing</h3>

        <div className="space-y-2">
          <Label htmlFor="type">Blog Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value: "Article" | "Case Study" | "Tutorial" | "Deep Dive" | "Quick Tip" | "Guide") =>
              setFormData((prev) => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="Case Study">Case Study</SelectItem>
              <SelectItem value="Tutorial">Tutorial</SelectItem>
              <SelectItem value="Deep Dive">Deep Dive</SelectItem>
              <SelectItem value="Quick Tip">Quick Tip</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="isPublished">Publish Status</Label>
          <Select
            value={formData.isPublished ? "published" : "draft"}
            onValueChange={(value) =>
              setFormData((prev) => ({
                ...prev,
                isPublished: value === "published",
                publishedAt: value === "published" && !prev.publishedAt
                  ? new Date().toISOString()
                  : prev.publishedAt
              }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.isPublished && (
          <div className="space-y-2">
            <Label htmlFor="publishedAt">Published Date</Label>
            <Input
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
              value={
                formData.publishedAt
                  ? new Date(formData.publishedAt).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  publishedAt: new Date(e.target.value).toISOString(),
                }))
              }
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Processing..."
            : blog
              ? "Update Blog"
              : "Create Blog"}
        </Button>
      </div>
    </form>
  );
}
