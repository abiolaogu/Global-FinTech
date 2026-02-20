#!/usr/bin/env bash
set -euo pipefail

echo "[phase2] perf profile start: $(pwd)"

if [ -f go.mod ]; then
  echo "[phase2] go baseline"
  go test ./... || true
  go test -bench=. -benchmem ./... || true
fi

if [ -f Cargo.toml ]; then
  echo "[phase2] rust baseline"
  cargo check --all-targets || true
  cargo test --all --no-run || true
fi

if [ -f package.json ]; then
  echo "[phase2] node baseline"
  if command -v npm >/dev/null 2>&1; then
    npm run -s lint || true
    npm test --silent || true
  fi
fi

if [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  echo "[phase2] python baseline"
  python3 -m pytest -q || true
fi

echo "[phase2] perf profile complete"
