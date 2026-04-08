package billing

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
	"github.com/night/go-astro-template/apps/api/internal/repository/postgres"
	"go.uber.org/zap"
)

type Service struct {
	logger   *zap.Logger
	billing  *postgres.BillingRepository
	sessions *postgres.SessionRepository
	users    *postgres.UserRepository
}

func NewService(logger *zap.Logger, billing *postgres.BillingRepository, sessions *postgres.SessionRepository, users *postgres.UserRepository) *Service {
	return &Service{
		logger:   logger,
		billing:  billing,
		sessions: sessions,
		users:    users,
	}
}

func (s *Service) currentUser(ctx context.Context, token string) (*postgres.User, error) {
	session, err := s.sessions.FindByToken(ctx, token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.New("session not found")
	}
	user, err := s.users.FindByID(ctx, session.TenantID, session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}

func (s *Service) Summary(ctx context.Context, token string) (map[string]any, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	if err := s.billing.EnsureAccount(ctx, user.TenantID, user.ID); err != nil {
		return nil, err
	}
	result, err := s.billing.Summary(ctx, user.TenantID, user.ID)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"balance":           result.Balance,
		"transaction_count": result.TransactionCnt,
	}, nil
}

func (s *Service) Transactions(ctx context.Context, token string, limit int) ([]postgres.BillingTransactionRecord, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	return s.billing.ListTransactions(ctx, user.TenantID, user.ID, limit)
}

func (s *Service) CreatePaymentIntent(ctx context.Context, token string, amount int64) (map[string]any, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}
	paymentIntentID := fmt.Sprintf("pi_%d", time.Now().UnixNano())
	if err := s.billing.CreatePaymentIntentRecord(ctx, user.TenantID, user.ID, "stripe", paymentIntentID, amount); err != nil {
		return nil, err
	}
	metrics.RecordBillingIntent()
	return map[string]any{
		"payment_intent_id": paymentIntentID,
		"client_secret":     paymentIntentID,
		"provider":          "stripe",
		"status":            "pending",
		"amount":            amount,
	}, nil
}

func (s *Service) ConfirmPaymentIntent(ctx context.Context, token, paymentIntentID string) (map[string]any, error) {
	paymentIntentID = strings.TrimSpace(paymentIntentID)
	if paymentIntentID == "" {
		return nil, errors.New("payment_intent_id is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	creditedAmount, err := s.billing.ConfirmPaymentIntent(ctx, user.TenantID, user.ID, paymentIntentID)
	if err != nil {
		return nil, err
	}
	summary, err := s.billing.Summary(ctx, user.TenantID, user.ID)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"payment_intent_id": paymentIntentID,
		"status":            "succeeded",
		"credited_amount":   creditedAmount,
		"current_balance":   summary.Balance,
	}, nil
}

func (s *Service) ProcessWebhook(ctx context.Context, provider, eventID, tenantID, userID, paymentIntentID string, amount int64, payload map[string]any) error {
	if provider == "" || eventID == "" {
		return errors.New("provider and event_id are required")
	}
	if tenantID == "" {
		tenantID = tenant.DefaultTenantID
	}
	if err := s.billing.MarkWebhookProcessed(ctx, tenantID, provider, eventID, payload); err != nil {
		if err.Error() == "duplicate webhook event" {
			return nil
		}
		return err
	}
	if userID == "" || paymentIntentID == "" {
		return errors.New("user_id and payment_intent_id are required")
	}
	if err := s.billing.CreditByPaymentIntent(ctx, tenantID, userID, paymentIntentID, amount); err != nil {
		return err
	}
	s.logger.Info("billing_webhook_processed",
		zap.String("tenant_id", tenantID),
		zap.String("event_id", eventID),
		zap.String("payment_intent_id", paymentIntentID),
		zap.Int64("amount", amount),
	)
	metrics.RecordBillingWebhook()
	return nil
}

func (s *Service) Catalog(ctx context.Context, token string) ([]postgres.MarketplaceCatalogItem, error) {
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	if err := s.billing.SeedDefaultCatalog(ctx, user.TenantID); err != nil {
		return nil, err
	}
	return s.billing.Catalog(ctx, user.TenantID)
}

func (s *Service) PurchaseCatalogItem(ctx context.Context, token, itemCode string) (map[string]any, error) {
	itemCode = strings.TrimSpace(itemCode)
	if itemCode == "" {
		return nil, errors.New("item_code is required")
	}
	user, err := s.currentUser(ctx, token)
	if err != nil {
		return nil, err
	}
	if err := s.billing.EnsureAccount(ctx, user.TenantID, user.ID); err != nil {
		return nil, err
	}
	order, err := s.billing.PurchaseCatalogItem(ctx, user.TenantID, user.ID, itemCode)
	if err != nil {
		return nil, err
	}
	summary, err := s.billing.Summary(ctx, user.TenantID, user.ID)
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"order":          order,
		"current_credit": summary.Balance,
	}, nil
}
