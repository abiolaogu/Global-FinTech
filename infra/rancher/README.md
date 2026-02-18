# Rancher Deployment

Rancher is used as the control plane for Kubernetes clusters running on Harvester HCI.

## Recommended Pattern

1. Use Rancher Fleet for GitOps (`/infra/fleet`).
2. Deploy workloads through Helm (`/infra/helm/atlasx`).
3. Keep secrets in Vault or External Secrets Operator (no plaintext credentials in Git).

## Required Cluster Labels

- `env=production` for production clusters.
- `env=staging` for staging clusters.

Fleet target customizations in `infra/fleet/fleet.yaml` use these labels.
