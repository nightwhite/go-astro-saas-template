import type { ReactNode } from "react";

interface PageSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageSection(props: PageSectionProps) {
  return (
    <section className="space-y-3">
      <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{props.eyebrow}</p>
      <h2 className="text-3xl font-semibold text-foreground">{props.title}</h2>
      <p className="max-w-3xl text-base leading-7 text-muted-foreground">{props.description}</p>
      {props.children}
    </section>
  );
}
