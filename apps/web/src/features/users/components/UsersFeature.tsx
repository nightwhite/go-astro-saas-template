import { useEffect, useMemo, useState } from "react";
import {
  AdminPageLayout,
  Badge,
  Button,
  DataTable,
  EmptyState,
  FilterBar,
  Input,
  Pagination,
  SurfacePanel,
  Toast,
} from "@repo/ui";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import { createUser, deleteUser, fetchUsers, resetUserPassword, updateUser } from "@/lib/api/admin";
import { getAPIBaseURL } from "@/lib/api/runtime";
import { MoreHorizontal } from "lucide-react";
import { adminT } from "@/lib/admin-i18n";
import { resolveClientLocale } from "@/lib/locale";
import { Link } from "wouter";

interface UsersFeatureProps {
  overview: AdminOverview | null;
  data?: UsersFeatureInitialData;
}

export interface UsersFeatureInitialData {
  users: Array<{
    id: string;
    tenant_id: string;
    email: string;
    display_name: string;
    role: string;
    status: string;
    created_at: string;
  }>;
  filters: Record<string, string>;
  explain: string[];
  pagination?: { page: number; page_size: number; total: number };
}

export function UsersFeature({ overview, data }: UsersFeatureProps) {
  const locale = resolveClientLocale();
  const m = adminT(locale);
  const baseURL = getAPIBaseURL();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<"success" | "warning">("success");
  const [users, setUsers] = useState(data?.users ?? overview?.users ?? []);
  const [page, setPage] = useState(data?.pagination?.page ?? 1);
  const [pageSize] = useState(data?.pagination?.page_size ?? 20);
  const [total, setTotal] = useState(data?.pagination?.total ?? data?.users.length ?? overview?.users.length ?? 0);
  const [loading, setLoading] = useState(false);
  const [explain, setExplain] = useState<string[]>(data?.explain ?? []);
  const [filterEmail, setFilterEmail] = useState(data?.filters?.email ?? "");
  const [creating, setCreating] = useState(false);
  const [roleFilter, setRoleFilter] = useState(data?.filters?.role ?? "");
  const [statusFilter, setStatusFilter] = useState(data?.filters?.status ?? "");

  function syncURL(nextPage: number, nextEmail: string, nextRole: string, nextStatus: string) {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    params.set("page_size", String(pageSize));
    if (nextEmail.trim()) params.set("filter_email", nextEmail.trim());
    if (nextRole.trim()) params.set("filter_role", nextRole.trim());
    if (nextStatus.trim()) params.set("filter_status", nextStatus.trim());
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchUsers(baseURL, {
          page,
          pageSize,
          sortBy: "created_at",
          sortOrder: "desc",
          filters: {
            email: filterEmail || undefined,
            role: roleFilter || undefined,
            status: statusFilter || undefined,
          },
        });
        if (cancelled) return;
        setUsers(response.users);
        setTotal(response.pagination?.total ?? response.users.length);
        setExplain(response.explain);
        syncURL(response.pagination?.page ?? page, filterEmail, roleFilter, statusFilter);
      } catch {
        if (!cancelled) {
          setMessage(m.users.failedLoad);
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
  }, [baseURL, filterEmail, page, pageSize, roleFilter, statusFilter]);

  const filteredUsers = useMemo(() => users, [users]);

  async function handleCreateDemoUser() {
    setCreating(true);
    const email = `member_${Date.now()}@example.com`;
    try {
      const response = await createUser(baseURL, {
        email,
        display_name: "Template Member",
        password: "member123456",
        role: "member",
      });
      setUsers((current) => [response.data.user, ...current]);
      setMessage(`${m.users.createdUser} ${email}`);
      setTone("success");
    } catch {
      setMessage(m.users.failedCreate);
      setTone("warning");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleStatus(userID: string, nextStatus: "active" | "inactive") {
    try {
      const response = await updateUser(baseURL, {
        user_id: userID,
        status: nextStatus,
      });
      setUsers((current) => current.map((item) => (item.id === userID ? response.data.user : item)));
      setMessage(`${m.users.statusUpdated} ${nextStatus}`);
      setTone("success");
    } catch {
      setMessage(m.users.failedStatus);
      setTone("warning");
    }
  }

  async function handleResetPassword(userID: string) {
    try {
      await resetUserPassword(baseURL, userID, "member123456");
      setMessage(m.users.resetSuccess);
      setTone("success");
    } catch {
      setMessage(m.users.failedResetPassword);
      setTone("warning");
    }
  }

  async function handleDelete(userID: string) {
    try {
      await deleteUser(baseURL, userID);
      setUsers((current) => current.filter((item) => item.id !== userID));
      setMessage(m.users.deleted);
      setTone("success");
    } catch {
      setMessage(m.users.failedDelete);
      setTone("warning");
    }
  }

  return (
    <AdminPageLayout
      section={m.users.section}
      title={m.users.title}
      description={m.users.description}
    >
      <FilterBar>
        <Input
          label={m.users.filters.email}
          placeholder={m.users.filters.emailPlaceholder}
          value={filterEmail}
          onChange={(event) => {
            const nextEmail = event.currentTarget.value;
            setPage(1);
            setFilterEmail(nextEmail);
            syncURL(1, nextEmail, roleFilter, statusFilter);
          }}
        />
        <Input
          label={m.users.filters.role}
          placeholder={m.users.filters.rolePlaceholder}
          value={roleFilter}
          onChange={(event) => {
            const nextRole = event.currentTarget.value;
            setPage(1);
            setRoleFilter(nextRole);
            syncURL(1, filterEmail, nextRole, statusFilter);
          }}
        />
        <Input
          label={m.users.filters.status}
          placeholder={m.users.filters.statusPlaceholder}
          value={statusFilter}
          onChange={(event) => {
            const nextStatus = event.currentTarget.value;
            setPage(1);
            setStatusFilter(nextStatus);
            syncURL(1, filterEmail, roleFilter, nextStatus);
          }}
        />
        <Button onClick={() => void handleCreateDemoUser()} disabled={creating}>
          {creating ? m.users.creating : m.users.createDemoUser}
        </Button>
      </FilterBar>

      <SurfacePanel title={m.users.panelTitle} description={m.users.panelDescription}>
        {loading ? (
          <p className="text-sm text-muted-foreground">{m.users.loading}</p>
        ) : filteredUsers.length ? (
          <DataTable
            columns={[
              {
                key: "user",
                title: m.users.columns.user,
                render: (user) => (
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{user.display_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                ),
              },
              {
                key: "role",
                title: m.users.columns.role,
                render: (user) => <Badge tone="brand">{user.role}</Badge>,
              },
              {
                key: "status",
                title: m.users.columns.status,
                render: (user) => <Badge tone={user.status === "active" ? "success" : "warning"}>{user.status}</Badge>,
              },
              {
                key: "actions",
                title: m.users.columns.actions,
                render: (user) => (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
                      href={`/users/${encodeURIComponent(user.id)}`}
                    >
                      {m.users.actionButtons.details}
                    </Link>
                    <Button size="icon" variant="ghost" aria-label="open-actions" title={user.id}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void handleToggleStatus(user.id, user.status === "active" ? "inactive" : "active")}
                    >
                      {m.users.actionButtons.toggleStatus}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void handleResetPassword(user.id)}>
                      {m.users.actionButtons.resetPassword}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => void handleDelete(user.id)}>
                      {m.users.actionButtons.delete}
                    </Button>
                  </div>
                ),
              },
            ]}
            items={filteredUsers}
          />
        ) : (
          <EmptyState title={m.users.noUsersTitle} description={m.users.noUsersDescription} />
        )}
        <div className="mt-4 space-y-2">
          <Pagination page={page} pageSize={pageSize} total={total || filteredUsers.length} />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) => {
                  const nextPage = Math.max(1, current - 1);
                  syncURL(nextPage, filterEmail, roleFilter, statusFilter);
                  return nextPage;
                })
              }
            >
              {m.users.paginationPrev}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={page * pageSize >= total}
              onClick={() =>
                setPage((current) => {
                  const nextPage = current + 1;
                  syncURL(nextPage, filterEmail, roleFilter, statusFilter);
                  return nextPage;
                })
              }
            >
              {m.users.paginationNext}
            </Button>
          </div>
          {explain.length ? <p className="text-xs text-muted-foreground">{m.users.explainPrefix}: {explain.join(" | ")}</p> : null}
        </div>
      </SurfacePanel>
      {message ? <Toast title={m.users.feedbackTitle} description={message} tone={tone} /> : null}
    </AdminPageLayout>
  );
}
