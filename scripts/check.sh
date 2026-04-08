#!/usr/bin/env sh
set -eu

free_port_if_busy() {
  port="$1"
  if command -v lsof >/dev/null 2>&1; then
    pid="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null | head -n 1 || true)"
    if [ -n "${pid:-}" ]; then
      echo "[check] port ${port} occupied by pid=${pid}, terminating stale process"
      kill "$pid" >/dev/null 2>&1 || true
      sleep 0.5
    fi
  fi
}

free_port_if_busy 4411
free_port_if_busy 4321

GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go test -C apps/api ./...
npm run check -w apps/web
npm run build -w apps/web
npm run test:e2e -w apps/web

API_URL="${API_URL:-http://127.0.0.1:8080}"
DEVSTACK_PID=""

cleanup() {
  if [ -n "${DEVSTACK_PID}" ]; then
    kill "${DEVSTACK_PID}" >/dev/null 2>&1 || true
  fi
  if [ -n "${DEVSTACK_RUNTIME_DIR:-}" ] && [ -f "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" ]; then
    stale_pid="$(sed -n '1p' "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" 2>/dev/null || true)"
    if [ -n "${stale_pid:-}" ] && kill -0 "${stale_pid}" >/dev/null 2>&1; then
      kill "${stale_pid}" >/dev/null 2>&1 || true
    fi
    rm -f "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

if curl -fsS "${API_URL}/readyz" >/dev/null 2>&1; then
  if ! zsh scripts/explain-check.sh "${API_URL}"; then
    echo "[check] explain-check failed on external api, fallback to embedded devstack"
    force_devstack=1
  else
    force_devstack=0
  fi
else
  force_devstack=1
fi

if [ "${force_devstack}" = "1" ]; then
  echo "[check] api not ready on ${API_URL}, starting embedded devstack for explain-check"

  port_in_use() {
    lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1
  }

  if [ -z "${DEVSTACK_POSTGRES_PORT:-}" ] || [ -z "${DEVSTACK_REDIS_PORT:-}" ] || [ -z "${DEVSTACK_API_PORT:-}" ] || [ -z "${DEVSTACK_WEB_PORT:-}" ]; then
    seed=$((50000 + ($$ % 10000)))
    while :; do
      candidate_pg=$seed
      candidate_redis=$((seed + 1))
      candidate_api=$((seed + 2))
      candidate_web=$((seed + 3))
      if ! port_in_use "$candidate_pg" && ! port_in_use "$candidate_redis" && ! port_in_use "$candidate_api" && ! port_in_use "$candidate_web"; then
        DEVSTACK_POSTGRES_PORT="${DEVSTACK_POSTGRES_PORT:-$candidate_pg}"
        DEVSTACK_REDIS_PORT="${DEVSTACK_REDIS_PORT:-$candidate_redis}"
        DEVSTACK_API_PORT="${DEVSTACK_API_PORT:-$candidate_api}"
        DEVSTACK_WEB_PORT="${DEVSTACK_WEB_PORT:-$candidate_web}"
        break
      fi
      seed=$((seed + 10))
    done
  fi

  DEVSTACK_RUNTIME_DIR="${DEVSTACK_RUNTIME_DIR:-$(pwd)/apps/api/.devstack-check}"
  export DEVSTACK_RUNTIME_DIR

  if [ -f "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" ]; then
    stale_pid="$(sed -n '1p' "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" 2>/dev/null || true)"
    if [ -n "${stale_pid:-}" ] && kill -0 "${stale_pid}" >/dev/null 2>&1; then
      kill "${stale_pid}" >/dev/null 2>&1 || true
      sleep 0.5
    fi
    rm -f "${DEVSTACK_RUNTIME_DIR}/postgres-data/postmaster.pid" >/dev/null 2>&1 || true
  fi

  (
    cd apps/api
    export DEVSTACK_POSTGRES_PORT DEVSTACK_REDIS_PORT DEVSTACK_API_PORT DEVSTACK_WEB_PORT DEVSTACK_RUNTIME_DIR
    GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go run ./cmd/devstack >/tmp/go_astro_check_devstack.log 2>&1
  ) &
  DEVSTACK_PID="$!"

  READY_URL="http://127.0.0.1:${DEVSTACK_API_PORT}/readyz"
  i=0
  while [ "$i" -lt 120 ]; do
    if curl -fsS "${READY_URL}" >/dev/null 2>&1; then
      break
    fi
    i=$((i + 1))
    sleep 1
  done
  if ! curl -fsS "${READY_URL}" >/dev/null 2>&1; then
    echo "[check] devstack failed to become ready" >&2
    cat /tmp/go_astro_check_devstack.log >&2 || true
    exit 1
  fi
  zsh scripts/explain-check.sh "http://127.0.0.1:${DEVSTACK_API_PORT}"
fi

zsh scripts/deploy-check.sh
