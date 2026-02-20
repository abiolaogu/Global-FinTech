# RUNBOOK

## Service Operations
- Deployment target: Kubernetes (Harvester HCI)
- Event backbone: Apache Pulsar
- Search/Log index: Quickwit

## SLO Baseline
- Availability: 99.9%
- Error budget tracked monthly

## Incident Response
1. Detect via alerts/log anomalies.
2. Triage severity and blast radius.
3. Mitigate and stabilize.
4. Run post-incident review with action items.

## Key Checks
- Pulsar topic lag and DLQ growth
- Quickwit ingestion latency
- API error rates and p95 latency
