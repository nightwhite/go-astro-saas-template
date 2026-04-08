import type { ReactNode } from "react";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import { AdminSidebar } from "./layout/Sidebar";
import { AdminTopbar } from "./layout/Topbar";

interface AdminAppProps {
  overview: AdminOverview | null;
  currentPath: string;
  breadcrumb: string[];
  children: ReactNode;
}

export default function AdminApp({ overview, currentPath, breadcrumb, children }: AdminAppProps) {
  const currentRole = overview?.viewer.role ?? "guest";
  const tenantID = overview?.viewer.tenant_id ?? "default";

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <AdminSidebar
          currentPath={currentPath}
          permissions={overview?.permissions ?? []}
          tenantID={tenantID}
          currentRole={currentRole}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar breadcrumb={breadcrumb} />
          <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
