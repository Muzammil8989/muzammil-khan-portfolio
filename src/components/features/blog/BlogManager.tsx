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
// Suspense wraps provider so useSearchParams is safe in Next.js App Router
export function BlogManager() {
  return (
    <Suspense fallback={<BlogManagerSkeleton />}>
      <BlogManagerProvider>
        <div className="flex flex-col flex-1 min-h-0 gap-6">
          <BlogManagerHeader />
          <BlogManagerStats />
          <BlogManagerLinkedIn />
          <BlogManagerFilters />
          <BlogManagerContent />
          <BlogManagerDialogs />
        </div>
      </BlogManagerProvider>
    </Suspense>
  );
}
