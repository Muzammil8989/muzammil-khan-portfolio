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
    <main className="min-h-screen bg-white dark:bg-[#00001a]">
      <div className="w-full mx-auto px-6 py-20 space-y-12 max-w-7xl">
        {/* Hero Section */}
        <header className="text-center space-y-4 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-blue-500/10 border border-indigo-100 dark:border-blue-400/30 text-indigo-600 dark:text-blue-300 text-sm font-bold uppercase tracking-widest mb-4">
            <BookOpen className="h-4 w-4" />
            Programming Blog
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Learn & <span className="text-[#FFB902]">Build</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Tutorials, guides, and insights on modern web development
          </p>
        </header>

        {/* Search and Filter - Client Component */}
        <BlogFilter
          allTags={allTags}
          initialSearch={search}
          initialTag={tag}
          initialDifficulty={difficulty}
        />


        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <BlogCard
                key={blog._id}
                blog={blog}
                showActions={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-xl border border-slate-200 dark:border-white/10">
            <BookOpen className="mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blogs found</h3>
            <p className="text-muted-foreground">
              {search || tag || (difficulty && difficulty !== "all")
                ? "Try adjusting your filters or search terms"
                : "Check back soon for new content!"}
            </p>
          </div>
        )}
      </div>

      <Navbar />

      {/* Footer */}
      <footer className="text-center py-20 border-t border-slate-100 dark:border-white/10 dark:bg-black/10">
        <p className="text-slate-400 dark:text-slate-400 font-light text-sm">
          © {new Date().getFullYear()} Muhammad Muzammil • Built with precision.
        </p>
      </footer>
    </main>
  );
}
