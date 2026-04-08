package csrf

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Claims struct {
	TenantID      string `json:"tenant_id"`
	SessionToken  string `json:"session_token,omitempty"`
	IssuedAt      int64  `json:"iat"`
	ExpiresAt     int64  `json:"exp"`
	Nonce         string `json:"nonce"`
}

func randomNonce() (string, error) {
	var b [18]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b[:]), nil
}

func sign(secret []byte, payload []byte) string {
	m := hmac.New(sha256.New, secret)
	_, _ = m.Write(payload)
	return base64.RawURLEncoding.EncodeToString(m.Sum(nil))
}

func Issue(secret string, tenantID string, sessionToken string, ttl time.Duration) (string, error) {
	if tenantID == "" {
		tenantID = "default"
	}
	if ttl <= 0 {
		ttl = 2 * time.Hour
	}
	nonce, err := randomNonce()
	if err != nil {
		return "", err
	}
	now := time.Now()
	claims := Claims{
		TenantID:     tenantID,
		SessionToken: sessionToken,
		IssuedAt:     now.Unix(),
		ExpiresAt:    now.Add(ttl).Unix(),
		Nonce:        nonce,
	}
	raw, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}
	payload := base64.RawURLEncoding.EncodeToString(raw)
	sig := sign([]byte(secret), []byte(payload))
	return fmt.Sprintf("%s.%s", payload, sig), nil
}

func Verify(token string, secret string, tenantID string, sessionToken string) (*Claims, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 2 {
		return nil, errors.New("invalid csrf token")
	}
	payload := parts[0]
	sig := parts[1]
	want := sign([]byte(secret), []byte(payload))
	if !hmac.Equal([]byte(want), []byte(sig)) {
		return nil, errors.New("invalid csrf token")
	}
	raw, err := base64.RawURLEncoding.DecodeString(payload)
	if err != nil {
		return nil, errors.New("invalid csrf token")
	}
	var claims Claims
	if err := json.Unmarshal(raw, &claims); err != nil {
		return nil, errors.New("invalid csrf token")
	}
	now := time.Now().Unix()
	if claims.ExpiresAt > 0 && now > claims.ExpiresAt {
		return nil, errors.New("csrf token expired")
	}
	if tenantID == "" {
		tenantID = "default"
	}
	if claims.TenantID != tenantID {
		return nil, errors.New("invalid csrf token")
	}
	// Bind to session when present on either side.
	if claims.SessionToken != "" || sessionToken != "" {
		if claims.SessionToken != sessionToken {
			return nil, errors.New("invalid csrf token")
		}
	}
	return &claims, nil
}

