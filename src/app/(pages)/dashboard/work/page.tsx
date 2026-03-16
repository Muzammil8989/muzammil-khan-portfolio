import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { WorkService } from "@/services/work-service";
import { WorkManager } from "@/components/features/work";

export const dynamic = "force-dynamic";

export default async function WorkPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["workExperiences"],
    queryFn: () => WorkService.getAll().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <WorkManager />
    </HydrationBoundary>
  );
}
