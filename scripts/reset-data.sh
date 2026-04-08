#!/usr/bin/env sh
set -eu

docker compose -f deploy/docker/docker-compose.yml down -v
docker compose -f deploy/docker/docker-compose.yml up -d postgres redis
