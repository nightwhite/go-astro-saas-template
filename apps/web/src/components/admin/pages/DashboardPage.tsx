import type { AdminOverview } from "@/features/dashboard/api/admin";
import { DashboardOverviewFeature } from "@/features/dashboard/components/DashboardOverviewFeature";

interface DashboardPageProps {
  overview: AdminOverview | null;
}

export function DashboardPage({ overview }: DashboardPageProps) {
  return <DashboardOverviewFeature overview={overview} />;
}
