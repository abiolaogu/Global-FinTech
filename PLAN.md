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

## Figma Make Prompt
Task:
Build a premium enterprise dashboard for this repository with real-time Pulsar health and Quickwit global search.
Output:
Desktop + mobile-ready information architecture and component specification in Figma Make TOKEN format.
Key Elements:
Tenant-aware navigation, live event stream indicators, compliance evidence timeline, global search with filters.
Expected Behaviors:
Low-latency updates, resilient loading states, actionable alerts, and audit-first interactions.
Notable Constraints:
Use the repository's actual domain model, preserve existing design language, and keep performance-first rendering.

