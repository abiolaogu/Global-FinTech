import sys
from pathlib import Path

from fastapi.testclient import TestClient

# Ensure service root is importable in CI runners.
sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import app


client = TestClient(app)


def test_health_contract():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}
