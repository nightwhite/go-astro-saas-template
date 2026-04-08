import type { ReactNode } from "react";

interface SettingsPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsPageLayout({ title, description, children }: SettingsPageLayoutProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Settings</p>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}
