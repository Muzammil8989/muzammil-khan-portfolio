import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { ProjectService } from "@/services/project-service";
import { ProjectManager } from "@/components/features/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["projects"],
    queryFn: () => ProjectService.getAll().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProjectManager />
      </HydrationBoundary>
    </div>
  );
}
