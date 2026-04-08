#!/usr/bin/env sh
set -eu

cd apps/api
GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go generate ./ent
