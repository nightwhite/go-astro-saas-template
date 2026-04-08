import type { AuditFeatureData } from "@/features/audit/api/audit";
import { AuditFeature } from "@/features/audit/components/AuditFeature";

interface AuditPageProps {
  data: AuditFeatureData;
}

export function AuditPage({ data }: AuditPageProps) {
  return <AuditFeature data={data} />;
}
