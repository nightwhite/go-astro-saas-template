package settings

import "testing"

func TestMergeSettings(t *testing.T) {
	defaults := map[string]any{
		"host": "localhost",
		"port": 587,
	}
	overrides := map[string]any{
		"host": "smtp.example.com",
	}

	merged := mergeSettings(defaults, overrides)
	if merged["host"] != "smtp.example.com" {
		t.Fatalf("expected override host, got %v", merged["host"])
	}
	if merged["port"] != 587 {
		t.Fatalf("expected default port, got %v", merged["port"])
	}
}

func TestMergeSettingsKeepsDefaultsWhenOverrideEmpty(t *testing.T) {
	defaults := map[string]any{
		"jobs_default_queue": "default",
		"jobs_max_retries":   5,
	}

	merged := mergeSettings(defaults, map[string]any{})
	if merged["jobs_default_queue"] != "default" {
		t.Fatalf("expected default queue preserved, got %v", merged["jobs_default_queue"])
	}
	if merged["jobs_max_retries"] != 5 {
		t.Fatalf("expected retries preserved, got %v", merged["jobs_max_retries"])
	}
}
