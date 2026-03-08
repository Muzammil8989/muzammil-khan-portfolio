import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { AboutService } from "@/services/about-service";
import { AboutManager } from "@/components/features/about";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["about"],
    queryFn: () => AboutService.get().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <AboutManager />
      </HydrationBoundary>
    </div>
  );
}
