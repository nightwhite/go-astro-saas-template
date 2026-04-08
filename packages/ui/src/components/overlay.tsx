import type { ReactNode } from "react";

interface OverlayProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function Dialog({ title, description, children }: OverlayProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function Drawer({ title, description, children }: OverlayProps) {
  return (
    <div className="rounded-lg border border-border bg-sidebar p-5 text-sidebar-foreground">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-sidebar-foreground/75">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

interface ConfirmDialogProps extends OverlayProps {
  confirmLabel?: string;
  cancelLabel?: string;
}

export function ConfirmDialog({
  title,
  description,
  children,
  confirmLabel = "确认",
  cancelLabel = "取消",
}: ConfirmDialogProps) {
  return (
    <Dialog title={title} description={description}>
      {children}
      <div className="mt-5 flex gap-3">
        <button type="button" className="h-10 rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground">
          {cancelLabel}
        </button>
        <button type="button" className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
