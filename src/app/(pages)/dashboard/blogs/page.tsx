import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { BlogService } from "@/services/blog-service";
import { BlogManager } from "@/components/features/blog";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["blogs", undefined],
    queryFn: () =>
      BlogService.getAll().then((res) =>
        JSON.parse(JSON.stringify(res)).map((b: any) => {
          delete b.likedBy;
          return b;
        })
      ),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlogManager />
    </HydrationBoundary>
  );
}
