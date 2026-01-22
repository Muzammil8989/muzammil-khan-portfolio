import { BlogService } from "@/services/blog-service";
import { BlogCard } from "@/components/features/blog/blog-card";
import { BookOpen } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { BlogFilter } from "@/components/features/blog/blog-filter";
import { Blog } from "@/services/blog";

export const dynamic = "force-dynamic";

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
  const allBlogsData = await BlogService.getAll({ status: "published" });

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
    <main className="min-h-screen bg-white dark:bg-[#00001a] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full mx-auto px-4 sm:px-6 py-24 space-y-16 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center space-y-6 max-w-3xl mx-auto py-12 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Engineering Journal
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
            Insight & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-blue-400 dark:to-indigo-400">Innovation</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-light">
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
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          {filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <div key={blog._id} className="h-full">
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
