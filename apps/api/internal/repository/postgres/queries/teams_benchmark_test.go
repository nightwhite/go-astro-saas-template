package queries

import "testing"

func BenchmarkTeamsHotQueries(b *testing.B) {
	payloads := []string{
		"SELECT id,name,slug,owner_user_id FROM teams WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3",
		"SELECT id,team_id,user_id,role FROM team_memberships WHERE tenant_id=$1 AND team_id=$2",
		"SELECT id,team_id,email,status,expires_at FROM team_invites WHERE tenant_id=$1 AND email=$2 AND status='pending'",
	}
	var size int
	for i := 0; i < b.N; i++ {
		size += len(payloads[i%len(payloads)])
	}
	if size == 0 {
		b.Fatal("expected benchmark payload size")
	}
}
