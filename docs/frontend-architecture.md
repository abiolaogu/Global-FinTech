# Frontend Architecture

This repository follows a unified frontend standard:

- Web: Refine v4 + Ant Design 5 + React Query (headless CRUD)
- Flutter: Ferry GraphQL + Riverpod + GoRouter (clean architecture)
- Android: Jetpack Compose + Apollo Kotlin + Hilt + Orbit MVI
- iOS: SwiftUI + Apollo iOS + TCA

Reference entities and CRUD flows use `User`, `Organization`, and `Project` when available.
Fallback entity is `Item` when schema differs.

## Structure

- `web/` React + Refine reference app
- `flutter/` Flutter reference app
- `android/` Compose reference app
- `ios/` SwiftUI + TCA reference app

## CI Contract

GitHub Actions are wired to run schema pull/codegen/tests when Hasura metadata,
schema, or GraphQL operation files change.
