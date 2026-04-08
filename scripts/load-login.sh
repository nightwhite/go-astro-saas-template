#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://127.0.0.1:8080}"
COUNT="${COUNT:-20}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/go_astro_load_login_cookie.txt}"

echo "[load-login] target=${BASE_URL} count=${COUNT}"
CSRF_HEADER="${CSRF_HEADER:-X-CSRF-Token}"
CSRF_TOKEN="${CSRF_TOKEN:-}"

fetch_csrf_token() {
  curl -sS -c "${COOKIE_FILE}" "${BASE_URL}/api/v1/auth/csrf" | \
    sed -n 's/.*"token":"\([^"]*\)".*/\1/p' | head -n 1
}

if [ -z "${CSRF_TOKEN}" ]; then
  rm -f "${COOKIE_FILE}" >/dev/null 2>&1 || true
  CSRF_TOKEN="$(fetch_csrf_token || true)"
fi

if [ -z "${CSRF_TOKEN}" ]; then
  echo "[load-login] failed to fetch csrf token" >&2
  exit 1
fi

i=1
while [ "$i" -le "$COUNT" ]; do
  curl -sS -o /dev/null -w "request=${i} code=%{http_code} total=%{time_total}\n" \
    -b "${COOKIE_FILE}" \
    -c "${COOKIE_FILE}" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: default" \
    -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
    -X POST "${BASE_URL}/api/v1/auth/login" \
    -d '{"email":"admin@example.com","password":"admin123456"}'
  i=$((i + 1))
done
