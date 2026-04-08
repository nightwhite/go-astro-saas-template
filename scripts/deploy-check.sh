#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

echo "[deploy-check] validating docker compose"
if command -v docker >/dev/null 2>&1; then
  docker compose -f deploy/docker/docker-compose.yml config >/dev/null
elif command -v docker-compose >/dev/null 2>&1; then
  docker-compose -f deploy/docker/docker-compose.yml config >/dev/null
else
  echo "[deploy-check] skip docker compose validation (docker not found)"
fi

echo "[deploy-check] validating helm templates"
if command -v helm >/dev/null 2>&1; then
  helm lint deploy/helm/go-astro-template
  helm template template deploy/helm/go-astro-template -f deploy/helm/go-astro-template/values.yaml >/dev/null
  helm template template deploy/helm/go-astro-template -f deploy/helm/go-astro-template/values.staging.yaml >/dev/null
  helm template template deploy/helm/go-astro-template -f deploy/helm/go-astro-template/values.production.yaml >/dev/null
else
  echo "[deploy-check] skip helm lint/template (helm not found)"
fi

echo "[deploy-check] validating k8s manifests"
if command -v kubectl >/dev/null 2>&1; then
  if kubectl cluster-info >/dev/null 2>&1; then
    for file in deploy/k8s/*.yaml; do
      kubectl apply --dry-run=client --validate=false -f "$file" >/dev/null
    done
  else
    echo "[deploy-check] skip kubectl apply dry-run (cluster not reachable)"
  fi
else
  echo "[deploy-check] skip kubectl dry-run (kubectl not found)"
fi

echo "[deploy-check] offline YAML syntax validation"
if command -v yq >/dev/null 2>&1; then
  for file in deploy/k8s/*.yaml; do
    yq e '.' "$file" >/dev/null
  done
else
  echo "[deploy-check] skip yq validation (yq not found)"
fi

echo "[deploy-check] running API deploycheck"
cd apps/api
GOWORK=off GOPROXY="${GOPROXY:-https://goproxy.cn,direct}" go run ./cmd/deploycheck
