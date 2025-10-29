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
