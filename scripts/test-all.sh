#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$ROOT/web/package.json" ]; then
  (cd "$ROOT/web" && npm install && npm run lint && npm run typecheck && npm run test)
fi

if [ -f "$ROOT/flutter/pubspec.yaml" ]; then
  (cd "$ROOT/flutter" && flutter test)
fi

if [ -f "$ROOT/android/gradlew" ]; then
  (cd "$ROOT/android" && ./gradlew test)
elif [ -f "$ROOT/gradlew" ]; then
  (cd "$ROOT" && ./gradlew test)
fi

if [ -f "$ROOT/ios/Package.swift" ]; then
  (cd "$ROOT/ios" && swift test)
fi
