package settings

import (
	"context"
	"strings"

	"github.com/night/go-astro-template/apps/api/internal/metrics"
	"github.com/night/go-astro-template/apps/api/internal/pkg/tenant"
)

func (s *Service) GetSiteSettings(ctx context.Context) (map[string]any, error) {
	return s.getDomainSettings(ctx, "site", map[string]any{
		"name":       s.cfg.App.Name,
		"base_url":   s.cfg.App.BaseURL,
		"web_origin": s.cfg.App.WebOrigin,
	})
}

func (s *Service) GetAuthSettings(ctx context.Context) (map[string]any, error) {
	return s.getDomainSettings(ctx, "auth", map[string]any{
		"default_admin_email": s.cfg.Auth.DefaultAdminEmail,
		"session_ttl_seconds": int(s.cfg.Session.TTL.Seconds()),
		"secure_cookie":       s.cfg.Session.Secure,
	})
}

func (s *Service) GetSMTPSettings(ctx context.Context) (map[string]any, error) {
	return s.getDomainSettings(ctx, "smtp", map[string]any{
		"host": s.cfg.SMTP.Host,
		"port": s.cfg.SMTP.Port,
		"from": s.cfg.SMTP.From,
	})
}

func (s *Service) GetStorageSettings(ctx context.Context) (map[string]any, error) {
	return s.getDomainSettings(ctx, "storage", map[string]any{
		"bucket":             s.cfg.R2.Bucket,
		"endpoint":           s.cfg.R2.Endpoint,
		"public_base_url":    s.cfg.R2.PublicBaseURL,
		"max_upload_size_mb": s.cfg.Storage.MaxUploadSizeMB,
	})
}

func (s *Service) GetRuntimeSettings(ctx context.Context) (map[string]any, error) {
	return s.getDomainSettings(ctx, "runtime", map[string]any{
		"jobs_default_queue":  s.cfg.Jobs.DefaultQueue,
		"jobs_critical_queue": s.cfg.Jobs.CriticalQueue,
		"jobs_max_retries":    s.cfg.Jobs.MaxRetries,
		"settings_cache_ttl":  s.cfg.Settings.CacheTTLSeconds,
	})
}

func (s *Service) GetSEOSettings(ctx context.Context) (map[string]any, error) {
	defaultKeywords := "saas,template,go,astro"
	return s.getDomainSettings(ctx, "seo", map[string]any{
		"site_name":                s.cfg.App.Name,
		"site_description":         "Production-ready SaaS template",
		"site_url":                 s.cfg.App.WebOrigin,
		"default_language":         "en",
		"organization_type":        "Organization",
		"organization_name":        s.cfg.App.Name,
		"organization_logo":        "",
		"organization_description": "",
		"contact_email":            s.cfg.SMTP.From,
		"social_links":             map[string]any{},
		"robots_allow_paths":       []string{"/"},
		"robots_disallow_paths":    []string{"/admin/", "/dashboard/", "/api/"},
		"robots_custom_rules":      "",
		"sitemap_include_paths":    []string{"/", "/about", "/contact", "/blog"},
		"sitemap_exclude_paths":    []string{"/admin", "/dashboard", "/api"},
		"sitemap_change_freq":      "weekly",
		"sitemap_priority":         0.5,
		"google_analytics_id":      "",
		"google_site_verification": "",
		"bing_site_verification":   "",
		"default_og_image":         "",
		"default_twitter_card":     "summary_large_image",
		"default_keywords":         defaultKeywords,
		"enable_structured_data":   true,
		"enable_breadcrumbs":       true,
		"enable_author_schema":     true,
	})
}

func (s *Service) SaveSiteSettings(ctx context.Context, payload map[string]any) error {
	return s.saveDomainSettings(ctx, "site", payload)
}

func (s *Service) SaveAuthSettings(ctx context.Context, payload map[string]any) error {
	return s.saveDomainSettings(ctx, "auth", payload)
}

func (s *Service) SaveSMTPSettings(ctx context.Context, payload map[string]any) error {
	return s.saveDomainSettings(ctx, "smtp", payload)
}

func (s *Service) SaveStorageSettings(ctx context.Context, payload map[string]any) error {
	return s.saveDomainSettings(ctx, "storage", payload)
}

func (s *Service) SaveRuntimeSettings(ctx context.Context, payload map[string]any) error {
	return s.saveDomainSettings(ctx, "runtime", payload)
}

func (s *Service) SaveSEOSettings(ctx context.Context, payload map[string]any) error {
	normalized := map[string]any{}
	for key, value := range payload {
		normalized[key] = value
	}

	if raw, ok := normalized["default_language"]; ok {
		if lang, ok := raw.(string); ok {
			lang = strings.TrimSpace(strings.ToLower(lang))
			switch lang {
			case "en", "zh", "ja":
				normalized["default_language"] = lang
			default:
				normalized["default_language"] = "en"
			}
		}
	}

	return s.saveDomainSettings(ctx, "seo", normalized)
}

func (s *Service) InitSEOSettings(ctx context.Context) (map[string]any, bool, error) {
	existing, err := s.settings.GetValue(ctx, tenant.TenantID(ctx), "seo", "config")
	if err != nil {
		return nil, false, err
	}
	if len(existing) > 0 {
		current, currentErr := s.GetSEOSettings(ctx)
		return current, true, currentErr
	}

	defaults, err := s.GetSEOSettings(ctx)
	if err != nil {
		return nil, false, err
	}
	if err := s.settings.Upsert(ctx, tenant.TenantID(ctx), "seo", "config", defaults); err != nil {
		return nil, false, err
	}
	_ = s.cache.delete(ctx, "seo")

	current, currentErr := s.GetSEOSettings(ctx)
	return current, false, currentErr
}

func (s *Service) getDomainSettings(ctx context.Context, domain string, defaults map[string]any) (map[string]any, error) {
	if payload, hit, err := s.cache.load(ctx, domain); err == nil && hit && payload != nil {
		metrics.RecordCacheHit()
		return mergeSettings(defaults, payload), nil
	} else if err != nil {
		return nil, err
	}
	metrics.RecordCacheMiss()

	raw, err := s.settings.GetValue(ctx, tenant.TenantID(ctx), domain, "config")
	if err != nil {
		return nil, err
	}

	merged := mergeSettings(defaults, raw)
	_ = s.cache.save(ctx, domain, merged)
	return merged, nil
}

func (s *Service) saveDomainSettings(ctx context.Context, domain string, payload map[string]any) error {
	if err := s.settings.Upsert(ctx, tenant.TenantID(ctx), domain, "config", payload); err != nil {
		return err
	}
	return s.cache.delete(ctx, domain)
}

func mergeSettings(defaults, overrides map[string]any) map[string]any {
	merged := map[string]any{}
	for key, value := range defaults {
		merged[key] = value
	}
	for key, value := range overrides {
		merged[key] = value
	}
	return merged
}
