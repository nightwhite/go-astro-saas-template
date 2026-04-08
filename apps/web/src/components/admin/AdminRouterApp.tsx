import { useEffect, useMemo, useState } from "react";
import { Link, Route, Router, Switch } from "wouter";
import type { Locale } from "@/lib/i18n";
import { resolveClientLocale } from "@/lib/locale";
import { fetchAdminOverview, fetchUserDetail, type UserDetailRecord } from "@/lib/api/admin";
import type { AdminOverview } from "@/features/dashboard/api/admin";
import { resolveAdminPageMeta } from "@/features/admin/runtime/metadata";
import { AdminSidebar } from "@/components/admin/layout/Sidebar";
import { AdminTopbar } from "@/components/admin/layout/Topbar";
import { DashboardPage } from "@/components/admin/pages/DashboardPage";
import { UsersPage } from "@/components/admin/pages/UsersPage";
import { RolesPage } from "@/components/admin/pages/RolesPage";
import { FilesPage } from "@/components/admin/pages/FilesPage";
import { JobsPage } from "@/components/admin/pages/JobsPage";
import { AuditPage } from "@/components/admin/pages/AuditPage";
import { ObservabilityPage } from "@/components/admin/pages/ObservabilityPage";
import { BlogListPage } from "@/components/admin/pages/BlogListPage";
import { BlogCreatePage } from "@/components/admin/pages/BlogCreatePage";
import { BlogEditPage } from "@/components/admin/pages/BlogEditPage";
import { AnnouncementsPage } from "@/components/admin/pages/AnnouncementsPage";
import { SEOPage } from "@/components/admin/pages/SEOPage";
import { SettingsSMTPPage } from "@/components/admin/pages/SettingsSMTPPage";
import { SettingsStoragePage } from "@/components/admin/pages/SettingsStoragePage";
import { SiteSettingsFeature } from "@/features/settings/site/components/SiteSettingsFeature";
import { AuthSettingsFeature } from "@/features/settings/auth/components/AuthSettingsFeature";
import { EmailTemplatesFeature } from "@/features/admin/email-templates/components/EmailTemplatesFeature";
import { ProfileFeature } from "@/features/profile/components/ProfileFeature";
import { UserDetailFeature } from "@/features/users/components/UserDetailFeature";
import { loadCurrentProfile, type CurrentUserProfile } from "@/features/profile/api/profile";
import { loadRolesFeature, type RolesFeatureData } from "@/features/roles/api/roles";
import { loadFilesFeature, type FilesFeatureData } from "@/features/files/api/files";
import { loadJobsFeature, type JobsFeatureData } from "@/features/jobs/api/jobs";
import { loadAuditFeature, type AuditFeatureData } from "@/features/audit/api/audit";
import { loadBlogAdminFeature, type BlogAdminFeatureData } from "@/features/blog-admin/api/blog";
import { fetchAdminBlogPost, type BlogPostRecord } from "@/lib/api/admin";
import { adminT } from "@/lib/admin-i18n";
import { t } from "@/lib/i18n";
import { EmptyState } from "@repo/ui";

type Props = {
  locale: Locale;
  initialPath: string;
  initialSearch: string;
};

type AdminQueryState = {
  page: number;
  pageSize: number;
  filters: Record<string, string>;
};

function normalizeAdminPath(pathname: string): string {
  if (!pathname.startsWith("/admin")) return pathname;
  const next = pathname.slice("/admin".length);
  if (!next) return "/";
  return next.startsWith("/") ? next : `/${next}`;
}

function parseQuery(search: string): AdminQueryState {
  const sp = new URLSearchParams(search);
  const page = Math.max(1, Number(sp.get("page") || "1") || 1);
  const pageSize = Math.min(100, Math.max(1, Number(sp.get("page_size") || "20") || 20));
  const filters: Record<string, string> = {};
  for (const [key, value] of sp.entries()) {
    if (!key.startsWith("filter_")) continue;
    const normalized = value.trim();
    if (!normalized) continue;
    filters[key.slice("filter_".length)] = normalized;
  }
  return { page, pageSize, filters };
}

function resolveMetaPath(adminPath: string): string {
  if (adminPath.startsWith("/users/")) return "/admin/users";
  if (adminPath.startsWith("/blog/") && adminPath !== "/blog/create") return "/admin/blog/[blogID]";
  if (adminPath === "/") return "/admin";
  return `/admin${adminPath}`;
}

function NotFoundPanel(props: { locale: Locale }) {
  const common = t(props.locale).common;
  const am = adminT(props.locale);
  return (
    <div className="space-y-4">
      <EmptyState title={am.common.pageNotFoundTitle} description={am.common.pageNotFoundDescription} />
      <Link
        className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition hover:bg-accent hover:text-accent-foreground"
        href="/"
      >
        {common.admin}
      </Link>
    </div>
  );
}

function UserDetailPage(props: { id: string }) {
  const [detail, setDetail] = useState<UserDetailRecord | null>(null);
  useEffect(() => {
    void fetchUserDetail("", props.id).then(setDetail).catch(() => setDetail(null));
  }, [props.id]);
  return <UserDetailFeature detail={detail} />;
}

function BlogEditPageRoute(props: { blogID: string }) {
  const [post, setPost] = useState<BlogPostRecord | null>(null);
  useEffect(() => {
    void fetchAdminBlogPost("", props.blogID).then(setPost).catch(() => setPost(null));
  }, [props.blogID]);

  const locale = resolveClientLocale();
  const m = adminT(locale);
  if (!post) {
    return <EmptyState title={m.common.userDetailUnavailable} description={m.common.returnToUserList} />;
  }
  return <BlogEditPage post={post} />;
}

export default function AdminRouterApp(props: Props) {
  const [locationState, setLocationState] = useState(() => ({
    path: normalizeAdminPath(props.initialPath),
    search: props.initialSearch || "",
  }));
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [usersData, setUsersData] = useState<any | null>(null);
  const [rolesData, setRolesData] = useState<RolesFeatureData | null>(null);
  const [filesData, setFilesData] = useState<FilesFeatureData | null>(null);
  const [jobsData, setJobsData] = useState<JobsFeatureData | null>(null);
  const [auditData, setAuditData] = useState<AuditFeatureData | null>(null);
  const [profile, setProfile] = useState<CurrentUserProfile | null>(null);
  const [blogData, setBlogData] = useState<BlogAdminFeatureData | null>(null);

  const locale = resolveClientLocale();
  const am = adminT(locale);

  useEffect(() => {
    const update = () => {
      setLocationState({
        path: normalizeAdminPath(window.location.pathname),
        search: window.location.search || "",
      });
    };
    update();
    window.addEventListener("popstate", update);
    document.addEventListener("astro:after-swap", update as EventListener);
    document.addEventListener("astro:page-load", update as EventListener);
    return () => {
      window.removeEventListener("popstate", update);
      document.removeEventListener("astro:after-swap", update as EventListener);
      document.removeEventListener("astro:page-load", update as EventListener);
    };
  }, []);

  useEffect(() => {
    void fetchAdminOverview("").then(setOverview).catch(() => setOverview(null));
  }, [locationState.path]);

  useEffect(() => {
    const query = parseQuery(locationState.search);
    if (locationState.path === "/users") {
      void import("@/lib/api/admin").then(async ({ fetchUsers }) => {
        const next = await fetchUsers("", {
          page: query.page,
          pageSize: query.pageSize,
          sortBy: "created_at",
          sortOrder: "desc",
          filters: {
            email: query.filters.email,
            role: query.filters.role,
            status: query.filters.status,
          },
        }).catch(() => ({
          users: [],
          filters: {},
          explain: [],
          pagination: { page: 1, page_size: 20, total: 0 },
        }));
        setUsersData(next);
      });
    }
    if (locationState.path === "/roles") {
      void loadRolesFeature("", {
        page: query.page,
        pageSize: query.pageSize,
        filters: {
          key: query.filters.key || "",
          name: query.filters.name || "",
        },
      }).then(setRolesData).catch(() => setRolesData({ roles: [], page: 1, pageSize: 20, total: 0 }));
    }
    if (locationState.path === "/files") {
      void loadFilesFeature("", {
        page: query.page,
        pageSize: query.pageSize,
        filters: {
          file_name: query.filters.file_name || "",
          content_type: query.filters.content_type || "",
        },
      }).then(setFilesData).catch(() => setFilesData({ files: [], explain: [], filters: {}, page: 1, pageSize: 20, total: 0 }));
    }
    if (locationState.path === "/jobs") {
      void loadJobsFeature("", {
        page: query.page,
        pageSize: query.pageSize,
        filters: {
          job_type: query.filters.job_type || "",
          status: query.filters.status || "",
          queue: query.filters.queue || "",
        },
      }).then(setJobsData).catch(() => setJobsData({ jobs: [], explain: [], filters: {}, page: 1, pageSize: 20, total: 0 }));
    }
    if (locationState.path === "/audit") {
      void loadAuditFeature("", {
        page: query.page,
        pageSize: query.pageSize,
        filters: {
          actor_email: query.filters.actor_email || "",
          action: query.filters.action || "",
          resource: query.filters.resource || "",
        },
      }).then(setAuditData).catch(() => setAuditData({ logs: [], explain: [], filters: {}, page: 1, pageSize: 20, total: 0 }));
    }
    if (locationState.path === "/profile") {
      void loadCurrentProfile().then(setProfile).catch(() => setProfile(null));
    }
    if (locationState.path === "/blog") {
      void loadBlogAdminFeature("", {
        page: query.page,
        pageSize: query.pageSize,
        filters: {
          slug: query.filters.slug || "",
          status: query.filters.status || "",
          lang: query.filters.lang || "",
        },
      }).then(setBlogData).catch(() =>
        setBlogData({ posts: [], explain: [], filters: {}, page: 1, pageSize: 20, total: 0 }),
      );
    }
  }, [locationState.path, locationState.search]);

  const meta = useMemo(() => resolveAdminPageMeta(resolveMetaPath(locationState.path), locale), [locationState.path, locale]);
  const currentPath = useMemo(() => `/admin${locationState.path === "/" ? "" : locationState.path}`, [locationState.path]);

  return (
    <Router base="/admin" ssrPath={props.initialPath} ssrSearch={props.initialSearch}>
      <div className="min-h-svh bg-background text-foreground">
        <div className="flex min-h-svh">
          <AdminSidebar
            currentPath={currentPath}
            permissions={overview?.permissions ?? []}
            tenantID={overview?.viewer.tenant_id ?? "default"}
            currentRole={overview?.viewer.role ?? "guest"}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <AdminTopbar breadcrumb={meta.breadcrumb} />
            <main className="min-h-0 flex-1 overflow-auto p-4 md:p-6 lg:p-8">
              <Switch>
                <Route path="/">
                  <DashboardPage overview={overview} />
                </Route>
                <Route path="/users">
                  <UsersPage overview={overview} data={usersData ?? undefined} />
                </Route>
                <Route path="/users/:id">
                  {(params) => <UserDetailPage id={params.id} />}
                </Route>
                <Route path="/roles">
                  {rolesData ? <RolesPage data={rolesData} /> : <EmptyState title={am.sidebar.items.Roles} description={am.common.loading} />}
                </Route>
                <Route path="/files">
                  {filesData ? <FilesPage data={filesData} /> : <EmptyState title={am.sidebar.items.Files} description={am.common.loading} />}
                </Route>
                <Route path="/jobs">
                  {jobsData ? <JobsPage data={jobsData} /> : <EmptyState title={am.sidebar.items.Jobs} description={am.common.loading} />}
                </Route>
                <Route path="/audit">
                  {auditData ? <AuditPage data={auditData} /> : <EmptyState title={am.sidebar.items.Audit} description={am.common.loading} />}
                </Route>
                <Route path="/observability">
                  <ObservabilityPage overview={overview} />
                </Route>
                <Route path="/blog">
                  {blogData ? <BlogListPage data={blogData} /> : <EmptyState title={am.sidebar.items.Blog} description={am.common.loading} />}
                </Route>
                <Route path="/announcements">
                  <AnnouncementsPage />
                </Route>
                <Route path="/seo">
                  <SEOPage />
                </Route>
                <Route path="/blog/create">
                  <BlogCreatePage />
                </Route>
                <Route path="/blog/:blogID">
                  {(params) => <BlogEditPageRoute blogID={params.blogID} />}
                </Route>
                <Route path="/settings/site">
                  <SiteSettingsFeature />
                </Route>
                <Route path="/settings/auth">
                  <AuthSettingsFeature />
                </Route>
                <Route path="/settings/smtp">
                  <SettingsSMTPPage />
                </Route>
                <Route path="/settings/storage">
                  <SettingsStoragePage />
                </Route>
                <Route path="/settings/email-templates">
                  <EmailTemplatesFeature />
                </Route>
                <Route path="/profile">
                  <ProfileFeature profile={profile} />
                </Route>
                <Route>
                  <NotFoundPanel locale={locale} />
                </Route>
              </Switch>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}
