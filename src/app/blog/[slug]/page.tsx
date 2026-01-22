import { BlogService } from "@/services/blog-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/shared/code-block";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/layout/navbar";
import { BlogActions } from "@/components/features/blog/blog-actions";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Blog } from "@/services/blog";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const extractTextFromMarkdown = (markdown: string): string => {
  return markdown
    .replace(/#+\s/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/>\s/g, "")
    .replace(/^-\s/gm, "")
    .trim();
};

import { ReadingProgressBar } from "@/components/features/blog/reading-progress";

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  // Get user IP for server-side like check
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

  // Fetch blog data directly on the server
  let blog: Blog;
  try {
    const rawBlog = await BlogService.getBySlug(slug) as any;
    if (!rawBlog) notFound();

    // Inject isLiked status for the current user
    blog = {
      ...rawBlog,
      _id: rawBlog._id.toString(),
      isLiked: rawBlog.likedBy?.includes(ip) || false,
      likedBy: undefined, // Don't leak other IPs
    } as Blog;
  } catch (error) {
    console.error("Error fetching blog:", error);
    notFound();
  }

  const contentToRead = `${blog.title}. ${blog.excerpt}. ${extractTextFromMarkdown(blog.content)}`;

  return (
    <main className="min-h-screen bg-white dark:bg-[#00001a] relative">
      <ReadingProgressBar />
      {/* Back Button */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-8">
        <Link href="/blog">
          <Button
            variant="ghost"
            className="group hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Article Container */}
      <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 break-words">
        <header className="mb-12">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags?.map((tag: string) => (
              <Badge
                key={tag}
                variant="outline"
                className="bg-indigo-50 dark:bg-blue-500/10 border-indigo-200 dark:border-blue-400/30 text-indigo-700 dark:text-blue-300"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 font-light leading-relaxed mb-8">
            {blog.excerpt}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 pb-8 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 dark:text-white">
                {blog.author}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </div>
            {blog.readingTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {blog.readingTime} min read
              </div>
            )}
          </div>

          {/* Client Side Actions (Audio, Like, Share) */}
          <BlogActions blog={blog} contentToRead={contentToRead} />
        </header>

        <div className="prose prose-slate dark:prose-invert prose-lg max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-5">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 mb-6 text-slate-700 dark:text-slate-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 mb-6 text-slate-700 dark:text-slate-300">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="ml-4">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#FFB902] pl-6 py-2 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 rounded-r-lg">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-slate-100 dark:bg-white/10 text-indigo-600 dark:text-blue-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-indigo-600 dark:text-blue-400 hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-slate-900 dark:text-white">
                  {children}
                </strong>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {blog.codeBlocks && blog.codeBlocks.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Code Examples
            </h2>
            {blog.codeBlocks.map((codeBlock: any, index: number) => (
              <CodeBlock
                key={index}
                code={codeBlock.code}
                language={codeBlock.language}
                filename={codeBlock.filename}
                highlightedLines={codeBlock.highlightedLines}
              />
            ))}
          </div>
        )}

        {((blog.languages?.length ?? 0) > 0 || (blog.frameworks?.length ?? 0) > 0) && (
          <div className="mt-12 p-8 rounded-2xl glass-card border border-slate-200 dark:border-white/10">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Technologies Covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.languages?.map((lang: string) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-400/30 text-blue-700 dark:text-blue-300"
                >
                  {lang}
                </Badge>
              ))}
              {blog.frameworks?.map((framework: string) => (
                <Badge
                  key={framework}
                  variant="outline"
                  className="bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-400/30 text-purple-700 dark:text-purple-300"
                >
                  {framework}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-16 pt-12 border-t border-slate-200 dark:border-white/10 text-center">
          <Link href="/blog">
            <Button variant="outline" className="gap-2 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to All Posts
            </Button>
          </Link>
        </div>
      </article>

      <Navbar />

      <footer className="text-center py-20 border-t border-slate-100 dark:border-white/10 dark:bg-black/10">
        <p className="text-slate-400 dark:text-slate-400 font-light text-sm">
          © {new Date().getFullYear()} {blog.author} • Built with precision.
        </p>
      </footer>
    </main>
  );
}
