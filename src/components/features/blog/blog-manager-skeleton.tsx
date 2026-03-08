"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function BlogManagerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
