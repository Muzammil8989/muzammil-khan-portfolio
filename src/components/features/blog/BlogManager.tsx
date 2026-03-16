"use client";

import { Suspense } from "react";
import { BlogManagerProvider } from "./blog-manager-provider";
import { BlogManagerSkeleton } from "./blog-manager-skeleton";
import { BlogManagerHeader } from "./blog-manager-header";
import { BlogManagerStats } from "./blog-manager-stats";
import { BlogManagerLinkedIn } from "./blog-manager-linkedin";
import { BlogManagerFilters } from "./blog-manager-filters";
import { BlogManagerContent } from "./blog-manager-empty";
import { BlogManagerDialogs } from "./blog-manager-dialogs";

// ─── Main export ──────────────────────────────────────────────────────────────
export function BlogManager() {
  return (
    <Suspense fallback={<BlogManagerSkeleton />}>
      <BlogManagerProvider>
        <div className="flex flex-col gap-6 pb-6">
          <BlogManagerHeader />
          <BlogManagerStats />

          {/* LinkedIn + Search/Filters — one combined toolbar */}
          <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm px-4 py-3 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <BlogManagerLinkedIn />
              <div className="w-px h-8 bg-border hidden sm:block shrink-0" />
              <BlogManagerFilters />
            </div>
          </div>

          <BlogManagerContent />
          <BlogManagerDialogs />
        </div>
      </BlogManagerProvider>
    </Suspense>
  );
}
