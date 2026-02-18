# Flutter Frontend (Ferry + Riverpod + GoRouter)

## Structure

- `lib/core` shared environment and utility layer
- `lib/features/*/{data,domain,presentation}` clean architecture slices
- `lib/graphql` operations and generated types

## Commands

```bash
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter test
```
