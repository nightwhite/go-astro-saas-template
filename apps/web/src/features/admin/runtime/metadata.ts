import { adminT } from "@/lib/admin-i18n";
import { t, type Locale } from "@/lib/i18n";

export interface AdminNavItem {
  href: string;
  label: string;
  match: string;
  permission: string;
  description: string;
}

export interface AdminPageMetadata {
  title: string;
  description: string;
  breadcrumb: string[];
  section: string;
}

export const adminNavigation: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", match: "/admin", permission: "admin.dashboard.read", description: "Overview and quick operations" },
  { href: "/admin/blog", label: "Blog", match: "/admin/blog", permission: "admin.blog.read", description: "Posts, translations, and preview links" },
  { href: "/admin/announcements", label: "Announcements", match: "/admin/announcements", permission: "admin.blog.read", description: "Announcement templates and publishing status" },
  { href: "/admin/seo", label: "SEO", match: "/admin/seo", permission: "admin.settings.read", description: "SEO and metadata defaults" },
  { href: "/admin/users", label: "Users", match: "/admin/users", permission: "admin.users.read", description: "Browse and manage users" },
  { href: "/admin/roles", label: "Roles", match: "/admin/roles", permission: "admin.roles.read", description: "Role bindings and permissions" },
  { href: "/admin/files", label: "Files", match: "/admin/files", permission: "admin.files.read", description: "Storage objects and upload policy" },
  { href: "/admin/jobs", label: "Jobs", match: "/admin/jobs", permission: "admin.jobs.read", description: "Queue and worker execution records" },
  { href: "/admin/audit", label: "Audit", match: "/admin/audit", permission: "admin.audit.read", description: "Security and operation trails" },
  { href: "/admin/observability", label: "Observability", match: "/admin/observability", permission: "admin.dashboard.read", description: "Metrics and runtime health" },
  { href: "/admin/settings/site", label: "Site", match: "/admin/settings/site", permission: "admin.settings.read", description: "Application identity and origin" },
  { href: "/admin/settings/auth", label: "Auth", match: "/admin/settings/auth", permission: "admin.settings.read", description: "Session and auth policy" },
  { href: "/admin/settings/smtp", label: "SMTP", match: "/admin/settings/smtp", permission: "admin.settings.read", description: "Mail transport and templates" },
  { href: "/admin/settings/email-templates", label: "Email Templates", match: "/admin/settings/email-templates", permission: "admin.settings.read", description: "Template content and preview" },
  { href: "/admin/settings/storage", label: "Storage", match: "/admin/settings/storage", permission: "admin.settings.read", description: "R2 style object storage config" },
  { href: "/admin/profile", label: "Profile", match: "/admin/profile", permission: "admin.dashboard.read", description: "Current account and sessions" },
];

export const adminPermissionGroups: Record<string, string[]> = {
  dashboard: ["admin.dashboard.read"],
  users_read: ["admin.users.read"],
  users_write: ["admin.users.write"],
  roles_read: ["admin.roles.read"],
  roles_write: ["admin.roles.write"],
  files_read: ["admin.files.read"],
  files_write: ["admin.files.write"],
  jobs_read: ["admin.jobs.read"],
  audit_read: ["admin.audit.read"],
  blog_read: ["admin.blog.read"],
  blog_write: ["admin.blog.write"],
  settings_read: ["admin.settings.read"],
  settings_write: ["admin.settings.write"],
};

export const adminPageMeta: Record<string, AdminPageMetadata> = {
  "/admin": {
    title: "Dashboard",
    description: "Overview, key counters, and operational entry points.",
    breadcrumb: ["Admin"],
    section: "Admin",
  },
  "/admin/users": {
    title: "Users",
    description: "List, create, and maintain users.",
    breadcrumb: ["Admin", "Users"],
    section: "Users",
  },
  "/admin/seo": {
    title: "SEO",
    description: "Manage site SEO defaults and structured metadata.",
    breadcrumb: ["Admin", "SEO"],
    section: "SEO",
  },
  "/admin/blog": {
    title: "Blog",
    description: "Manage posts, translations, and preview links.",
    breadcrumb: ["Admin", "Blog"],
    section: "Blog",
  },
  "/admin/announcements": {
    title: "Announcements",
    description: "Reusable module demo for announcement publishing.",
    breadcrumb: ["Admin", "Announcements"],
    section: "Blog",
  },
  "/admin/blog/create": {
    title: "Create Blog Post",
    description: "Create a post skeleton then edit translations.",
    breadcrumb: ["Admin", "Blog", "Create"],
    section: "Blog",
  },
  "/admin/blog/[blogID]": {
    title: "Edit Blog Post",
    description: "Edit blog metadata, localized content, and publish state.",
    breadcrumb: ["Admin", "Blog", "Detail"],
    section: "Blog",
  },
  "/admin/roles": {
    title: "Roles",
    description: "Configure role permissions and user bindings.",
    breadcrumb: ["Admin", "Roles"],
    section: "Roles",
  },
  "/admin/files": {
    title: "Files",
    description: "Object metadata, upload endpoints, and cleanup strategy.",
    breadcrumb: ["Admin", "Files"],
    section: "Files",
  },
  "/admin/jobs": {
    title: "Jobs",
    description: "Queue tasks, retries, and execution history.",
    breadcrumb: ["Admin", "Jobs"],
    section: "Jobs",
  },
  "/admin/audit": {
    title: "Audit",
    description: "Operation logs and security events.",
    breadcrumb: ["Admin", "Audit"],
    section: "Audit",
  },
  "/admin/observability": {
    title: "Observability",
    description: "Runtime metrics and health endpoints.",
    breadcrumb: ["Admin", "Observability"],
    section: "Observability",
  },
  "/admin/profile": {
    title: "Profile",
    description: "Current account profile and security actions.",
    breadcrumb: ["Admin", "Profile"],
    section: "Profile",
  },
  "/admin/settings/site": {
    title: "Site Settings",
    description: "Site identity, base URL, and allowed origins.",
    breadcrumb: ["Admin", "Settings", "Site"],
    section: "Settings",
  },
  "/admin/settings/auth": {
    title: "Auth Settings",
    description: "Auth and session defaults.",
    breadcrumb: ["Admin", "Settings", "Auth"],
    section: "Settings",
  },
  "/admin/settings/smtp": {
    title: "SMTP Settings",
    description: "SMTP transport and delivery tests.",
    breadcrumb: ["Admin", "Settings", "SMTP"],
    section: "Settings",
  },
  "/admin/settings/email-templates": {
    title: "Email Templates",
    description: "Template editor, preview, and test send.",
    breadcrumb: ["Admin", "Settings", "Email Templates"],
    section: "Settings",
  },
  "/admin/settings/storage": {
    title: "Storage Settings",
    description: "Storage endpoint, bucket, and presign policy.",
    breadcrumb: ["Admin", "Settings", "Storage"],
    section: "Settings",
  },
};

function defaultAdminMeta(): AdminPageMetadata {
  return {
    title: "Admin",
    description: "Admin panel",
    breadcrumb: ["Admin"],
    section: "Admin",
  };
}

function blogLabelByLocale(locale: Locale): string {
  if (locale === "zh") return "博客";
  if (locale === "ja") return "ブログ";
  return "Blog";
}

function createLabelByLocale(locale: Locale): string {
  if (locale === "zh") return "创建";
  if (locale === "ja") return "作成";
  return "Create";
}

export function resolveAdminPageMeta(pathname: string, locale?: Locale): AdminPageMetadata {
  const normalizedPath = pathname.startsWith("/admin/blog/") && pathname !== "/admin/blog/create" ? "/admin/blog/[blogID]" : pathname;
  const base = adminPageMeta[normalizedPath] ?? defaultAdminMeta();
  const normalizedBase = adminPageMeta[normalizedPath] ?? base;
  if (!locale) return base;

  const common = t(locale).common;
  const m = adminT(locale);
  const byPath: Record<string, Pick<AdminPageMetadata, "title" | "description" | "section">> = {
    "/admin": {
      title: m.dashboard.title,
      description: m.dashboard.description,
      section: m.dashboard.section,
    },
    "/admin/users": {
      title: m.users.title,
      description: m.users.description,
      section: m.users.section,
    },
    "/admin/seo": {
      title: m.sidebar.items.SEO,
      description: m.seo.description,
      section: m.sidebar.items.SEO,
    },
    "/admin/blog": {
      title: blogLabelByLocale(locale),
      description: locale === "zh"
        ? "管理文章、翻译与预览链接。"
        : locale === "ja"
          ? "記事、翻訳、プレビューリンクを管理します。"
          : "Manage posts, translations, and preview links.",
      section: blogLabelByLocale(locale),
    },
    "/admin/announcements": {
      title: m.announcements.title,
      description: m.announcements.description,
      section: blogLabelByLocale(locale),
    },
    "/admin/blog/create": {
      title: locale === "zh" ? "创建博客文章" : locale === "ja" ? "ブログ記事を作成" : "Create Blog Post",
      description: locale === "zh"
        ? "先创建文章，再编辑多语言内容。"
        : locale === "ja"
          ? "記事を作成してから多言語内容を編集します。"
          : "Create a post skeleton then edit translations.",
      section: blogLabelByLocale(locale),
    },
    "/admin/blog/[blogID]": {
      title: locale === "zh" ? "编辑博客文章" : locale === "ja" ? "ブログ記事を編集" : "Edit Blog Post",
      description: locale === "zh"
        ? "编辑文章元数据、翻译内容与发布状态。"
        : locale === "ja"
          ? "記事メタデータ、翻訳、公開状態を編集します。"
          : "Edit blog metadata, localized content, and publish state.",
      section: blogLabelByLocale(locale),
    },
    "/admin/roles": {
      title: m.roles.title,
      description: m.roles.description,
      section: m.roles.section,
    },
    "/admin/files": {
      title: m.files.title,
      description: m.files.description,
      section: m.sidebar.items.Files,
    },
    "/admin/jobs": {
      title: m.jobs.title,
      description: m.jobs.description,
      section: m.jobs.section,
    },
    "/admin/audit": {
      title: m.audit.title,
      description: m.audit.description,
      section: m.audit.section,
    },
    "/admin/observability": {
      title: m.observability.title,
      description: m.observability.description,
      section: m.observability.section,
    },
    "/admin/profile": {
      title: m.sidebar.items.Profile,
      description: base.description,
      section: m.sidebar.items.Profile,
    },
    "/admin/settings/site": {
      title: m.settingsSite.title,
      description: m.settingsSite.description,
      section: common.settings,
    },
    "/admin/settings/auth": {
      title: m.settingsAuth.title,
      description: m.settingsAuth.description,
      section: common.settings,
    },
    "/admin/settings/smtp": {
      title: m.settingsSMTP.title,
      description: m.settingsSMTP.description,
      section: common.settings,
    },
    "/admin/settings/email-templates": {
      title: m.emailTemplates.title,
      description: m.emailTemplates.description,
      section: common.settings,
    },
    "/admin/settings/storage": {
      title: m.settingsStorage.title,
      description: m.settingsStorage.description,
      section: common.settings,
    },
  };

  const breadcrumbMap: Record<string, string> = {
    Admin: common.admin,
    Dashboard: m.sidebar.items.Dashboard,
    Blog: blogLabelByLocale(locale),
    Announcements: m.announcements.title,
    Users: m.sidebar.items.Users,
    SEO: m.sidebar.items.SEO,
    Roles: m.sidebar.items.Roles,
    Files: m.sidebar.items.Files,
    Jobs: m.sidebar.items.Jobs,
    Audit: m.sidebar.items.Audit,
    Observability: m.sidebar.items.Observability,
    Settings: common.settings,
    Site: m.sidebar.items.Site,
    Auth: m.sidebar.items.Auth,
    SMTP: m.sidebar.items.SMTP,
    "Email Templates": m.sidebar.items["Email Templates"],
    Storage: m.sidebar.items.Storage,
    Profile: m.sidebar.items.Profile,
    Create: createLabelByLocale(locale),
    Detail: m.common.details,
  };

  const localized = byPath[normalizedPath] ?? {
    title: common.admin,
    description: "Admin panel",
    section: common.admin,
  };

  return {
    ...normalizedBase,
    ...localized,
    breadcrumb: normalizedBase.breadcrumb.map((item) => breadcrumbMap[item] ?? item),
  };
}

export function visibleAdminNavigation(permissions: string[]) {
  return adminNavigation.filter((item) => permissions.includes(item.permission));
}
