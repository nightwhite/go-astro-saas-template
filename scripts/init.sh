#!/usr/bin/env sh
set -eu

cp -n .env.example .env || true
GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go mod tidy -C apps/api
npm install
