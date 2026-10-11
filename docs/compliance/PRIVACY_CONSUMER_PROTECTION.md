# Privacy, Consumer Protection & AI-Generated App Safety Standard

**Status:** Proposed baseline; not a legal certification. **Scope:** Web, mobile, backend, messaging, payments, B2C/B2B products; apply controls by product and jurisdiction.

## P0 release controls
1. **Children / COPPA:** classify service audience and countries; for child-directed or known-under-13 US users, obtain legally sufficient parental notice/consent before collecting covered personal information unless a valid exception applies. Neutral age screening where appropriate; never assert COPPA requires age prompts for every general-audience app. Restrict tracking, retention and profiling of minors; consider local minor-age laws.
2. **Fonts / third-party requests:** self-host fonts and other static assets when practicable. No unreviewed third-party calls that disclose visitors' IP or identifiers. Review CSS imports, font stylesheets, CDNs, tag managers and dependency runtime loading.
3. **Session replay / telemetry:** replay disabled by default until approved after legal, security and consent review, as required. Never record passwords, payment-card data, OTPs, tokens, sensitive health, government identity or private message content. Mask all user-entered values by default; maintain consent, vendor inventory, retention and deletion controls.
4. **Commercial email:** distinguish transactional/service from marketing content using actual primary purpose. Marketing messages require accurate header/subject, valid postal address, clear unsubscribe, opt-out processing within applicable statutory timeframe, durable suppression, and contractor oversight. Follow local opt-in law where stricter.
5. **Subscriptions / automatic renewals:** disclose recurring price, term, trial conversion, cancellation terms and any minimum commitments conspicuously before authorization; obtain affirmative consent; store versioned timestamped evidence; send acknowledgments and legally required renewal/change reminders; support easy cancellation using required channels. No pre-checked consent boxes.
6. **Analytics / tracking / cookies:** maintain SDK and vendor inventory; gate nonessential trackers on valid jurisdiction-specific consent where required; respect withdrawal and data-subject rights; minimize collection, residency transfers and retention.
7. **General privacy:** conspicuous notices, rights requests, deletion/export, breach response, DPA/vendor review, access controls, immutable audit evidence, least privilege and fail-closed sensitive actions.

## CI policy
- Apply a scanner on every PR and scheduled run; hard-fail only high-confidence technical indicators. Advisory matches require triage and may not be silently auto-waived.
- Positive evidence is required for business-process controls: UX screenshots/e2e tests, sample rendered emails, consent receipt, billing webhook tests, age/parental-consent flows, legal/jurisdiction matrix.
- Classify each repo: `customer-facing`, `platform/library`, `internal`, `infrastructure`, or `archived`. Do not mandate an age gate, checkout or email footer in repositories that do not implement those features.
- Track every finding with repo, file, evidence, risk, owner, target date and mitigation. Critical issues block release pending authorized remediation.
- No AI coding agent may suppress test findings, remove protections, weaken release gates, or fabricate evidence to make CI pass.
- Repo owners and counsel must review actual product-specific compliance before release.

## Mandatory review questions
- Does this PR add signup or minors' data? Has the child-directed/age treatment been assessed?
- Does it load fonts, analytics, tracking pixels or replay code from another domain?
- Does it send marketing emails? Show rendered proof of postal address and unsubscribe.
- Does it create subscription checkout, renewal, price change or cancellation behavior? Show tested consent and cancellation.
- Does it collect location, biometrics, financial, health or other sensitive data? Show privacy impact analysis, consent and retention controls.
- What jurisdictions does the feature serve, and what more protective local rules apply?

## Remediation and evidence
Produce: inventory.csv, findings.sarif/json, release-blocker list, consent and communication test evidence, jurisdiction applicability matrix, exceptions register with expiry and approver.

## Reference authorities (verify current texts before launch)
- FTC COPPA FAQ: https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
- FTC CAN-SPAM guide: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- California DOJ auto-renewal advisory: https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-consumer-alert-california%E2%80%99s-automatic-renewal-law
- Munich Google Fonts case: https://www.gesetze-bayern.de/Content/Document/Y-300-Z-BECKRS-B-2022-N-612
