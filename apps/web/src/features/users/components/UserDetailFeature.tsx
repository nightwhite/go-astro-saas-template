import { AdminPageLayout, Badge, DataTable, EmptyState, SurfacePanel } from "@repo/ui";
import type { UserDetailRecord } from "@/lib/api/admin";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface UserDetailFeatureProps {
  detail: UserDetailRecord | null;
}

export function UserDetailFeature({ detail }: UserDetailFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);

  if (!detail) {
    return (
      <AdminPageLayout
        section={m.users.section}
        title={m.common.details}
        description={m.common.userDetailUnavailable}
      >
        <EmptyState title={m.common.userDetailUnavailable} description={m.common.returnToUserList} />
      </AdminPageLayout>
    );
  }

  return (
    <AdminPageLayout
      section={m.users.section}
      title={detail.user.display_name}
      description={`${m.common.detailDescriptionPrefix} ${detail.user.email}.`}
    >
      <SurfacePanel title={m.sidebar.items.Profile} description={m.users.description}>
        <div className="grid gap-3 text-sm text-foreground md:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">{m.common.userID}</p>
            <p className="mt-1 break-all font-medium">{detail.user.id}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">{m.common.tenant}</p>
            <p className="mt-1 font-medium">{detail.user.tenant_id}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">{m.users.columns.role}</p>
            <p className="mt-1"><Badge tone="brand">{detail.user.role}</Badge></p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">{m.users.columns.status}</p>
            <p className="mt-1"><Badge tone={detail.user.status === "active" ? "success" : "warning"}>{detail.user.status}</Badge></p>
          </div>
        </div>
      </SurfacePanel>

      <SurfacePanel title={m.roles.title} description={m.roles.description}>
        {detail.roles.length ? (
          <DataTable
            columns={[
              { key: "key", title: m.roles.columns.key, render: (item) => item.key },
              { key: "name", title: m.roles.columns.role, render: (item) => item.name },
              { key: "desc", title: m.common.description, render: (item) => item.description || "-" },
            ]}
            items={detail.roles}
          />
        ) : (
          <EmptyState title={m.roles.noRolesTitle} description={m.roles.noRolesDescription} />
        )}
      </SurfacePanel>

      <SurfacePanel title={m.roles.filters.permissions} description={m.roles.bindPanelDescription}>
        {detail.permissions.length ? (
          <div className="flex flex-wrap gap-2">
            {detail.permissions.map((item) => (
              <Badge key={item} tone="neutral">{item}</Badge>
            ))}
          </div>
        ) : (
          <EmptyState title={m.roles.noRolesTitle} description={m.roles.noRolesDescription} />
        )}
      </SurfacePanel>
    </AdminPageLayout>
  );
}
