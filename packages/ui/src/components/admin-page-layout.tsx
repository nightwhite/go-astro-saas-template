import type { ReactNode } from "react";

interface AdminPageLayoutProps {
  section: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function AdminPageLayout({ section, title, description, children }: AdminPageLayoutProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{section}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
