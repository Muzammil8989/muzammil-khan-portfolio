import Footer from "@/components/layout/footer";
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
import remarkGfm from "remark-gfm";

// Wraps arrow/symbol chars that browsers render as emoji inside
// <span style="font-variant-emoji:text"> so they appear as plain text glyphs.
// Real emoji (🎉 😀 etc.) are NOT in the split pattern so they stay as-is.
const ARROW_SPLIT = /([\u2194-\u2199\u21A9\u21AA\u21D0-\u21D5])/g;
const isArrow = (s: string) => /^[\u2194-\u2199\u21A9\u21AA\u21D0-\u21D5]$/.test(s);

const rehypeTextArrows = () => (tree: any) => {
  // Process ALL text nodes (including inside code/pre) — arrows should render
  // as text glyphs everywhere, not just in paragraphs.
  const walk = (node: any, parent: any, idx: number) => {
    if (node.type === 'text') {
      const parts = node.value.split(ARROW_SPLIT);
      if (parts.length > 1 && parent?.children) {
        const nodes = parts
          .filter((p: string) => p !== '')
          .map((p: string) =>
            isArrow(p)
              ? { type: 'element', tagName: 'span', properties: { style: 'font-variant-emoji:text' }, children: [{ type: 'text', value: p }] }
              : { type: 'text', value: p }
          );
        parent.children.splice(idx, 1, ...nodes);
        return;
      }
    }
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        walk(node.children[i], node, i);
      }
    }
  };
  if (tree.children) {
    for (let i = tree.children.length - 1; i >= 0; i--) {
      walk(tree.children[i], tree, i);
    }
  }
};
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
import { DATA } from "@/data/resume";

export const dynamic = "force-dynamic"; // needed: per-IP like status injected on each request

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
    const baseUrl = DATA.url.replace(/\/$/, "");
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
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.excerpt || blog.title,
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

    // Fetch related blogs based on tags, fallback to recent posts
    const allBlogs = await BlogService.getAll({ isPublished: true });
    const otherBlogs = allBlogs.filter((b: any) => b.slug !== slug);

    // Deduplicate by slug in case DB has duplicate entries
    const seen = new Set<string>();
    const uniqueOtherBlogs = otherBlogs.filter((b: any) => {
      if (seen.has(b.slug)) return false;
      seen.add(b.slug);
      return true;
    });

    // Try tag-matched first, fallback to most recent
    const tagMatched = uniqueOtherBlogs.filter((b: any) =>
      blog.tags?.length > 0 && b.tags?.some((t: string) => blog.tags.includes(t))
    );
    const candidates = tagMatched.length > 0 ? tagMatched : uniqueOtherBlogs;

    relatedBlogs = candidates
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

  const baseUrl = DATA.url.replace(/\/$/, "");
  const blogUrl = `${baseUrl}/blog/${blog.slug}`;

  return (
    <main className="min-h-screen relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* SEO Structured Data */}
      <BlogPostingStructuredData
        title={blog.title}
        description={blog.excerpt}
        url={blogUrl}
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
        <nav className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10 lg:px-8 pt-16 pb-6 flex items-center justify-between">
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
        <article className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10 lg:px-8 pb-20 break-words">
          <header className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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

            <p className="text-lg sm:text-xl font-light leading-relaxed mb-10 border-l-4 pl-6 italic text-justify" style={{
              color: 'var(--text-secondary)',
              borderColor: 'var(--color-brand-primary)',
              hyphens: 'auto',
              WebkitHyphens: 'auto',
              overflowWrap: 'break-word',
            } as any}>
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
            prose-img:rounded-2xl prose-img:shadow-2xl
            prose-p:text-justify prose-p:break-words
            prose-li:text-justify prose-li:break-words
            animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200
            [&_p]:[hyphens:auto] [&_p]:[-webkit-hyphens:auto] [&_p]:[overflow-wrap:break-word]
            [&_li]:[hyphens:auto] [&_li]:[-webkit-hyphens:auto]"
            style={{
              '--tw-prose-links': 'var(--color-brand-primary)',
              '--tw-prose-quote-borders': 'var(--color-brand-primary)',
              '--tw-prose-headings': 'var(--color-brand-accent)',
            } as any}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeTextArrows]}
              components={{
                h1: ({ children }) => <h1 className="text-3xl sm:text-4xl mt-12 mb-6" style={{ color: 'var(--color-brand-accent)' }}>{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl sm:text-3xl mt-10 mb-5 pb-2 border-b" style={{ color: 'var(--color-brand-accent)', borderColor: 'var(--border-subtle)' }}>{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl sm:text-2xl mt-8 mb-4" style={{ color: 'var(--color-brand-accent)' }}>{children}</h3>,
                table: ({ children }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse text-sm">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead style={{ backgroundColor: 'var(--surface-elevated)' }}>{children}</thead>
                ),
                th: ({ children }) => (
                  <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider border" style={{ borderColor: 'var(--border-default)', color: 'var(--color-brand-accent)' }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-3 border" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    {children}
                  </td>
                ),
                tr: ({ children }) => (
                  <tr className="transition-colors hover:bg-white/5">{children}</tr>
                ),
                pre: ({ children }) => {
                  // Block code — handle here so it never ends up inside a <p>
                  const child = Array.isArray(children) ? children[0] : children;
                  const className = (child as any)?.props?.className || "";
                  const match = /language-(\w+)/.exec(className);
                  if (match) {
                    // Recursively extract raw text (children may contain span elements from rehype plugins)
                    const extractText = (n: any): string => {
                      if (typeof n === 'string') return n;
                      if (Array.isArray(n)) return n.map(extractText).join('');
                      if (n?.props?.children !== undefined) return extractText(n.props.children);
                      return '';
                    };
                    const code = extractText((child as any)?.props?.children ?? "").replace(/\n$/, "");
                    return (
                      <div className="not-prose my-8">
                        <CodeBlock code={code} language={match[1]} />
                      </div>
                    );
                  }
                  // Plain pre block: render children directly so span-wrapped arrows display correctly
                  return (
                    <pre
                      className="not-prose my-6 overflow-x-auto rounded-xl px-5 py-4 text-sm font-mono leading-relaxed"
                      style={{
                        backgroundColor: 'var(--surface-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {children}
                    </pre>
                  );
                },
                code({ className, children, ...props }: any) {
                  // Inline code only (block code is handled by pre above)
                  return (
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
                <BookOpen className="h-5 w-5" style={{ color: '#FFB902' }} />
                Stack Context
              </h3>
              <div className="flex flex-wrap gap-3">
                {blog.languages?.map((lang: string) => (
                  <Badge key={lang} className="shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform border" style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: '#FFB902',
                    borderColor: 'rgba(255,185,2,0.3)'
                  }}>
                    {lang}
                  </Badge>
                ))}
                {blog.frameworks?.map((framework: string) => (
                  <Badge key={framework} className="shadow-sm px-4 py-1.5 rounded-xl hover:scale-105 transition-transform border" style={{
                    backgroundColor: 'var(--surface-elevated)',
                    color: '#FFB902',
                    borderColor: 'rgba(255,185,2,0.3)'
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
            <div className="mt-24 pt-16 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <h3 className="text-2xl font-bold mb-10 flex items-center gap-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
                Continue Reading
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(255,185,2,0.3), transparent)" }} />
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedBlogs.map((rBlog) => (
                  <div key={rBlog._id} className="h-full">
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

      <Footer />
    </main>
  );
}
