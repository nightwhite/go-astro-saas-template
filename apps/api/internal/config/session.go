package config

import "time"

type SessionConfig struct {
	CookieName string
	TTL        time.Duration
	Secure     bool
}

