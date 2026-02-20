# ARCHITECTURE.md

## Data Flow
```mermaid
flowchart LR
  UI["Client / Frontend"] --> API["Service API Layer"]
  API --> P1["Pulsar Topic: persistent://billyronks/global-fintech/command"]
  API --> P2["Pulsar Topic: persistent://billyronks/global-fintech/event"]
  API --> P3["Pulsar Topic: persistent://billyronks/global-fintech/audit"]
  API --> O["Pulsar Topic: persistent://billyronks/global/observability"]
  P1 --> W["Workers / Domain Services"]
  P2 --> W
  P3 --> W
  W --> Q["Quickwit Index: logs-global-fintech"]
  API --> Q
```

## Standard Contracts
- Messaging: Apache Pulsar only for asynchronous inter-service communication.
- Observability: Quickwit ingestion with shared schema (`observability/log-schema.json`).
- Infrastructure: Harvester HCI target with `storageClassName: mayastor` (or Vitastor equivalent).
