import type { ReactNode } from "react";

interface ListPageLayoutProps {
  title: string;
  description: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

export function ListPageLayout({ title, description, toolbar, children }: ListPageLayoutProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{title}</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
        </div>
        {toolbar ? <div className="flex flex-wrap gap-3">{toolbar}</div> : null}
      </div>
      {children}
    </section>
  );
}
