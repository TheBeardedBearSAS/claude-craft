# PHP Security Best Practices

## OWASP Top 10 Protection

### A01: Broken Access Control

```php
<?php

declare(strict_types=1);

// ✅ Implement proper authorization checks
final class OrderController
{
    public function __construct(
        private readonly AuthorizationCheckerInterface $authChecker,
        private readonly OrderRepositoryInterface $orderRepository,
    ) {}

    public function show(string $orderId): Response
    {
        $order = $this->orderRepository->find(OrderId::fromString($orderId));

        if ($order === null) {
            throw new NotFoundHttpException('Order not found');
        }

        // ✅ Check ownership or permission
        if (!$this->authChecker->isGranted('VIEW', $order)) {
            throw new AccessDeniedHttpException('Access denied');
        }

        return new JsonResponse($order);
    }
}

// ✅ Voter for fine-grained authorization
final class OrderVoter extends Voter
{
    protected function supports(string $attribute, mixed $subject): bool
    {
        return $subject instanceof Order
            && in_array($attribute, ['VIEW', 'EDIT', 'DELETE'], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var Order $order */
        $order = $subject;

        return match ($attribute) {
            'VIEW' => $this->canView($order, $user),
            'EDIT' => $this->canEdit($order, $user),
            'DELETE' => $this->canDelete($order, $user),
            default => false,
        };
    }

    private function canView(Order $order, User $user): bool
    {
        // Owner can view
        if ($order->getCustomerId()->equals($user->getId())) {
            return true;
        }

        // Admin can view all
        return $user->hasRole('ROLE_ADMIN');
    }
}
```

### A02: Cryptographic Failures

```php
<?php

declare(strict_types=1);

// ✅ Password hashing with modern algorithms
final class PasswordHasher
{
    public function hash(string $password): string
    {
        // Use PASSWORD_DEFAULT (currently bcrypt, may change to Argon2)
        return password_hash($password, PASSWORD_DEFAULT, [
            'cost' => 12, // Adjust based on server capabilities
        ]);
    }

    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    public function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, PASSWORD_DEFAULT, ['cost' => 12]);
    }
}

// ✅ Argon2id (recommended for new projects)
final class Argon2PasswordHasher
{
    public function hash(string $password): string
    {
        return password_hash($password, PASSWORD_ARGON2ID, [
            'memory_cost' => PASSWORD_ARGON2_DEFAULT_MEMORY_COST,
            'time_cost' => PASSWORD_ARGON2_DEFAULT_TIME_COST,
            'threads' => PASSWORD_ARGON2_DEFAULT_THREADS,
        ]);
    }
}

// ✅ Data encryption
final class Encryptor
{
    private const CIPHER = 'aes-256-gcm';

    public function __construct(
        private readonly string $secretKey,
    ) {
        if (strlen($secretKey) !== 32) {
            throw new InvalidArgumentException('Key must be 32 bytes');
        }
    }

    public function encrypt(string $data): string
    {
        $iv = random_bytes(openssl_cipher_iv_length(self::CIPHER));
        $tag = '';

        $encrypted = openssl_encrypt(
            $data,
            self::CIPHER,
            $this->secretKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
        );

        // Concatenate IV + tag + encrypted data
        return base64_encode($iv . $tag . $encrypted);
    }

    public function decrypt(string $encryptedData): string
    {
        $data = base64_decode($encryptedData, true);

        $ivLength = openssl_cipher_iv_length(self::CIPHER);
        $tagLength = 16;

        $iv = substr($data, 0, $ivLength);
        $tag = substr($data, $ivLength, $tagLength);
        $encrypted = substr($data, $ivLength + $tagLength);

        $decrypted = openssl_decrypt(
            $encrypted,
            self::CIPHER,
            $this->secretKey,
            OPENSSL_RAW_DATA,
            $iv,
            $tag,
        );

        if ($decrypted === false) {
            throw new RuntimeException('Decryption failed');
        }

        return $decrypted;
    }
}
```

### A03: Injection

```php
<?php

declare(strict_types=1);

// ✅ SQL Injection Prevention - Prepared Statements
final class UserRepository
{
    public function __construct(
        private readonly PDO $pdo,
    ) {}

    // ✅ GOOD: Parameterized query
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT * FROM users WHERE email = :email'
        );
        $stmt->execute(['email' => $email]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    // ❌ BAD: Never do this!
    public function findByEmailUnsafe(string $email): ?array
    {
        // VULNERABLE TO SQL INJECTION
        $sql = "SELECT * FROM users WHERE email = '{$email}'";
        // ...
    }

    // ✅ Dynamic queries with whitelisting
    public function findWithSorting(string $column, string $direction): array
    {
        // Whitelist allowed columns
        $allowedColumns = ['name', 'email', 'created_at'];
        $allowedDirections = ['ASC', 'DESC'];

        if (!in_array($column, $allowedColumns, true)) {
            throw new InvalidArgumentException('Invalid column');
        }

        if (!in_array(strtoupper($direction), $allowedDirections, true)) {
            $direction = 'ASC';
        }

        // Column names cannot be parameterized, but we've validated them
        $stmt = $this->pdo->prepare(
            "SELECT * FROM users ORDER BY {$column} {$direction}"
        );
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}

// ✅ Command Injection Prevention
final class ReportGenerator
{
    public function generate(string $reportName): string
    {
        // Whitelist allowed report names
        $allowedReports = ['sales', 'inventory', 'users'];

        if (!in_array($reportName, $allowedReports, true)) {
            throw new InvalidArgumentException('Invalid report name');
        }

        // ✅ Use escapeshellarg for any user input
        $escapedName = escapeshellarg($reportName);

        $output = [];
        $returnCode = 0;

        exec("./bin/generate-report {$escapedName}", $output, $returnCode);

        if ($returnCode !== 0) {
            throw new RuntimeException('Report generation failed');
        }

        return implode("\n", $output);
    }
}
```

### A04: Insecure Design - Rate Limiting

```php
<?php

declare(strict_types=1);

// ✅ Rate limiter implementation
final class RateLimiter
{
    public function __construct(
        private readonly CacheInterface $cache,
        private readonly int $maxAttempts = 5,
        private readonly int $decaySeconds = 60,
    ) {}

    public function attempt(string $key): bool
    {
        $cacheKey = 'rate_limit:' . $key;
        $attempts = $this->cache->get($cacheKey, 0);

        if ($attempts >= $this->maxAttempts) {
            return false;
        }

        $this->cache->set($cacheKey, $attempts + 1, $this->decaySeconds);

        return true;
    }

    public function tooManyAttempts(string $key): bool
    {
        return $this->cache->get('rate_limit:' . $key, 0) >= $this->maxAttempts;
    }

    public function remainingAttempts(string $key): int
    {
        $attempts = $this->cache->get('rate_limit:' . $key, 0);

        return max(0, $this->maxAttempts - $attempts);
    }

    public function clear(string $key): void
    {
        $this->cache->delete('rate_limit:' . $key);
    }
}

// ✅ Usage in login controller
final class LoginController
{
    public function __construct(
        private readonly RateLimiter $rateLimiter,
        private readonly AuthenticationService $authService,
    ) {}

    public function login(Request $request): Response
    {
        $key = 'login:' . $request->getClientIp();

        if ($this->rateLimiter->tooManyAttempts($key)) {
            return new JsonResponse([
                'error' => 'Too many login attempts. Try again later.',
            ], 429);
        }

        if (!$this->rateLimiter->attempt($key)) {
            return new JsonResponse(['error' => 'Rate limit exceeded'], 429);
        }

        try {
            $token = $this->authService->authenticate(
                $request->get('email'),
                $request->get('password'),
            );

            // Clear rate limit on successful login
            $this->rateLimiter->clear($key);

            return new JsonResponse(['token' => $token]);
        } catch (AuthenticationException $e) {
            return new JsonResponse(['error' => 'Invalid credentials'], 401);
        }
    }
}
```

### A05: Security Misconfiguration

```php
<?php

// php.ini security settings (production)

// ✅ Disable dangerous functions
// disable_functions = exec,passthru,shell_exec,system,proc_open,popen

// ✅ Error handling
// display_errors = Off
// display_startup_errors = Off
// log_errors = On
// error_log = /var/log/php/error.log

// ✅ Session security
// session.cookie_httponly = 1
// session.cookie_secure = 1
// session.cookie_samesite = Strict
// session.use_strict_mode = 1
// session.use_only_cookies = 1

// ✅ File uploads
// file_uploads = On
// upload_max_filesize = 2M
// max_file_uploads = 5

// ✅ Expose less information
// expose_php = Off
// allow_url_fopen = Off
// allow_url_include = Off
```

```php
<?php

declare(strict_types=1);

// ✅ Security headers middleware
final class SecurityHeadersMiddleware
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        $response = $handler->handle($request);

        return $response
            ->withHeader('X-Content-Type-Options', 'nosniff')
            ->withHeader('X-Frame-Options', 'DENY')
            ->withHeader('X-XSS-Protection', '1; mode=block')
            ->withHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->withHeader('Permissions-Policy', 'geolocation=(), camera=()')
            ->withHeader(
                'Content-Security-Policy',
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
            )
            ->withHeader(
                'Strict-Transport-Security',
                'max-age=31536000; includeSubDomains'
            );
    }
}
```

### A06: Vulnerable Components

```bash
# Check for known vulnerabilities
composer audit

# Update dependencies
composer update

# Check outdated packages
composer outdated
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "composer"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

### A07: Authentication Failures

```php
<?php

declare(strict_types=1);

// ✅ Secure session management
final class SessionManager
{
    public function __construct(
        private readonly int $lifetime = 1800, // 30 minutes
    ) {}

    public function start(): void
    {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        ini_set('session.cookie_httponly', '1');
        ini_set('session.cookie_secure', '1');
        ini_set('session.cookie_samesite', 'Strict');
        ini_set('session.use_strict_mode', '1');
        ini_set('session.gc_maxlifetime', (string) $this->lifetime);

        session_start();
    }

    public function regenerate(): void
    {
        session_regenerate_id(true);
    }

    public function destroy(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'],
                $params['domain'],
                $params['secure'],
                $params['httponly'],
            );
        }

        session_destroy();
    }
}

// ✅ CSRF Protection
final class CsrfTokenManager
{
    public function generateToken(): string
    {
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;

        return $token;
    }

    public function validateToken(string $token): bool
    {
        if (!isset($_SESSION['csrf_token'])) {
            return false;
        }

        return hash_equals($_SESSION['csrf_token'], $token);
    }
}
```

### A08: Software and Data Integrity

```php
<?php

declare(strict_types=1);

// ✅ File upload validation
final class FileUploader
{
    private const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
    ];

    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];

    private const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    public function __construct(
        private readonly string $uploadDir,
    ) {}

    public function upload(UploadedFileInterface $file): string
    {
        // Validate size
        if ($file->getSize() > self::MAX_SIZE) {
            throw new InvalidArgumentException('File too large');
        }

        // Validate MIME type (from file content, not header)
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $tempPath = $file->getStream()->getMetadata('uri');
        $mimeType = $finfo->file($tempPath);

        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            throw new InvalidArgumentException('Invalid file type');
        }

        // Validate extension
        $originalName = $file->getClientFilename();
        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));

        if (!in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw new InvalidArgumentException('Invalid file extension');
        }

        // Generate safe filename
        $newFilename = bin2hex(random_bytes(16)) . '.' . $extension;
        $targetPath = $this->uploadDir . '/' . $newFilename;

        // Move file
        $file->moveTo($targetPath);

        return $newFilename;
    }
}
```

### A09: Security Logging

```php
<?php

declare(strict_types=1);

// ✅ Security event logger
final class SecurityLogger
{
    public function __construct(
        private readonly LoggerInterface $logger,
    ) {}

    public function logLoginAttempt(
        string $email,
        bool $success,
        string $ipAddress,
    ): void {
        $level = $success ? LogLevel::INFO : LogLevel::WARNING;

        $this->logger->log($level, 'Login attempt', [
            'email' => $email,
            'success' => $success,
            'ip_address' => $ipAddress,
            'timestamp' => (new DateTimeImmutable())->format(DATE_ATOM),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        ]);
    }

    public function logAccessDenied(
        string $userId,
        string $resource,
        string $action,
    ): void {
        $this->logger->warning('Access denied', [
            'user_id' => $userId,
            'resource' => $resource,
            'action' => $action,
            'timestamp' => (new DateTimeImmutable())->format(DATE_ATOM),
        ]);
    }

    public function logSuspiciousActivity(
        string $description,
        array $context = [],
    ): void {
        $this->logger->error('Suspicious activity', array_merge([
            'description' => $description,
            'timestamp' => (new DateTimeImmutable())->format(DATE_ATOM),
        ], $context));
    }
}
```

### A10: SSRF Prevention

```php
<?php

declare(strict_types=1);

// ✅ SSRF-safe HTTP client
final class SafeHttpClient
{
    private const ALLOWED_SCHEMES = ['https'];

    private const BLOCKED_HOSTS = [
        '127.0.0.1',
        'localhost',
        '0.0.0.0',
        '169.254.169.254', // AWS metadata
        '::1',
    ];

    public function __construct(
        private readonly HttpClientInterface $httpClient,
        private readonly array $allowedHosts = [],
    ) {}

    public function request(string $method, string $url, array $options = []): ResponseInterface
    {
        $parsedUrl = parse_url($url);

        if ($parsedUrl === false) {
            throw new InvalidArgumentException('Invalid URL');
        }

        // Validate scheme
        $scheme = $parsedUrl['scheme'] ?? '';
        if (!in_array($scheme, self::ALLOWED_SCHEMES, true)) {
            throw new SecurityException('Only HTTPS URLs are allowed');
        }

        // Validate host
        $host = $parsedUrl['host'] ?? '';

        if (in_array($host, self::BLOCKED_HOSTS, true)) {
            throw new SecurityException('Access to internal hosts is not allowed');
        }

        // Check if it's a private IP
        $ip = gethostbyname($host);
        if ($this->isPrivateIp($ip)) {
            throw new SecurityException('Access to private IPs is not allowed');
        }

        // Whitelist check if configured
        if (!empty($this->allowedHosts) && !in_array($host, $this->allowedHosts, true)) {
            throw new SecurityException('Host not in allowed list');
        }

        return $this->httpClient->request($method, $url, $options);
    }

    private function isPrivateIp(string $ip): bool
    {
        return filter_var(
            $ip,
            FILTER_VALIDATE_IP,
            FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE,
        ) === false;
    }
}
```

## XSS Prevention

```php
<?php

declare(strict_types=1);

// ✅ Output encoding
final class HtmlEncoder
{
    public static function encode(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function encodeAttribute(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    public static function encodeJs(string $value): string
    {
        return json_encode($value, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP);
    }
}

// Usage in templates
// ✅ GOOD
echo HtmlEncoder::encode($userInput);
echo '<div data-value="' . HtmlEncoder::encodeAttribute($value) . '">';

// ❌ BAD - Never do this
echo $userInput;
echo "<script>var data = '{$userInput}';</script>";
```

## Security Checklist

- [ ] All user input validated and sanitized
- [ ] Prepared statements for all database queries
- [ ] Password hashing with bcrypt/Argon2
- [ ] CSRF protection on all forms
- [ ] Rate limiting on authentication endpoints
- [ ] Security headers configured
- [ ] Session cookies HTTP-only and secure
- [ ] File uploads validated (type, size, content)
- [ ] No sensitive data in URLs or logs
- [ ] Dependencies regularly audited
- [ ] Error messages don't leak information
- [ ] HTTPS enforced everywhere
