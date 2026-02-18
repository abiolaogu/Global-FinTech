# Deployment Guide — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Local Development

```bash
# Prerequisites: Docker, Node.js 20+, Python 3.11+
git clone https://github.com/abiolaogu/Global-FinTech.git
cd Global-FinTech
cp .env.example .env
docker-compose up -d  # PostgreSQL, Redis, Kafka
cd apps/api && pnpm install && pnpm run start:dev
```

## 2. Kubernetes Deployment (Helm)

### 2.1 Prerequisites
- GKE cluster provisioned via Terraform (`infra/terraform/`)
- `kubectl` configured for target cluster
- Helm 3 installed

### 2.2 Deploy via Helm
```bash
cd infra/helm/atlasx
helm dependency update
helm upgrade --install atlasx . -f values-production.yaml -n atlasx-prod --create-namespace
```

### 2.3 Verify Deployment
```bash
kubectl get pods -n atlasx-prod
kubectl get svc -n atlasx-prod
```

## 3. GitOps (Rancher Fleet)

Fleet bundles in `infra/fleet/` manage multi-environment deployments:
- `staging/values.yaml` — staging overrides
- `production/values.yaml` — production overrides

Fleet automatically syncs on push to main.

## 4. Coolify (Self-Hosted PaaS)

For self-hosted deployments, use the Coolify stack in `infra/coolify/`:
```bash
cd infra/coolify
docker-compose up -d
```

## 5. CI/CD Pipeline

### GitHub Actions (`.github/workflows/ci.yml`)
1. Build web, API, and AI services
2. Run unit and integration tests
3. Execute AIDD guardrail checks
4. Build and push Docker images
5. Deploy to staging (auto) / production (manual approval)

### Jenkins (`Jenkinsfile`)
1. Python tests for RegAI service
2. OPA policy tests
3. Security scanning

## 6. Rollback

```bash
# Helm rollback
scripts/rollback.sh <revision>

# Or manually
helm rollback atlasx <revision> -n atlasx-prod
```

## 7. Pre-Deployment Checklist

- [ ] All CI checks pass
- [ ] Database migrations reviewed and tested
- [ ] Feature flags configured for target environment
- [ ] Secrets updated in Vault
- [ ] Monitoring dashboards verified
- [ ] Rollback plan documented
