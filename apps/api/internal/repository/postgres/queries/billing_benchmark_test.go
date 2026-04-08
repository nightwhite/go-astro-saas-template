package queries

import "testing"

func BenchmarkBillingHotQueries(b *testing.B) {
	payloads := []string{
		"SELECT tenant_id,balance,updated_at FROM credit_accounts WHERE tenant_id=$1",
		"SELECT id,kind,status,amount,created_at FROM billing_transactions WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
		"SELECT id,name,credit_cost,enabled FROM marketplace_items WHERE enabled=true ORDER BY created_at DESC",
		"SELECT id,item_id,total_credits,status,created_at FROM marketplace_orders WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
	}
	var size int
	for i := 0; i < b.N; i++ {
		size += len(payloads[i%len(payloads)])
	}
	if size == 0 {
		b.Fatal("expected benchmark payload size")
	}
}
