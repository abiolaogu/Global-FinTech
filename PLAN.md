# PLAN.md

## Repo
- Name: `Global-FinTech`
- Vertical: `FinTech`
- Core language: `TypeScript/JavaScript`
- Benchmark targets: `Stripe, Adyen`

## Audit Summary (2026-02-20)
- Pulsar references found: `0`
- Quickwit references found: `0`
- REST/polling indicators found: `50`

## Engineering Plan
1. Standardize event boundaries on Apache Pulsar topics and remove high-frequency REST polling paths.
2. Standardize observability through Quickwit with a shared log schema and index strategy.
3. Align Kubernetes manifests for Harvester HCI with Mayastor/Vitastor compatible storage classes.
4. Add compliance and API contracts as code artifacts.

## Tech Stack Evolution
- Recommendation: Migrate high-concurrency workers and streaming adapters to Go/Rust while keeping UI in TS.

## Autonomous Feature Expansion
- Proposed capability: Autonomous payment routing + real-time fraud graph scoring
