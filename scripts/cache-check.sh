#!/usr/bin/env sh
set -eu

API_URL="${1:-http://127.0.0.1:8080}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/go_astro_cache_cookie.txt}"
CSRF_HEADER="${CSRF_HEADER:-X-CSRF-Token}"
CSRF_TOKEN="${CSRF_TOKEN:-dev-token}"

if [ "${SKIP_LOGIN:-0}" != "1" ] || [ ! -f "${COOKIE_FILE}" ]; then
  rm -f "${COOKIE_FILE}"
  login_code="$(curl -sS -o /dev/null -w '%{http_code}' \
    -c "${COOKIE_FILE}" \
    -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
    -H "Content-Type: application/json" \
    -X POST "${API_URL}/api/v1/auth/login" \
    -d '{"email":"admin@example.com","password":"admin123456"}')"
  if [ "${login_code}" != "200" ]; then
    echo "[cache-check] login failed code=${login_code}" >&2
    exit 1
  fi
fi

echo "[cache-check] first settings request"
curl -sS -b "${COOKIE_FILE}" "${API_URL}/api/v1/admin/settings/runtime" >/dev/null

echo "[cache-check] second settings request"
curl -sS -b "${COOKIE_FILE}" "${API_URL}/api/v1/admin/settings/runtime" >/dev/null

echo "[cache-check] inspect /metrics for cache_hit_rate"
curl -sS "${API_URL}/metrics" | rg 'cache_hit_rate|cache_hit_ratio' || true
