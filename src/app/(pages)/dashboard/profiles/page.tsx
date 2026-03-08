import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { ProfileService } from "@/services/profile-service";
import { ProfileManager } from "@/components/features/profile";

export const dynamic = "force-dynamic";

export default async function ProfilesPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["profiles"],
    queryFn: () => ProfileService.getAll().then((res) => JSON.parse(JSON.stringify(res))),
  });

  return (
    <div className="h-full overflow-y-auto">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProfileManager />
      </HydrationBoundary>
    </div>
  );
}
