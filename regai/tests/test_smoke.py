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
