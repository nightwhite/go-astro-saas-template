#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)

cd "$ROOT_DIR"

echo "[dev] starting from root: $ROOT_DIR"
echo "[dev] make sure root .env exists"

if [ ! -f ".env" ]; then
  echo "[dev] missing .env in project root"
  echo "[dev] create it first, for example: cp .env.example .env"
  exit 1
fi

set -a
. "$ROOT_DIR/.env"
set +a

cleanup() {
  if [ "${WEB_PID:-}" != "" ] && kill -0 "$WEB_PID" >/dev/null 2>&1; then
    kill "$WEB_PID" >/dev/null 2>&1 || true
  fi
  if [ "${API_PID:-}" != "" ] && kill -0 "$API_PID" >/dev/null 2>&1; then
    kill "$API_PID" >/dev/null 2>&1 || true
  fi
  pkill -f "astro dev --host 127.0.0.1 --port 4321" >/dev/null 2>&1 || true
  pkill -f "go run ./cmd/server" >/dev/null 2>&1 || true
}

find_pid_by_port() {
  port="$1"
  if command -v lsof >/dev/null 2>&1; then
    lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true
    return 0
  fi
  if command -v ss >/dev/null 2>&1; then
    ss -ltnp 2>/dev/null | awk -v p=":$port" '$4 ~ p {print $NF}' | sed -n 's/.*pid=\([0-9]*\).*/\1/p' || true
    return 0
  fi
  return 0
}

ensure_port_free() {
  port="$1"
  owner="$2"
  pids="$(find_pid_by_port "$port" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
  if [ -z "$pids" ]; then
    return 0
  fi
  echo "[dev] port $port occupied by pid(s): $pids, terminating for $owner startup"
  for pid in $pids; do
    kill "$pid" >/dev/null 2>&1 || true
  done
  sleep 0.5
  still_running="$(find_pid_by_port "$port" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
  if [ -n "$still_running" ]; then
    echo "[dev] forcing kill on port $port pid(s): $still_running"
    for pid in $still_running; do
      kill -9 "$pid" >/dev/null 2>&1 || true
    done
    sleep 0.3
  fi
  still_running="$(find_pid_by_port "$port" | tr '\n' ' ' | sed 's/[[:space:]]*$//')"
  if [ -n "$still_running" ]; then
    echo "[dev] failed to free port $port (pid(s): $still_running)"
    exit 1
  fi
}

wait_api_ready() {
  pid="$1"
  port="$2"
  # Wait up to ~20s for API to become ready.
  i=0
  while [ "$i" -lt 100 ]; do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      echo "[dev] api process exited before readiness"
      return 1
    fi
    if curl -fsS "http://127.0.0.1:${port}/readyz" >/dev/null 2>&1; then
      return 0
    fi
    i=$((i + 1))
    sleep 0.2
  done
  return 1
}

trap cleanup INT TERM EXIT

ensure_port_free "${APP_PORT:-8080}" "api"
ensure_port_free "4321" "web"

echo "[dev] starting api on http://127.0.0.1:${APP_PORT:-8080}"
cd "$ROOT_DIR/apps/api"
GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go run ./cmd/server &
API_PID=$!

echo "[dev] waiting for api readiness (/readyz)..."
if ! wait_api_ready "$API_PID" "${APP_PORT:-8080}"; then
  echo "[dev] api did not become ready in time, stopping"
  cleanup
  exit 1
fi

echo "[dev] starting web on http://127.0.0.1:4321"
cd "$ROOT_DIR"
npm run dev -w apps/web -- --host 127.0.0.1 --port 4321 --strictPort &
WEB_PID=$!

echo "[dev] web+api running (Ctrl+C to stop)"
while :; do
  if kill -0 "$WEB_PID" >/dev/null 2>&1; then
    :
  else
    echo "[dev] web exited, stopping api"
    cleanup
    exit 0
  fi
  if kill -0 "$API_PID" >/dev/null 2>&1; then
    :
  else
    echo "[dev] api exited, stopping web"
    cleanup
    exit 1
  fi
  sleep 1
done
