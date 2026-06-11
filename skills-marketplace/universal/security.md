---
name: security
description: Security guidelines and OWASP Top 10:2025 — authentication, encryption, supply chain security
author: The Bearded CTO / Claude Craft
version: 1.0.0
tags: [security, owasp, auth, encryption, jwt, supply-chain, ssrf]
category: security
license: MIT
repository: https://github.com/TheBeardedBearSAS/claude-craft
---

# Security — OWASP Top 10:2025 Essentials

Universal security guidelines for any technology stack.

## OWASP Top 10:2025

| # | Threat | Defense |
|---|--------|---------|
| 1 | Broken Access Control (incl. **SSRF**) | Verify permissions at EVERY request, deny by default |
| 2 | Cryptographic Failures | TLS 1.3, **Argon2id** (128 MiB RAM, t=3-5), secrets in vault |
| 3 | Injection | Parameterized queries, validation/sanitization |
| 4 | Insecure Design | Threat modeling, defense in depth, rate limiting |
| 5 | Security Misconfiguration | Hardening, generic errors in prod |
| 6 | **Software Supply Chain Failures** (new 2025) | SLSA 1.0, SBOM (SPDX 3 / CycloneDX), Sigstore keyless signing |
| 7 | **Mishandling of Exceptional Conditions** (new 2025) | Log errors, never expose stack trace in prod |

## Non-Negotiable Rules

- **Never trust user data** — validate server-side
- **Parameterized queries** — NEVER concatenate SQL
- **Passwords:** hash **Argon2id** (OWASP 2026: 128 MiB RAM, t=3-5, p=1), NEVER MD5/SHA1/bcrypt in new code, minimum 12 chars
- **Sessions:** **HTTP-only cookies** (never localStorage for tokens), secure, sameSite strict, expiration 15-30 min
- **JWT:** **EdDSA (Ed25519) priority** > ES256 > RS256, short expiration (15 min), **DPoP** (RFC 9449) for sensitive tokens
- **Secrets:** environment variables or Vault, NEVER in code

## Mandatory Headers (2026)

- CSP Level 3
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- HSTS
- Referrer-Policy strict
- **COOP** (Cross-Origin-Opener-Policy: same-origin)
- **COEP** (Cross-Origin-Embedder-Policy: require-corp)
- **Permissions-Policy** granular

## Supply Chain

- **SLSA** 1.0 levels 1-3 (verifiable sources, reproducible builds, provenance)
- **SBOM** automatic (SPDX 3 or CycloneDX) every build
- **Sigstore** keyless signing (cosign) for artifacts and images
- Dependabot / Renovate with CVE scan (Trivy, Grype)

## Logging

**Log:** connections, permission changes, sensitive data access, authorization errors

**DO NOT log:** passwords, tokens, full PII, stack traces in prod

## MCP & Plugins

Before installing third-party MCP server:
- Auditable source code
- Pinned version
- Minimal permissions

---

**By The Bearded CTO / Claude Craft**
**Framework-agnostic — works with any stack**
