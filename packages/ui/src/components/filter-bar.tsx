import type { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">{children}</div>;
}
