#!/usr/bin/env bash

set -euo pipefail

ENVIRONMENT="${1:-staging}"
IMAGE_TAG="${2:-1.1.0}"
NAMESPACE="${NAMESPACE:-atlasx}"
RELEASE_NAME="${RELEASE_NAME:-atlasx}"
CHART_PATH="${CHART_PATH:-./infra/helm/atlasx}"

COMMON_VALUES="./infra/fleet/values/common.yaml"
ENV_VALUES="./infra/fleet/values/${ENVIRONMENT}.yaml"

if ! command -v kubectl >/dev/null 2>&1; then
  echo "kubectl is required"
  exit 1
fi

if ! command -v helm >/dev/null 2>&1; then
  echo "helm is required"
  exit 1
fi

if [[ ! -f "${ENV_VALUES}" ]]; then
  echo "Missing environment values file: ${ENV_VALUES}"
  exit 1
fi

echo "Deploying ${RELEASE_NAME} to ${ENVIRONMENT} (namespace=${NAMESPACE}, imageTag=${IMAGE_TAG})"

kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

helm dependency update "${CHART_PATH}"

helm upgrade --install "${RELEASE_NAME}" "${CHART_PATH}" \
  --namespace "${NAMESPACE}" \
  --values "${COMMON_VALUES}" \
  --values "${ENV_VALUES}" \
  --set image.tag="${IMAGE_TAG}" \
  --wait \
  --timeout 10m

kubectl rollout status "deployment/${RELEASE_NAME}" -n "${NAMESPACE}" --timeout=5m

echo "Deployment completed successfully."
