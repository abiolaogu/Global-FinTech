# Rancher Fleet GitOps Deployment

This bundle deploys the `atlasx` Helm chart through Rancher Fleet.

## Structure

- `fleet.yaml`: Fleet bundle definition.
- `values/common.yaml`: Shared values for all clusters.
- `values/production.yaml`: Overrides for production clusters (`env=production`).
- `values/staging.yaml`: Overrides for staging clusters (`env=staging`).

## Usage

1. Label target clusters in Rancher:
   - Production: `env=production`
   - Staging: `env=staging`
2. Add this repository to Fleet.
3. Point Fleet to `infra/fleet/` path.

## Harvester Notes

- Use CSI storage classes provided by Harvester (for example `harvester-longhorn`) in Helm values when internal stateful dependencies are enabled.
- Prefer external PostgreSQL and Redis for production multi-region deployments.
