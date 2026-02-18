import sys
from pathlib import Path

from fastapi.testclient import TestClient

# Ensure service root is importable in CI runners.
sys.path.append(str(Path(__file__).resolve().parents[1]))

from main import app


client = TestClient(app)


def test_health_contract():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "UP"
    assert body["service"] == "ai-advisor-svc"


def test_advise_contract_mock_provider():
    response = client.post(
        "/advise",
        json={
            "user_id": "test-user",
            "query": "Give me one spending tip",
            "provider": "mock",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert "insight" in body
    assert "confidence" in body
    assert "source" in body
