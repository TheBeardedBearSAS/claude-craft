---
description: PHP Security Audit
argument-hint: [arguments]
---

# PHP Security Audit

## Arguments

$ARGUMENTS (optional: path to PHP project to audit, defaults to current directory)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Security audit of a native PHP project based on **OWASP Top 10:2025** (incl. Software Supply Chain Failures and Mishandling of Exceptional Conditions), CWE/SANS Top 25, and SLSA 1.0. Produce a report with a score out of 25 and a prioritized remediation plan.

**Reference rules**: `.claude/rules/php-security.md`

### Step 1: Dependency Scan (4 pts)

```bash
docker compose exec app composer audit
docker compose exec app composer outdated --direct
```

Optional (SBOM + CVE):

```bash
docker compose exec app trivy fs --scanners vuln,secret,config .
```

Check:
- [ ] `composer audit` reports 0 critical / high vulnerabilities
- [ ] All direct dependencies pinned to exact or caret ranges (no `*`)
- [ ] No abandoned packages
- [ ] SBOM generated (SPDX 3 or CycloneDX) and checked into CI
- [ ] Sigstore / cosign signing configured for release artifacts (SLSA 1.0)

### Step 2: Injection — SQL, Command, LDAP, Header (5 pts)

Scan for dangerous patterns:

```bash
docker compose exec app grep -rn "PDO.*->query\|mysqli_query\|->prepare.*\$_" src/
docker compose exec app grep -rn "shell_exec\|passthru\|system\|exec\|popen" src/
```

Check:
- [ ] 100% parameterized queries — **no string concatenation in SQL**
- [ ] Command execution avoided; if required, `escapeshellarg()` + whitelist
- [ ] HTTP header injection prevented (no raw CR/LF in `header()`)
- [ ] LDAP filters escaped via `ldap_escape()`
- [ ] XML parsers disable external entities (`libxml_disable_entity_loader(true)` / `LIBXML_NONET`)

### Step 3: Authentication & Authorization (4 pts)

- [ ] Passwords hashed with **Argon2id** (OWASP 2026: 128 MiB RAM, t=3-5, p=1)
- [ ] `password_hash($p, PASSWORD_ARGON2ID)` used; **no MD5/SHA1/bcrypt in new code**
- [ ] Minimum password length ≥ 12 characters
- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Session expiration 15–30 minutes
- [ ] JWT: **EdDSA (Ed25519)** > ES256 > RS256; short expiry (15 min)
- [ ] **DPoP (RFC 9449)** for sensitive tokens
- [ ] Permissions checked at every request (deny-by-default, not just once at login)

**Detection command**:

```bash
docker compose exec app grep -rn "md5\|sha1\|password_hash.*BCRYPT" src/
```

### Step 4: Secrets & Cryptography (4 pts)

- [ ] No secrets in git history (`gitleaks detect --log-opts='--all'` / `trufflehog`)
- [ ] Secrets loaded from env vars or a vault (HashiCorp Vault, AWS Secrets Manager)
- [ ] TLS 1.3 enforced; TLS 1.2 only if backward-compatibility required
- [ ] Random generation via `random_bytes()` / `random_int()` — **never `rand()`/`mt_rand()` for security**
- [ ] Key rotation strategy documented
- [ ] Encryption at rest for sensitive fields (e.g., `paragonie/halite` for field-level AEAD)

### Step 5: Input Validation & Output Encoding (3 pts)

- [ ] All user input validated server-side (never trust client validation)
- [ ] Value Objects enforce invariants in constructors
- [ ] HTML output escaped with `htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`
- [ ] JSON output via `json_encode()` with `JSON_THROW_ON_ERROR`
- [ ] File uploads: MIME sniffing, size limit, random name, outside web root

### Step 6: Security Headers & Configuration (3 pts)

- [ ] `Content-Security-Policy` (Level 3) with nonces, no `unsafe-inline`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (or CSP `frame-ancestors 'none'`)
- [ ] `Strict-Transport-Security` (HSTS, 1 year min, preload if applicable)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Cross-Origin-Opener-Policy: same-origin` (COOP)
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- [ ] `Cross-Origin-Resource-Policy` (CORP)
- [ ] `Permissions-Policy` granular
- [ ] `display_errors=Off`, `expose_php=Off` in production
- [ ] Generic error pages — **never leak stack traces in production**

### Step 7: Logging & Supply Chain (2 pts)

- [ ] Logs include: logins, permission changes, sensitive data access, authorization errors
- [ ] Logs **never** contain: passwords, tokens, full PII, stack traces in prod
- [ ] Structured logs (JSON) with correlation IDs
- [ ] SLSA 1.0 level 1+ provenance on CI builds
- [ ] Dependabot / Renovate with CVE scanning (Trivy, Grype)
- [ ] Reproducible builds verified on releases

## OUTPUT FORMAT

```
PHP SECURITY AUDIT — OWASP TOP 10:2025
=======================================

SCORE: XX/25
SEVERITY: [Critical / High / Medium / Low]

DEPENDENCY SCAN (X/4)
  composer audit: N critical, N high
  Abandoned packages: N
  SBOM present: yes/no

INJECTION (X/5)
  Non-parameterized SQL: N
  Dangerous command calls: N
  XXE risk: yes/no

AUTH & AUTHORIZATION (X/4)
  Weak hashes (MD5/SHA1/bcrypt): N
  Missing permission checks: N
  JWT algorithm: [EdDSA/ES256/RS256/none]

SECRETS & CRYPTO (X/4)
  Secrets in history: N
  Weak RNG usage: N

INPUT / OUTPUT (X/3)
  Missing validation: N
  Unescaped output: N

HEADERS & CONFIG (X/3)
  Missing CSP / HSTS / COOP: N
  display_errors leaking: yes/no

LOGGING & SUPPLY CHAIN (X/2)
  PII in logs: N
  SLSA level: [0/1/2/3]

TOP 3 CRITICAL ACTIONS:
1. [CRITICAL] Replace MD5 hashes with Argon2id
   Files: src/Infrastructure/Auth/...:line
   Impact: HIGH — Effort: MEDIUM
2. [...]
3. [...]

QUICK WINS:
- Run `composer audit` in CI (0 effort)
- Add `declare(strict_types=1);` everywhere (enforced by Rector)
- Enable HSTS in production (1 line of config)

REMEDIATION ROADMAP:
Week 1  — Patch all composer audit CRITICAL CVEs
Week 2  — Argon2id migration + JWT algorithm rotation
Month 2 — SBOM + Sigstore signing + SLSA level 2
```

## IMPORTANT NOTES

- **Security issues are ALWAYS top priority** — they outrank architectural concerns
- Use Docker for all scans; **never** leak real secrets into scan output
- OWASP Top 10:2025 consolidates SSRF into Broken Access Control
- **Mishandling Exceptional Conditions** (new 2025): a production stack trace is a disclosure vulnerability
- Supply Chain (new 2025): sign artifacts with Sigstore/cosign, generate SBOM on every build
- Re-run this audit on every major dependency bump and quarterly in steady state
