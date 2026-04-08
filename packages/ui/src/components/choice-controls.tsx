import type { InputHTMLAttributes, ReactNode } from "react";

interface ChoiceProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({ label, hint, className = "", ...props }: ChoiceProps) {
  return (
    <label className={`flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 ${className}`.trim()}>
      <input type="checkbox" className="mt-1 size-4 rounded border-input" {...props} />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

export function Radio({ label, hint, className = "", ...props }: ChoiceProps) {
  return (
    <label className={`flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 ${className}`.trim()}>
      <input type="radio" className="mt-1 size-4 border-input" {...props} />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

interface SwitchProps {
  checked?: boolean;
  label: ReactNode;
  hint?: ReactNode;
}

export function Switch({ checked = false, label, hint }: SwitchProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </div>
      <span className={`inline-flex h-7 w-12 rounded-full p-1 transition ${checked ? "bg-primary" : "bg-muted"}`}>
        <span className={`size-5 rounded-full bg-background transition ${checked ? "translate-x-5" : ""}`} />
      </span>
    </div>
  );
}
