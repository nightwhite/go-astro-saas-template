import { test, expect } from "@playwright/test";

test("admin dashboard renders", async ({ page }) => {
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Dashboard" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "No overview data" })).toBeVisible();
});

test("client home renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Production-Ready SaaS Template")).toBeVisible();
});

test("blog routes render", async ({ page }) => {
  await page.goto("/blog");
  await expect(page.getByRole("heading", { name: /Blog|博客|ブログ/ }).first()).toBeVisible();
  await expect(page.getByText(/No published posts|暂无|記事はありません/i).first()).toBeVisible();

  await page.goto("/blog/quickstart-go-astro-template");
  await expect(page).toHaveURL(/\/blog\/quickstart-go-astro-template$/);
});

test("chat route is removed", async ({ page }) => {
  await page.goto("/chat");
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByText(/Not Found/i)).toBeVisible();
});

test("theme toggle applies and persists across routes", async ({ page }) => {
  await page.goto("/");

  const topThemeSwitch = page.getByRole("button", { name: /Theme|主题|テーマ/i }).first();

  await topThemeSwitch.click();
  await page.getByRole("menuitem", { name: /Light|浅色|ライト/i }).first().click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.className))
    .not.toContain("dark");
  await expect
    .poll(async () => page.evaluate(() => window.localStorage.getItem("theme")))
    .toBe("light");

  await page.goto("/dashboard");
  const dashboardThemeSwitch = page.getByRole("button", { name: /Theme|主题|テーマ/i }).first();
  await dashboardThemeSwitch.click();
  await page.getByRole("menuitem", { name: /Dark|深色|ダーク/i }).first().click();
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.className))
    .toContain("dark");
  await expect
    .poll(async () => page.evaluate(() => window.localStorage.getItem("theme")))
    .toBe("dark");

  await page.goto("/about");
  await expect
    .poll(async () => page.evaluate(() => document.documentElement.className))
    .toContain("dark");
});

test("preview blog route renders with token", async ({ page }) => {
  await page.goto("/preview/blog?token=quickstart-go-astro&lang=en");
  await expect(page.getByText(/Not Found|Missing token/i).first()).toBeVisible();
});

test("account shell renders", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/dashboard\/account$/);
  await expect(page.locator("main h1").first()).toContainText(/Account|账户|アカウント/i);
});

test("account route redirects into dashboard shell", async ({ page }) => {
  await page.goto("/account");
  await expect(page).toHaveURL(/\/dashboard\/account$/);
  await expect(page.locator("main h1").first()).toContainText(/Account|账户|アカウント/i);
});

test("locale switch keeps current client-routed path", async ({ page }) => {
  await page.goto("/");
  const homeLocaleSwitch = page.getByRole("button", { name: /Language|语言|言語/i }).first();
  await homeLocaleSwitch.click();
  const zhOptionFromHome = page.getByRole("menuitem", { name: /Chinese|中文|中国語|日文/i }).first();
  await expect(zhOptionFromHome).toBeVisible();
  await zhOptionFromHome.click();
  await expect(page).toHaveURL(/\/$/);

  await page.goto("/settings/sessions");
  const dashboardLocaleSwitch = page.getByRole("button", { name: /Language|语言|言語/i }).first();
  await expect(dashboardLocaleSwitch).toBeVisible();
  await expect(page).toHaveURL(/\/dashboard\/settings\/sessions$/);
});

test("auth form interaction shows failure state without backend", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByPlaceholder("name@example.com").fill("admin@example.com");
  await page.getByPlaceholder("••••••••").fill("admin123456");
  await page.locator("form[data-endpoint] button[type='submit']").click();
  await Promise.race([
    expect(page.locator("[data-role='error']")).toBeVisible(),
    expect(page).toHaveURL(/\/dashboard$/),
  ]);
});

test("settings sessions page renders card-style state", async ({ page }) => {
  await page.goto("/settings/sessions");
  await expect(page).toHaveURL(/\/dashboard\/settings\/sessions$/);
  await expect(page.getByRole("link", { name: "Sessions" })).toBeVisible();
  await expect(
    page.getByText(/No active sessions|Active session|会话|セッション/i).first(),
  ).toBeVisible();
});

test("settings security page renders passkeys section", async ({ page }) => {
  await page.goto("/settings/security");
  await expect(page).toHaveURL(/\/dashboard\/settings\/security$/);
  await expect(page.getByRole("heading", { name: /Manage passkeys|管理 Passkey|Passkey 管理/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Refresh|刷新|更新/i })).toBeVisible();
  await expect(
    page.getByText(/No passkeys found|暂无 Passkey|Passkey がありません/i).first(),
  ).toBeVisible();
});

test("ui components render on settings pages", async ({ page }) => {
  await page.goto("/admin/settings/auth");
  await expect(page.getByRole("heading", { name: "Auth Settings" }).first()).toBeVisible();
  await expect(page.locator("text=Secure Cookie")).toBeVisible();

  await page.goto("/admin/settings/site");
  await expect(page.getByRole("heading", { name: "Site Settings" }).first()).toBeVisible();
  await expect(page.getByLabel("App Name")).toBeVisible();
});

test("admin settings/files/jobs/audit routes render", async ({ page }) => {
  await page.goto("/admin/files");
  await expect(page.getByRole("heading", { name: "Files" }).first()).toBeVisible();

  await page.goto("/admin/jobs");
  await expect(page.locator("text=Job Queue")).toBeVisible();

  await page.goto("/admin/audit");
  await expect(page.getByRole("heading", { name: "Audit Logs" })).toBeVisible();

  await page.goto("/admin/settings/smtp");
  await expect(page.getByRole("heading", { name: "SMTP Settings" }).first()).toBeVisible();

  await page.goto("/admin/settings/storage");
  await expect(page.getByRole("heading", { name: "Storage Settings" }).first()).toBeVisible();

  await page.goto("/admin/settings/email-templates");
  await expect(page.getByRole("heading", { name: "Email Templates" }).first()).toBeVisible();

  await page.goto("/admin/seo");
  await expect(page.getByRole("heading", { name: "SEO" }).first()).toBeVisible();
});

test("admin list pages keep query-state in url", async ({ page }) => {
  await page.goto("/admin/users");
  await expect(page.getByRole("heading", { name: "Users" }).first()).toBeVisible();
  await page.getByLabel("Email").fill("admin@example.com");
  await expect(page.getByLabel("Email")).toHaveValue("admin@example.com");
  await expect(page.getByRole("heading", { name: "No users found" })).toBeVisible();

  await page.goto("/admin/jobs");
  await expect(page.getByRole("heading", { name: "Job Queue" })).toBeVisible();
  await page.getByPlaceholder("filter_job_type").fill("mail");
  await page.getByRole("button", { name: "Apply filters" }).first().click();
  await expect(page.getByPlaceholder("filter_job_type")).toHaveValue("mail");

  await page.goto("/admin/files");
  await expect(page.getByRole("heading", { name: "Files" }).first()).toBeVisible();
  await page.getByPlaceholder("filter_file_name").fill("demo");
  await page.getByRole("button", { name: "Apply filters" }).first().click();
  await expect(page.getByPlaceholder("filter_file_name")).toHaveValue("demo");
});

test("ui harness renders base components", async ({ page }) => {
  await page.goto("/tests/ui");
  await expect(page.getByTestId("ui-harness-ready")).toHaveText("ready");
  await expect(page.getByRole("heading", { name: "UI Test Harness" })).toBeVisible();
  await expect(page.getByText("Form State")).toBeVisible();
  await expect(page.getByText("Data Table")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Module" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "users" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "ready" })).toBeVisible();
  await expect(page.getByTestId("confirm-content")).toBeVisible();
  await expect(page.getByText("第 1 / 3 页 · 共 22 条")).toBeVisible();
  await expect(page.getByText("Action succeeded")).toBeVisible();
  await expect(page.getByTestId("permission-groups")).toContainText("roles_write:admin.roles.write");
});

test("ui harness supports form interactions", async ({ page }) => {
  await page.goto("/tests/ui");
  await expect(page.getByTestId("ui-harness-ready")).toHaveText("ready");

  await page.getByTestId("form-email").fill("release@example.com");
  await page.getByTestId("form-notes").fill("release checks done");
  await page.getByLabel("Remember Session").uncheck();
  await page.getByLabel("Webhook Channel").check();
  await page.getByTestId("submit-form").click();

  await expect(page.getByTestId("form-status")).toHaveText("Submitted: release@example.com / webhook / remember-off");
  await expect(page.getByTestId("form-email")).toHaveValue("release@example.com");
  await expect(page.getByTestId("form-notes")).toHaveValue("release checks done");
});

test("ui harness toggles permission guarded content", async ({ page }) => {
  await page.goto("/tests/ui");
  await expect(page.getByTestId("ui-harness-ready")).toHaveText("ready");

  await expect(page.getByTestId("visible-nav")).toContainText("Users");
  await expect(page.getByTestId("visible-nav")).toContainText("Users");
  await expect(page.getByTestId("visible-nav")).not.toContainText("Site");
  await expect(page.getByTestId("settings-fallback")).toBeVisible();

  await page.getByLabel("Settings Permission").check();
  await expect(page.getByTestId("settings-panel")).toBeVisible();
  await expect(page.getByTestId("visible-nav")).toContainText("Site");
  await expect(page.getByTestId("visible-nav")).toContainText("SMTP");

  await page.getByLabel("Settings Permission").uncheck();
  await expect(page.getByTestId("settings-fallback")).toBeVisible();
});

test("ui harness toggles dialog and drawer previews", async ({ page }) => {
  await page.goto("/tests/ui");
  await expect(page.getByTestId("ui-harness-ready")).toHaveText("ready");

  await expect(page.getByTestId("dialog-content")).toHaveCount(0);
  await expect(page.getByTestId("drawer-content")).toHaveCount(0);

  await page.getByTestId("open-dialog").click();
  await page.getByTestId("open-drawer").click();

  await expect(page.getByTestId("dialog-content")).toBeVisible();
  await expect(page.getByTestId("drawer-content")).toBeVisible();
});
