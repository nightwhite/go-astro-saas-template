import { useEffect, useMemo, useState } from "react";
import {
  AdminPageLayout,
  Badge,
  Button,
  Checkbox,
  ConfirmDialog,
  DataTable,
  Dialog,
  Drawer,
  FilterBar,
  Input,
  Pagination,
  PermissionGuard,
  Radio,
  Switch,
  Textarea,
  Toast,
} from "@repo/ui";
import { adminPermissionGroups, visibleAdminNavigation } from "@/features/admin/runtime/metadata";

const defaultPermissions = ["admin.dashboard.read", "admin.users.read"];

export function UITestHarness() {
  const [searchEmail, setSearchEmail] = useState("ops@example.com");
  const [formEmail, setFormEmail] = useState("ops@example.com");
  const [notes, setNotes] = useState("waiting for release");
  const [remember, setRemember] = useState(true);
  const [channel, setChannel] = useState("email");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [permissions, setPermissions] = useState<string[]>(defaultPermissions);
  const [status, setStatus] = useState("Not submitted");
  const [hydrated, setHydrated] = useState(false);
  const visibleItems = useMemo(() => visibleAdminNavigation(permissions), [permissions]);
  const emailInputID = "ui-harness-email";
  const notesInputID = "ui-harness-notes";

  useEffect(() => {
    setHydrated(true);
  }, []);

  function submitForm() {
    setStatus(`Submitted: ${formEmail} / ${channel} / ${remember ? "remember-on" : "remember-off"}`);
  }

  function togglePermission(permission: string) {
    setPermissions((current) =>
      current.includes(permission) ? current.filter((item) => item !== permission) : [...current, permission],
    );
  }

  return (
    <AdminPageLayout
      section="Testing"
      title="UI Test Harness"
      description="Frontend fixture for component, form, and permission behavior checks."
    >
      <p data-testid="ui-harness-ready" className="sr-only">
        {hydrated ? "ready" : "pending"}
      </p>
      <FilterBar>
        <Input
          label="Search email"
          value={searchEmail}
          onChange={(event) => setSearchEmail(event.currentTarget.value)}
          placeholder="ops@example.com"
        />
        <Input label="Channel" value={channel} readOnly />
        <Button data-testid="open-dialog" onClick={() => setDialogOpen((value) => !value)}>
          Toggle Dialog
        </Button>
        <Button data-testid="open-drawer" variant="secondary" onClick={() => setDrawerOpen((value) => !value)}>
          Toggle Drawer
        </Button>
      </FilterBar>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">Form State</h2>
            <p className="mt-2 text-sm text-muted-foreground">Covers input, radio, checkbox, and state transitions.</p>
            <div className="mt-5 grid gap-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Notify Email</span>
                <Input
                  id={emailInputID}
                  aria-label="Notify Email"
                  value={formEmail}
                  onChange={(event) => setFormEmail(event.currentTarget.value)}
                  data-testid="form-email"
                />
                <span className="block text-xs text-muted-foreground">Used to simulate settings form submit.</span>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-foreground">Release Notes</span>
                <Textarea
                  id={notesInputID}
                  aria-label="Release Notes"
                  value={notes}
                  onChange={(event) => setNotes(event.currentTarget.value)}
                  data-testid="form-notes"
                />
                <span className="block text-xs text-muted-foreground">Covers textarea update and echo.</span>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <Checkbox
                  label="Remember Session"
                  hint="Affects submit summary output."
                  checked={remember}
                  onChange={(event) => setRemember(event.currentTarget.checked)}
                />
                <Switch
                  checked={remember}
                  label="Remember Mirror"
                  hint="Preview switch visual style."
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Radio
                  label="Email Channel"
                  hint="Email notification"
                  name="channel"
                  checked={channel === "email"}
                  onChange={() => setChannel("email")}
                />
                <Radio
                  label="Webhook Channel"
                  hint="Webhook notification"
                  name="channel"
                  checked={channel === "webhook"}
                  onChange={() => setChannel("webhook")}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <Button data-testid="submit-form" onClick={submitForm}>
                  Submit form
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchEmail("ops@example.com");
                    setFormEmail("ops@example.com");
                    setNotes("waiting for release");
                    setRemember(true);
                    setChannel("email");
                    setStatus("Reset");
                  }}
                >
                  Reset state
                </Button>
              </div>
              <p data-testid="form-status" className="text-sm font-medium text-foreground">
                {status}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">Data Table</h2>
            <p className="mt-2 text-sm text-muted-foreground">Covers badge/table/list baseline styles.</p>
            <div className="mt-5">
              <DataTable
                columns={[
                  {
                    key: "module",
                    title: "Module",
                    render: (item: { module: string }) => item.module,
                  },
                  {
                    key: "status",
                    title: "Status",
                    render: (item: { status: string }) => (
                      <Badge tone={item.status === "ready" ? "success" : "brand"}>{item.status}</Badge>
                    ),
                  },
                ]}
                items={[
                  { module: "users", status: "ready" },
                  { module: "audit", status: "review" },
                ]}
              />
            </div>
            <div className="mt-4">
              <Pagination page={1} pageSize={10} total={22} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-card-foreground">Permission Guard</h2>
            <p className="mt-2 text-sm text-muted-foreground">Covers visible navigation and permission fallback.</p>
            <div className="mt-5 grid gap-3">
              <Checkbox
                label="Dashboard Permission"
                checked={permissions.includes("admin.dashboard.read")}
                onChange={() => togglePermission("admin.dashboard.read")}
              />
              <Checkbox
                label="Users Permission"
                checked={permissions.includes("admin.users.read")}
                onChange={() => togglePermission("admin.users.read")}
              />
              <Checkbox
                label="Settings Permission"
                checked={permissions.includes("admin.settings.read")}
                onChange={() => togglePermission("admin.settings.read")}
              />
            </div>
            <div className="mt-5 space-y-3">
              <div data-testid="visible-nav">
                {visibleItems.map((item) => (
                  <Badge key={item.href} tone="neutral" className="mr-2">
                    {item.label}
                  </Badge>
                ))}
              </div>
              <div data-testid="permission-groups" className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {Object.entries(adminPermissionGroups)
                  .map(([group, keys]) => `${group}:${keys.join("|")}`)
                  .join(" ; ")}
              </div>
              <PermissionGuard
                permissions={permissions}
                require="admin.settings.read"
                fallback={
                  <p data-testid="settings-fallback" className="text-sm text-muted-foreground">
                    settings hidden
                  </p>
                }
              >
                <div data-testid="settings-panel" className="rounded-md border border-border bg-muted/40 px-4 py-3 text-sm text-foreground">
                  settings visible
                </div>
              </PermissionGuard>
            </div>
          </div>

          {dialogOpen ? (
            <Dialog title="Dialog Preview" description="Preview dialog structure used in automation checks.">
              <p data-testid="dialog-content" className="text-sm text-muted-foreground">
                dialog body ready
              </p>
            </Dialog>
          ) : null}

          {drawerOpen ? (
            <Drawer title="Drawer Preview" description="Preview drawer structure used in automation checks.">
              <p data-testid="drawer-content" className="text-sm text-sidebar-foreground/80">
                drawer body ready
              </p>
            </Drawer>
          ) : null}

          <ConfirmDialog title="Confirm Preview" description="Preview confirm dialog actions and description.">
            <p data-testid="confirm-content" className="text-sm text-muted-foreground">
              confirm body ready
            </p>
          </ConfirmDialog>

          <Toast
            title="Action succeeded"
            description="Feedback component semantics preview."
            tone="success"
          />
        </div>
      </section>
    </AdminPageLayout>
  );
}
