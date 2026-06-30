# Laravel 13 Security Standards

**Source :** https://laravel.com/docs/13.x/security | https://laravel.com/docs/13.x/passkey

## OWASP Top 10 Protection

### A01:2025 - Broken Access Control (inclut SSRF)

```php
<?php
// Always use Laravel's authorization features

// Policy-based authorization
class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->id === $order->customer_id
            || $user->hasRole('admin');
    }

    public function update(User $user, Order $order): bool
    {
        return $user->id === $order->customer_id
            && $order->status === OrderStatus::Draft;
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->hasRole('admin');
    }
}

// Controller usage
class OrderController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Order::class, 'order');
    }

    public function show(Order $order)
    {
        // Authorization handled automatically
        return OrderResource::make($order);
    }
}

// Gate-based authorization
Gate::define('access-admin-panel', function (User $user) {
    return $user->hasRole('admin');
});

// Middleware-based protection
Route::middleware(['auth', 'can:access-admin-panel'])
    ->prefix('admin')
    ->group(function () {
        Route::resource('users', AdminUserController::class);
    });
```

#### SSRF — Server-Side Request Forgery (consolidé dans A01:2025)

```php
<?php
// Validate and restrict URLs
class WebhookRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'url' => [
                'required',
                'url',
                function ($attribute, $value, $fail) {
                    $parsed = parse_url($value);

                    // Block internal networks
                    $blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0'];
                    if (in_array($parsed['host'] ?? '', $blockedHosts)) {
                        $fail('Internal URLs are not allowed.');
                    }

                    // Only allow HTTPS
                    if (($parsed['scheme'] ?? '') !== 'https') {
                        $fail('Only HTTPS URLs are allowed.');
                    }

                    // Check for private IP ranges
                    $ip = gethostbyname($parsed['host'] ?? '');
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                        $fail('URLs pointing to private networks are not allowed.');
                    }
                },
            ],
        ];
    }
}

// Use allowlist for external services
$allowedDomains = config('services.allowed_webhook_domains');

if (!in_array(parse_url($url, PHP_URL_HOST), $allowedDomains)) {
    throw new InvalidArgumentException('Domain not allowed');
}
```

### A02:2025 - Cryptographic Failures

> **Règle obligatoire (project rule 11) :** Utiliser **Argon2id** pour les mots de passe. Ne jamais utiliser bcrypt en nouveau code.

```php
<?php
// config/hashing.php — configurer Argon2id
return [
    'driver' => 'argon2id',
    'argon' => [
        'memory' => 131072,  // 128 MiB
        'time'   => 3,
        'threads' => 1,
    ],
];
```

```php
<?php
// Use Laravel's encryption for sensitive data
use Illuminate\Support\Facades\Crypt;

// Encrypting data
$encrypted = Crypt::encryptString($sensitiveData);

// Decrypting data
$decrypted = Crypt::decryptString($encrypted);

// Model attribute encryption
class User extends Authenticatable
{
    protected $casts = [
        'ssn' => 'encrypted',
        'api_key' => 'encrypted',
    ];
}

// Hashing passwords with Argon2id (configured above)
use Illuminate\Support\Facades\Hash;

$hashedPassword = Hash::make($password);  // uses Argon2id driver

if (Hash::check($plainPassword, $hashedPassword)) {
    // Password matches
}

// Never store sensitive data in plain text
// BAD: $user->credit_card = $cardNumber;
// GOOD: Use a payment processor that handles card data
```

### A03:2025 - Injection

```php
<?php
// SQL Injection Prevention - Use Eloquent/Query Builder

// GOOD: Parameterized queries
$users = User::where('email', $email)->get();
$orders = DB::table('orders')->where('status', $status)->get();

// GOOD: Raw expressions with bindings
$results = DB::select('SELECT * FROM users WHERE email = ?', [$email]);

// BAD: Raw queries with concatenation
// $users = DB::select("SELECT * FROM users WHERE email = '$email'");

// XSS Prevention - Always escape output in Blade
// GOOD: {{ $user->name }} - Escapes HTML entities
// BAD: {!! $user->name !!} - Only for trusted HTML content

// Command Injection Prevention
use Symfony\Component\Process\Process;

// GOOD: Use Process component
$process = new Process(['ls', '-la', $directory]);
$process->run();

// BAD: Using shell_exec or exec with user input
// shell_exec("ls -la $directory");
```

### A04:2025 - Insecure Design

```php
<?php
// Rate limiting
Route::middleware(['throttle:api'])
    ->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

// Custom rate limiter
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->ip());
});

RateLimiter::for('api', function (Request $request) {
    return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
});

// Input validation
class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1', 'max:50'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}

// Business logic validation
public function placeOrder(Order $order): void
{
    if ($order->items->isEmpty()) {
        throw new OrderCannotBePlacedException('Order must have at least one item');
    }

    if ($order->total_amount <= 0) {
        throw new OrderCannotBePlacedException('Order total must be positive');
    }

    // Proceed with order placement
}
```

### A05:2025 - Security Misconfiguration

```php
<?php
// .env configuration for production
// APP_ENV=production
// APP_DEBUG=false
// APP_KEY=base64:your-secure-key-here

// config/app.php
return [
    'debug' => env('APP_DEBUG', false),
    'env' => env('APP_ENV', 'production'),
];

// Disable unnecessary features in production
// config/debugbar.php
return [
    'enabled' => env('DEBUGBAR_ENABLED', false),
];

// Secure headers middleware
class SecureHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // X-XSS-Protection est déprécié — s'appuyer sur CSP Level 3
        return $response
            ->header('X-Content-Type-Options', 'nosniff')
            ->header('X-Frame-Options', 'DENY')
            ->header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests")
            ->header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
            ->header('Referrer-Policy', 'strict-origin-when-cross-origin')
            ->header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
            ->header('Cross-Origin-Opener-Policy', 'same-origin')
            ->header('Cross-Origin-Embedder-Policy', 'require-corp')
            ->header('Cross-Origin-Resource-Policy', 'same-origin');
    }
}

// Register in bootstrap/app.php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(SecureHeaders::class);
})
```

### A06:2025 - Software Supply Chain Failures

```bash
# Regular security audits — exclure les dev deps en production
composer audit --no-dev

# Update dependencies regularly
composer update --with-all-dependencies

# Check for security advisories
composer outdated --direct
```

```json
// composer.json - Pin versions and use version constraints
{
    "require": {
        "php": "^8.3",
        "laravel/framework": "^13.0",
        "laravel/sanctum": "^4.0"
    }
}
```

```bash
# Générer un SBOM (CycloneDX) à chaque build CI
composer require --dev cyclonedx/cyclonedx-php-composer
composer make-bom --output-format=JSON --output-file=sbom.json

# Scanner les images Docker avec Trivy
trivy image --exit-code 1 --severity HIGH,CRITICAL myapp:latest
```

> Utiliser **Renovate** ou **Dependabot** pour les mises à jour automatiques avec gate CI.

### A07:2025 - Mishandling of Exceptional Conditions

```php
<?php
// app/Exceptions/Handler.php — ne jamais exposer les stack traces en production
namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;
use Illuminate\Support\Facades\Log;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (Throwable $e, Request $request): ?JsonResponse {
            if ($request->expectsJson()) {
                // Logger l'erreur complète côté serveur
                Log::error('Unhandled exception', [
                    'exception' => $e->getMessage(),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'user_id' => auth()->id(),
                    'url' => $request->fullUrl(),
                ]);

                // Retourner une réponse générique au client
                return response()->json(
                    ['message' => 'An unexpected error occurred.'],
                    500
                );
            }

            return null; // Laisser le handler par défaut gérer les vues
        });
    }
}
```

```env
# Désactiver les stack traces en production — obligatoire
APP_DEBUG=false
```

> **Règle :** Ne jamais retourner de stack trace en production. Logger via `Log::error()` centralement et retourner des messages génériques.

### A08:2025 - Authentication Failures

**Nouveauté Laravel 13 :** Passkey Authentication (WebAuthn) intégré dans Breeze/Jetstream/Fortify (https://laravel.com/docs/13.x/passkey).

```php
<?php
// Passkey Authentication (Laravel 13) - Authentification sans mot de passe
use Laravel\Fortify\Features;

// config/fortify.php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
    Features::passkeys(),  // Nouveauté Laravel 13
],
```

```php
<?php
// app/Models/User.php — Requis pour que Fortify résolve les endpoints WebAuthn
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;

class User extends Authenticatable implements PasskeyUser
{
    use PasskeyAuthenticatable;

    // ... reste du modèle
}
```

// Laravel Sanctum for API authentication
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
}

// Token creation with abilities
$token = $user->createToken('api-token', ['orders:read', 'orders:write']);

// Token validation middleware
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// Ability checking
Route::middleware(['auth:sanctum', 'ability:orders:write'])
    ->post('/orders', [OrderController::class, 'store']);

// Password confirmation for sensitive actions
Route::middleware(['auth', 'password.confirm'])->group(function () {
    Route::delete('/account', [AccountController::class, 'destroy']);
});

// Multi-factor authentication
use Laravel\Fortify\Features;

// config/fortify.php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirm' => true,
        'confirmPassword' => true,
    ]),
],
```

### Software and Data Integrity

```php
<?php
// Signed URLs for secure file downloads
use Illuminate\Support\Facades\URL;

$signedUrl = URL::signedRoute('download', ['file' => $fileId]);
$temporarySignedUrl = URL::temporarySignedRoute(
    'download',
    now()->addMinutes(30),
    ['file' => $fileId]
);

// Validate signed URL in controller
public function download(Request $request, string $file)
{
    if (!$request->hasValidSignature()) {
        abort(401);
    }

    return Storage::download($file);
}

// CSRF protection (enabled by default)
// All POST, PUT, PATCH, DELETE requests require CSRF token
<form method="POST" action="/orders">
    @csrf
    <!-- form fields -->
</form>

// SRI for external scripts
<script src="https://cdn.example.com/app.js"
        integrity="sha384-hash-here"
        crossorigin="anonymous"></script>
```

### A09:2025 - Security Logging and Monitoring

```php
<?php
// config/logging.php
'channels' => [
    'security' => [
        'driver' => 'daily',
        'path' => storage_path('logs/security.log'),
        'level' => 'info',
        'days' => 90,
    ],
],

// Security event logging
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(LoginRequest $request)
    {
        if (Auth::attempt($request->only('email', 'password'))) {
            Log::channel('security')->info('User logged in', [
                'user_id' => Auth::id(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json(['message' => 'Logged in']);
        }

        Log::channel('security')->warning('Failed login attempt', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['message' => 'Invalid credentials'], 401);
    }
}

// Activity logging with Spatie
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total_amount'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
```

## Authentication Best Practices

### Laravel Sanctum (API Tokens)

```php
<?php
// Install Sanctum
// composer require laravel/sanctum
// php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
// php artisan migrate

// config/sanctum.php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 'localhost')),
    'expiration' => 60 * 24 * 7, // 7 days
    'token_prefix' => 'laravel_',
];

// Token creation
public function login(LoginRequest $request): JsonResponse
{
    $user = User::where('email', $request->email)->first();

    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    // Revoke existing tokens
    $user->tokens()->delete();

    // Create new token with abilities
    $token = $user->createToken('api-token', [
        'orders:read',
        'orders:write',
        'profile:read',
        'profile:update',
    ]);

    return response()->json([
        'token' => $token->plainTextToken,
        'expires_at' => now()->addDays(7)->toIso8601String(),
    ]);
}

// Token revocation
public function logout(Request $request): JsonResponse
{
    $request->user()->currentAccessToken()->delete();

    return response()->json(['message' => 'Logged out']);
}
```

### Laravel Passport (OAuth2)

```php
<?php
// For OAuth2 server implementation
// composer require laravel/passport
// php artisan passport:install

// config/auth.php
'guards' => [
    'api' => [
        'driver' => 'passport',
        'provider' => 'users',
    ],
],

// Scopes definition
Passport::tokensCan([
    'read-orders' => 'Read order information',
    'write-orders' => 'Create and update orders',
    'delete-orders' => 'Delete orders',
]);

// Client credentials grant
Route::middleware(['client', 'scopes:read-orders'])->group(function () {
    Route::get('/orders', [OrderController::class, 'index']);
});
```

## Data Validation

### Request Validation

```php
<?php
class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Order::class);
    }

    public function rules(): array
    {
        return [
            'customer_id' => [
                'required',
                'integer',
                Rule::exists('customers', 'id')->where('active', true),
            ],
            'items' => ['required', 'array', 'min:1', 'max:100'],
            'items.*.product_id' => [
                'required',
                'integer',
                Rule::exists('products', 'id')->where('available', true),
            ],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:999'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.street' => ['required', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'size:2'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'coupon_code' => ['nullable', 'string', new ValidCouponCode()],
        ];
    }

    public function messages(): array
    {
        return [
            'items.min' => 'At least one item is required.',
            'items.max' => 'Maximum 100 items per order.',
            'items.*.quantity.max' => 'Maximum quantity per item is 999.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Sanitize input
        $this->merge([
            'notes' => strip_tags($this->notes ?? ''),
        ]);
    }
}
```

### Custom Validation Rules

```php
<?php
// app/Rules/ValidCouponCode.php
namespace App\Rules;

use App\Models\Coupon;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidCouponCode implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $coupon = Coupon::where('code', $value)->first();

        if (!$coupon) {
            $fail('The coupon code is invalid.');
            return;
        }

        if ($coupon->isExpired()) {
            $fail('The coupon code has expired.');
            return;
        }

        if ($coupon->usageLimit && $coupon->usage_count >= $coupon->usageLimit) {
            $fail('The coupon code has reached its usage limit.');
        }
    }
}
```

## File Upload Security

```php
<?php
class UploadDocumentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'document' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                'max:10240', // 10MB
                function ($attribute, $value, $fail) {
                    // Verify MIME type matches extension
                    $mimeType = $value->getMimeType();
                    $extension = $value->getClientOriginalExtension();

                    $allowedMimes = [
                        'pdf' => 'application/pdf',
                        'doc' => 'application/msword',
                        'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ];

                    if (($allowedMimes[$extension] ?? null) !== $mimeType) {
                        $fail('File type does not match extension.');
                    }
                },
            ],
        ];
    }
}

// Secure file storage
class DocumentController extends Controller
{
    public function store(UploadDocumentRequest $request): JsonResponse
    {
        $file = $request->file('document');

        // Generate secure filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();

        // Store outside public directory
        $path = $file->storeAs(
            'documents/' . auth()->id(),
            $filename,
            's3' // Or 'local' with private disk
        );

        $document = Document::create([
            'user_id' => auth()->id(),
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return response()->json([
            'document' => DocumentResource::make($document),
        ], 201);
    }

    public function download(Document $document): Response
    {
        $this->authorize('view', $document);

        return Storage::disk('s3')->download(
            $document->path,
            $document->original_name
        );
    }
}
```

## Environment Security

```env
# .env.example - Never commit actual .env file

# Application
APP_NAME=MyApp
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://myapp.com

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=myapp
DB_USERNAME=
DB_PASSWORD=

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=
REDIS_PORT=6379

# Mail (use transactional email service)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict

# Sanctum
SANCTUM_STATEFUL_DOMAINS=myapp.com
```

```php
<?php
// config/session.php
return [
    'driver' => env('SESSION_DRIVER', 'redis'),
    'lifetime' => env('SESSION_LIFETIME', 120),
    'expire_on_close' => true,
    'encrypt' => true,
    'secure' => env('SESSION_SECURE_COOKIE', true),
    'http_only' => true,
    'same_site' => env('SESSION_SAME_SITE', 'strict'),
];
```

## Security Checklist

### Authentication & Authorization
- [ ] Laravel Sanctum/Passport configured
- [ ] Passkey Authentication enabled (Laravel 13 - WebAuthn)
- [ ] Token expiration set appropriately
- [ ] Policies defined for all models
- [ ] Gates defined for non-model authorization
- [ ] Rate limiting on authentication endpoints
- [ ] Password reset tokens expire quickly

### Input Validation
- [ ] All inputs validated via Form Requests
- [ ] File uploads validated (type, size, content)
- [ ] SQL injection prevented (Eloquent/Query Builder)
- [ ] XSS prevented (Blade escaping)
- [ ] CSRF protection enabled

### Configuration
- [ ] APP_DEBUG=false in production
- [ ] APP_KEY set and secure
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Sensitive data encrypted
- [ ] .env not committed to version control

### Dependencies
- [ ] composer audit passes
- [ ] Dependencies up to date
- [ ] No known vulnerabilities

### Logging & Monitoring
- [ ] Security events logged
- [ ] Failed login attempts tracked
- [ ] Sensitive data not logged
- [ ] Log retention policy defined

### API Security
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] API versioning implemented
- [ ] Sensitive endpoints require authentication
