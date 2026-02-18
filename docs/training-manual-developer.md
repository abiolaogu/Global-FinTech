# Training Manual — Developer — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## Module 1: Architecture Deep Dive (3 hours)
- Modular monolith architecture and NestJS module system
- Database schema and TypeORM patterns
- Event-driven architecture with Kafka
- Understanding Fineract core banking integration

## Module 2: Local Development Setup (2 hours)
- Environment setup (Node.js, Python, Docker)
- Running the full stack locally
- Database migrations and seeding
- Development tools and IDE configuration

## Module 3: API Development (4 hours)
- NestJS module, controller, service pattern
- Request validation with class-validator
- Error handling and response formatting
- Writing OpenAPI documentation
- Integration testing with Jest

## Module 4: Payment Integration (3 hours)
- Payment gateway provider interface
- Adding a new payment provider
- Webhook handling and idempotency
- Split payment configuration
- Error recovery and retry patterns

## Module 5: RegAI & Compliance (2 hours)
- OPA policy language (Rego) basics
- Writing and testing compliance rules
- Detector configuration for new jurisdictions
- LLM integration for SAR drafting

## Module 6: Infrastructure & Deployment (3 hours)
- Docker containerization
- Kubernetes deployment with Helm
- CI/CD pipeline (GitHub Actions + Jenkins)
- GitOps with Rancher Fleet
- Monitoring and observability (Prometheus/Grafana/Loki)

## Module 7: Security Practices (2 hours)
- Secure coding guidelines for fintech
- PCI-DSS compliance requirements
- Secrets management with Vault
- Vulnerability scanning and SBOM generation

## Assessment
- Build and deploy a custom NestJS module
- Write OPA policy for a new compliance rule
- Pass security review checklist
