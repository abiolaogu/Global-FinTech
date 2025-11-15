#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
NAMESPACE="atlasx"
HELM_RELEASE="atlasx"

echo -e "${YELLOW}Starting rollback for ${ENVIRONMENT}${NC}"

# Get cluster credentials
echo -e "${YELLOW}Getting cluster credentials...${NC}"
gcloud container clusters get-credentials atlasx-${ENVIRONMENT} --region us-east1

# List available revisions
echo -e "${YELLOW}Available revisions:${NC}"
helm history ${HELM_RELEASE} -n ${NAMESPACE}

# Get previous revision
REVISION=${2:-$(helm history ${HELM_RELEASE} -n ${NAMESPACE} --max 2 -o json | jq -r '.[1].revision')}

echo -e "${YELLOW}Rolling back to revision ${REVISION}${NC}"

# Perform rollback
helm rollback ${HELM_RELEASE} ${REVISION} -n ${NAMESPACE} --wait --timeout 5m

# Wait for rollback to complete
kubectl rollout status deployment/${HELM_RELEASE} -n ${NAMESPACE} --timeout=5m

# Verify health
API_URL=$(kubectl get ingress ${HELM_RELEASE} -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}')
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://${API_URL}/health)

if [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}Rollback completed successfully!${NC}"
else
    echo -e "${RED}Health check failed after rollback${NC}"
    exit 1
fi
