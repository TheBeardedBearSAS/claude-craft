# Security

## Overview

Security is an **absolute priority**. This document presents the general security principles applicable to any project.

> **Note:** Refer to the rules specific to your technology for concrete implementations.

**References:**
- OWASP Top 10
- CWE/SANS Top 25

---

## Table of Contents

1. [OWASP Top 10](#owasp-top-10)
2. [Input Validation](#input-validation)
3. [Authentication](#authentication)
4. [Authorization](#authorization)
5. [Sensitive Data](#sensitive-data)
6. [Security Headers](#security-headers)
7. [Logging and Monitoring](#logging-and-monitoring)
8. [Checklist](#checklist)

---

## OWASP Top 10

### 1. Broken Access Control

```
RISK
- Accessing resources without verification
- Predictable URLs (/admin, /user/123/edit)
- Manipulating IDs in URLs

PROTECTION
- Verify permissions on EVERY request
- Use non-predictable identifiers (UUID)
- Deny by default
```

### 2. Cryptographic Failures

```
RISK
- Sensitive data in plain text
- Obsolete algorithms (MD5, SHA1)
- Keys in source code

PROTECTION
- Encrypt sensitive data at rest
- Use TLS 1.3 in transit
- Modern algorithms (bcrypt, Argon2, AES-256)
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

### 6. Vulnerable Components

```
RISK
- Dependencies with known vulnerabilities
- Obsolete components
- No CVE tracking

PROTECTION
- Regular dependency audits
- Automatic updates (Dependabot)
- SBOM (Software Bill of Materials)
```

### 7. Authentication Failures

```
RISK
- Weak passwords allowed
- No MFA
- Sessions that never expire
- Credential stuffing possible

PROTECTION
- Strong password policy
- MFA for sensitive access
- Session expiration
- Rate limiting on login
- Brute force detection
```

### 8. Data Integrity Failures

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

### 10. SSRF (Server-Side Request Forgery)

```
RISK
- User-supplied URLs not validated
- Access to internal resources

PROTECTION
- Whitelist of authorized destinations
- Strict URL validation
- No internal network access from inputs
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
Rules:
- Minimum 12 characters
- Uppercase, lowercase, digits, special characters
- Not in compromised password lists
- Hash with bcrypt/Argon2 (NEVER MD5/SHA1)
- Unique salt per user

// GOOD
hash = bcrypt.hash(password, costFactor=12)

// BAD
hash = md5(password)
hash = sha1(password + "static_salt")
```

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
Rules:
- Algorithm: RS256 or ES256 (not HS256 with weak secret)
- Short expiration (15 min)
- Long refresh token (7 days) stored securely
- Verify signature and claims
- Do not store sensitive data in the payload

// BAD
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// GOOD
jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  expiresIn: "15m"
})
```

### Multi-Factor Authentication (MFA)

```
When to enable MFA:
- Admin access
- Sensitive operations (payment, deletion)
- Password change
- Login from new device

Methods:
- TOTP (Google Authenticator)
- SMS (less secure)
- Hardware keys (FIDO2)
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
| **Secret** | Passwords, keys | Vault, hash |

### Storage

```
Passwords:
  -> Hash with bcrypt/Argon2
  -> NEVER in plain text

Personal data (GDPR):
  -> Encryption at rest
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

### Recommended Headers

```http
# XSS Protection
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Clickjacking Protection
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permissions
Permissions-Policy: geolocation=(), camera=()
```

### Content-Security-Policy (CSP)

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
```

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

## Checklist

### Development

- [ ] Server-side input validation
- [ ] Parameterized queries (no SQL concatenation)
- [ ] Output escaping (XSS prevention)
- [ ] Hashed passwords (bcrypt/Argon2)
- [ ] Secure sessions (httpOnly, secure, sameSite)
- [ ] Permission verification on every request
- [ ] Secrets in environment variables
- [ ] Dependencies audited

### Configuration

- [ ] HTTPS enabled (TLS 1.3)
- [ ] Security headers configured
- [ ] Generic error messages in prod
- [ ] Debug mode disabled in prod
- [ ] Rate limiting enabled
- [ ] CORS configured strictly

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

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Last updated:** 2025-01
**Version:** 1.0.0
**Author:** The Bearded CTO
