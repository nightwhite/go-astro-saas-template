package config

import "time"

type SecurityConfig struct {
	CSRFEnabled             bool
	MetricsEnabled          bool
	CSRFHeader              string
	CSRFSecret              string
	CSRFTTL                 time.Duration
	CSRFCookieName          string
	CaptchaEnabled          bool
	CaptchaStrict           bool
	MaxBodyBytes            int64
	LoginRateLimitWindow    time.Duration
	LoginRateLimitMax       int
	AdminRateLimitWindow    time.Duration
	AdminRateLimitMax       int
	ResetRateLimitWindow    time.Duration
	ResetRateLimitMax       int
	IdempotencyTTL          time.Duration
	EnablePprof             bool
	SensitiveFieldsToRedact []string
}
