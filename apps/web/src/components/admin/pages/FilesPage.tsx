import type { FilesFeatureData } from "@/features/files/api/files";
import { FilesFeature } from "@/features/files/components/FilesFeature";

interface FilesPageProps {
  data: FilesFeatureData;
}

export function FilesPage({ data }: FilesPageProps) {
  return <FilesFeature data={data} />;
}
