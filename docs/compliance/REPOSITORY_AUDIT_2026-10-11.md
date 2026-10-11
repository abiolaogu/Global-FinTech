# Global FinTech Privacy and Consumer-Protection Audit

**Evidence date:** 2026-10-11  
**Baseline commit:** `764b66501b230f18b2e1e7b145b622ef7b9bbdf4`  
**Status:** Engineering audit and remediation evidence, not legal approval or production certification.

## Classification and application inventory

`customer-facing` financial platform. The repository contains web and mobile applications, a public NestJS API, identity/role guards, payment and recurring-payment domains, marketing/growth agents, telemetry and analytics assets, infrastructure, and customer-data processing. PCI scope, deployed topology, served jurisdictions, vendors, retention schedules, and production configuration require control-owner evidence outside this repository.

Canonical ownership is preserved: StratoID/Authentik supplies authenticated principals, SpiceDB owns authorization policy, Nvuto Consent owns consent receipts and withdrawal decisions, Nvuto Pay/billing owns governed payment operations, Vault/KMS supplies secrets, and Nvuto GRC owns findings, exceptions, approvals, and evidence receipts.

## Risk-ranked findings and disposition

| Risk | Baseline evidence | Disposition |
| --- | --- | --- |
| Critical | `apps/api/src/common/guards/jwt-auth.guard.ts:12-17` fabricated an administrator identity and authorized the request. | Remediated: fail closed unless a verified principal is present; an explicit non-production override creates only a local-developer principal. Tests cover production denial and constrained local use. |
| Critical | `apps/api/src/common/guards/roles.guard.ts:23-25` permitted role-protected handlers when the authenticated principal had no roles array. | Remediated: a route with required roles now fails closed when principal roles are absent; routes without a role requirement retain their existing behavior. |
| Critical | `apps/api/src/modules/payment-engine/gateway/payment-gateway.service.ts:86` logged a full primary account number. | Remediated: log output is masked; regression test proves the full PAN is absent. |
| Critical | `apps/api/src/modules/recurring-payments/recurring-payments.service.ts:321` used a predictable all-zero encryption fallback. | Remediated: a valid 32-byte hex key is mandatory and must be injected from Vault/KMS. |
| Critical | `apps/api/src/modules/payment-gateways/payment-gateways.service.ts:638` and `apps/api/src/modules/realtime-payments/realtime-payments.service.ts:725,739` used the same predictable encryption fallback. | Remediated with the shared fail-closed key resolver; encryption and decryption cannot proceed without an exact 32-byte Vault/KMS-injected key. |
| High | Recurring-payment create/read/pause/resume/cancel endpoints accepted caller-supplied user identifiers and lacked affirmative-consent evidence. | Remediated in the API: authenticated subject ownership is enforced; creation verifies and stores a canonical Nvuto Consent receipt, versioned terms/disclosure, exact disclosure-artifact hash, jurisdiction, renewal disclosure, timestamp, and digest; every charge re-evaluates consent; an actual denial cancels future charges immediately while canonical-service authentication/outage errors remain retryable; consumer cancellation is authenticated and emits an event. |
| High | Recurring-payment API responses exposed encrypted payment material and internal evidence fields. | Remediated: every consumer and merchant response uses an explicit minimized view; encrypted payment material, provider authorization code, internal evidence digest/artifact hash, and arbitrary metadata are removed. Merchant listing additionally requires a merchant/admin role and tenant-issued merchant identity. |
| High | The repository does not yet contain verified consumer checkout disclosures, acknowledgement/reminder delivery, or cancellation UI evidence. | Open release dependency: product owner and counsel must provide jurisdiction-specific UX, rendered communications, and end-to-end tests before enabling automatic renewal. API work alone is insufficient. |
| High | The API currently uses direct TypeORM product-data access and local role checks; the repository contains no Hasura product boundary or SpiceDB permission check for these paths. | Open architecture/security dependency: do not deploy the compatibility migration or merchant authorization path until the canonical Hasura metadata/API and SpiceDB relationship/permission model are integrated and tested. |
| High | `npm ci` reports 91 dependency advisories (5 low, 24 moderate, 60 high, 2 critical). | Open security review: generate/update the SBOM, assess reachability and compensating controls, then upgrade through tested pull requests. Do not apply a breaking force-upgrade without review. |
| High/review | `apps/api/src/modules/subscriptions/subscriptions.service.ts` is an unwired/dormant subscription implementation without consent evidence. | Do not expose or schedule it. Before wiring, integrate canonical Nvuto Consent, authenticated ownership, versioned disclosures, acknowledgement/reminders, easy cancellation, migrations, and end-to-end evidence. |
| Medium/review | Flutter registration and runtime Google Fonts indicators require audience, age-treatment, and third-party-request review. | No legal conclusion from keyword matches. Confirm whether the service is child-directed or has actual knowledge, document the jurisdiction decision, and self-host approved fonts or record the reviewed basis/configuration. |

## Applicability matrix

| Control family | Status | Required evidence before release |
| --- | --- | --- |
| Privacy / GDPR / UK GDPR / NDPA | Applicable | Data map, lawful basis by purpose, notices, retention, processor/transfer records, rights workflow, DPIA where required. |
| Children / age safety | Review required | Audience classification and served jurisdictions; neutral age treatment, parental flow, and child-protective defaults only where applicable. |
| Communications privacy / tracking / replay | Review required | SDK/vendor inventory, consent configuration, masking, withdrawal, deletion, retention, and interception analysis. |
| Marketing / CAN-SPAM / CASL / PECR | Applicable when marketing agents send | Message classification, rendered template, identity/address, opt-in where required, unsubscribe, canonical suppression propagation, vendor oversight. |
| Subscription / automatic renewal | Applicable | Versioned pre-purchase terms, affirmative Nvuto Consent receipt, acknowledgement, required reminders, price-change proof, and easy same-channel cancellation. |
| Payment / financial privacy | Applicable | PCI scope decision, tokenization, no sensitive authentication data retention, Vault/KMS evidence, access/audit controls, incident and retention evidence. |
| Accessibility | Applicable to web/mobile | WCAG 2.2 automated and manual keyboard, screen-reader, focus, reflow, error and payment-flow evidence. |
| Auditability | Applicable | OpenTelemetry correlation without sensitive fields, immutable Nvuto GRC evidence receipt, and reviewed exception records. |

## Test evidence

- `npm test -- --runInBand`: all 10 suites and 36 tests passed, including authentication, authorization, fail-closed encryption keys, payment-log masking, recurring-consent/withdrawal enforcement, disclosure-artifact binding, response minimisation, and the Nvuto Consent client.
- Shared scanner: 475 files scanned, 2 review findings, 0 confirmed blockers after remediation.
- `npm run build`: failed on six pre-existing wallet-topup TypeScript errors at `wallet-topup.service.ts:88,172,191,242,319,335`; none is in the privacy-remediation diff, and none was suppressed.
- The privacy workflow treats remote-font/replay indicators as advisory and blocks only high-confidence critical patterns. Its JSON artifact is evidence of a source scan, not proof of operating effectiveness.

## Release blockers and nontechnical obligations

Automatic-renewal release remains blocked until the consumer UI, acknowledgement/reminder delivery, cancellation journey, dormant-subscription-service disposition, deployed Nvuto Consent purpose/channel configuration, Hasura/SpiceDB integration, migration rollout plan, Vault/KMS key injection, and jurisdiction/counsel approval are evidenced in Nvuto GRC. Production payment release also requires PCI and dependency-advisory disposition. The pre-existing build failures block a clean release build. No exception is implied by this document.

Current authority references are maintained in the Nvuto GRC jurisdiction pack; they must be re-verified at release time.
