package queries

import "testing"

func BenchmarkOverviewStatsShape(b *testing.B) {
	for i := 0; i < b.N; i++ {
		_ = OverviewStats{
			UserCount:          12,
			FileCount:          34,
			RoleCount:          3,
			JobCount:           20,
			AuditLogCount:      88,
			SystemSettingCount: 5,
		}
	}
}

func BenchmarkOverviewExplainNotes(b *testing.B) {
	notes := []string{
		"overview 通过 tenant_id 聚合 users/files/roles/jobs/audit/settings。",
		"建议建立 tenant_id 前缀索引并限制 dashboard 轮询频率。",
	}
	total := 0
	for i := 0; i < b.N; i++ {
		total += len(notes[i%len(notes)])
	}
	if total == 0 {
		b.Fatal("notes benchmark should accumulate")
	}
}
