#!/usr/bin/env bash

set -euo pipefail

PORT="${PORT:-3000}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/health}"
LOG_FILE="${LOG_FILE:-/tmp/core-api-postgres-smoke.log}"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-45}"
SLEEP_SECONDS="${SLEEP_SECONDS:-1}"
DATABASE_HOST="${DATABASE_HOST:-127.0.0.1}"
DATABASE_PORT="${DATABASE_PORT:-5432}"
DB_WAIT_ATTEMPTS="${DB_WAIT_ATTEMPTS:-30}"

cleanup() {
  if [[ -n "${APP_PID:-}" ]] && kill -0 "${APP_PID}" 2>/dev/null; then
    kill "${APP_PID}" >/dev/null 2>&1 || true
    wait "${APP_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

wait_for_database() {
  echo "Waiting for Postgres on ${DATABASE_HOST}:${DATABASE_PORT}"
  for ((attempt=1; attempt<=DB_WAIT_ATTEMPTS; attempt++)); do
    if (echo >"/dev/tcp/${DATABASE_HOST}/${DATABASE_PORT}") >/dev/null 2>&1; then
      echo "Postgres is reachable."
      return 0
    fi
    sleep 1
  done

  echo "Postgres did not become reachable within ${DB_WAIT_ATTEMPTS}s."
  return 1
}

: >"${LOG_FILE}"
wait_for_database

echo "Starting API smoke check with CORE_API_ENABLED=${CORE_API_ENABLED:-unset}"
node dist/main.js >"${LOG_FILE}" 2>&1 &
APP_PID=$!

for ((attempt=1; attempt<=MAX_ATTEMPTS; attempt++)); do
  if ! kill -0 "${APP_PID}" 2>/dev/null; then
    wait "${APP_PID}" 2>/dev/null || true
    echo "Smoke check failed. API process exited before health became ready."
    echo "API logs:"
    cat "${LOG_FILE}"
    exit 1
  fi

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
