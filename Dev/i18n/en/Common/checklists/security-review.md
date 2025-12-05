# Security Review Checklist

## OWASP Top 10 (2021)

### A01:2021 - Broken Access Control

- [ ] Authorization verification on every endpoint
- [ ] No direct object access by ID without verification
- [ ] CORS configured correctly
- [ ] JWT tokens validated server-side
- [ ] Principle of least privilege applied
- [ ] No privilege escalation possible

### A02:2021 - Cryptographic Failures

- [ ] Sensitive data encrypted at rest
- [ ] Sensitive data encrypted in transit (HTTPS)
- [ ] Up-to-date encryption algorithms (no MD5, SHA1)
- [ ] Encryption keys stored securely
- [ ] Passwords hashed with bcrypt/argon2
- [ ] No secrets in source code

### A03:2021 - Injection

- [ ] Parameterized SQL queries (prepared statements)
- [ ] Input validation and sanitization
- [ ] Output escaping (XSS)
- [ ] No dynamic code evaluation
- [ ] LDAP/XML/OS injection verified
- [ ] HTTP headers sanitized

### A04:2021 - Insecure Design

- [ ] Threat modeling performed
- [ ] Rate limiting implemented
- [ ] Resource limits defined
- [ ] Fail securely (no data exposed on error)
- [ ] Defense in depth applied

### A05:2021 - Security Misconfiguration

- [ ] Security headers configured (CSP, HSTS, X-Frame-Options)
- [ ] Debug mode disabled in production
- [ ] Generic errors in production (no stack traces)
- [ ] Restrictive file permissions
- [ ] Unused services disabled
- [ ] Up-to-date dependency versions

### A06:2021 - Vulnerable Components

- [ ] Dependency audit performed (npm audit, safety check)
- [ ] No known critical vulnerabilities
- [ ] Dependencies up to date
- [ ] Package sources verified
- [ ] Lockfile present and up to date

### A07:2021 - Authentication Failures

- [ ] Robust password policy (12+ chars, complexity)
- [ ] Brute force protection
- [ ] MFA available/mandatory for admins
- [ ] Session invalidated after logout
- [ ] Tokens with reasonable expiration
- [ ] No default credentials

### A08:2021 - Software and Data Integrity Failures

- [ ] CI/CD pipeline integrity verified
- [ ] Package signatures verified
- [ ] No insecure deserialization
- [ ] SRI (Subresource Integrity) for CDNs
- [ ] Secure automatic updates

### A09:2021 - Security Logging Failures

- [ ] Security events logged (login, failures, access)
- [ ] Logs protected against modification
- [ ] No sensitive data in logs
- [ ] Alerts on suspicious events
- [ ] Compliant log retention

### A10:2021 - Server-Side Request Forgery (SSRF)

- [ ] URLs validated server-side
- [ ] Whitelist of allowed domains
- [ ] No access to cloud metadata
- [ ] Controlled DNS resolution

---

## Checklist by Component

### API / Backend

- [ ] Authentication on all sensitive endpoints
- [ ] Authorization verified (RBAC/ABAC)
- [ ] Strict input validation
- [ ] Output encoding
- [ ] Rate limiting per IP/user
- [ ] Timeouts configured
- [ ] Restrictive CORS

### Database

- [ ] Access with limited privilege account
- [ ] No direct access from internet
- [ ] Encryption of sensitive data
- [ ] Encrypted backups
- [ ] Access audit enabled

### Frontend

- [ ] Content Security Policy (CSP)
- [ ] Sanitization of displayed data
- [ ] No secrets in JS code
- [ ] HTTPS enforced
- [ ] Secure cookies (HttpOnly, Secure, SameSite)

### Mobile

- [ ] Certificate pinning
- [ ] Secure storage (Keychain/Keystore)
- [ ] No sensitive data in plain text
- [ ] Anti-tampering
- [ ] Code obfuscation

### Infrastructure

- [ ] Firewall configured
- [ ] Isolated VPC/network
- [ ] Secrets in vault (not in env vars)
- [ ] Centralized logs
- [ ] Security monitoring

---

## Security Tests

### Automated Tests

- [ ] SAST (static analysis) passed
- [ ] DAST (dynamic analysis) passed
- [ ] Dependency scanning passed
- [ ] Container scanning passed (if applicable)

### Manual Tests

- [ ] Penetration test (if major change)
- [ ] Security code review
- [ ] Common attack scenario testing

---

## Security Documentation

- [ ] Security policy documented
- [ ] Incident response process
- [ ] Security contact defined
- [ ] Responsible disclosure policy

---

## Decision

- [ ] ✅ **Approved** - No security issues
- [ ] ⚠️ **Concerns** - Points to verify/improve
- [ ] ❌ **Blocked** - Critical vulnerabilities to fix
