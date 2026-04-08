import type { RolesFeatureData } from "@/features/roles/api/roles";
import { RolesFeature } from "@/features/roles/components/RolesFeature";

interface RolesPageProps {
  data: RolesFeatureData;
}

export function RolesPage({ data }: RolesPageProps) {
  return <RolesFeature data={data} />;
}
