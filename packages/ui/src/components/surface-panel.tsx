import type { ReactNode } from "react";

interface SurfacePanelProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SurfacePanel(props: SurfacePanelProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-4 md:p-5">
      <div className="mb-4 space-y-1">
        <h3 className="text-base font-semibold text-card-foreground">{props.title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{props.description}</p>
      </div>
      {props.children}
    </section>
  );
}
