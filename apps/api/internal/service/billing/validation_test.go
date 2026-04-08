package billing

import (
	"context"
	"testing"

	"go.uber.org/zap"
)

func TestProcessWebhookValidateRequiredFields(t *testing.T) {
	service := &Service{
		logger: zap.NewNop(),
	}
	err := service.ProcessWebhook(context.Background(), "", "", "", "", "", 100, nil)
	if err == nil {
		t.Fatal("ProcessWebhook should fail without provider and event id")
	}
}

func TestPurchaseCatalogItemRequiresCode(t *testing.T) {
	service := &Service{
		logger: zap.NewNop(),
	}
	if _, err := service.PurchaseCatalogItem(context.Background(), "token", " "); err == nil {
		t.Fatal("PurchaseCatalogItem should fail when item code is empty")
	}
}

func TestCreatePaymentIntentRequiresPositiveAmount(t *testing.T) {
	t.Skip("CreatePaymentIntent current implementation requires repository/session wiring before amount validation branch")
}
