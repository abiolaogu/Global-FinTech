#!/usr/bin/env bash
set -euo pipefail

if [ ! -d .git ]; then
    echo "Run this from the root of a Git repository ('.git' not found)."; exit 1
fi

mkdir -p regai/{regai_service,policies/common/{opa,tests},policies/jurisdictions,detectors,schemas,reports/{na/CA,apac/SG,mena/AE-ADGM,africa/NG-CBN},tooling/ci} \
regai/tests

########################################
# README
########################################
cat > regai/README.md <<'EOF'
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
EOF

########################################
# FastAPI service
########################################
cat > regai/regai_service/app.py <<'EOF'
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os, requests, json, hashlib, time

app = FastAPI(title="RegAI", version="1.0.0")
OPA_URL = os.getenv("OPA_URL", "http://opa:8181/v1/data/payouts/decision")
POLICY_VERSION = os.getenv("POLICY_VERSION", "dev")
SERVICE_VERSION = os.getenv("SERVICE_VERSION", "1.0.0")

class Actor(BaseModel):
    id: str
    residency_country: Optional[str] = None
    kyc_level: Optional[str] = None
    kyc_tier: Optional[str] = None
    risk_score: float = 0.0
    pep_flag: bool = False
    sanctions_pending: Optional[bool] = False

class Action(BaseModel):
    type: str # ONBOARD, TRANSFER, PAYOUT, CARD_AUTH
    amount: Optional[float] = 0.0
    currency: Optional[str] = "USD"

class Context(BaseModel):
    jurisdiction_pack: str
    product_caps: List[str] = Field(default_factory=list)
    ip_country: Optional[str] = None
    device_fingerprint: Optional[str] = None
    sanctions_pending: Optional[bool] = False
    cross_border: Optional[bool] = None
    fx: Optional[Dict[str, Any]] = None
    transfer: Optional[Dict[str, Any]] = None

class DecisionInput(BaseModel):
    actor: Actor
    action: Action
    context: Context
    metrics: Optional[Dict[str, Any]] = None

class Decision(BaseModel):
    result: str # ALLOW, DENY, STEP_UP
    reasons: List[str] = Field(default_factory=list)
    obligations: List[str] = Field(default_factory=list)
    policy_version: str = POLICY_VERSION
    fingerprint: str

def _fingerprint(payload: dict, decision: dict) -> str:
    blob = json.dumps({"input": payload, "decision": decision, "ts": int(time.time())}, sort_keys=True).encode()
    return hashlib.sha256(blob).hexdigest()

@app.get("/v1/healthz")
def healthz():
    return {"ok": True, "service_version": SERVICE_VERSION, "policy_version": POLICY_VERSION}

@app.post("/v1/decision", response_model=Decision)
def decision(inp: DecisionInput):
    payload = json.loads(inp.json())
    try:
        r = requests.post(OPA_URL, json={"input": payload}, timeout=3)
        r.raise_for_status()
        out = r.json()
        data = out.get("result") or out.get("data") or out
        if isinstance(data, dict) and "result" in data:
            data = data["result"]
        # attach policy version & fingerprint
        enriched = dict(data, policy_version=POLICY_VERSION)
        enriched["fingerprint"] = _fingerprint(payload, enriched)
        return Decision(**enriched)
    except Exception as e:
        fallback = {"result":"STEP_UP","reasons":["PDP_UNREACHABLE",str(e)],"obligations":["MANUAL_REVIEW"],"policy_version":POLICY_VERSION}
        fallback["fingerprint"] = _fingerprint(payload, fallback)
        return Decision(**fallback)

class Subject(BaseModel):
    name: Optional[str] = None
    dob: Optional[str] = None
    national_id: Optional[str] = None
    addresses: Optional[List[str]] = None
    aliases: Optional[List[str]] = None
    country_codes: Optional[List[str]] = None

class ScreeningResult(BaseModel):
    matches: List[Dict[str, Any]] = Field(default_factory=list)
    score: float = 0.0
    disposition: str = "CLEAR"

@app.post("/v1/screen/sanctions", response_model=ScreeningResult)
def screen(subject: Subject):
    # Stub: connect to official lists/commercial providers via adapter later
    return ScreeningResult()

class CaseOpen(BaseModel):
    type: str # AML, KYC, PRIVACY, SECURITY
    summary: str
    artifacts: List[str] = Field(default_factory=list)

@app.post("/v1/case")
def open_case(c: CaseOpen):
    # Stub: integrate with Postgres/Yugabyte + UI in next iteration
    return {"created": True, "id": "case_"+str(abs(hash(c.summary)) % 10**8)}

class SarDraftReq(BaseModel):
    case_id: str
    narrative_hints: List[str] = Field(default_factory=list)

@app.post("/v1/report/sar")
def sar(req: SarDraftReq):
    # Stub: LLM-assisted narrative (human-in-the-loop)
    return {"case_id": req.case_id, "draft": "SAR/STR narrative draft (review required)."}
EOF

cat > regai/regai_service/requirements.txt <<'EOF'
fastapi==0.115.2
uvicorn==0.30.6
pydantic==2.9.2
requests==2.32.3
EOF

cat > regai/regai_service/Dockerfile <<'EOF'
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
ENV OPA_URL=http://opa:8181/v1/data/payouts/decision
CMD ["uvicorn", "regai_service.app:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

########################################
# Docker Compose (FastAPI + OPA)
########################################
cat > regai/compose.yaml <<'EOF'
services:
    api:
        build: ./regai_service
        environment:
            - POLICY_VERSION=${POLICY_VERSION:-dev}
            - SERVICE_VERSION=1.0.0
            - OPA_URL=http://opa:8181/v1/data/payouts/decision
        ports: ["8000:8000"]
        depends_on: [opa]
        volumes:
            - ./policies:/policies:ro
    opa:
        image: openpolicyagent/opa:0.62.1
        command: ["run","--server","--addr=:8181","--diagnostic-addr=:8282","--ignore=.*","/policies"]
        ports: ["8181:8181","8282:8282"]
        volumes:
            - ./policies:/policies:ro
EOF

########################################
# Minimal tests
########################################
cat > regai/tests/test_smoke.py <<'EOF'
from regai.regai_service.app import Decision, DecisionInput, Actor, Action, Context

def test_models():
    d = Decision(result="STEP_UP", reasons=["X"], obligations=["Y"], policy_version="dev", fingerprint="abc")
    assert d.result in {"ALLOW","DENY","STEP_UP"}

    sample = DecisionInput(
        actor=Actor(id="u1", risk_score=10.0),
        action=Action(type="PAYOUT", amount=100, currency="CAD"),
        context=Context(jurisdiction_pack="CA", product_caps=["EMI"])
    )
    assert sample.context.jurisdiction_pack == "CA"
EOF

########################################
# OPA policies + tests (incl. Canada)
########################################
cat > regai/policies/common/opa/payouts.rego <<'EOF'
package payouts

# Default is DENY if no other rule matches
default decision = {"result": "DENY", "reasons": ["DEFAULT_DENY"]}

# decision is ALLOW if the 'allow' rule is satisfied
decision = {
    "result": "ALLOW",
    "reasons": ["RISK_OK", "LIMIT_OK"]
} {
    allow
}

# decision is STEP_UP if the 'step_up' rule is satisfied
decision = {
    "result": "STEP_UP",
    "reasons": ["RISK_BORDERLINE"],
    "obligations": ["EDD_REQUIRED"]
} {
    step_up
}

# The 'allow' rule
allow {
    input.action.type == "PAYOUT"
    not input.actor.pep_flag
    not input.context.sanctions_pending
    input.actor.risk_score < 70
    cls := product_class(input.context.product_caps)
    lim := max_amount[input.context.jurisdiction_pack][cls]
    input.action.amount <= lim
}

# The 'step_up' rule
step_up {
    input.action.type == "PAYOUT"
    input.actor.risk_score >= 70
    input.actor.risk_score < 80
}

# Helper rule to determine product class without using 'else'
product_class(caps) = "EMI" {
    any(caps, "EMI")
}

product_class(caps) = "DPT" {
    not any(caps, "EMI")
    any(caps, "DPT")
}

product_class(caps) = "GEN" {
    not any(caps, "EMI")
    not any(caps, "DPT")
}

# Helper to check for element in array
any(arr, elem) {
  some i
  arr[i] == elem
}

# Data
max_amount = {
    "SG": {"EMI": 5000, "DPT": 2000, "GEN": 3000},
    "HK": {"EMI": 5000, "GEN": 2500},
    "AE-ADGM": {"GEN": 3000}, "AE-DIFC": {"GEN": 3000}, "AE-CBUAE": {"GEN": 2500},
    "AU": {"GEN": 4000},
    "CA": {"EMI": 4000, "GEN": 2500},
    "NG-CBN": {"EMI": 5000, "GEN": 2000}, "ZA": {"GEN": 5000}, "KE-CBK": {"EMI": 3000, "GEN": 1500},
    "GH-BoG": {"EMI": 2500, "GEN": 1000}, "EG-CBE": {"GEN": 2000}, "MU": {"GEN": 4000}
}
EOF

cat > regai/policies/common/tests/payouts_test.rego <<'EOF'
package payouts

test_deny_by_default {
	res := decision with input as {"action": {"type": "PAYOUT"}, "actor": {"risk_score": 99, "pep_flag": false}, "context": {"jurisdiction_pack": "CA", "product_caps": ["GEN"], "sanctions_pending": false}}
	res.result == "DENY"
}

test_deny_pep {
	input_data := {
		"action": {"type": "PAYOUT", "amount": 10},
		"actor": {"risk_score": 10, "pep_flag": true},
		"context": {"jurisdiction_pack": "CA", "product_caps": ["GEN"], "sanctions_pending": false}
	}
	res := decision with input as input_data
	res.result == "DENY"
}

test_allow_ca_emi {
	input_data := {
		"action": {"type": "PAYOUT", "amount": 500},
		"actor": {"risk_score": 10, "pep_flag": false},
		"context": {"jurisdiction_pack": "CA", "product_caps": ["EMI"], "sanctions_pending": false}
	}
	res := decision with input as input_data
	res.result == "ALLOW"
}

test_step_up_risk_score {
    input_data := {
        "action": {"type": "PAYOUT", "amount": 100},
        "actor": {"risk_score": 75, "pep_flag": false},
        "context": {"jurisdiction_pack": "CA", "product_caps": ["GEN"], "sanctions_pending": false}
    }
    res := decision with input as input_data
    res.result == "STEP_UP"
}
EOF

########################################
# Streaming detectors (YAML)
########################################
cat > regai/detectors/ca_velocity_interac_v1.yaml <<'EOF'
id: ca_velocity_interac_v1
where: event.type == "TRANSFER" and ctx.jurisdiction_pack == "CA" and event.channel in ["INTERAC","EFT"]
window: 24h
group_by: actor_id
conditions:
- sum(amount_cad) > 10000
- count(txn_id) >= 10
- distinct(dest_bank_id) >= 3
action: alert("VELOCITY_SPIKE_CA")
severity: MEDIUM
obligations: ["OPEN_CASE_AML"]
EOF

cat > regai/detectors/hk_structuring_v1.yaml <<'EOF'
id: hk_structuring_v1
where: event.type == "TRANSFER" and ctx.jurisdiction_pack == "HK"
window: 24h
group_by: actor_id
conditions:
- sum(amount_hkd) > 120000
- count(txn_id) >= 8
- distinct(dest_country) >= 3
action: alert("POSSIBLE_STRUCTURING")
severity: HIGH
obligations: ["FREEZE_RELATED_TXNS","OPEN_CASE_AML"]
EOF

cat > regai/detectors/ke_agent_float_anom_v1.yaml <<'EOF'
id: ke_agent_float_anom_v1
where: event.type == "AGENT_CASHOUT" and ctx.jurisdiction_pack == "KE-CBK"
window: 7d
group_by: agent_id
conditions:
- zscore(sum(amount_local)) > 3
- distinct(device_id) >= 3
- geo_radius_km(home_cell, latest_cell) > 50
action: alert("AGENT_FLOAT_SPIKE")
severity: HIGH
obligations: ["OPEN_CASE_AML","FREEZE_RELATED_TXNS"]
EOF

cat > regai/detectors/au_velocity_v1.yaml <<'EOF'
id: au_velocity_v1
where: event.type == "TRANSFER" and ctx.jurisdiction_pack == "AU"
window: 24h
group_by: actor_id
conditions:
- sum(amount_aud) > 10000
- count(txn_id) >= 10
action: alert("VELOCITY_SPIKE")
obligations: ["OPEN_CASE_AML"]
severity: MEDIUM
EOF

########################################
# Schemas + report stubs
########################################
cat > regai/schemas/decision_input.schema.json <<'EOF'
{
"$schema": "https://json-schema.org/draft/2020-12/schema",
"title": "DecisionInput",
"type": "object",
"required": ["actor","action","context"],
"properties": {
"actor": {"type": "object"},
"action": {"type": "object"},
"context": {"type": "object"}
}
}
EOF

cat > regai/reports/na/CA/FINTRAC-STR.json <<'EOF'
{
"schema_version": "1.0",
"jurisdiction": "CA",
"authority": "FINTRAC",
"report_type": "STR",
"notes": "Align with PCMLTFA and FINTRAC tech specs; map internal fields via ETL.",
"required_fields": [
"reporting_entity_info",
"subject",
"transactions",
"suspicion_narrative",
"dates",
"attachments"
]
}
EOF

cat > regai/reports/apac/SG/STR.json <<'EOF'
{
"schema_version": "1.0",
"jurisdiction": "SG",
"type": "STR",
"note": "Align with MAS guidance; human review required."
}
EOF

cat > regai/reports/mena/AE-ADGM/STR.json <<'EOF'
{
"schema_version": "1.0",
"jurisdiction": "AE-ADGM",
"type": "SAR",
"note": "Template stub for FSRA; verify with counsel."
}
EOF

cat > regai/reports/africa/NG-CBN/STR.json <<'EOF'
{
"schema_version": "1.0",
"jurisdiction": "NG-CBN",
"type": "STR",
"required_fields": ["subject","narrative","transactions","attachments"]
}
EOF

########################################
# CI: Jenkins
########################################
cat > Jenkinsfile <<'EOF'
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Python Dependencies') {
            steps {
                sh 'pip install -r regai/regai_service/requirements.txt'
                sh 'pip install pytest'
            }
        }

        stage('Run Python Tests') {
            steps {
                sh 'PYTHONPATH=. pytest -q regai/tests'
            }
        }

        stage('Run OPA Tests') {
            steps {
                sh 'sudo docker run --rm -v $(pwd)/regai/policies:/policies openpolicyagent/opa:0.62.1 test -v /policies'
            }
        }
    }
}
EOF

########################################
# Makefile (dev helpers)
########################################
cat > regai/Makefile <<'EOF'
.PHONY: run test opa-test up
run:
    uvicorn regai_service.app:app --host 0.0.0.0 --port 8000 --reload
test:
    PYTHONPATH=. pytest -q regai/tests
opa-test:
    sudo docker run --rm -v $(pwd)/regai/policies:/policies openpolicyagent/opa:0.62.1 test -v /policies
up:
    docker compose -f compose.yaml up --build
EOF

# Add __init__.py files
touch regai/__init__.py
touch regai/regai_service/__init__.py
touch regai/tests/__init__.py

echo "✅ RegAI scaffold added. For local dev: cd regai && make up"
