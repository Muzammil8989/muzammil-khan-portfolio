import { BlogService } from "@/services/blog-service";
import { BlogCard } from "@/components/features/blog/blog-card";
import { BookOpen, ArrowUpRight, Clock, Heart } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import { BlogFilter } from "@/components/features/blog/blog-filter";
import { Blog } from "@/services/blog";
import { Metadata } from "next";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Footer from "@/components/layout/footer";

export const revalidate = 60;

const blogUrl = `${DATA.url}blog`;

export const metadata: Metadata = {
  title: "Engineering Blog | Software Development Insights & Tutorials",
  description: "Deep dives into modern software architecture, technical leadership, full-stack development, and programming best practices.",
  keywords: ["software engineering blog", "web development tutorials", "full stack development", "react tutorials", "nextjs blog", "typescript guides"],
  openGraph: {
    title: "Engineering Blog | Software Development Insights",
    description: "Deep dives into modern software architecture, technical leadership, and full-stack development.",
    type: "website",
    url: blogUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Engineering Blog | Software Development Insights",
    description: "Deep dives into modern software architecture, technical leadership, and full-stack development.",
  },
  alternates: { canonical: blogUrl },
};

interface BlogPageProps {
  searchParams: Promise<{ search?: string; tag?: string; difficulty?: string }>;
}

const DIFFICULTY_BARS: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { search, tag, difficulty } = await searchParams;

  const allBlogsData = await BlogService.getAll({ isPublished: true });
  const blogsArray: Blog[] = allBlogsData.map((blog: any) => ({
    ...blog,
    _id: blog._id.toString(),
  }));

  const totalLikes = blogsArray.reduce((sum, b) => sum + (b.likes || 0), 0);

  const isFiltered = !!search || (!!difficulty && difficulty !== "all");

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

  // Newest blog in big featured card; only shown when not filtered
  const featuredBlog = !isFiltered && blogsArray.length > 0 ? blogsArray[0] : null;
  const gridBlogs = isFiltered ? filteredBlogs : blogsArray.slice(1);

  const featuredBars = featuredBlog ? (DIFFICULTY_BARS[featuredBlog.difficulty] ?? 1) : 0;
  const featuredStack = featuredBlog
    ? [...(featuredBlog.languages || []), ...(featuredBlog.frameworks || [])].slice(0, 5)
    : [];

  return (
    <main className="min-h-screen relative overflow-x-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* BG orbs */}
      <div className="gradient-decorative-bg" />

      <div className="relative z-10">

        {/* ── Hero ────────────────────────────────────────────────────── */}
        <header className="text-center pt-24 pb-10 px-4">
          {/* pill badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.18em] mb-6"
            style={{ background: "rgba(255,185,2,0.12)", border: "1px solid rgba(255,185,2,0.25)", color: "#FFB902" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB902] animate-pulse" />
            New articles every week
          </div>

          <h1
            className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-[3.4rem] font-black tracking-tighter leading-[1.1] mb-5"
            style={{ color: "var(--text-primary)" }}
          >
            Developer{" "}
            <span className="relative inline-block" style={{ color: "#FFB902" }}>
              Knowledge
              <span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full opacity-30"
                style={{ background: "#FFB902" }}
              />
            </span>{" "}
            Hub
          </h1>

          <p className="text-base sm:text-lg max-w-md mx-auto leading-relaxed font-light mb-10" style={{ color: "var(--text-secondary)" }}>
            Tutorials, deep dives &amp; guides for modern developers —<br className="hidden sm:block" /> written by engineers, for engineers.
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-8 sm:gap-14">
            {[
              { num: `${blogsArray.length}+`, label: "Articles" },
              { num: `${totalLikes}`, label: "Total Likes" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black" style={{ color: "#FFB902" }}>{num}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.12em] mt-1" style={{ color: "#3a4060" }}>{label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* ── Search + Filter ─────────────────────────────────────────── */}
        <div className="max-w-2xl mx-auto px-4 pb-12">
          <BlogFilter initialSearch={search} initialDifficulty={difficulty} />
        </div>

        {/* ── Featured card — newest blog upload ──────────────────────── */}
        {featuredBlog && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
            <Link href={`/blog/${featuredBlog.slug}`} className="block group">
              <div
                className="relative rounded-[24px] p-8 sm:p-10 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden
                  grid sm:grid-cols-[1fr_auto] gap-8 items-center"
                style={{
                  background: "linear-gradient(135deg, rgba(255,185,2,0.09) 0%, rgba(255,185,2,0.03) 50%, transparent 100%)",
                  border: "1px solid rgba(255,185,2,0.2)",
                }}
              >
                {/* top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, #FFB902, transparent)" }} />

                {/* bg number */}
                <span
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-[8rem] sm:text-[9rem] font-black leading-none pointer-events-none select-none hidden sm:block"
                  style={{ color: "rgba(255,185,2,0.05)" }}
                >
                  01
                </span>

                <div className="relative">
                  {/* Latest badge */}
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-[0.1em] mb-4"
                    style={{ background: "#FFB902", color: "#04061a" }}
                  >
                    ⭐ Latest Post
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-[1.75rem] font-black leading-snug mb-3" style={{ color: "var(--text-primary)" }}>
                    {featuredBlog.title}
                  </h2>

                  <p className="text-sm leading-relaxed mb-5 max-w-xl line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                    {featuredBlog.excerpt}
                  </p>

                  {/* Stack chips */}
                  {featuredStack.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-5">
                      {featuredStack.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-[6px] text-[12px] font-semibold"
                          style={{ background: "rgba(255,185,2,0.1)", border: "1px solid rgba(255,185,2,0.25)", color: "#FFB902" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                      <Clock className="w-3.5 h-3.5" />
                      {featuredBlog.readingTime || 5} min read
                    </span>
                    <span className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
                      <Heart className="w-3.5 h-3.5" />
                      {featuredBlog.likes || 0} likes
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-[3px]">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="w-[18px] h-1 rounded-sm"
                            style={{ background: n <= featuredBars ? "#FFB902" : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                      <span className="text-[12px] capitalize" style={{ color: "var(--text-secondary)" }}>
                        {featuredBlog.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="flex-shrink-0 self-start sm:self-center">
                  <span
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[12px] text-[14px] font-black whitespace-nowrap transition-opacity duration-200 group-hover:opacity-85"
                    style={{ background: "#FFB902", color: "#04061a" }}
                  >
                    Read Article
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ── Section header ──────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between mb-7">
          <div className="flex items-center gap-4">
            <div className="w-[3px] h-9 rounded-full" style={{ background: "#FFB902" }} />
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color: "#FFB902" }}>
                {isFiltered ? "Search Results" : "Browse All"}
              </div>
              <div className="text-xl font-black" style={{ color: "var(--text-primary)" }}>
                {isFiltered
                  ? `${filteredBlogs.length} article${filteredBlogs.length !== 1 ? "s" : ""} found`
                  : "Latest Articles"}
              </div>
            </div>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: "#3a4060" }}>
            {gridBlogs.length} post{gridBlogs.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Card grid ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
          {gridBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridBlogs.map((blog, index) => (
                <div
                  key={blog._id}
                  className="h-full opacity-0 animate-fadeInUp"
                  style={{ animationDelay: `${index * 80}ms`, animationFillMode: "forwards" }}
                >
                  <BlogCard
                    blog={blog}
                    showActions={false}
                    cardNumber={index + (featuredBlog ? 2 : 1)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-20 rounded-[28px] max-w-xl mx-auto"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(255,185,2,0.1)", border: "1px solid rgba(255,185,2,0.2)" }}
              >
                <BookOpen className="h-8 w-8" style={{ color: "#FFB902" }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>No articles found</h3>
              <p className="text-sm font-light px-8" style={{ color: "var(--text-secondary)" }}>
                {search || tag || (difficulty && difficulty !== "all")
                  ? "Try refining your search or clearing your filters"
                  : "Check back soon for new content!"}
              </p>
            </div>
          )}
        </div>
      </div>

      <Navbar />

      <Footer />
    </main>
  );
}
