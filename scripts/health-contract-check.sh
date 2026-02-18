#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

fail() {
  echo "Health contract check failed: $1"
  exit 1
}

echo "[1/3] Checking core API health contract"
API_CONTROLLER="$ROOT_DIR/apps/api/src/platform/platform.controller.ts"
[[ -f "$API_CONTROLLER" ]] || fail "Missing platform controller at $API_CONTROLLER"
grep -n "@Get('health')" "$API_CONTROLLER" >/dev/null || fail "API /health route missing"
grep -n "@Get('health/ready')" "$API_CONTROLLER" >/dev/null || fail "API /health/ready route missing"
grep -n "status: 'ok'" "$API_CONTROLLER" >/dev/null || fail "API /health status payload missing"

echo "[2/3] Checking Java service health contracts"
JAVA_SERVICES=(
  "audit-trail-svc"
  "crm-core"
  "crypto-custody-svc"
  "fabric-bridge-svc"
  "fx-treasury-svc"
  "kyc-kyb-svc"
  "ledger-facade-svc"
  "notification-svc"
  "payments-switch-svc"
)

for service in "${JAVA_SERVICES[@]}"; do
  src_dir="$ROOT_DIR/services/$service/src/main/java"
  [[ -d "$src_dir" ]] || fail "Missing Java source directory for $service"
  grep -R -n '@GetMapping("/health")' "$src_dir" >/dev/null || fail "$service missing /health mapping"
  grep -R -n -E 'status\\?"[[:space:]]*:[[:space:]]*\\?"UP' "$src_dir" >/dev/null || fail "$service missing UP health payload"
done

echo "[3/3] Checking Python service health contracts"
PYTHON_SERVICES=(
  "ai-advisor-svc"
  "risk-engine-svc"
)

for service in "${PYTHON_SERVICES[@]}"; do
  main_py="$ROOT_DIR/services/$service/main.py"
  if [[ ! -f "$main_py" ]]; then
    main_py="$ROOT_DIR/services/$service/app/main.py"
  fi

  [[ -f "$main_py" ]] || fail "Missing main.py for $service"
  grep -n '@app.get("/health")' "$main_py" >/dev/null || fail "$service missing /health route"
  grep -E -n '"status"\s*:\s*"UP"|'\''status'\''\s*:\s*'\''UP'\''' "$main_py" >/dev/null || fail "$service missing UP status payload"
done

echo "Health contract checks passed."
