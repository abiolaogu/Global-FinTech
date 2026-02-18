#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$ROOT/web/package.json" ] && [ -f "$ROOT/web/codegen.ts" ]; then
  (cd "$ROOT/web" && npx graphql-codegen --config codegen.ts)
fi

if [ -f "$ROOT/flutter/pubspec.yaml" ]; then
  (cd "$ROOT/flutter" && flutter pub get && flutter pub run build_runner build --delete-conflicting-outputs)
fi

if [ -f "$ROOT/android/gradlew" ]; then
  (cd "$ROOT/android" && ./gradlew :app:generateApolloSources)
elif [ -f "$ROOT/gradlew" ]; then
  (cd "$ROOT" && ./gradlew :app:generateApolloSources)
fi

if [ -f "$ROOT/ios/apollo-codegen-config.json" ]; then
  (cd "$ROOT/ios" && swift package resolve)
fi
