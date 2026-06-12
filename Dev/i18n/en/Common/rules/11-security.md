# Security

## Overview

Security is an **absolute priority**. This document presents the general security principles applicable to any project.

> **Note:** Refer to the rules specific to your technology for concrete implementations.

**References:**
- **OWASP Top 10:2025** (published November 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Table of Contents

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Input Validation](#input-validation)
3. [Authentication](#authentication)
4. [Authorization](#authorization)
5. [Sensitive Data](#sensitive-data)
6. [Security Headers](#security-headers)
7. [Supply Chain](#supply-chain)
8. [Logging and Monitoring](#logging-and-monitoring)
9. [MCP & Plugin Security](#mcp--plugin-security)
10. [Checklist](#checklist)

---

## OWASP Top 10:2025

> **Source:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — published November 2025.
> Key changes vs 2021: SSRF consolidated into #1, Supply Chain Failures new at #6, Mishandling Exceptional Conditions new at #7.

### 1. Broken Access Control (includes consolidated SSRF)

```
RISK
- Accessing resources without verification
- Predictable URLs (/admin, /user/123/edit)
- Manipulating IDs in URLs
- SSRF: User-supplied URLs not validated, access to internal resources

PROTECTION
- Verify permissions on EVERY request
- Use non-predictable identifiers (UUID)
- Deny by default
- SSRF: Whitelist of authorized destinations, strict URL validation
- No internal network access from user inputs
```

### 2. Cryptographic Failures

```
RISK
- Sensitive data in plain text
- Obsolete algorithms (MD5, SHA1, bcrypt in new code)
- Keys in source code
- JWT with weak algorithm (HS256, RS256)

PROTECTION
- Encrypt sensitive data at rest
- Use TLS 1.3 in transit
- Password hashing: Argon2id (128 MiB RAM, t=3-5, p=1) — NEVER MD5/SHA1/bcrypt
- JWT: EdDSA (Ed25519) preferred > ES256 > RS256
- Secrets in a vault (not in the code)
```

### 3. Injection

```
RISK
- SQL Injection
- Command Injection
- LDAP Injection

PROTECTION
- Parameterized queries (prepared statements)
- Input validation and sanitization
- Principle of least privilege (DB)
- Output escaping
```

### 4. Insecure Design

```
RISK
- No threat modeling
- Sensitive features unprotected
- Rate limiting absent

PROTECTION
- Threat modeling from the design phase
- Security by design
- Defense in depth
- Rate limiting
```

### 5. Security Misconfiguration

```
RISK
- Default configs unchanged
- Unnecessary features enabled
- Verbose error messages
- Permissions too broad

PROTECTION
- Configuration hardening
- Disable what is unnecessary
- Generic error messages in prod
- Principle of least privilege
```

### 6. Software Supply Chain Failures (new in 2025)

```
RISK
- Dependencies with known vulnerabilities
- Components without verifiable provenance
- Unsecured CI/CD
- Unsigned artifacts

PROTECTION
- SLSA 1.0 levels 1-3 (verifiable sources, reproducible builds, provenance)
- Automatic SBOM (SPDX 3 or CycloneDX) on every build
- Sigstore keyless signing (cosign) for artifacts and images
- Dependabot / Renovate with CVE scanning (Trivy, Grype)
- Pinned versions on all dependencies (no "latest")
```

### 7. Mishandling of Exceptional Conditions (new in 2025)

```
RISK
- Stack traces exposed in production
- Unhandled exceptions leaking internal data
- Undefined behavior on malformed inputs

PROTECTION
- Log errors, never expose stack traces in prod
- Global exception handlers (error boundaries)
- Generic error messages on the client side
- Fail fast with clear business errors
```

### 8. Authentication Failures

```
RISK
- Weak passwords allowed
- No MFA
- Sessions that never expire
- Credential stuffing possible

PROTECTION
- Strong password policy (min 12 characters)
- MFA for sensitive access
- Session expiration
- Rate limiting on login
- Brute force detection
```

### 9. Logging & Monitoring Failures

```
RISK
- No security event logs
- Unprotected logs
- No alerting

PROTECTION
- Log security events
- Protect logs (restricted access)
- Alert on anomalies
- Appropriate retention
```

### 10. Data Integrity Failures

```
RISK
- Unverified dependencies
- Unsecured CI/CD
- Unsigned updates

PROTECTION
- Signature verification
- Secured CI/CD
- Integrity checks (checksums)
```

---

## Input Validation

### Golden Rule

> **Never trust user data.**
> Validate server-side, ALWAYS.

### Types of Validation

| Type | Description | Example |
|------|-------------|---------|
| **Whitelist** | Accept only what is expected | `status in ["pending", "done"]` |
| **Type checking** | Verify the type | `typeof id === "number"` |
| **Format** | Verify the format | `email.matches(EMAIL_REGEX)` |
| **Range** | Verify bounds | `1 <= page <= 100` |
| **Length** | Verify the length | `name.length <= 255` |

### Examples

```
// BAD - No validation
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// GOOD - Validation + parameterized query
function getUser(id):
  if not isValidUUID(id):
    throw InvalidInput("Invalid user ID")

  return db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
```

### Sanitization vs Validation

```
Validation: Reject invalid data
  -> "abc" as numeric ID -> ERROR

Sanitization: Clean the data
  -> "<script>" in a name -> "script"

Prefer VALIDATION (reject) over SANITIZATION (transform)
```

---

## Authentication

### Passwords

```
OWASP 2026 Rules:
- Minimum 12 characters
- Uppercase, lowercase, digits, special characters
- Not in compromised password lists
- Hash with Argon2id (128 MiB RAM, t=3-5, p=1)
- NEVER MD5/SHA1/bcrypt in new code
- Unique salt per user (managed by Argon2id)

// GOOD
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// BAD
hash = md5(password)
hash = sha1(password + "static_salt")
hash = bcrypt.hash(password, costFactor=12)  // Do not use in new code
```

Sources: [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

### Sessions

```
Rules:
- Cryptographically secure random token
- Server-side storage (not in cookies)
- Expiration: 15-30 min of inactivity
- Renewal after login
- Invalidation after logout

Session config:
  cookie:
    httpOnly: true     # Not accessible via JS
    secure: true       # HTTPS only
    sameSite: strict   # CSRF protection
```

### JWT (if used)

```
OWASP 2026 Rules:
- Algorithm: EdDSA (Ed25519) preferred > ES256 > RS256
- NEVER HS256 with weak secret
- Short expiration (15 min)
- Long refresh token (7 days) stored securely
- DPoP (RFC 9449) for sensitive tokens
- Verify signature and claims
- Do not store sensitive data in the payload

// BAD
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// GOOD
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Sources: [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Factor Authentication (MFA)

```
When to enable MFA:
- Admin access
- Sensitive operations (payment, deletion)
- Password change
- Login from new device

Methods (by security level):
- Hardware keys (FIDO2/WebAuthn) — most secure
- TOTP (Google Authenticator, Authy)
- SMS (less secure — avoid if possible)
```

---

## Authorization

### Principle of Least Privilege

```
Rule: Grant only the NECESSARY permissions.

BAD
user.role = "admin"  # Access to everything

GOOD
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Roles:
- admin: All permissions
- manager: User management, read reports
- user: Access to own data

Verification:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... delete logic
```

### Row-Level Security

```
Rule: Verify that the user has access to THE specific resource.

// BAD - Only checks authentication
function getOrder(orderId):
  return db.find("orders", orderId)

// GOOD - Checks ownership
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Sensitive Data

### Classification

| Category | Examples | Protection |
|----------|----------|------------|
| **Public** | Product name | None |
| **Internal** | Emails | Restricted access |
| **Confidential** | Customer data | Encryption |
| **Secret** | Passwords, keys | Vault, Argon2id hash |

### Storage

```
Passwords:
  -> Hash with Argon2id (128 MiB RAM, t=3-5, p=1)
  -> NEVER in plain text
  -> NEVER bcrypt/MD5/SHA1 in new code

Personal data (GDPR):
  -> Encryption at rest (AES-256-GCM)
  -> Pseudonymization if possible
  -> Limited retention

Secrets (API keys, etc.):
  -> Environment variables
  -> Vault (HashiCorp, AWS Secrets Manager)
  -> NEVER in source code
```

### Transmission

```
Rules:
- HTTPS mandatory (TLS 1.3)
- Valid certificates
- HSTS enabled
- No sensitive data in URLs

// BAD
GET /api/users?password=secret123

// GOOD
POST /api/auth
Body: { "password": "..." }
```

---

## Security Headers

### Mandatory Headers 2026

```http
# XSS Protection + CSP Level 3
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
X-Content-Type-Options: nosniff

# Clickjacking protection
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Granular permissions
Permissions-Policy: geolocation=(), camera=(), microphone=()

# Cross-Origin Isolation (2026 — mandatory)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Source: [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/)

### Content-Security-Policy (CSP) Level 3

```http
# Restrictive (recommended)
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' api.example.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### Cross-Origin Headers (new in 2026)

| Header | Recommended Value | Protection |
|--------|-------------------|------------|
| **COOP** | `same-origin` | Isolates browsing context (Spectre) |
| **COEP** | `require-corp` | Enables Cross-Origin Isolation |
| **CORP** | `same-origin` | Protects resources from cross-origin inclusion |
| **Permissions-Policy** | Granular per feature | Controls access to browser APIs |

---

## Supply Chain

> **Reference:** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Level | Requirements | Impact |
|-------|-------------|--------|
| **Level 1** | Documented build provenance | Basic traceability |
| **Level 2** | Build on verifiable platform, signed | Resistance to internal compromises |
| **Level 3** | Reproducible build, hardened infrastructure | Resistance to platform compromises |

### SBOM (Software Bill of Materials)

```
Generate automatically on every build:
- Format SPDX 3 or CycloneDX
- List all direct and transitive dependencies
- Include versions, licenses, known CVEs
- Publish to artifact registry

Tools: syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Sign artifacts and Docker images:
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless signing (recommended in CI/CD):
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Supply Chain Checklist

- [ ] SBOM generated automatically (SPDX 3 or CycloneDX)
- [ ] Artifacts signed with Sigstore/cosign
- [ ] SLSA 1+ provenance documented
- [ ] Dependencies with pinned versions (hash or exact version)
- [ ] Automated CVE scanning (Trivy, Grype) on every build
- [ ] Dependabot / Renovate configured
- [ ] Dependency review before merge

---

## Logging and Monitoring

### Events to Log

```
LOG:
- Login attempts (success/failure)
- Permission changes
- Access to sensitive data
- Authorization errors
- Configuration changes
- Data exports

DO NOT LOG:
- Passwords
- Tokens
- Complete personal data
- Credit card numbers
- Full stack traces in prod
```

### Log Format

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "WARN",
  "event": "login_failed",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### Alerting

```
Critical alerts:
- 5+ login failures on same account
- Admin access from new IP
- Permission changes
- Consecutive 500 errors
- Abnormal request volume
```

---

## MCP & Plugin Security

### Risks of Third-party MCP Servers

> **Alert:** Security research (Snyk, 2026) identified 76 malicious payloads in public MCP server registries. Unvetted third-party MCP servers represent a significant risk.

```
RISKS:
- Command injection via MCP parameters
- Data exfiltration (files, secrets, context)
- Arbitrary code execution on host machine
- Privilege escalation via exposed tools

PROTECTION:
- Prefer writing your own MCP servers
- Audit source code before installing third-party servers
- Limit permissions (tools allowlist)
- Use PreToolUse hook to block dangerous patterns
```

### MCP/Plugin Vetting Checklist

Before installing a third-party MCP server:

- [ ] Source code available and auditable
- [ ] Verified author/organization
- [ ] No unjustified network access
- [ ] No reading sensitive files (.env, secrets)
- [ ] Minimal permissions (principle of least privilege)
- [ ] Pinned version (not `latest`)
- [ ] Changelog and security history

### PreToolUse Hook for Security

Use Claude Code hooks to block dangerous patterns.

> **Best practice:** Hooks receive tool input as JSON on **stdin** — always use `jq -r '.tool_input.<field>'` (not `echo '$TOOL_INPUT'`) to read values safely and avoid shell injection.
> **Important:** Use `exit 2` (not `exit 1`) to actually block the tool call in Claude Code. `exit 1` only signals an error but does **not** block execution.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(jq -r '.tool_input.command // empty'); printf '%s' \"$INPUT\" | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' >&2 && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.md vs Hooks

| Mechanism | Strength | Usage |
|-----------|----------|-------|
| **CLAUDE.md** | Suggestion | Guidelines, conventions |
| **Rules** | Strong suggestion | Detailed rules |
| **Hooks** | Enforcement | Effective blocking, automatic validation |

> **Rule:** CLAUDE.md = suggestions. Hooks = requirements.
> For critical security constraints, use hooks, not text instructions.

---

## Checklist

### Development

- [ ] Server-side input validation
- [ ] Parameterized queries (no SQL concatenation)
- [ ] Output escaping (XSS prevention)
- [ ] Passwords hashed with **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Secure sessions (httpOnly, secure, sameSite)
- [ ] Permission verification on every request
- [ ] Secrets in environment variables or Vault
- [ ] Dependencies audited (CVE scan)
- [ ] JWT with EdDSA or ES256 (never HS256)
- [ ] DPoP (RFC 9449) for sensitive tokens

### Configuration

- [ ] HTTPS enabled (TLS 1.3)
- [ ] 2026 security headers (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Generic error messages in prod
- [ ] Debug mode disabled in prod
- [ ] Rate limiting enabled
- [ ] CORS configured strictly

### Supply Chain

- [ ] SBOM generated (SPDX 3 or CycloneDX)
- [ ] Artifacts signed (Sigstore/cosign)
- [ ] SLSA 1+ provenance documented
- [ ] Dependencies pinned to exact version

### Monitoring

- [ ] Security event logging
- [ ] Alerting on anomalies
- [ ] Regular access audits
- [ ] Periodic vulnerability scans

### Compliance (if applicable)

- [ ] GDPR: Consent, right to erasure
- [ ] PCI-DSS: Payment data
- [ ] HIPAA: Health data
- [ ] SOC2: Security controls

---

## Resources

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)
- **Argon2id 2026:** [Complete guide](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- **RFC 9449 DPoP:** [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc9449)
- **JWT Best Practices 2026:** [duendesoftware.com](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps)
- **HTTP Security Headers 2026:** [thibautprobst.fr](https://thibautprobst.fr/en/posts/http-security-headers/)
- **Supply Chain 2026:** [kawaldeepsingh.medium.com](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

---

**Last updated:** 2026-06
**Version:** 1.2.0
**Author:** The Bearded CTO
