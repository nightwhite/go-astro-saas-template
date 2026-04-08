import type { ReactNode } from "react";
import { Badge } from "./badge";

type ToastTone = "success" | "warning" | "danger" | "brand" | "neutral";

interface ToastProps {
  tone?: ToastTone;
  title: string;
  description?: string;
  action?: ReactNode;
}

const toneLabel: Record<ToastTone, string> = {
  success: "Success",
  warning: "Warning",
  danger: "Danger",
  brand: "Info",
  neutral: "Notice",
};

export function Toast({ tone = "neutral", title, description, action }: ToastProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge tone={tone}>{toneLabel[tone]}</Badge>
            <p className="text-sm font-semibold text-card-foreground">{title}</p>
          </div>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}
