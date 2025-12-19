---
description: Check Python Security
argument-hint: [arguments]
---

# Check Python Security

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## MISSION

Perform a complete security audit of the Python project by identifying vulnerabilities, exposed secrets, and security bad practices defined in project rules.

### Step 1: Security Analysis with Bandit

Scan code with Bandit to detect vulnerabilities:
- [ ] No hardcoded passwords/secrets
- [ ] No use of `eval()` or `exec()`
- [ ] No insecure deserialization (pickle)
- [ ] No SQL injection (ORM or parameterized queries)
- [ ] No shell command injection
- [ ] Secure cryptography (not MD5/SHA1)

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install bandit && bandit -r /app -f json"`

**Reference**: `rules/06-tooling.md` section "Security Analysis"

### Step 2: Secret Detection

Search for secrets and credentials in code:
- [ ] No API keys in source code
- [ ] No tokens in files
- [ ] No plain text passwords
- [ ] Environment variables for sensitive configuration
- [ ] .env in .gitignore
- [ ] .env.example provided (without real values)

**Command**: Use grep/search to detect secret patterns

**Patterns to search**:
- `password\s*=\s*["'][^"']+["']`
- `api_key\s*=\s*["'][^"']+["']`
- `secret\s*=\s*["'][^"']+["']`
- `token\s*=\s*["'][^"']+["']`

**Reference**: `rules/03-coding-standards.md` section "Security Best Practices"

### Step 3: User Input Validation

Verify data validation and sanitization:
- [ ] Validation of all user inputs
- [ ] Use of Pydantic for validation
- [ ] Data sanitization before processing
- [ ] No blind trust in external data
- [ ] Type and format validation
- [ ] Limits on input size

**Reference**: `rules/03-coding-standards.md` section "Input Validation"

### Step 4: Dependencies and Vulnerabilities

Analyze dependencies for known vulnerabilities:
- [ ] No dependencies with critical CVEs
- [ ] Up-to-date library versions
- [ ] requirements.txt with pinned versions
- [ ] Use of `pip-audit` or `safety`
- [ ] No obsolete dependencies

**Command**: Run `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pip-audit && pip-audit --requirement /app/requirements.txt"`

**Reference**: `rules/06-tooling.md` section "Dependency Management"

### Step 5: Error and Log Management

Check secure error handling:
- [ ] No exposed stack traces in production
- [ ] Generic error messages for users
- [ ] Secure logs (no sensitive data)
- [ ] No debug mode in production
- [ ] Proper exception handling
- [ ] Logging of security events

**Reference**: `rules/03-coding-standards.md` section "Error Handling"

### Step 6: Authentication and Authorization

Verify authentication security:
- [ ] No manual password management (use bcrypt/argon2)
- [ ] JWT tokens with expiration
- [ ] HTTPS mandatory for sensitive endpoints
- [ ] CSRF protection if applicable
- [ ] Rate limiting on sensitive endpoints
- [ ] Permission validation (RBAC/ABAC)

**Reference**: `rules/02-architecture.md` section "Security Layer"

### Step 7: Configuration and Environment

Analyze security configuration:
- [ ] Environment variables for secrets
- [ ] Different configuration per environment (dev/staging/prod)
- [ ] No secrets in docker-compose.yml
- [ ] Secrets in environment variables or vault
- [ ] Documented .env.example
- [ ] DEBUG=False in production

**Reference**: `rules/06-tooling.md` section "Environment Configuration"

### Step 8: Injection and XSS

Verify protection against injections:
- [ ] No SQL injection (ORM or parameterized queries)
- [ ] Data escaping in templates
- [ ] No command injection (secure subprocess)
- [ ] File path validation (path traversal)
- [ ] Content-Security-Policy if web application
- [ ] HTML input sanitization

**Reference**: `rules/03-coding-standards.md` section "Security Best Practices"

### Step 9: Calculate Score

Point attribution (out of 25):
- Bandit (vulnerabilities): 6 points
- Secrets and credentials: 5 points
- Input validation: 4 points
- Secure dependencies: 4 points
- Error handling: 3 points
- Auth/Authz: 2 points
- Injection/XSS: 1 point

## OUTPUT FORMAT

```
PYTHON SECURITY AUDIT
================================

OVERALL SCORE: XX/25

STRENGTHS:
- [List of observed security good practices]

IMPROVEMENTS:
- [List of minor security improvements]

CRITICAL ISSUES:
- [List of critical vulnerabilities to fix IMMEDIATELY]

DETAILS BY CATEGORY:

1. BANDIT SCAN (XX/6)
   Status: [Vulnerability analysis]
   Critical Issues: XX
   Medium Issues: XX
   Low Issues: XX

2. EXPOSED SECRETS (XX/5)
   Status: [Secret detection]
   Hardcoded Secrets: XX
   Secure .env Files: ✅/❌

3. INPUT VALIDATION (XX/4)
   Status: [Validation and sanitization]
   Unvalidated Inputs: XX
   Pydantic Usage: ✅/❌

4. DEPENDENCIES (XX/4)
   Status: [Dependency vulnerabilities]
   Critical CVEs: XX
   Medium CVEs: XX
   Obsolete Dependencies: XX

5. ERROR HANDLING (XX/3)
   Status: [Error and log security]
   Exposed Stack Traces: XX
   Sensitive Data in Logs: XX

6. AUTHENTICATION (XX/2)
   Status: [Auth/Authz]
   Secure Hashing: ✅/❌
   JWT with Expiration: ✅/❌

7. INJECTIONS (XX/1)
   Status: [Injection protection]
   SQL Injection Risks: XX
   Command Injection Risks: XX

CRITICAL VULNERABILITIES:
[Detailed list of vulnerabilities to fix immediately with file:line]

TOP 3 PRIORITY ACTIONS:
1. [Most critical security action - URGENT]
2. [Second priority action - IMPORTANT]
3. [Third priority action - RECOMMENDED]
```

## NOTES

- Security issues MUST be treated with absolute priority
- Use Docker to run security tools
- Provide exact file and line for each vulnerability
- Propose concrete corrections for each problem
- Document risks and potential impact
- Test suggested fixes
- NEVER commit secrets in code
