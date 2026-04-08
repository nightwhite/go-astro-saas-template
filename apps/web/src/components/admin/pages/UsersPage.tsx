import type { AdminOverview } from "@/features/dashboard/api/admin";
import { UsersFeature, type UsersFeatureInitialData } from "@/features/users/components/UsersFeature";

interface UsersPageProps {
  overview: AdminOverview | null;
  data?: UsersFeatureInitialData;
}

export function UsersPage({ overview, data }: UsersPageProps) {
  return <UsersFeature overview={overview} data={data} />;
}
