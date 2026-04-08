#!/usr/bin/env sh
set -eu

echo "[devstack] starting embedded PostgreSQL + Redis-compatible server + API"
cd apps/api
GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go run ./cmd/devstack
