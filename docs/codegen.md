# GraphQL Schema and Codegen

## Schema source

1. Set `HASURA_ENDPOINT` (and optional `HASURA_ADMIN_SECRET`) in `.env.local`.
2. Run:

```bash
make schema:pull
```

Schema is written to `backend/schema.graphql` when `backend/` exists, otherwise `schema.graphql`.

## Operations locations

- Web: `web/src/graphql/**/*.graphql`
- Flutter: `flutter/lib/graphql/**/*.graphql`
- Android: `android/app/src/main/graphql/**/*.graphql`
- iOS: `ios/Sources/GraphQL/**/*.graphql`

## Generate all clients

```bash
make codegen:all
```

## Validate stack quality gates

```bash
make test:all
```
