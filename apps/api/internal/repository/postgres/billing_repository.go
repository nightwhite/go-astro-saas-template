package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	dbent "github.com/night/go-astro-template/apps/api/ent"
	entbillingtransaction "github.com/night/go-astro-template/apps/api/ent/billingtransaction"
	entcreditaccount "github.com/night/go-astro-template/apps/api/ent/creditaccount"
	entmarketplaceitem "github.com/night/go-astro-template/apps/api/ent/marketplaceitem"
)

type BillingSummary struct {
	Balance        int64 `json:"balance"`
	TransactionCnt int   `json:"transaction_count"`
}

type BillingTransactionRecord struct {
	ID              string    `json:"id"`
	Provider        string    `json:"provider"`
	PaymentIntentID string    `json:"payment_intent_id"`
	Amount          int64     `json:"amount"`
	Status          string    `json:"status"`
	CreatedAt       time.Time `json:"created_at"`
}

type MarketplaceCatalogItem struct {
	ID           string `json:"id"`
	Code         string `json:"code"`
	Name         string `json:"name"`
	ItemType     string `json:"item_type"`
	PriceCredits int64  `json:"price_credits"`
	Enabled      bool   `json:"enabled"`
}

type MarketplaceOrderRecord struct {
	ID          string    `json:"id"`
	UserID      string    `json:"user_id"`
	ItemID      string    `json:"item_id"`
	CreditsCost int64     `json:"credits_cost"`
	Status      string    `json:"status"`
	PurchasedAt time.Time `json:"purchased_at"`
}

type BillingRepository struct {
	ent *dbent.Client
}

func NewBillingRepository(client *Client) *BillingRepository {
	return &BillingRepository{ent: client.Ent}
}

func (r *BillingRepository) EnsureAccount(ctx context.Context, tenantID, userID string) error {
	existing, err := r.ent.CreditAccount.Query().
		Where(
			entcreditaccount.TenantID(tenantID),
			entcreditaccount.UserID(userID),
		).
		Only(ctx)
	if err == nil && existing != nil {
		return nil
	}
	if err != nil && !dbent.IsNotFound(err) {
		return err
	}
	_, err = r.ent.CreditAccount.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetBalance(0).
		SetVersion(0).
		Save(ctx)
	if dbent.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *BillingRepository) Summary(ctx context.Context, tenantID, userID string) (BillingSummary, error) {
	account, err := r.ent.CreditAccount.Query().
		Where(
			entcreditaccount.TenantID(tenantID),
			entcreditaccount.UserID(userID),
		).
		Only(ctx)
	if dbent.IsNotFound(err) {
		return BillingSummary{}, nil
	}
	if err != nil {
		return BillingSummary{}, err
	}

	count, err := r.ent.BillingTransaction.Query().
		Where(
			entbillingtransaction.TenantID(tenantID),
			entbillingtransaction.UserID(userID),
		).
		Count(ctx)
	if err != nil {
		return BillingSummary{}, err
	}

	return BillingSummary{
		Balance:        account.Balance,
		TransactionCnt: count,
	}, nil
}

func (r *BillingRepository) ListTransactions(ctx context.Context, tenantID, userID string, limit int) ([]BillingTransactionRecord, error) {
	rows, err := r.ent.BillingTransaction.Query().
		Where(
			entbillingtransaction.TenantID(tenantID),
			entbillingtransaction.UserID(userID),
		).
		Order(dbent.Desc(entbillingtransaction.FieldCreatedAt)).
		Limit(limit).
		All(ctx)
	if err != nil {
		return nil, err
	}
	output := make([]BillingTransactionRecord, 0, len(rows))
	for _, row := range rows {
		output = append(output, BillingTransactionRecord{
			ID:              row.ID,
			Provider:        row.Provider,
			PaymentIntentID: row.PaymentIntentID,
			Amount:          row.Amount,
			Status:          row.Status,
			CreatedAt:       row.CreatedAt,
		})
	}
	return output, nil
}

func (r *BillingRepository) CreatePaymentIntentRecord(ctx context.Context, tenantID, userID, provider, paymentIntentID string, amount int64) error {
	_, err := r.ent.BillingTransaction.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetProvider(provider).
		SetPaymentIntentID(paymentIntentID).
		SetAmount(amount).
		SetStatus("pending").
		Save(ctx)
	if dbent.IsConstraintError(err) {
		return nil
	}
	return err
}

func (r *BillingRepository) GetPaymentIntent(ctx context.Context, tenantID, userID, paymentIntentID string) (*BillingTransactionRecord, error) {
	row, err := r.ent.BillingTransaction.Query().
		Where(
			entbillingtransaction.TenantID(tenantID),
			entbillingtransaction.UserID(userID),
			entbillingtransaction.PaymentIntentID(paymentIntentID),
		).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, nil
		}
		return nil, err
	}
	return &BillingTransactionRecord{
		ID:              row.ID,
		Provider:        row.Provider,
		PaymentIntentID: row.PaymentIntentID,
		Amount:          row.Amount,
		Status:          row.Status,
		CreatedAt:       row.CreatedAt,
	}, nil
}

func (r *BillingRepository) MarkWebhookProcessed(ctx context.Context, tenantID, provider, eventID string, payload map[string]any) error {
	_, err := r.ent.BillingWebhookEvent.Create().
		SetTenantID(tenantID).
		SetProvider(provider).
		SetEventID(eventID).
		SetPayload(payload).
		SetProcessedAt(time.Now()).
		Save(ctx)
	if dbent.IsConstraintError(err) {
		return errors.New("duplicate webhook event")
	}
	return err
}

func (r *BillingRepository) CreditByPaymentIntent(ctx context.Context, tenantID, userID, paymentIntentID string, amount int64) error {
	record, err := r.ent.BillingTransaction.Query().
		Where(
			entbillingtransaction.TenantID(tenantID),
			entbillingtransaction.PaymentIntentID(paymentIntentID),
			entbillingtransaction.UserID(userID),
		).
		Only(ctx)
	if err != nil {
		return err
	}
	if record.Status == "succeeded" {
		return nil
	}

	account, err := r.ent.CreditAccount.Query().
		Where(
			entcreditaccount.TenantID(tenantID),
			entcreditaccount.UserID(userID),
		).
		Only(ctx)
	if err != nil {
		return err
	}

	if _, err := r.ent.CreditLedger.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetDelta(amount).
		SetReason("payment_succeeded").
		SetRefType("payment_intent").
		SetRefID(paymentIntentID).
		Save(ctx); err != nil {
		return err
	}

	if _, err := r.ent.CreditAccount.UpdateOneID(account.ID).
		SetBalance(account.Balance + amount).
		SetVersion(account.Version + 1).
		Save(ctx); err != nil {
		return err
	}

	_, err = r.ent.BillingTransaction.UpdateOneID(record.ID).
		SetStatus("succeeded").
		Save(ctx)
	return err
}

func (r *BillingRepository) ConfirmPaymentIntent(ctx context.Context, tenantID, userID, paymentIntentID string) (int64, error) {
	record, err := r.GetPaymentIntent(ctx, tenantID, userID, paymentIntentID)
	if err != nil {
		return 0, err
	}
	if record == nil {
		return 0, errors.New("payment intent not found")
	}
	if record.Amount <= 0 {
		return 0, errors.New("invalid payment amount")
	}
	if record.Status == "succeeded" {
		return record.Amount, nil
	}

	eventID := fmt.Sprintf("confirm_%s", paymentIntentID)
	if err := r.MarkWebhookProcessed(ctx, tenantID, record.Provider, eventID, map[string]any{
		"source":            "manual_confirm",
		"payment_intent_id": paymentIntentID,
	}); err != nil && err.Error() != "duplicate webhook event" {
		return 0, err
	}
	if err := r.CreditByPaymentIntent(ctx, tenantID, userID, paymentIntentID, record.Amount); err != nil {
		return 0, err
	}
	return record.Amount, nil
}

func (r *BillingRepository) Catalog(ctx context.Context, tenantID string) ([]MarketplaceCatalogItem, error) {
	rows, err := r.ent.MarketplaceItem.Query().
		Where(entmarketplaceitem.TenantID(tenantID)).
		Order(dbent.Asc(entmarketplaceitem.FieldCode)).
		All(ctx)
	if err != nil {
		return nil, err
	}
	output := make([]MarketplaceCatalogItem, 0, len(rows))
	for _, row := range rows {
		output = append(output, MarketplaceCatalogItem{
			ID:           row.ID,
			Code:         row.Code,
			Name:         row.Name,
			ItemType:     row.ItemType,
			PriceCredits: row.PriceCredits,
			Enabled:      row.Enabled,
		})
	}
	return output, nil
}

func (r *BillingRepository) SeedDefaultCatalog(ctx context.Context, tenantID string) error {
	defaults := []MarketplaceCatalogItem{
		{Code: "credits_100", Name: "100 Credits", ItemType: "credit_package", PriceCredits: 100, Enabled: true},
		{Code: "credits_500", Name: "500 Credits", ItemType: "credit_package", PriceCredits: 500, Enabled: true},
	}
	for _, item := range defaults {
		existing, err := r.ent.MarketplaceItem.Query().
			Where(
				entmarketplaceitem.TenantID(tenantID),
				entmarketplaceitem.Code(item.Code),
			).
			Only(ctx)
		if err == nil && existing != nil {
			continue
		}
		if err != nil && !dbent.IsNotFound(err) {
			return err
		}
		if _, err := r.ent.MarketplaceItem.Create().
			SetTenantID(tenantID).
			SetCode(item.Code).
			SetName(item.Name).
			SetItemType(item.ItemType).
			SetPriceCredits(item.PriceCredits).
			SetEnabled(item.Enabled).
			Save(ctx); err != nil && !dbent.IsConstraintError(err) {
			return err
		}
	}
	return nil
}

func (r *BillingRepository) PurchaseCatalogItem(ctx context.Context, tenantID, userID, itemCode string) (*MarketplaceOrderRecord, error) {
	item, err := r.ent.MarketplaceItem.Query().
		Where(
			entmarketplaceitem.TenantID(tenantID),
			entmarketplaceitem.Code(itemCode),
			entmarketplaceitem.EnabledEQ(true),
		).
		Only(ctx)
	if err != nil {
		if dbent.IsNotFound(err) {
			return nil, errors.New("catalog item not found")
		}
		return nil, err
	}

	account, err := r.ent.CreditAccount.Query().
		Where(
			entcreditaccount.TenantID(tenantID),
			entcreditaccount.UserID(userID),
		).
		Only(ctx)
	if err != nil {
		return nil, err
	}
	if account.Balance < item.PriceCredits {
		return nil, errors.New("insufficient credits")
	}

	order, err := r.ent.MarketplaceOrder.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetItemID(item.ID).
		SetCostCredits(item.PriceCredits).
		SetStatus("succeeded").
		Save(ctx)
	if err != nil {
		return nil, err
	}

	if _, err := r.ent.CreditLedger.Create().
		SetTenantID(tenantID).
		SetUserID(userID).
		SetDelta(-item.PriceCredits).
		SetReason("marketplace_purchase").
		SetRefType("order").
		SetRefID(order.ID).
		Save(ctx); err != nil {
		return nil, err
	}

	if _, err := r.ent.CreditAccount.UpdateOneID(account.ID).
		SetBalance(account.Balance - item.PriceCredits).
		SetVersion(account.Version + 1).
		Save(ctx); err != nil {
		return nil, err
	}

	return &MarketplaceOrderRecord{
		ID:          order.ID,
		UserID:      order.UserID,
		ItemID:      order.ItemID,
		CreditsCost: order.CostCredits,
		Status:      order.Status,
		PurchasedAt: order.CreatedAt,
	}, nil
}
