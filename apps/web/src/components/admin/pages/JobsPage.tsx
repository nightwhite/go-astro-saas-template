import type { JobsFeatureData } from "@/features/jobs/api/jobs";
import { JobsFeature } from "@/features/jobs/components/JobsFeature";

interface JobsPageProps {
  data: JobsFeatureData;
}

export function JobsPage({ data }: JobsPageProps) {
  return <JobsFeature data={data} />;
}
