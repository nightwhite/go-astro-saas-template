import type { ReactNode } from "react";

interface PermissionGuardProps {
  permissions: string[];
  require: string | string[];
  mode?: "all" | "any";
  fallback?: ReactNode;
  deniedFallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGuard({
  permissions,
  require,
  mode = "all",
  fallback = null,
  deniedFallback = null,
  children,
}: PermissionGuardProps) {
  const required = Array.isArray(require) ? require : [require];
  const cleaned = required.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    return <>{children}</>;
  }

  const allowed = mode === "any"
    ? cleaned.some((permission) => permissions.includes(permission))
    : cleaned.every((permission) => permissions.includes(permission));

  const hasDeniedRole = permissions.includes("admin.denied");
  if (hasDeniedRole && deniedFallback) {
    return <>{deniedFallback}</>;
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}
