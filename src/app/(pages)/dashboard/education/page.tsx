import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { EducationService } from "@/services/education-service";
import { EducationManager } from "@/components/features/education";

export const dynamic = "force-dynamic";

export default async function EducationPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["educations"],
    queryFn: () => EducationService.getAll().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <EducationManager />
      </HydrationBoundary>
    </div>
  );
}
