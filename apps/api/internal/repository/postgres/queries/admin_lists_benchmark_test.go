package queries

import "testing"

func BenchmarkAdminListSQLConstants(b *testing.B) {
	payloads := []string{
		UserListSQL,
		UserListKeysetSQL,
		FileListSQL,
		FileListKeysetSQL,
		JobListSQL,
		JobListKeysetSQL,
		AuditListSQL,
		AuditListKeysetSQL,
	}
	var size int
	for i := 0; i < b.N; i++ {
		size += len(payloads[i%len(payloads)])
	}
	if size == 0 {
		b.Fatal("expected benchmark payload size")
	}
}
