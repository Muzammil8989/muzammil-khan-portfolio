import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { SkillService } from "@/services/skill-service";
import { SkillsManager } from "@/components/features/skills";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["skills"],
    queryFn: () => SkillService.getSkillsList().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SkillsManager />
      </HydrationBoundary>
    </div>
  );
}
