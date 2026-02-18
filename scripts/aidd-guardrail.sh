#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Missing required file: $1"
    exit 1
  fi
}

assert_no_match() {
  local pattern="$1"
  local file="$2"
  local message="$3"
  if rg -n "$pattern" "$file" >/dev/null 2>&1; then
    echo "$message"
    rg -n "$pattern" "$file"
    exit 1
  fi
}

require_cmd rg
require_cmd helm

cd "$ROOT_DIR"

echo "[A] Architecture checks"
require_file "infra/helm/atlasx/templates/deployment.yaml"
require_file "infra/helm/atlasx/templates/service.yaml"
require_file "infra/helm/atlasx/templates/hpa.yaml"
require_file "infra/fleet/fleet.yaml"
require_file "infra/coolify/docker-compose.coolify.yaml"

echo "[I] Integrity checks"
assert_no_match "tag:\\s*\"latest\"" "infra/fleet/values/production.yaml" \
  "Production image tag must be immutable; found latest tag."
assert_no_match "create:\\s*true" "infra/fleet/values/production.yaml" \
  "Production must not create inline Kubernetes secrets."

if ! rg -n "existingSecret:\\s*[A-Za-z0-9._-]+" \
  "infra/fleet/values/production.yaml" "infra/fleet/values/common.yaml" >/dev/null 2>&1; then
  echo "Production must reference an existing secret."
  exit 1
fi

echo "[D] Defense checks"
if ! grep -A5 -n "^networkPolicy:" "infra/helm/atlasx/values.yaml" | rg -n "enabled:\\s*true" >/dev/null 2>&1; then
  echo "Network policy must be enabled by default."
  exit 1
fi

if ! rg -n "readOnlyRootFilesystem:\\s*true" "infra/helm/atlasx/values.yaml" >/dev/null 2>&1; then
  echo "Containers must use readOnlyRootFilesystem by default."
  exit 1
fi

echo "[D] Delivery checks"
if git ls-files | rg -n "^(apps/api/dist|apps/api/node_modules|apps/web/\\.next|apps/web/node_modules)" >/dev/null 2>&1; then
  echo "Generated artifacts must not be tracked in Git (dist/.next/node_modules)."
  exit 1
fi

helm repo add bitnami https://charts.bitnami.com/bitnami >/dev/null 2>&1 || true
helm repo update >/dev/null
helm dependency build infra/helm/atlasx
helm lint infra/helm/atlasx \
  --values infra/fleet/values/common.yaml \
  --values infra/fleet/values/staging.yaml
helm template atlasx infra/helm/atlasx \
  --values infra/fleet/values/common.yaml \
  --values infra/fleet/values/production.yaml >/dev/null

echo "AIDD guardrail checks passed."
