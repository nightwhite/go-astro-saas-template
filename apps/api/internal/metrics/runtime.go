package metrics

import (
	"sync/atomic"
	"time"
)

const (
	slowRequestThreshold = 800 * time.Millisecond
	slowQueryThreshold   = 200 * time.Millisecond
)

var cacheRequestTotal atomic.Int64
var cacheHitTotal atomic.Int64
var slowRequestTotal atomic.Int64
var slowQueryTotal atomic.Int64
var httpRequestTotal atomic.Int64
var totalRequestLatencyMs atomic.Int64
var authLoginTotal atomic.Int64
var authRegisterTotal atomic.Int64
var authPasswordResetTotal atomic.Int64
var teamsCreateTotal atomic.Int64
var teamsInviteTotal atomic.Int64
var billingIntentTotal atomic.Int64
var billingWebhookTotal atomic.Int64
var adminSettingsWriteTotal atomic.Int64
var jobRetryTotal atomic.Int64
var jobDeadLetterTotal atomic.Int64
var jobReplayTotal atomic.Int64
var frontendRequestErrorTotal atomic.Int64

func RecordCacheHit() {
	cacheRequestTotal.Add(1)
	cacheHitTotal.Add(1)
}

func RecordCacheMiss() {
	cacheRequestTotal.Add(1)
}

func RecordSlowRequest(latency time.Duration) {
	httpRequestTotal.Add(1)
	totalRequestLatencyMs.Add(latency.Milliseconds())
	if latency > slowRequestThreshold {
		slowRequestTotal.Add(1)
	}
}

func RecordSlowQuery(latency time.Duration) {
	if latency > slowQueryThreshold {
		slowQueryTotal.Add(1)
	}
}

func RuntimeSnapshot() map[string]any {
	requests := cacheRequestTotal.Load()
	hits := cacheHitTotal.Load()

	ratio := 0.0
	rate := 0.0
	if requests > 0 {
		ratio = float64(hits) / float64(requests)
		rate = ratio * 100
	}

	return map[string]any{
		"http_qps_estimate":            estimateQPS(),
		"http_avg_latency_ms":          averageLatencyMs(),
		"http_request_total":           httpRequestTotal.Load(),
		"cache_hit_rate":               rate,
		"cache_hit_ratio":              ratio,
		"slow_request_total":           slowRequestTotal.Load(),
		"slow_request_threshold_ms":    slowRequestThreshold.Milliseconds(),
		"slow_query_total":             slowQueryTotal.Load(),
		"slow_query_threshold_ms":      slowQueryThreshold.Milliseconds(),
		"auth_login_total":             authLoginTotal.Load(),
		"auth_register_total":          authRegisterTotal.Load(),
		"auth_password_reset_total":    authPasswordResetTotal.Load(),
		"teams_create_total":           teamsCreateTotal.Load(),
		"teams_invite_total":           teamsInviteTotal.Load(),
		"billing_intent_total":         billingIntentTotal.Load(),
		"billing_webhook_total":        billingWebhookTotal.Load(),
		"admin_settings_write_total":   adminSettingsWriteTotal.Load(),
		"job_retry_total":              jobRetryTotal.Load(),
		"job_dead_letter_total":        jobDeadLetterTotal.Load(),
		"job_replay_total":             jobReplayTotal.Load(),
		"frontend_request_error_total": frontendRequestErrorTotal.Load(),
	}
}

func estimateQPS() float64 {
	// 模板级近似值：基于进程内累计请求数，便于本地压测对比。
	return float64(httpRequestTotal.Load()) / 60.0
}

func averageLatencyMs() float64 {
	total := httpRequestTotal.Load()
	if total == 0 {
		return 0
	}
	return float64(totalRequestLatencyMs.Load()) / float64(total)
}

func RecordAuthLogin() {
	authLoginTotal.Add(1)
}

func RecordAuthRegister() {
	authRegisterTotal.Add(1)
}

func RecordAuthPasswordReset() {
	authPasswordResetTotal.Add(1)
}

func RecordTeamsCreate() {
	teamsCreateTotal.Add(1)
}

func RecordTeamsInvite() {
	teamsInviteTotal.Add(1)
}

func RecordBillingIntent() {
	billingIntentTotal.Add(1)
}

func RecordBillingWebhook() {
	billingWebhookTotal.Add(1)
}

func RecordAdminSettingsWrite() {
	adminSettingsWriteTotal.Add(1)
}

func RecordJobRetry() {
	jobRetryTotal.Add(1)
}

func RecordJobDeadLetter() {
	jobDeadLetterTotal.Add(1)
}

func RecordJobReplay() {
	jobReplayTotal.Add(1)
}

func RecordFrontendRequestError() {
	frontendRequestErrorTotal.Add(1)
}
