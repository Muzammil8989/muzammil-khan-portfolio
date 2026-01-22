import { BlogService } from "@/services/blog-service";
import { ProfileService } from "@/services/profile-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/shared/code-block";
import {
  ArrowLeft,
  Calendar,
  Clock,
  BookOpen,
  ChevronRight,
  User,
  Share2,
} from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/layout/navbar";
import { BlogActions } from "@/components/features/blog/blog-actions";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Blog } from "@/services/blog";
import { ReadingProgressBar } from "@/components/features/blog/reading-progress";
import { BlogCard } from "@/components/features/blog/blog-card";

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

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;

  // Get user IP for server-side like check
  const headersList = await headers();
  const forwarded = headersList.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "anonymous";

  // Fetch blog data directly on the server
  let blog: Blog;
  let relatedBlogs: Blog[] = [];

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

    // Fetch related blogs based on tags
    const allBlogs = await BlogService.getAll({ status: "published" });
    relatedBlogs = allBlogs
      .filter((b: any) => b.slug !== slug && b.tags.some((t: string) => blog.tags.includes(t)))
      .slice(0, 3)
      .map((b: any) => ({ ...b, _id: b._id.toString() } as Blog));

    // Fetch author profile
    const rawProfiles = await ProfileService.getAll();
    const rawAuthorProfile = rawProfiles.find(p => p.name === blog.author) || rawProfiles[0];

    // Serialize to plain object for Client Component compatibility
    if (rawAuthorProfile) {
      (blog as any).authorProfile = {
        _id: rawAuthorProfile._id.toString(),
        name: rawAuthorProfile.name,
        avatarUrl: rawAuthorProfile.avatarUrl,
        initials: rawAuthorProfile.initials,
        description: rawAuthorProfile.description,
      };
    }

  } catch (error) {
    console.error("Error fetching blog:", error);
    notFound();
  }

  const contentToRead = `${blog.title}. ${blog.excerpt}. ${extractTextFromMarkdown(blog.content)}`;

  return (
    <main className="min-h-screen bg-white dark:bg-[#00001a] relative">
      <ReadingProgressBar />

      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Navigation / Breadcrumbs */}
        <nav className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-8 flex items-center justify-between">
          <Link href="/blog">
            <Button
              variant="ghost"
              size="sm"
              className="group hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            <Link href="/" className="hover:text-indigo-600 dark:hover:text-blue-400 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blog" className="hover:text-indigo-600 dark:hover:text-blue-400 transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{blog.title}</span>
          </div>
        </nav>

        {/* Article Container */}
        <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 break-words">
          <header className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {blog.tags?.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-indigo-50/50 dark:bg-blue-500/10 border-indigo-100 dark:border-blue-400/20 text-indigo-600 dark:text-blue-300 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-8 leading-[1.15] tracking-tight">
              {blog.title}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-light leading-relaxed mb-10 border-l-4 border-indigo-500/30 dark:border-blue-500/30 pl-6 italic">
              {blog.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-8 border-y border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-indigo-100 dark:border-blue-900/50 shadow-lg">
                  <AvatarImage src={(blog as any).authorProfile?.avatarUrl} alt={blog.author} className="object-cover" />
                  <AvatarFallback className="bg-indigo-50 dark:bg-blue-900 text-indigo-600 dark:text-blue-300 font-bold">
                    {(blog as any).authorProfile?.initials || <User className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{blog.author}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {blog.readingTime || 5} min read
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <BlogActions blog={blog} contentToRead={contentToRead} />
              </div>
            </div>
          </header>

          <div className="prose prose-slate dark:prose-invert prose-lg max-w-none 
            prose-headings:font-[family-name:var(--font-display)] prose-headings:font-bold prose-headings:tracking-tight
            prose-a:text-indigo-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-blockquote:border-indigo-500 dark:prose-blockquote:border-blue-500 prose-blockquote:bg-indigo-50/30 dark:prose-blockquote:bg-blue-500/5 prose-blockquote:rounded-r-xl
            prose-img:rounded-2xl prose-img:shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl sm:text-4xl mt-12 mb-6">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl sm:text-3xl mt-10 mb-5 pb-2 border-b border-slate-100 dark:border-white/5">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl sm:text-2xl mt-8 mb-4">{children}</h3>,
                code({ inline, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <div className="not-prose my-8">
                      <CodeBlock
                        code={String(children).replace(/\n$/, "")}
                        language={match[1]}
                        {...props}
                      />
                    </div>
                  ) : (
                    <code
                      className="bg-indigo-50 dark:bg-blue-500/10 text-indigo-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-sm font-mono font-medium"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
              }}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          {blog.codeBlocks && blog.codeBlocks.length > 0 && (
            <div id="code-lab" className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 scroll-mt-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-1 bg-indigo-500 rounded-full" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Code Lab</h2>
              </div>
              {blog.codeBlocks.map((codeBlock: any, index: number) => (
                <div key={index} className="not-prose">
                  <CodeBlock
                    code={codeBlock.code}
                    language={codeBlock.language}
                    filename={codeBlock.filename}
                    highlightedLines={codeBlock.highlightedLines}
                    showLineNumbers={true}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Tech Footer */}
          {((blog.languages?.length ?? 0) > 0 || (blog.frameworks?.length ?? 0) > 0) && (
            <div className="mt-20 p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Share2 className="h-24 w-24 -rotate-12" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Stack Context
              </h3>
              <div className="flex flex-wrap gap-3">
                {blog.languages?.map((lang: string) => (
                  <Badge key={lang} className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-blue-400 border-indigo-100 dark:border-blue-900/50 shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform">
                    {lang}
                  </Badge>
                ))}
                {blog.frameworks?.map((framework: string) => (
                  <Badge key={framework} className="bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/50 shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedBlogs.length > 0 && (
            <div className="mt-24 pt-16 border-t border-slate-100 dark:border-white/5">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-10 flex items-center gap-3 tracking-tight">
                Continue Reading
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((rBlog) => (
                  <div key={rBlog._id} className="scale-95 hover:scale-100 transition-transform duration-300">
                    <BlogCard blog={rBlog} showActions={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 pt-12 border-t border-slate-100 dark:border-white/5 text-center">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="rounded-2xl px-8 gap-3 group border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                All Programming Articles
              </Button>
            </Link>
          </div>
        </article>
      </div>

      <Navbar />

      <footer className="text-center py-24 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="h-12 w-12 rounded-2xl bg-[#FFB902]/20 border border-[#FFB902]/30 flex items-center justify-center text-[#FFB902] mx-auto mb-6">
            <BookOpen className="h-6 w-6" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 font-medium text-sm tracking-widest uppercase">
            End of Transmission
          </p>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-4 italic">
            Thoughtfully crafted by Muhammad Muzammil
          </p>
        </div>
      </footer>
    </main>
  );
}
