# RegAI – Compliance-as-a-Service (Plugin Module)

A vendor-neutral **policy-as-code** compliance layer for fintech:
- FastAPI service exposing `/v1/decision`, `/v1/screen/sanctions`, `/v1/case`, `/v1/report/sar`, `/v1/healthz`
- OPA/Rego PDP with global + jurisdiction packs:
- **North America**: **CA** (RPAA PSP, FINTRAC/PCMLTFA, PIPEDA + QC Law 25 note), US baseline (BSA/AML)
- **EU/UK**: GDPR/AMLD6, PSR/AML (scaffold)
- **APAC**: SG, HK, JP, KR, IN, MY, ID, PH, TH, VN, AU (scaffold)
- **MENA**: AE-ADGM, AE-DIFC, AE-CBUAE, SA, QA, BH, TR, IL (scaffold)
- **Africa**: NG-CBN, ZA, KE-CBK, GH-BoG, EG-CBE, MU (scaffold)
- **Bloc overlays**: WAEMU/UEMOA, EAC, SADC (corridors/FX behaviors)
- Streaming detector YAMLs (velocity, structuring, agent anomalies, corridor spikes, INTERAC/EFT for CA)
- Evidence hooks (reasons + policy version), report stubs (e.g., **FINTRAC STR**)
- Jenkins CI (pytest + OPA tests)
- Docker Compose for local dev (FastAPI + OPA)

> Not legal advice. Keep counsel involved and map regulations → enforceable controls + tests + evidence.

## Quick start
1) Install deps: `pip install -r regai/regai_service/requirements.txt`
2) Dev stack: `docker compose -f regai/compose.yaml up --build`
3) Try a decision:



curl -s localhost:8000/v1/decision -X POST -H 'content-type: application/json' -d '{"actor":{"id":"u1","risk_score":12,"pep_flag":false},"action":{"type":"PAYOUT","amount":500,"currency":"CAD"},"context":{"jurisdiction_pack":"CA","product_caps":["EMI"]}}'

Python:

## Structure
- `regai_service/` – FastAPI microservice
- `policies/` – OPA Rego + tests (decision entrypoint: `data/payouts/decision`)
- `detectors/` – AML/fraud streaming rules (YAML)
- `schemas/` – JSON Schemas for core events
- `reports/` – SAR/STR stubs (incl. `na/CA/FINTRAC-STR.json`)
- `tooling/ci/` – CI helpers
- `compose.yaml` – FastAPI + OPA dev compose
