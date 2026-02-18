#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "$ROOT/backend" ]; then
  DEFAULT_SCHEMA="$ROOT/backend/schema.graphql"
else
  DEFAULT_SCHEMA="$ROOT/schema.graphql"
fi
SCHEMA_PATH="${SCHEMA_PATH:-$DEFAULT_SCHEMA}"

if [ -z "${HASURA_ENDPOINT:-}" ]; then
  echo "HASURA_ENDPOINT is not set. Skipping schema pull."
  exit 0
fi

mkdir -p "$(dirname "$SCHEMA_PATH")"
CMD=(npx --yes get-graphql-schema "$HASURA_ENDPOINT")
if [ -n "${HASURA_ADMIN_SECRET:-}" ]; then
  CMD+=( -h "x-hasura-admin-secret: ${HASURA_ADMIN_SECRET}" )
fi
"${CMD[@]}" > "$SCHEMA_PATH"
echo "Schema updated at $SCHEMA_PATH"
