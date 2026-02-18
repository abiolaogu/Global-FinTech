#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-3000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/health}"
LOG_FILE="${LOG_FILE:-/tmp/core-api-postgres-smoke.log}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-45}"
SLEEP_SECONDS="${SLEEP_SECONDS:-1}"

cleanup() {
  if [[ -n "${APP_PID:-}" ]] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" >/dev/null 2>&1 || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "Starting API smoke check with CORE_API_ENABLED=${CORE_API_ENABLED:-unset}"
node dist/main.js >"${LOG_FILE}" 2>&1 &
APP_PID=$!

for ((attempt=1; attempt<=MAX_ATTEMPTS; attempt++)); do
  if response="$(curl -fsS "${HEALTH_URL}" 2>/dev/null)"; then
    if echo "${response}" | grep -q '"coreApiEnabled":true'; then
      echo "Smoke check passed: ${response}"
      exit 0
    fi

    echo "Health endpoint responded but core API flag is not true: ${response}"
    break
  fi

  sleep "${SLEEP_SECONDS}"
done

echo "Smoke check failed. API logs:"
cat "${LOG_FILE}"
exit 1
