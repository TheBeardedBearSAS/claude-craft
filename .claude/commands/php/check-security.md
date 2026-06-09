---
description: Security Audit
model: haiku

---

# Security Audit

Security audit for PHP applications following OWASP guidelines.

## What This Command Does

1. **Vulnerability Scanning**
   - SQL Injection detection
   - XSS vulnerability analysis
   - CSRF protection check
   - Authentication weakness detection
   - Authorization bypass risks

2. **Code Security Review**
   - Input validation
   - Output encoding
   - Session management
   - Cryptography usage
   - Error handling

3. **Dependency Audit**
   - Known vulnerability check
   - Outdated packages
   - Security advisories

4. **Configuration Review**
   - Security headers
   - PHP configuration
   - Framework security settings

## OWASP Top 10 Checklist

### A01: Broken Access Control

```php
<?php
// ✅ Secure - Use Voter pattern
#[Route('/orders/{id}', methods: ['GET'])]
public function show(Order $order): JsonResponse
{
    $this->denyAccessUnlessGranted('view', $order);
    return new JsonResponse($order);
}

// ❌ Insecure - No authorization check
#[Route('/orders/{id}', methods: ['GET'])]
public function show(string $id): JsonResponse
{
    $order = $this->repository->find($id);
    return new JsonResponse($order);  // Anyone can access any order!
}
```

**Checklist:**
- [ ] Authorization checked on every endpoint
- [ ] Row-level security implemented
- [ ] Deny by default policy
- [ ] No IDOR vulnerabilities

### A02: Cryptographic Failures

```php
<?php
// ✅ Secure - Use Argon2id for passwords
$hash = password_hash($password, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,
    'time_cost' => 4,
    'threads' => 3,
]);

// ✅ Secure - AES-256-GCM for encryption
$cipher = 'aes-256-gcm';
$iv = random_bytes(12);
$ciphertext = openssl_encrypt($plaintext, $cipher, $key, OPENSSL_RAW_DATA, $iv, $tag);

// ❌ Insecure - MD5/SHA1 for passwords
$hash = md5($password);  // NEVER DO THIS!
$hash = sha1($password);  // NEVER DO THIS!
```

**Checklist:**
- [ ] Passwords hashed with Argon2id/bcrypt
- [ ] Sensitive data encrypted at rest
- [ ] TLS 1.3 for data in transit
- [ ] Secure random number generation
- [ ] No hardcoded secrets

### A03: Injection

```php
<?php
// ✅ Secure - Parameterized queries
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);

// ✅ Secure - Doctrine QueryBuilder
$query = $this->createQueryBuilder('u')
    ->where('u.email = :email')
    ->setParameter('email', $email);

// ❌ Insecure - String concatenation
$sql = "SELECT * FROM users WHERE email = '$email'";  // SQL INJECTION!
```

**Checklist:**
- [ ] Parameterized queries used everywhere
- [ ] No string concatenation in queries
- [ ] Input validation before use
- [ ] Output encoding applied

### A04: Insecure Design

```php
<?php
// ✅ Secure - Rate limiting
if (!$this->rateLimiter->isAllowed($key, maxAttempts: 5, decaySeconds: 300)) {
    throw new TooManyRequestsHttpException();
}

// ✅ Secure - Account lockout
if ($user->getFailedLoginAttempts() >= 5) {
    $user->lock(minutes: 30);
}
```

**Checklist:**
- [ ] Rate limiting implemented
- [ ] Account lockout after failed attempts
- [ ] CAPTCHA for sensitive operations
- [ ] Threat modeling performed

### A05: Security Misconfiguration

```php
<?php
// ✅ Secure - Security headers — X-XSS-Protection est déprécié, s'appuyer sur CSP Level 3
$response->headers->set('X-Content-Type-Options', 'nosniff');
$response->headers->set('X-Frame-Options', 'DENY');
$response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
$response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
$response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
$response->headers->set('Cross-Origin-Resource-Policy', 'same-origin');
```

**Checklist:**
- [ ] Security headers configured
- [ ] Debug mode disabled in production
- [ ] Error messages don't leak info
- [ ] Default credentials changed
- [ ] Unnecessary features disabled

### A06: Vulnerable Components

```bash
# Check for vulnerabilities
composer audit

# Check for outdated packages
composer outdated

# Update dependencies
composer update
```

**Checklist:**
- [ ] Regular dependency audits
- [ ] Automated vulnerability scanning
- [ ] Update policy in place
- [ ] SBOM maintained

### A07: Authentication Failures

```php
<?php
// ✅ Secure - Strong password policy
$options = [
    'cost' => 12,
];
$hash = password_hash($password, PASSWORD_BCRYPT, $options);

// ✅ Secure - Session configuration
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_secure', '1');
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', '1');

// ✅ Secure - JWT with short expiration
$payload = [
    'sub' => $userId,
    'exp' => time() + 3600,  // 1 hour
    'jti' => bin2hex(random_bytes(16)),
];
```

**Checklist:**
- [ ] Strong password requirements
- [ ] MFA for sensitive operations
- [ ] Secure session management
- [ ] JWT with short expiration
- [ ] Credential stuffing protection

### A08: Data Integrity Failures

```php
<?php
// ✅ Secure - File upload validation
public function validate(UploadedFile $file): void
{
    // Check file size
    if ($file->getSize() > 5 * 1024 * 1024) {
        throw new InvalidFileException('File too large');
    }

    // Check MIME type
    $allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!in_array($file->getMimeType(), $allowedTypes, true)) {
        throw new InvalidFileException('Invalid file type');
    }

    // Verify actual content
    $finfo = new \finfo(FILEINFO_MIME_TYPE);
    $actualType = $finfo->file($file->getPathname());
    if ($actualType !== $file->getMimeType()) {
        throw new InvalidFileException('Content mismatch');
    }
}
```

**Checklist:**
- [ ] File uploads validated
- [ ] CSRF protection enabled
- [ ] Integrity checks on updates
- [ ] Signed requests for sensitive ops

### A09: Logging Failures

```php
<?php
// ✅ Secure - Security event logging
$this->logger->warning('Authentication failed', [
    'email' => $email,
    'ip' => $request->getClientIp(),
    'user_agent' => $request->headers->get('User-Agent'),
    'timestamp' => (new \DateTimeImmutable())->format('c'),
]);

// ❌ Insecure - Logging sensitive data
$this->logger->info('Login attempt', [
    'password' => $password,  // NEVER LOG PASSWORDS!
    'credit_card' => $cardNumber,  // NEVER LOG SENSITIVE DATA!
]);
```

**Checklist:**
- [ ] Security events logged
- [ ] No sensitive data in logs
- [ ] Logs protected from tampering
- [ ] Alerting on suspicious activity

### A10: SSRF

```php
<?php
// ✅ Secure - URL validation
public function fetch(string $url): string
{
    $parsed = parse_url($url);

    // Whitelist check
    if (!in_array($parsed['host'], $this->allowedHosts, true)) {
        throw new InvalidUrlException('Host not allowed');
    }

    // Block private IPs
    $ip = gethostbyname($parsed['host']);
    if ($this->isPrivateIp($ip)) {
        throw new InvalidUrlException('Private IP not allowed');
    }

    return file_get_contents($url);
}
```

**Checklist:**
- [ ] URL whitelist implemented
- [ ] Private IP ranges blocked
- [ ] Redirects not followed blindly
- [ ] Timeout limits set

## Security Configuration

### php.ini Hardening

```ini
; Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen

; Hide PHP version
expose_php = Off

; Error handling
display_errors = Off
log_errors = On
error_log = /var/log/php_errors.log

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = Strict
session.use_strict_mode = 1

; File uploads
upload_max_filesize = 5M
max_file_uploads = 5

; Disable URL file operations
allow_url_fopen = Off
allow_url_include = Off
```

### Framework Security

```yaml
# Symfony security.yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: argon2id
            memory_cost: 65536
            time_cost: 4
            threads: 3

    firewalls:
        main:
            pattern: ^/
            stateless: true
            jwt: ~

    access_control:
        - { path: ^/api/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: ROLE_USER }
```

## Security Audit Checklist

### Input Handling
- [ ] All input validated server-side
- [ ] Whitelist validation used
- [ ] Type casting applied
- [ ] Length limits enforced

### Output Handling
- [ ] HTML output escaped
- [ ] JSON properly encoded
- [ ] SQL parameterized
- [ ] Shell commands escaped

### Authentication
- [ ] Strong password requirements
- [ ] Secure password storage
- [ ] Session management secure
- [ ] MFA available

### Authorization
- [ ] Role-based access control
- [ ] Resource-level permissions
- [ ] Deny by default
- [ ] Audit logging

### Data Protection
- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Secure key management
- [ ] Data minimization

### Configuration
- [ ] Security headers set
- [ ] Debug disabled
- [ ] Errors hidden
- [ ] Updates applied

## Running Security Checks

```bash
# Dependency vulnerabilities
composer audit

# Static analysis security rules
vendor/bin/phpstan analyse --level=max
vendor/bin/psalm --taint-analysis

# OWASP dependency check
composer require --dev roave/security-advisories:dev-latest
```

## CI/CD Security

```yaml
security:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Dependency Audit
      run: composer audit --format=json

    - name: Static Analysis
      run: |
        vendor/bin/phpstan analyse
        vendor/bin/psalm --taint-analysis

    - name: Security Scan
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.5'
        tools: security-checker
```
