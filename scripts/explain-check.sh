#!/usr/bin/env sh
set -eu

API_URL="${1:-http://127.0.0.1:8080}"
COOKIE_FILE="${COOKIE_FILE:-/tmp/go_astro_explain_cookie.txt}"
CSRF_HEADER="${CSRF_HEADER:-X-CSRF-Token}"
CSRF_TOKEN="${CSRF_TOKEN:-}"
USE_CSRF=0

fetch_csrf_token() {
  response="$(curl -sS -c "${COOKIE_FILE}" "${API_URL}/api/v1/auth/csrf" || true)"
  printf "%s" "${response}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p' | head -n 1
}

if [ -z "${CSRF_TOKEN}" ]; then
  CSRF_TOKEN="$(fetch_csrf_token || true)"
fi

if [ -n "${CSRF_TOKEN}" ]; then
  USE_CSRF=1
else
  echo "[explain-check] csrf token unavailable, fallback to non-csrf login flow"
fi

if [ "${SKIP_LOGIN:-0}" != "1" ] || [ ! -f "${COOKIE_FILE}" ]; then
  rm -f "${COOKIE_FILE}" >/dev/null 2>&1 || true
  if [ "${USE_CSRF}" = "1" ]; then
    # refresh token after cookie reset
    CSRF_TOKEN="$(fetch_csrf_token || true)"
    if [ -z "${CSRF_TOKEN}" ]; then
      echo "[explain-check] csrf token refresh failed, fallback to non-csrf login flow"
      USE_CSRF=0
    fi
  fi
  if [ "${USE_CSRF}" = "1" ]; then
    login_code="$(curl -sS -o /dev/null -w '%{http_code}' \
      -c "${COOKIE_FILE}" \
      -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
      -H "X-Tenant-ID: default" \
      -H "Content-Type: application/json" \
      -X POST "${API_URL}/api/v1/auth/login" \
      -d '{"email":"admin@example.com","password":"admin123456"}')"
  else
    login_code="$(curl -sS -o /dev/null -w '%{http_code}' \
      -c "${COOKIE_FILE}" \
      -H "X-Tenant-ID: default" \
      -H "Content-Type: application/json" \
      -X POST "${API_URL}/api/v1/auth/login" \
      -d '{"email":"admin@example.com","password":"admin123456"}')"
  fi
  if [ "${login_code}" != "200" ]; then
    echo "[explain-check] login failed code=${login_code}" >&2
    exit 1
  fi
fi

for route in \
  "/api/v1/admin/users?page=1&page_size=20&sort_by=created_at&sort_order=desc&filter_role=member" \
  "/api/v1/admin/files?page=1&page_size=20&sort_by=created_at&sort_order=desc&filter_content_type=text/plain" \
  "/api/v1/admin/jobs?page=1&page_size=20&sort_by=created_at&sort_order=desc&filter_status=pending" \
  "/api/v1/admin/audit?page=1&page_size=20&sort_by=created_at&sort_order=desc&filter_action=auth.login" \
  "/api/v1/admin/overview"
do
  echo "[explain-check] ${route}"
  curl -sS -b "${COOKIE_FILE}" "${API_URL}${route}" | grep -E '"explain"' || true
done

echo "[explain-check] teams detail"
teams_payload="$(curl -sS -b "${COOKIE_FILE}" "${API_URL}/api/v1/teams" | cat)"
team_id="$(printf "%s" "${teams_payload}" | grep -Eo '"id":"[^"]+"' | head -n 1 | sed 's/"id":"//;s/"$//')"
if [ -n "${team_id}" ]; then
  curl -sS -b "${COOKIE_FILE}" "${API_URL}/api/v1/teams/${team_id}" | grep -E '"team"' || true
fi
