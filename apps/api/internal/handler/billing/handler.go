package billing

import (
	"context"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/night/go-astro-template/apps/api/internal/config"
	apperrors "github.com/night/go-astro-template/apps/api/internal/pkg/errors"
	"github.com/night/go-astro-template/apps/api/internal/pkg/httpx"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
)

type Service interface {
	Summary(ctx context.Context, token string) (map[string]any, error)
	Transactions(ctx context.Context, token string, limit int) ([]postgres.BillingTransactionRecord, error)
	CreatePaymentIntent(ctx context.Context, token string, amount int64) (map[string]any, error)
	ConfirmPaymentIntent(ctx context.Context, token, paymentIntentID string) (map[string]any, error)
	ProcessWebhook(ctx context.Context, provider, eventID, tenantID, userID, paymentIntentID string, amount int64, payload map[string]any) error
	Catalog(ctx context.Context, token string) ([]postgres.MarketplaceCatalogItem, error)
	PurchaseCatalogItem(ctx context.Context, token, itemCode string) (map[string]any, error)
}

type Handler struct {
	cfg     *config.Config
	service Service
}

func NewHandler(cfg *config.Config, service Service) *Handler {
	return &Handler{
		cfg:     cfg,
		service: service,
	}
}

func (h *Handler) Summary(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	result, err := h.service.Summary(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"summary": result})
}

func (h *Handler) Transactions(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	if limit <= 0 {
		limit = 20
	}
	rows, err := h.service.Transactions(c.Request.Context(), token, limit)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"transactions": rows})
}

func (h *Handler) CreatePaymentIntent(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		Amount int64 `json:"amount"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.CreatePaymentIntent(c.Request.Context(), token, payload.Amount)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"payment_intent": result})
}

func (h *Handler) ConfirmPaymentIntent(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		PaymentIntentID string `json:"payment_intent_id"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.ConfirmPaymentIntent(c.Request.Context(), token, payload.PaymentIntentID)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"result": result})
}

func (h *Handler) Webhook(c *gin.Context) {
	var payload struct {
		Provider        string         `json:"provider"`
		EventID         string         `json:"event_id"`
		TenantID        string         `json:"tenant_id"`
		UserID          string         `json:"user_id"`
		PaymentIntentID string         `json:"payment_intent_id"`
		Amount          int64          `json:"amount"`
		Payload         map[string]any `json:"payload"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	if err := h.service.ProcessWebhook(
		c.Request.Context(),
		payload.Provider,
		payload.EventID,
		payload.TenantID,
		payload.UserID,
		payload.PaymentIntentID,
		payload.Amount,
		payload.Payload,
	); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"processed": true})
}

func (h *Handler) Catalog(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	rows, err := h.service.Catalog(c.Request.Context(), token)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"items": rows})
}

func (h *Handler) Purchase(c *gin.Context) {
	token, err := c.Cookie(h.cfg.Session.CookieName)
	if err != nil || token == "" {
		httpx.Fail(c, apperrors.Unauthorized("missing session"))
		return
	}
	var payload struct {
		ItemCode string `json:"item_code"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	result, err := h.service.PurchaseCatalogItem(c.Request.Context(), token, payload.ItemCode)
	if err != nil {
		httpx.Fail(c, apperrors.BadRequest(err.Error()))
		return
	}
	httpx.OK(c, gin.H{"result": result})
}
