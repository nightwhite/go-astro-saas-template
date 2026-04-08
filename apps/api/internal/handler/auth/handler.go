package auth

import (
	"context"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	authservice "github.com/night/go-astro-template/apps/api/internal/service/auth"
)

type Service interface {
	RegisterWithCaptcha(ctx context.Context, email, password, displayName, verifyCode, captchaToken string) (map[string]any, error)
	BuildGoogleSSOStartURL(ctx context.Context) (string, error)
	HandleGoogleSSOCallback(ctx context.Context, code, state string) (*authservice.LoginResult, error)
	GeneratePasskeyRegistrationOptions(ctx context.Context, email string) (map[string]any, error)
	VerifyPasskeyRegistration(ctx context.Context, email string, response map[string]any) (*authservice.LoginResult, error)
	GeneratePasskeyLoginOptions(ctx context.Context, email string) (map[string]any, error)
	VerifyPasskeyLogin(ctx context.Context, response map[string]any) (*authservice.LoginResult, error)
	RefreshSession(ctx context.Context, token string) (*authservice.LoginResult, error)
	ConfirmEmail(ctx context.Context, email, code string) error
	VerifyEmailToken(ctx context.Context, token string) error
	GetCurrentUser(ctx context.Context, token string) (map[string]any, error)
	Logout(ctx context.Context, token string) error
	LogoutAll(ctx context.Context, token string) error
	ResetPasswordWithCaptcha(ctx context.Context, token, newPassword, captchaToken string) error
	SendVerificationCodeWithCaptcha(ctx context.Context, email, captchaToken string) (map[string]any, error)
	CreateResetTokenWithCaptcha(ctx context.Context, email, captchaToken string) (map[string]any, error)
	LoginWithCaptcha(ctx context.Context, email, password, captchaToken string) (*authservice.LoginResult, error)
	UpdateCurrentUserProfile(ctx context.Context, token, displayName string) (map[string]any, error)
	ListUserSessions(ctx context.Context, currentToken string) ([]authservice.UserSession, error)
	ListUserSessionOverviews(ctx context.Context, currentToken string) ([]authservice.SessionOverview, error)
	LogoutSessionByID(ctx context.Context, currentToken, sessionID string) error
	UpdateCurrentUserName(ctx context.Context, token, firstName, lastName string) error
	ChangeCurrentUserEmail(ctx context.Context, token, newEmail, currentPassword string) error
	ChangeCurrentUserPassword(ctx context.Context, token, currentPassword, newPassword string) error
	DeleteCurrentUserAccount(ctx context.Context, token, currentPassword string) error
	ListCurrentUserPasskeys(ctx context.Context, token string) ([]authservice.PasskeyOverview, error)
	DeleteCurrentUserPasskey(ctx context.Context, token, credentialID string) error
}

type Handler struct {
	cfg     *config.Config
	service Service
}

func NewHandler(cfg *config.Config, service Service) *Handler {
	return &Handler{cfg: cfg, service: service}
}

func (h *Handler) Login(c *gin.Context) {
	var payload struct {
		Email        string `json:"email"`
		Password     string `json:"password"`
		CaptchaToken string `json:"captcha_token"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.service.LoginWithCaptcha(c.Request.Context(), payload.Email, payload.Password, payload.CaptchaToken)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.SetCookie(
		h.cfg.Session.CookieName,
		result.Token,
		int(h.cfg.Session.TTL.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		true,
	)

	httpx.OK(c, gin.H{"user": result.User})
}

func (h *Handler) Register(c *gin.Context) {
	var payload struct {
		Email        string `json:"email"`
		Password     string `json:"password"`
		DisplayName  string `json:"display_name"`
		VerifyCode   string `json:"verify_code"`
		CaptchaToken string `json:"captcha_token"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.service.RegisterWithCaptcha(c.Request.Context(), payload.Email, payload.Password, payload.DisplayName, payload.VerifyCode, payload.CaptchaToken)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.Created(c, gin.H{"result": result})
}

func (h *Handler) GoogleSSOStart(c *gin.Context) {
	url, err := h.service.BuildGoogleSSOStartURL(c.Request.Context())
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"url": url})
}

func (h *Handler) GoogleSSOCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	result, err := h.service.HandleGoogleSSOCallback(c.Request.Context(), code, state)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.SetCookie(
		h.cfg.Session.CookieName,
		result.Token,
		int(h.cfg.Session.TTL.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		true,
	)
	httpx.OK(c, gin.H{"user": result.User})
}

func (h *Handler) PasskeyRegisterOptions(c *gin.Context) {
	var payload struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.GeneratePasskeyRegistrationOptions(c.Request.Context(), payload.Email)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"options": result})
}

func (h *Handler) PasskeyRegisterVerify(c *gin.Context) {
	var payload struct {
		Email    string         `json:"email"`
		Response map[string]any `json:"response"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.VerifyPasskeyRegistration(c.Request.Context(), payload.Email, payload.Response)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.SetCookie(
		h.cfg.Session.CookieName,
		result.Token,
		int(h.cfg.Session.TTL.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		true,
	)
	httpx.OK(c, gin.H{"user": result.User})
}

func (h *Handler) PasskeyLoginOptions(c *gin.Context) {
	var payload struct {
		Email string `json:"email"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.GeneratePasskeyLoginOptions(c.Request.Context(), payload.Email)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"options": result})
}

func (h *Handler) PasskeyLoginVerify(c *gin.Context) {
	var payload struct {
		Response map[string]any `json:"response"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.VerifyPasskeyLogin(c.Request.Context(), payload.Response)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	c.SetCookie(
		h.cfg.Session.CookieName,
		result.Token,
		int(h.cfg.Session.TTL.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		true,
	)
	httpx.OK(c, gin.H{"user": result.User})
}

func (h *Handler) Refresh(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}

	result, err := h.service.RefreshSession(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	c.SetCookie(
		h.cfg.Session.CookieName,
		result.Token,
		int(h.cfg.Session.TTL.Seconds()),
		"/",
		"",
		h.cfg.Session.Secure,
		true,
	)
	httpx.OK(c, gin.H{"user": result.User})
}

func (h *Handler) Me(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}

	user, err := h.service.GetCurrentUser(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{
		"user": user,
	})
}

func (h *Handler) Logout(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err == nil && token != "" {
		_ = h.service.Logout(c.Request.Context(), token)
	}

	c.SetCookie(h.cfg.Session.CookieName, "", -1, "/", "", h.cfg.Session.Secure, true)
	httpx.OK(c, gin.H{"logged_out": true})
}

func (h *Handler) LogoutAll(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err == nil && token != "" {
		_ = h.service.LogoutAll(c.Request.Context(), token)
	}
	c.SetCookie(h.cfg.Session.CookieName, "", -1, "/", "", h.cfg.Session.Secure, true)
	httpx.OK(c, gin.H{"logged_out_all": true})
}

func (h *Handler) ForgotPassword(c *gin.Context) {
	var payload struct {
		Email        string `json:"email"`
		CaptchaToken string `json:"captcha_token"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.service.CreateResetTokenWithCaptcha(c.Request.Context(), payload.Email, payload.CaptchaToken)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) SendVerificationCode(c *gin.Context) {
	var payload struct {
		Email        string `json:"email"`
		CaptchaToken string `json:"captcha_token"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	result, err := h.service.SendVerificationCodeWithCaptcha(c.Request.Context(), payload.Email, payload.CaptchaToken)
	if err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) ConfirmEmail(c *gin.Context) {
	var payload struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.service.ConfirmEmail(c.Request.Context(), payload.Email, payload.Code); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"confirmed": true})
}

func (h *Handler) VerifyEmailToken(c *gin.Context) {
	token := strings.TrimSpace(c.Query("token"))
	if token == "" {
		httpx.Fail(c, apperrors.BadRequest("token is required"))
		return
	}
	if err := h.service.VerifyEmailToken(c.Request.Context(), token); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"verified": true})
}

func (h *Handler) ResetPassword(c *gin.Context) {
	var payload struct {
		Token        string `json:"token"`
		NewPassword  string `json:"new_password"`
		CaptchaToken string `json:"captcha_token"`
	}

	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	if err := h.service.ResetPasswordWithCaptcha(c.Request.Context(), payload.Token, payload.NewPassword, payload.CaptchaToken); err != nil {
		httpx.Fail(c, err)
		return
	}

	httpx.OK(c, gin.H{"reset": true})
}

func (h *Handler) Sessions(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	sessions, err := h.service.ListUserSessions(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"sessions": sessions})
}

func (h *Handler) UpdateMe(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}

	var payload struct {
		DisplayName string `json:"display_name"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}

	user, err := h.service.UpdateCurrentUserProfile(c.Request.Context(), token, payload.DisplayName)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"user": user})
}

func (h *Handler) LogoutSession(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	sessionID := c.Param("sessionID")
	if sessionID == "" {
		httpx.Fail(c, apperrors.BadRequest("missing session id"))
		return
	}
	if err := h.service.LogoutSessionByID(c.Request.Context(), token, sessionID); err != nil {
		if err.Error() == "forbidden" {
			httpx.Fail(c, apperrors.Forbidden("forbidden"))
			return
		}
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"logged_out": true})
}

func (h *Handler) SettingsProfile(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		FirstName string `json:"firstName"`
		LastName  string `json:"lastName"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.UpdateCurrentUserName(c.Request.Context(), token, payload.FirstName, payload.LastName); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SettingsSessions(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	sessions, err := h.service.ListUserSessionOverviews(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"sessions": sessions})
}

func (h *Handler) SettingsRevokeSession(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	sessionID := c.Param("sessionID")
	if sessionID == "" {
		httpx.Fail(c, apperrors.BadRequest("missing session id"))
		return
	}
	if err := h.service.LogoutSessionByID(c.Request.Context(), token, sessionID); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SettingsChangeEmail(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		NewEmail        string `json:"newEmail"`
		CurrentPassword string `json:"currentPassword"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.ChangeCurrentUserEmail(c.Request.Context(), token, payload.NewEmail, payload.CurrentPassword); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SettingsChangePassword(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.ChangeCurrentUserPassword(c.Request.Context(), token, payload.CurrentPassword, payload.NewPassword); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SettingsDeleteAccount(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		CurrentPassword string `json:"currentPassword"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.DeleteCurrentUserAccount(c.Request.Context(), token, payload.CurrentPassword); err != nil {
		httpx.Fail(c, err)
		return
	}
	c.SetCookie(h.cfg.Session.CookieName, "", -1, "/", "", h.cfg.Session.Secure, true)
	httpx.OK(c, gin.H{"ok": true})
}

func (h *Handler) SettingsPasskeys(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	passkeys, err := h.service.ListCurrentUserPasskeys(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"passkeys": passkeys})
}

func (h *Handler) SettingsDeletePasskey(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	credentialID := c.Param("credentialID")
	if credentialID == "" {
		httpx.Fail(c, apperrors.BadRequest("missing credential id"))
		return
	}
	if err := h.service.DeleteCurrentUserPasskey(c.Request.Context(), token, credentialID); err != nil {
		httpx.Fail(c, err)
		return
	}
	httpx.OK(c, gin.H{"ok": true})
}
