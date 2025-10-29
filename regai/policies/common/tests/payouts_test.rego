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
