package redis

import (
	"context"
	"strings"
	"time"

	"github.com/night/go-astro-template/apps/api/internal/config"
)

type CaptchaVerifier struct {
	cfg *config.Config
	kv  *KVStore
}

func NewCaptchaVerifier(cfg *config.Config, kv *KVStore) *CaptchaVerifier {
	return &CaptchaVerifier{cfg: cfg, kv: kv}
}

func (v *CaptchaVerifier) Verify(ctx context.Context, token string) (bool, error) {
	trimmed := strings.TrimSpace(token)
	if trimmed == "" {
		return false, nil
	}

	// Dev-friendly bypass token, useful before wiring a real captcha provider.
	if strings.EqualFold(trimmed, "dev-pass") {
		return true, nil
	}

	// Reserve a key-space for future provider callback validation.
	// Current template mode accepts signed-off tokens prefixed with "cap_".
	if strings.HasPrefix(trimmed, "cap_") {
		if v.kv != nil {
			_ = v.kv.SetJSON(ctx, "captcha:last_ok", map[string]any{"at": time.Now().UTC()}, 5*time.Minute)
		}
		return true, nil
	}

	return false, nil
}
