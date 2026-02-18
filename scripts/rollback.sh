#!/usr/bin/env bash

set -euo pipefail

NAMESPACE="${NAMESPACE:-atlasx}"
RELEASE_NAME="${RELEASE_NAME:-atlasx}"
REVISION="${1:-}"

if ! command -v helm >/dev/null 2>&1; then
  echo "helm is required"
  exit 1
fi

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required"
  exit 1
fi

echo "Helm history for ${RELEASE_NAME} in ${NAMESPACE}:"
helm history "${RELEASE_NAME}" -n "${NAMESPACE}"

if [[ -z "${REVISION}" ]]; then
  if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required to auto-select a revision. Pass a revision explicitly."
    exit 1
  fi
  REVISION="$(helm history "${RELEASE_NAME}" -n "${NAMESPACE}" --max 20 -o json | jq -r 'if length > 1 then .[-2].revision else .[-1].revision end')"
fi

if [[ -z "${REVISION}" || "${REVISION}" == "null" ]]; then
  echo "Could not determine rollback revision."
  exit 1
fi

echo "Rolling back ${RELEASE_NAME} to revision ${REVISION}"
helm rollback "${RELEASE_NAME}" "${REVISION}" -n "${NAMESPACE}" --wait --timeout 10m
kubectl rollout status "deployment/${RELEASE_NAME}" -n "${NAMESPACE}" --timeout=5m

echo "Rollback completed successfully."
