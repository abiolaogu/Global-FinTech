# SECURITY

## Supported Versions
This repository follows rolling security updates on the active branch.

## Reporting a Vulnerability
Report suspected vulnerabilities privately to the maintainers and include:
- impact summary
- reproduction steps
- affected version/commit

Do not disclose publicly until remediation guidance is available.

## Security Baseline
- Secrets are never committed; use environment variables.
- Dependency updates and scans run in CI.
- Structured audit logs are emitted for security-relevant events.
