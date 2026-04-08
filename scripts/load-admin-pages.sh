#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://127.0.0.1:8080}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/go_astro_load_admin_cookie.txt}"
COUNT="${COUNT:-5}"
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
  echo "[load-admin-pages] failed to fetch csrf token" >&2
  exit 1
fi

if [ "${SKIP_LOGIN:-0}" != "1" ] || [ ! -f "${COOKIE_FILE}" ]; then
  rm -f "${COOKIE_FILE}"
  CSRF_TOKEN="$(fetch_csrf_token || true)"
  if [ -z "${CSRF_TOKEN}" ]; then
    echo "[load-admin-pages] failed to refresh csrf token" >&2
    exit 1
  fi
  login_code="$(curl -sS -o /dev/null -w '%{http_code}' \
    -c "${COOKIE_FILE}" \
    -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
    -H "X-Tenant-ID: default" \
    -H "Content-Type: application/json" \
    -X POST "${BASE_URL}/api/v1/auth/login" \
    -d '{"email":"admin@example.com","password":"admin123456"}')"
  if [ "${login_code}" != "200" ]; then
    echo "[load-admin-pages] login failed code=${login_code}" >&2
    exit 1
  fi
fi

for route in \
  "/api/v1/admin/overview" \
  "/api/v1/admin/users" \
  "/api/v1/admin/files" \
  "/api/v1/admin/jobs" \
  "/api/v1/admin/audit" \
  "/api/v1/admin/settings/runtime"
do
  i=1
  while [ "${i}" -le "${COUNT}" ]; do
    echo "[load-admin-pages] request=${i} GET ${BASE_URL}${route}"
    curl -sS -o /dev/null \
      -b "${COOKIE_FILE}" \
      -w "code=%{http_code} total=%{time_total}\n" \
      "${BASE_URL}${route}"
    i=$((i + 1))
  done
done
