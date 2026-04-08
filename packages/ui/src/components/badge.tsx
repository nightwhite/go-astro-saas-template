import type { ReactNode } from "react";

interface BadgeProps {
  tone?: "neutral" | "brand" | "success" | "warning" | "danger";
  className?: string;
  children: ReactNode;
}

const toneClassMap = {
  neutral: "border-border bg-background text-foreground",
  brand: "border-transparent bg-primary text-primary-foreground",
  success: "border-transparent bg-secondary text-secondary-foreground",
  warning: "border-transparent bg-muted text-foreground",
  danger: "border-transparent bg-destructive text-destructive-foreground",
};

export function Badge({ tone = "neutral", className = "", children }: BadgeProps) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${toneClassMap[tone]} ${className}`.trim()}>{children}</span>;
}
