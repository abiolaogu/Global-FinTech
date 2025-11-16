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
CHART_PATH="./infra/helm/atlasx"

echo -e "${GREEN}Starting deployment to ${ENVIRONMENT}${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"
if ! command_exists kubectl; then
    echo -e "${RED}kubectl is not installed${NC}"
    exit 1
fi

if ! command_exists helm; then
    echo -e "${RED}helm is not installed${NC}"
    exit 1
fi

# Get cluster credentials
echo -e "${YELLOW}Getting cluster credentials...${NC}"
gcloud container clusters get-credentials atlasx-${ENVIRONMENT} --region us-east1

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace ${NAMESPACE}...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Add Helm repositories
echo -e "${YELLOW}Adding Helm repositories...${NC}"
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Build and push Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
IMAGE_TAG=$(git rev-parse --short HEAD)
docker build -t gcr.io/${GCP_PROJECT}/atlasx-api:${IMAGE_TAG} ./apps/api
docker push gcr.io/${GCP_PROJECT}/atlasx-api:${IMAGE_TAG}

# Deploy with Helm
echo -e "${YELLOW}Deploying with Helm...${NC}"
helm upgrade --install ${HELM_RELEASE} ${CHART_PATH} \
    --namespace ${NAMESPACE} \
    --set image.tag=${IMAGE_TAG} \
    --set global.environment=${ENVIRONMENT} \
    --values ./infra/helm/atlasx/values-${ENVIRONMENT}.yaml \
    --wait \
    --timeout 10m

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
kubectl run migration-${IMAGE_TAG} \
    --namespace=${NAMESPACE} \
    --image=gcr.io/${GCP_PROJECT}/atlasx-api:${IMAGE_TAG} \
    --restart=Never \
    --rm -i \
    --command -- npm run migration:run

# Wait for deployment to be ready
echo -e "${YELLOW}Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/${HELM_RELEASE} -n ${NAMESPACE} --timeout=5m

# Run smoke tests
echo -e "${YELLOW}Running smoke tests...${NC}"
API_URL=$(kubectl get ingress ${HELM_RELEASE} -n ${NAMESPACE} -o jsonpath='{.spec.rules[0].host}')
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://${API_URL}/health)

if [ "$HEALTH_CHECK" == "200" ]; then
    echo -e "${GREEN}Health check passed${NC}"
else
    echo -e "${RED}Health check failed with status ${HEALTH_CHECK}${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}API URL: https://${API_URL}${NC}"
