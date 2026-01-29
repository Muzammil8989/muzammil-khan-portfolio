import { BlogService } from "@/services/blog-service";
import { BlogCard } from "@/components/features/blog/blog-card";
import { BookOpen } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { BlogFilter } from "@/components/features/blog/blog-filter";
import { Blog } from "@/services/blog";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Engineering Blog | Software Development Insights & Tutorials",
  description: "Deep dives into modern software architecture, technical leadership, full-stack development, and programming best practices. Explore tutorials on React, Next.js, Node.js, TypeScript, and more.",
  keywords: ["software engineering blog", "web development tutorials", "full stack development", "react tutorials", "nextjs blog", "typescript guides", "programming articles", "technical writing", "software architecture", "code examples"],
  openGraph: {
    title: "Engineering Blog | Software Development Insights",
    description: "Deep dives into modern software architecture, technical leadership, and full-stack development.",
    type: "website",
    url: "https://muzammilkhan.vercel.app/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Blog | Software Development Insights",
    description: "Deep dives into modern software architecture, technical leadership, and full-stack development.",
  },
  alternates: {
    canonical: "https://muzammilkhan.vercel.app/blog",
  },
};

interface BlogPageProps {
  searchParams: Promise<{
    search?: string;
    tag?: string;
    difficulty?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { search, tag, difficulty } = await searchParams;

  // Fetch all published blogs
  const allBlogsData = await BlogService.getAll({ isPublished: true });

  // Ensure we have a clean array (handling Mongo results)
  const blogsArray: Blog[] = allBlogsData.map((blog: any) => ({
    ...blog,
    _id: blog._id.toString(),
  }));

  // Get unique tags for the filter
  const allTags = Array.from(new Set(blogsArray.flatMap((blog) => blog.tags)));

  // Filter logic on server side
  const filteredBlogs = blogsArray.filter((blog) => {
    const matchesSearch =
      !search ||
      blog.title.toLowerCase().includes(search.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(search.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesTag = !tag || blog.tags.includes(tag);

    const matchesDifficulty = !difficulty || difficulty === "all" || blog.difficulty === difficulty;

    return matchesSearch && matchesTag && matchesDifficulty;
  });

  return (
    <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Background Decorative Elements */}
      <div className="gradient-decorative-bg"></div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 py-10 space-y-16 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center space-y-6 max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mb-4" style={{
            backgroundColor: 'var(--surface-overlay)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)'
          }}>
            <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-brand-primary)' }} />
            Engineering Journal
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-[0.9]" style={{ color: 'var(--text-primary)' }}>
            Insight & <span className="text-transparent bg-clip-text bg-gradient-to-r" style={{
              backgroundImage: 'linear-gradient(to right, var(--color-brand-primary), var(--color-info))'
            }}>Innovation</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-xl mx-auto leading-relaxed font-light" style={{ color: 'var(--text-secondary)' }}>
            Deep dives into modern software architecture, technical leadership, and full-stack development.
          </p>
        </header>

        {/* Search and Filter - Client Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <BlogFilter
            allTags={allTags}
            initialSearch={search}
            initialTag={tag}
            initialDifficulty={difficulty}
          />
        </div>

        {/* Blog Grid */}
        <div>
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog, index) => (
                <div
                  key={blog._id}
                  className="h-full opacity-0 animate-fadeInUp"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <BlogCard
                    blog={blog}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 glass-card rounded-[32px] border border-slate-100 dark:border-white/5 max-w-2xl mx-auto">
              <div className="h-20 w-20 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">No articles found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-light px-8">
                {search || tag || (difficulty && difficulty !== "all")
                  ? "Try refining your search or clearing your tags"
                  : "Check back soon for new content!"}
              </p>
            </div>
          )}
        </div>
      </div>

      <Navbar />

      {/* Footer */}
      <footer className="text-center py-24 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
        <p className="text-slate-400 dark:text-slate-500 font-medium text-[10px] uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} MUHAMMAD MUZAMMIL • ALL RIGHTS RESERVED
        </p>
      </footer>

    </main>
  );
}
