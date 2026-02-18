# AIDD Guardrails

This repository uses **AIDD** guardrails for deployment quality:

- **A - Architecture**: Required deployment assets must exist for Helm, Fleet, and Coolify.
- **I - Integrity**: Production deployment values must use immutable image tags and external secrets.
- **D - Defense**: Secure defaults must stay enabled (network policy, read-only filesystem, least privilege).
- **D - Delivery**: Helm dependencies, linting, and template rendering must pass before merge.
  - Delivery checks also fail if generated artifacts (`dist`, `.next`, `node_modules`) are tracked in Git.

## Enforcement

Run:

```bash
./scripts/aidd-guardrail.sh
```

The CI workflow also runs this script on every push and pull request to `main`.

## Why It Matters

These checks reduce release risk for globally distributed fintech deployments by ensuring:

- deterministic deploys,
- secure secret handling,
- network isolation by default,
- reproducible GitOps bundles for Rancher Fleet and Harvester HCI.
