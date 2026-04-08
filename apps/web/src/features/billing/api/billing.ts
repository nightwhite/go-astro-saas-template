import { apiGet, apiPost } from "@/lib/api/client";

export interface BillingSummary {
  balance: number;
  transaction_count: number;
}

export interface BillingTransaction {
  id: string;
  provider: string;
  payment_intent_id: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface PaymentIntent {
  payment_intent_id: string;
  provider: string;
  status: string;
  client_secret: string;
  amount: number;
}

export interface MarketplaceItem {
  id: string;
  code: string;
  name: string;
  item_type: string;
  price_credits: number;
  enabled: boolean;
}

export async function fetchBillingSummary() {
  const response = await apiGet<{ summary: BillingSummary }>("/api/v1/billing/summary");
  return response.data.summary;
}

export async function fetchBillingTransactions(limit = 20) {
  const response = await apiGet<{ transactions: BillingTransaction[] }>(`/api/v1/billing/transactions?limit=${limit}`);
  return response.data.transactions;
}

export async function createPaymentIntent(amount: number) {
  return apiPost<{ payment_intent: PaymentIntent }>(
    "/api/v1/billing/payment-intents",
    { amount },
  );
}

export async function confirmPaymentIntent(paymentIntentID: string) {
  return apiPost<{
    result: {
      payment_intent_id: string;
      status: string;
      credited_amount: number;
      current_balance: number;
    };
  }>("/api/v1/billing/payment-intents/confirm", { payment_intent_id: paymentIntentID });
}

export async function fetchMarketplaceCatalog() {
  const response = await apiGet<{ items: MarketplaceItem[] }>("/api/v1/marketplace/catalog");
  return response.data.items;
}

export async function purchaseMarketplaceItem(itemCode: string) {
  return apiPost<{ result: { order: any; current_credit: number } }>("/api/v1/marketplace/purchase", { item_code: itemCode });
}
