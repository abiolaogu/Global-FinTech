.PHONY: run test opa-test up
run:
    uvicorn regai_service.app:app --host 0.0.0.0 --port 8000 --reload
test:
    PYTHONPATH=. pytest -q regai/tests
opa-test:
    sudo docker run --rm -v $(pwd)/regai/policies:/policies openpolicyagent/opa:0.62.1 test -v /policies
up:
    docker compose -f compose.yaml up --build
