# Release Notes — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## v1.0.0 — Initial Platform Release (2026-02-18)

### Features
- Multi-currency digital wallets (50+ currencies)
- Payment gateway integration (Paystack, Flutterwave, Stripe, Razorpay, PayMongo, Khalti, Mercado Pago, PayU)
- Split payment engine (percentage, fixed, hybrid, remainder)
- RegAI compliance engine with OPA policy decisions
- Sanctions screening (OFAC, EU, UN)
- LLM-assisted SAR/STR narrative drafting
- AI financial advisor chatbot
- Web frontend (Next.js/React)
- Mobile apps (React Native, Flutter)
- Kubernetes deployment via Helm
- CI/CD with GitHub Actions and Jenkins

### Infrastructure
- GKE deployment with Terraform provisioning
- Rancher Fleet GitOps for multi-environment management
- Prometheus + Grafana + Loki observability stack
- AIDD guardrail checks in CI pipeline

### Known Limitations
- Fineract core banking integration: target architecture, not yet fully connected
- JPOS payment switch: integration in progress
- Hyperledger Fabric: settlement attestation under development
- Investment, ROSCA, P2P Lending modules: under development (feature-flagged)
