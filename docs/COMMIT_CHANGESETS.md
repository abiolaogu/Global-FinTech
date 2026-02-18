# Commit-Ready Changesets

Use this split to keep review and rollback clean.

## Changeset 1: Infra + Runtime Hardening

Stage:

```bash
git add \
  .github/workflows/ci.yml \
  README.md \
  apps/api/Dockerfile \
  apps/api/package.json \
  apps/api/package-lock.json \
  apps/api/src \
  apps/api/tsconfig.build.json \
  apps/api/scripts/core-api-postgres-smoke.sh \
  docs/AIDD_GUARDRAILS.md \
  docs/REVIEW_GAP_ANALYSIS_2026-02-17.md \
  infra/coolify \
  infra/fleet \
  infra/helm/atlasx \
  infra/k8s/base/secrets.yaml \
  infra/rancher/README.md \
  scripts/deploy.sh \
  scripts/rollback.sh \
  scripts/aidd-guardrail.sh
```

Suggested commit message:

```text
feat(platform): harden runtime and deployment for Harvester/Fleet/Coolify with AIDD guardrails
```

## Changeset 2: Artifact Untracking Cleanup

Stage:

```bash
git add .gitignore
git add -u apps/api/dist apps/api/node_modules apps/web/.next apps/web/node_modules
```

Suggested commit message:

```text
chore(repo): remove generated artifacts from version control
```
