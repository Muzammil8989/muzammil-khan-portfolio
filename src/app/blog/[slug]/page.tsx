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
import { PortfolioCTA } from "@/components/features/blog/portfolio-cta";
import { Metadata } from "next";
import { BlogPostingStructuredData, BreadcrumbStructuredData } from "@/components/seo/structured-data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const rawBlog = await BlogService.getBySlug(slug) as any;
    if (!rawBlog) {
      return {
        title: "Blog Not Found",
        description: "The requested blog post could not be found.",
      };
    }

    const blog = { ...rawBlog, _id: rawBlog._id.toString() } as Blog;
    const baseUrl = "https://muzammilkhan.vercel.app";
    const blogUrl = `${baseUrl}/blog/${blog.slug}`;

    return {
      title: `${blog.title} | Muhammad Muzammil`,
      description: blog.excerpt || blog.title,
      keywords: [...(blog.tags || []), ...(blog.languages || []), ...(blog.frameworks || []), "programming", "tutorial", "software engineering"],
      authors: [{ name: blog.author }],
      openGraph: {
        title: blog.title,
        description: blog.excerpt || blog.title,
        type: "article",
        url: blogUrl,
        publishedTime: blog.publishedAt || blog.createdAt,
        modifiedTime: blog.updatedAt,
        authors: [blog.author],
        tags: blog.tags,
        images: blog.coverImage ? [
          {
            url: blog.coverImage,
            width: 1200,
            height: 630,
            alt: blog.title,
          }
        ] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt || blog.title,
        images: blog.coverImage ? [blog.coverImage] : [],
      },
      alternates: {
        canonical: blogUrl,
      },
    };
  } catch (error) {
    return {
      title: "Blog Post | Muhammad Muzammil",
      description: "Read this blog post on software development and engineering.",
    };
  }
}

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
    const allBlogs = await BlogService.getAll({ isPublished: true });
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

  const baseUrl = "https://muzammilkhan.vercel.app";
  const blogUrl = `${baseUrl}/blog/${blog.slug}`;

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* SEO Structured Data */}
      <BlogPostingStructuredData
        title={blog.title}
        description={blog.excerpt}
        url={blogUrl}
        image={blog.coverImage}
        datePublished={blog.publishedAt || blog.createdAt}
        dateModified={blog.updatedAt}
        author={blog.author}
        authorUrl={baseUrl}
        keywords={[...(blog.tags || []), ...(blog.languages || []), ...(blog.frameworks || [])]}
        readingTime={blog.readingTime}
      />
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: baseUrl },
          { name: "Blog", url: `${baseUrl}/blog` },
          { name: blog.title, url: blogUrl },
        ]}
      />

      <ReadingProgressBar />

      {/* Premium Background Elements */}
      <div className="gradient-decorative-bg"></div>

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
                  className="py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider border"
                  style={{
                    backgroundColor: 'var(--surface-overlay)',
                    borderColor: 'var(--border-default)',
                    color: 'var(--color-brand-primary)'
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-[1.15] tracking-tight" style={{ color: 'var(--color-brand-accent)' }}>
              {blog.title}
            </h1>

            <p className="text-lg sm:text-xl font-light leading-relaxed mb-10 border-l-4 pl-6 italic" style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--color-brand-primary)'
            }}>
              {blog.excerpt}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-8 border-y" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 shadow-lg" style={{ borderColor: 'var(--border-default)' }}>
                  <AvatarImage src={(blog as any).authorProfile?.avatarUrl} alt={blog.author} className="object-cover" />
                  <AvatarFallback className="font-bold" style={{
                    backgroundColor: 'var(--surface-overlay)',
                    color: 'var(--color-brand-primary)'
                  }}>
                    {(blog as any).authorProfile?.initials || <User className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{blog.author}</p>
                  <div className="flex items-center gap-4 text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
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
            prose-a:no-underline hover:prose-a:underline
            prose-blockquote:rounded-r-xl
            prose-img:rounded-2xl prose-img:shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200"
            style={{
              '--tw-prose-links': 'var(--color-brand-primary)',
              '--tw-prose-quote-borders': 'var(--color-brand-primary)',
              '--tw-prose-headings': 'var(--color-brand-accent)',
            } as any}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-3xl sm:text-4xl mt-12 mb-6" style={{ color: 'var(--color-brand-accent)' }}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl sm:text-3xl mt-10 mb-5 pb-2 border-b" style={{ color: 'var(--color-brand-accent)', borderColor: 'var(--border-subtle)' }}>{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl sm:text-2xl mt-8 mb-4" style={{ color: 'var(--color-brand-accent)' }}>{children}</h3>,
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
                      className="px-1.5 py-0.5 rounded text-sm font-mono font-medium"
                      style={{
                        backgroundColor: 'var(--surface-overlay)',
                        color: 'var(--color-brand-primary)'
                      }}
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
                <div className="h-8 w-1 rounded-full" style={{ backgroundColor: 'var(--color-brand-accent)' }} />
                <h2 className="text-2xl font-bold uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>Code Lab</h2>
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
            <div className="mt-20 p-8 rounded-3xl border relative overflow-hidden group" style={{
              backgroundColor: 'var(--surface-base)',
              borderColor: 'var(--border-subtle)'
            }}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Share2 className="h-24 w-24 -rotate-12" />
              </div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BookOpen className="h-5 w-5" style={{ color: 'var(--color-brand-primary)' }} />
                Stack Context
              </h3>
              <div className="flex flex-wrap gap-3">
                {blog.languages?.map((lang: string) => (
                  <Badge key={lang} className="shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform border" style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--color-brand-primary)',
                    borderColor: 'var(--border-default)'
                  }}>
                    {lang}
                  </Badge>
                ))}
                {blog.frameworks?.map((framework: string) => (
                  <Badge key={framework} className="shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform border" style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: 'var(--color-brand-secondary)',
                    borderColor: 'var(--border-default)'
                  }}>
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio CTA */}
          <PortfolioCTA />

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
