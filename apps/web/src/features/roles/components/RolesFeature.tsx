import { useEffect, useMemo, useState } from "react";
import { AdminPageLayout, Badge, Button, DataTable, EmptyState, FilterBar, Input, Pagination, SurfacePanel, Toast } from "@repo/ui";
import { bindUserRole, updateRolePermissions } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { fetchRolesWithExplain } from "@/lib/api/admin";
import type { RolesFeatureData } from "../api/roles";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";

interface RolesFeatureProps {
  data: RolesFeatureData;
}

export function RolesFeature({ data }: RolesFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [roles, setRoles] = useState(data.roles);
  const [selectedRoleID, setSelectedRoleID] = useState(data.roles[0]?.id ?? "");
  const [page, setPage] = useState(data.page);
  const [pageSize] = useState(data.pageSize || 20);
  const [total, setTotal] = useState(data.total || data.roles.length);
  const [loading, setLoading] = useState(false);
  const [keyFilter, setKeyFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [email, setEmail] = useState("admin@example.com");
  const [permissionText, setPermissionText] = useState("admin.roles.read,admin.roles.write,admin.users.read");
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchRolesWithExplain(baseURL, {
          page,
          pageSize,
          sortBy: "created_at",
          sortOrder: "desc",
          filters: {
            key: keyFilter,
            name: nameFilter,
          },
        });
        if (cancelled) return;
        setRoles(response.roles);
        setTotal(response.pagination?.total ?? response.roles.length);
        if (!selectedRoleID && response.roles[0]?.id) {
          setSelectedRoleID(response.roles[0].id);
        }
        if (typeof window !== "undefined") {
          const params = new URLSearchParams();
          params.set("page", String(response.pagination?.page ?? page));
          params.set("page_size", String(pageSize));
          if (keyFilter.trim()) params.set("filter_key", keyFilter.trim());
          if (nameFilter.trim()) params.set("filter_name", nameFilter.trim());
          window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
        }
      } catch {
        if (!cancelled) {
          setMessage(m.roles.failedLoad);
          setTone("warning");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [baseURL, keyFilter, nameFilter, page, pageSize, selectedRoleID]);

  const roleItems = useMemo(() => roles, [roles]);

  async function handleSavePermissions() {
    try {
      const keys = permissionText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      await updateRolePermissions(baseURL, selectedRoleID, keys);
      setMessage(m.roles.permissionsUpdated);
      setTone("success");
    } catch {
      setMessage(m.roles.failedUpdatePermissions);
      setTone("warning");
    }
  }

  async function handleBindUserRole() {
    try {
      await bindUserRole(baseURL, email, selectedRoleID);
      setMessage(`${m.roles.bindSuccess}: ${email}`);
      setTone("success");
    } catch {
      setMessage(m.roles.failedBindUser);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.roles.section}
      title={m.roles.title}
      description={m.roles.description}
    >
      <FilterBar>
        <Input
          label={m.roles.filters.roleKey}
          value={keyFilter}
          placeholder={m.roles.filters.roleKeyPlaceholder}
          onChange={(event) => {
            setPage(1);
            setKeyFilter(event.currentTarget.value);
          }}
        />
        <Input
          label={m.roles.filters.roleName}
          value={nameFilter}
          placeholder={m.roles.filters.roleNamePlaceholder}
          onChange={(event) => {
            setPage(1);
            setNameFilter(event.currentTarget.value);
          }}
        />
        <Input
          label={m.roles.filters.selectedRoleID}
          value={selectedRoleID}
          onChange={(event) => setSelectedRoleID(event.currentTarget.value)}
        />
        <Input
          label={m.roles.filters.permissions}
          value={permissionText}
          placeholder={m.roles.filters.permissionsPlaceholder}
          onChange={(event) => setPermissionText(event.currentTarget.value)}
        />
        <Button onClick={() => void handleSavePermissions()}>{m.roles.savePermissions}</Button>
      </FilterBar>

      <SurfacePanel title={m.roles.bindPanelTitle} description={m.roles.bindPanelDescription}>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <Input label={m.roles.userEmail} value={email} onChange={(event) => setEmail(event.currentTarget.value)} />
          <Button className="self-end" onClick={() => void handleBindUserRole()}>
            {m.roles.bindRole}
          </Button>
        </div>
      </SurfacePanel>

      <SurfacePanel title={m.roles.listPanelTitle} description={m.roles.listPanelDescription}>
        {loading ? (
          <p className="text-sm text-muted-foreground">{m.roles.loading}</p>
        ) : roleItems.length ? (
          <DataTable
            columns={[
              {
                key: "name",
                title: m.roles.columns.role,
                render: (role) => (
                  <div className="space-y-2">
                    <p className="font-medium text-foreground">{role.name}</p>
                    <p className="text-xs text-muted-foreground">{role.description}</p>
                  </div>
                ),
              },
              {
                key: "key",
                title: m.roles.columns.key,
                render: (role) => (
                  <button
                    type="button"
                    onClick={() => setSelectedRoleID(role.id)}
                    className="rounded-md"
                  >
                    <Badge>{role.key}</Badge>
                  </button>
                ),
              },
            ]}
            items={roleItems}
          />
        ) : (
          <EmptyState title={m.roles.noRolesTitle} description={m.roles.noRolesDescription} />
        )}
        <div className="mt-4 space-y-2">
          <Pagination page={page} pageSize={pageSize} total={total || roleItems.length} />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
              {m.common.prev}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page * pageSize >= total}
              onClick={() => setPage((current) => current + 1)}
            >
              {m.common.next}
            </Button>
          </div>
        </div>
      </SurfacePanel>
      {message ? <Toast tone={tone} title={m.roles.feedbackTitle} description={message} /> : null}
    </AdminPageLayout>
  );
}
