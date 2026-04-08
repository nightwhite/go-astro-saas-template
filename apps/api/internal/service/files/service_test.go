package files

import (
	"testing"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

func TestValidateUpload(t *testing.T) {
	service := &Service{
		cfg: &config.Config{
			Storage: config.StorageRuleConfig{
				MaxUploadSizeMB: 4,
				AllowedMimeTypes: []string{
					"text/plain",
					"application/json",
				},
			},
		},
	}

	if err := service.ValidateUpload("demo.txt", "text/plain", 1024); err != nil {
		t.Fatalf("ValidateUpload returned error: %v", err)
	}

	if err := service.ValidateUpload("", "text/plain", 1024); err == nil {
		t.Fatal("ValidateUpload should reject empty file name")
	}

	if err := service.ValidateUpload("demo.txt", "application/xml", 1024); err == nil {
		t.Fatal("ValidateUpload should reject mime type outside allow list")
	}
}
