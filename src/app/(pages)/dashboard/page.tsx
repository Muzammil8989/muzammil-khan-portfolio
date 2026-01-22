import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { ProfileService } from "@/services/profile-service";
import { WorkService } from "@/services/work-service";
import { EducationService } from "@/services/education-service";
import { AboutService } from "@/services/about-service";
import { ProjectService } from "@/services/project-service";
import { SkillService } from "@/services/skill-service";
import { BlogService } from "@/services/blog-service";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const queryClient = new QueryClient();

  // Prefetch all data on the server
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["profiles"],
      queryFn: () => ProfileService.getAll().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["workExperiences"],
      queryFn: () => WorkService.getAll().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["educations"],
      queryFn: () => EducationService.getAll().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["about"],
      queryFn: () => AboutService.get().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["projects"],
      queryFn: () => ProjectService.getAll().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["skills"],
      queryFn: () => SkillService.getSkillsList().then(res => JSON.parse(JSON.stringify(res))),
    }),
    queryClient.prefetchQuery({
      queryKey: ["blogs", undefined],
      queryFn: () => BlogService.getAll().then(res =>
        JSON.parse(JSON.stringify(res)).map((b: any) => {
          // Sanitize: Sensitive data removal
          delete b.likedBy;
          return b;
        })
      ),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  );
}
