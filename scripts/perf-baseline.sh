#!/usr/bin/env sh
set -eu

BASE_URL="${1:-http://127.0.0.1:8080}"
OUT_DIR="${OUT_DIR:-/tmp/go_astro_perf}"
TS="$(date +%Y%m%d%H%M%S)"
OUT_FILE="${OUT_DIR}/baseline_${TS}.txt"
COOKIE_FILE="${COOKIE_FILE:-/tmp/go_astro_perf_cookie.txt}"
CSRF_HEADER="${CSRF_HEADER:-X-CSRF-Token}"
CSRF_TOKEN="${CSRF_TOKEN:-}"
COUNT_LOGIN="${COUNT_LOGIN:-30}"
COUNT_ADMIN="${COUNT_ADMIN:-10}"
SKIP_EXPLAIN_CHECK="${SKIP_EXPLAIN_CHECK:-0}"
SKIP_CSRF_FETCH="${SKIP_CSRF_FETCH:-0}"

mkdir -p "${OUT_DIR}"

LOGIN_TMP="${OUT_DIR}/baseline_login_${TS}.tmp"
ROUTE_TMP="${OUT_DIR}/baseline_route_${TS}.tmp"

CSRF_HTTP_CODE="000"
csrf_available="0"

fetch_csrf_token() {
  payload="$(curl -sS -c "${COOKIE_FILE}" -w '\n__HTTP_CODE__:%{http_code}\n' "${BASE_URL}/api/v1/auth/csrf" || true)"
  CSRF_HTTP_CODE="$(printf "%s\n" "${payload}" | sed -n 's/^__HTTP_CODE__:\([0-9][0-9][0-9]\)$/\1/p' | tail -n 1)"
  printf "%s\n" "${payload}" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p' | head -n 1
}

login_code_once() {
  if [ "${csrf_available}" = "1" ]; then
    curl -sS -o /dev/null -w '%{http_code}' \
      -b "${COOKIE_FILE}" \
      -c "${COOKIE_FILE}" \
      -H "Content-Type: application/json" \
      -H "X-Tenant-ID: default" \
      -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
      -X POST "${BASE_URL}/api/v1/auth/login" \
      -d '{"email":"admin@example.com","password":"admin123456"}'
    return
  fi
  curl -sS -o /dev/null -w '%{http_code}' \
    -b "${COOKIE_FILE}" \
    -c "${COOKIE_FILE}" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: default" \
    -X POST "${BASE_URL}/api/v1/auth/login" \
    -d '{"email":"admin@example.com","password":"admin123456"}'
}

login_metric_once() {
  request_no="$1"
  if [ "${csrf_available}" = "1" ]; then
    curl -sS -o /dev/null \
      -w "request=${request_no} code=%{http_code} total=%{time_total}" \
      -b "${COOKIE_FILE}" \
      -c "${COOKIE_FILE}" \
      -H "Content-Type: application/json" \
      -H "X-Tenant-ID: default" \
      -H "${CSRF_HEADER}: ${CSRF_TOKEN}" \
      -X POST "${BASE_URL}/api/v1/auth/login" \
      -d '{"email":"admin@example.com","password":"admin123456"}'
    return
  fi
  curl -sS -o /dev/null \
    -w "request=${request_no} code=%{http_code} total=%{time_total}" \
    -b "${COOKIE_FILE}" \
    -c "${COOKIE_FILE}" \
    -H "Content-Type: application/json" \
    -H "X-Tenant-ID: default" \
    -X POST "${BASE_URL}/api/v1/auth/login" \
    -d '{"email":"admin@example.com","password":"admin123456"}'
}

calc_avg() {
  column="$1"
  file="$2"
  awk -v column="${column}" '{sum += $column; count += 1} END {if (count == 0) {printf "0.000000"} else {printf "%.6f", sum / count}}' "${file}"
}

calc_p95() {
  column="$1"
  file="$2"
  awk -v column="${column}" '{print $column}' "${file}" | sort -n | \
    awk '{
      values[++count] = $1
    } END {
      if (count == 0) {
        printf "0.000000"
        exit
      }
      idx = int((count * 95 + 99) / 100)
      if (idx < 1) {
        idx = 1
      }
      if (idx > count) {
        idx = count
      }
      printf "%.6f", values[idx]
    }'
}

collect_route_stats() {
  route="$1"
  route_name="$2"
  : > "${ROUTE_TMP}"
  i=1
  while [ "${i}" -le "${COUNT_ADMIN}" ]; do
    line="$(curl -sS -o /dev/null -w "code=%{http_code} total=%{time_total}" -b "${COOKIE_FILE}" "${BASE_URL}${route}")"
    code="$(printf "%s\n" "${line}" | sed -n 's/.*code=\([0-9][0-9][0-9]\).*/\1/p' | head -n 1)"
    total="$(printf "%s\n" "${line}" | sed -n 's/.*total=\([0-9.]*\).*/\1/p' | head -n 1)"
    printf "%s %s\n" "${code}" "${total}" >> "${ROUTE_TMP}"
    i=$((i + 1))
  done

  error_count="$(awk '$1 + 0 >= 400 {count += 1} END {print count + 0}' "${ROUTE_TMP}")"
  avg="$(calc_avg 2 "${ROUTE_TMP}")"
  p95="$(calc_p95 2 "${ROUTE_TMP}")"
  printf "%s_avg=%s\n" "${route_name}" "${avg}"
  printf "%s_p95=%s\n" "${route_name}" "${p95}"
  printf "%s_errors=%s\n" "${route_name}" "${error_count}"
}

if [ -n "${CSRF_TOKEN}" ]; then
  csrf_available="1"
else
  rm -f "${COOKIE_FILE}" >/dev/null 2>&1 || true
  if [ "${SKIP_CSRF_FETCH}" != "1" ]; then
    CSRF_TOKEN="$(fetch_csrf_token || true)"
    if [ -n "${CSRF_TOKEN}" ]; then
      csrf_available="1"
    fi
  fi
fi

login_code="$(login_code_once)"
if [ "${login_code}" != "200" ]; then
  echo "[perf-baseline] login failed code=${login_code} csrf_available=${csrf_available} csrf_http=${CSRF_HTTP_CODE}" >&2
  exit 1
fi

{
  echo "# Perf Baseline"
  echo "timestamp=${TS}"
  echo "base_url=${BASE_URL}"
  echo "count_login=${COUNT_LOGIN}"
  echo "count_admin=${COUNT_ADMIN}"
  echo "csrf_available=${csrf_available}"
  echo "csrf_http_code=${CSRF_HTTP_CODE}"
  echo "skip_csrf_fetch=${SKIP_CSRF_FETCH}"
  echo "skip_explain_check=${SKIP_EXPLAIN_CHECK}"
  echo ""

  echo "## login"
  : > "${LOGIN_TMP}"
  i=1
  while [ "${i}" -le "${COUNT_LOGIN}" ]; do
    line="$(login_metric_once "${i}")"
    code="$(printf "%s\n" "${line}" | sed -n 's/.*code=\([0-9][0-9][0-9]\).*/\1/p' | head -n 1)"
    total="$(printf "%s\n" "${line}" | sed -n 's/.*total=\([0-9.]*\).*/\1/p' | head -n 1)"
    printf "%s %s %s\n" "${i}" "${code}" "${total}" >> "${LOGIN_TMP}"
    echo "${line}"
    i=$((i + 1))
  done

  login_total="$(awk 'END {print NR + 0}' "${LOGIN_TMP}")"
  login_success="$(awk '$2 == "200" {count += 1} END {print count + 0}' "${LOGIN_TMP}")"
  login_429="$(awk '$2 == "429" {count += 1} END {print count + 0}' "${LOGIN_TMP}")"
  login_error="$(awk '$2 + 0 >= 400 {count += 1} END {print count + 0}' "${LOGIN_TMP}")"
  login_success_rate="$(awk -v ok="${login_success}" -v total="${login_total}" 'BEGIN {if (total == 0) {printf "0.00"} else {printf "%.2f", ok * 100 / total}}')"
  login_429_rate="$(awk -v rate="${login_429}" -v total="${login_total}" 'BEGIN {if (total == 0) {printf "0.00"} else {printf "%.2f", rate * 100 / total}}')"
  login_avg="$(calc_avg 3 "${LOGIN_TMP}")"
  login_p95="$(calc_p95 3 "${LOGIN_TMP}")"

  echo "login_total=${login_total}"
  echo "login_success=${login_success}"
  echo "login_error=${login_error}"
  echo "login_rate_limited=${login_429}"
  echo "login_success_rate_percent=${login_success_rate}"
  echo "login_rate_limited_percent=${login_429_rate}"
  echo "login_avg=${login_avg}"
  echo "login_p95=${login_p95}"

  echo ""
  echo "## admin latency"
  collect_route_stats "/api/v1/admin/overview" "overview"
  collect_route_stats "/api/v1/admin/users?page=1&page_size=20" "users"
  collect_route_stats "/api/v1/admin/files?page=1&page_size=20" "files"
  collect_route_stats "/api/v1/admin/jobs?page=1&page_size=20" "jobs"
  collect_route_stats "/api/v1/admin/audit?page=1&page_size=20" "audit"

  echo ""
  echo "## explain-check"
  if [ "${SKIP_EXPLAIN_CHECK}" = "1" ]; then
    echo "explain-check=skipped_by_flag"
  elif [ "${csrf_available}" != "1" ]; then
    echo "explain-check=skipped_no_csrf"
  elif CSRF_TOKEN="${CSRF_TOKEN}" COOKIE_FILE="${COOKIE_FILE}" SKIP_LOGIN=1 zsh scripts/explain-check.sh "${BASE_URL}"; then
    echo "explain-check=ok"
  else
    echo "explain-check=failed"
  fi
} >"${OUT_FILE}"

echo "[perf-baseline] report=${OUT_FILE}"
cat "${OUT_FILE}"
