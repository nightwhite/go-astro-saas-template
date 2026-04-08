package routes

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

type settingsStubAuthHandler struct{}

func (settingsStubAuthHandler) Login(*gin.Context)                  {}
func (settingsStubAuthHandler) Register(*gin.Context)               {}
func (settingsStubAuthHandler) Refresh(*gin.Context)                {}
func (settingsStubAuthHandler) Me(*gin.Context)                     {}
func (settingsStubAuthHandler) CSRF(*gin.Context)                   {}
func (settingsStubAuthHandler) GoogleSSOStart(*gin.Context)         {}
func (settingsStubAuthHandler) GoogleSSOCallback(*gin.Context)      {}
func (settingsStubAuthHandler) PasskeyRegisterOptions(*gin.Context) {}
func (settingsStubAuthHandler) PasskeyRegisterVerify(*gin.Context)  {}
func (settingsStubAuthHandler) PasskeyLoginOptions(*gin.Context)    {}
func (settingsStubAuthHandler) PasskeyLoginVerify(*gin.Context)     {}
func (settingsStubAuthHandler) Logout(*gin.Context)                 {}
func (settingsStubAuthHandler) LogoutAll(*gin.Context)              {}
func (settingsStubAuthHandler) ForgotPassword(*gin.Context)         {}
func (settingsStubAuthHandler) SendVerificationCode(*gin.Context)   {}
func (settingsStubAuthHandler) ConfirmEmail(*gin.Context)           {}
func (settingsStubAuthHandler) VerifyEmailToken(*gin.Context)       {}
func (settingsStubAuthHandler) ResetPassword(*gin.Context)          {}
func (settingsStubAuthHandler) UpdateMe(*gin.Context)               {}
func (settingsStubAuthHandler) Sessions(*gin.Context)               {}
func (settingsStubAuthHandler) LogoutSession(*gin.Context)          {}
func (settingsStubAuthHandler) SettingsProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAuthHandler) SettingsSessions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"sessions": []any{}})
}
func (settingsStubAuthHandler) SettingsRevokeSession(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAuthHandler) SettingsPasskeys(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"passkeys": []any{}})
}
func (settingsStubAuthHandler) SettingsDeletePasskey(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAuthHandler) SettingsChangeEmail(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAuthHandler) SettingsChangePassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAuthHandler) SettingsDeleteAccount(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

type settingsStubAdminHandler struct{}

func (settingsStubAdminHandler) Overview(c *gin.Context)  { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) Stats(c *gin.Context)     { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) ListUsers(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) GetUser(c *gin.Context)   { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) CreateUser(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"ok": true})
}
func (settingsStubAdminHandler) UpdateUser(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) DeleteUser(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) ResetUserPassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ListRoles(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) UpdateRolePermissions(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) BindUserRole(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) CurrentUserRoles(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ListFiles(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) ListJobs(c *gin.Context)  { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) EnqueueJob(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ReplayJob(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) ListAuditLogs(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) CreateDemoFile(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PrepareFileUpload(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) HeadFileObject(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) DeleteFileObject(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ListMedia(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) UploadMedia(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) DeleteMedia(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetSettings(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) GetSiteSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetAuthSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetSMTPSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetStorageSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetRuntimeSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveSiteSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveAuthSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveSMTPSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveStorageSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveRuntimeSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) TestSMTP(c *gin.Context)    { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) TestStorage(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) GetSEOSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveSEOSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) InitSEOSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ListMailTemplates(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetMailTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveMailTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PreviewMailTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) TestMailTemplate(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) BillingOverview(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ReconcileBilling(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ListBlogPosts(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) CreateBlogPost(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetBlogPost(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"ok": true}) }
func (settingsStubAdminHandler) UpdateBlogPost(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) DeleteBlogPost(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) GetBlogTranslation(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) SaveBlogTranslation(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) DeleteBlogTranslation(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PublishBlogPost(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) UnpublishBlogPost(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) CreateBlogPreviewLink(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ClearBlogCache(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PublicBlogList(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PublicBlogDetail(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) PublicBlogPreview(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
func (settingsStubAdminHandler) ServeMedia(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func TestRegisterSettingsRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	api := engine.Group("/api/v1")
	RegisterSettingsRoutes(api, settingsStubAuthHandler{})

	tests := []struct {
		method string
		path   string
	}{
		{http.MethodPatch, "/api/v1/settings/profile"},
		{http.MethodGet, "/api/v1/settings/sessions"},
		{http.MethodDelete, "/api/v1/settings/sessions/sid-1"},
		{http.MethodGet, "/api/v1/settings/passkeys"},
		{http.MethodDelete, "/api/v1/settings/passkeys/pk-1"},
		{http.MethodPost, "/api/v1/settings/change-email"},
		{http.MethodPost, "/api/v1/settings/change-password"},
		{http.MethodPost, "/api/v1/settings/delete-account"},
	}

	for _, tc := range tests {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)
		if rec.Code == http.StatusNotFound {
			t.Fatalf("route not registered: %s %s", tc.method, tc.path)
		}
	}
}

func TestRegisterAdminSettingsRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	admin := engine.Group("/api/v1/admin")
	registerAdminSettingsRoutes(admin, settingsStubAdminHandler{})

	tests := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/api/v1/admin/settings"},
		{http.MethodGet, "/api/v1/admin/settings/site"},
		{http.MethodGet, "/api/v1/admin/settings/auth"},
		{http.MethodGet, "/api/v1/admin/settings/smtp"},
		{http.MethodGet, "/api/v1/admin/settings/storage"},
		{http.MethodGet, "/api/v1/admin/settings/runtime"},
		{http.MethodGet, "/api/v1/admin/seo"},
		{http.MethodPost, "/api/v1/admin/seo/init"},
		{http.MethodPut, "/api/v1/admin/seo"},
		{http.MethodPost, "/api/v1/admin/settings/site"},
		{http.MethodPost, "/api/v1/admin/settings/auth"},
		{http.MethodPost, "/api/v1/admin/settings/smtp"},
		{http.MethodPost, "/api/v1/admin/settings/storage"},
		{http.MethodPost, "/api/v1/admin/settings/runtime"},
		{http.MethodPost, "/api/v1/admin/settings/smtp/test"},
		{http.MethodPost, "/api/v1/admin/settings/storage/test"},
		{http.MethodGet, "/api/v1/admin/settings/mail-templates"},
		{http.MethodGet, "/api/v1/admin/settings/mail-templates/welcome"},
		{http.MethodPost, "/api/v1/admin/settings/mail-templates/welcome"},
		{http.MethodPost, "/api/v1/admin/settings/mail-templates/welcome/preview"},
		{http.MethodPost, "/api/v1/admin/settings/mail-templates/welcome/test"},
	}

	for _, tc := range tests {
		req := httptest.NewRequest(tc.method, tc.path, nil)
		rec := httptest.NewRecorder()
		engine.ServeHTTP(rec, req)
		if rec.Code == http.StatusNotFound {
			t.Fatalf("route not registered: %s %s", tc.method, tc.path)
		}
	}
}
