import type { AdminOverview } from "@/features/dashboard/api/admin";
import { ObservabilityFeature } from "@/features/observability/components/ObservabilityFeature";

interface ObservabilityPageProps {
  overview: AdminOverview | null;
}

export function ObservabilityPage({ overview }: ObservabilityPageProps) {
  return <ObservabilityFeature overview={overview} />;
}
