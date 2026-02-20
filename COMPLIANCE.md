# COMPLIANCE.md

## Scope
Repository `Global-FinTech` mapped to controls for SOC2, HIPAA, and PCI-DSS where applicable.

## Control Mapping
| Control Family | Implementation in Repo |
|---|---|
| SOC2 CC6/CC7 | Pulsar authn/authz boundaries, centralized Quickwit logging, immutable audit topics |
| SOC2 CC8 | Git-tracked architecture/API/compliance artifacts and change plans |
| HIPAA 164.312(b) | Audit controls via Quickwit indexed trace/log records |
| HIPAA 164.312(c) | Integrity checks through event immutability and signed payload patterns |
| PCI-DSS 10 | Centralized security event logging with searchable trace correlation |
| PCI-DSS 7/8 | Role-based topic access and service identity enforcement |

## Evidence Artifacts
- `PLAN.md`
- `ARCHITECTURE.md`
- `API_SPEC.yaml`
- `eventing/pulsar/topics.yaml`
- `observability/quickwit/index-config.yaml`
