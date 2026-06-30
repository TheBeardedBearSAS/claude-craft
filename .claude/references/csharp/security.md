# Security - Principles & C#/.NET Best Practices

## Overview

Security is an **absolute priority**. This document covers general security principles with C#/.NET implementation examples.

**References:**
- [OWASP Top 10:2025](https://owasp.org/Top10/2025/)
- CWE/SANS Top 25

---

## Table of Contents

1. [OWASP Top 10](#owasp-top-10)
2. [Input Validation](#input-validation)
3. [Authentication](#authentication)
4. [Authorization](#authorization)
5. [Sensitive Data](#sensitive-data)
6. [Security Headers](#security-headers)
7. [Secrets Management](#secrets-management)
8. [Logging & Monitoring](#logging--monitoring)
9. [Checklist](#checklist)

---

## OWASP Top 10

### A01: Broken Access Control

**Risks:**
- Access to resources without verification
- Predictable URLs (/admin, /user/123/edit)
- ID manipulation in URLs

**Protection:**
- Verify permissions on EVERY request
- Use non-predictable identifiers (UUID)
- Deny by default

```csharp
// DO: Use policy-based authorization
[Authorize(Policy = "RequireAdminRole")]
public async Task<IActionResult> DeleteOrder(Guid orderId) { }

// Configure policies in Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin"));

    options.AddPolicy("CanManageOrders", policy =>
        policy.RequireClaim("Permission", "orders:manage"));

    options.AddPolicy("OrderOwner", policy =>
        policy.AddRequirements(new OrderOwnerRequirement()));
});

// Custom authorization handler
public class OrderOwnerAuthorizationHandler
    : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        OrderOwnerRequirement requirement,
        Order resource)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (resource.CustomerId.ToString() == userId)
        {
            context.Succeed(requirement);
        }
        return Task.CompletedTask;
    }
}
```

### A02: Cryptographic Failures

**Risks:**
- Sensitive data in plain text
- Obsolete algorithms (MD5, SHA1)
- Keys in source code

**Protection:**
- Encrypt sensitive data at rest
- Use TLS 1.3 in transit
- Modern algorithms (**Argon2id** primary, bcrypt secondary, AES-256 for symmetric encryption)
- Secrets in vault (not in code)

```csharp
// DO: Use strong encryption
public class EncryptionService
{
    private readonly byte[] _key;

    public EncryptionService(IConfiguration config)
    {
        _key = Convert.FromBase64String(config["Encryption:Key"]!);
    }

    public string Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var encryptedBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        var result = new byte[aes.IV.Length + encryptedBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(encryptedBytes, 0, result, aes.IV.Length, encryptedBytes.Length);

        return Convert.ToBase64String(result);
    }
}

// DO: Use Argon2id for password hashing (OWASP 2026 recommendation)
// NuGet: Konscious.Security.Cryptography.Argon2 (v1.3.1, MIT)
// Parameters: m=19456 KiB, t=2 iterations, p=1 parallelism (OWASP 2026 minimum)
public class PasswordHasher
{
    // Salt must be unique per password, 16 bytes minimum
    private const int SaltSize = 16;
    private const int HashSize = 32;

    public string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = ComputeArgon2id(Encoding.UTF8.GetBytes(password), salt);
        // Store as "salt:hash" (both Base64-encoded)
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    public bool VerifyPassword(string storedHash, string providedPassword)
    {
        var parts = storedHash.Split(':');
        if (parts.Length != 2) return false;
        var salt = Convert.FromBase64String(parts[0]);
        var expectedHash = Convert.FromBase64String(parts[1]);
        var actualHash = ComputeArgon2id(Encoding.UTF8.GetBytes(providedPassword), salt);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private static byte[] ComputeArgon2id(byte[] password, byte[] salt)
    {
        using var argon2 = new Argon2id(password)
        {
            Salt = salt,
            MemorySize = 19456,   // 19 MiB (OWASP 2026 minimum: 19456 KiB)
            Iterations = 2,        // t=2 (OWASP 2026 minimum)
            DegreeOfParallelism = 1 // p=1
        };
        return argon2.GetBytes(HashSize);
    }
}
// Required usings: Konscious.Security.Cryptography, System.Security.Cryptography, System.Text
//
// Bcrypt (secondary option, legacy migration): BCrypt.Net-Next, cost factor >= 12.
// NEVER use MD5, SHA-1, SHA-256 or unsalted hashes for passwords.
```

### A03: Injection

**Risks:**
- SQL Injection
- Command Injection
- LDAP Injection

**Protection:**
- Parameterized queries (prepared statements)
- Input validation and sanitization
- Least privilege principle (DB)

```csharp
// DO: Use parameterized queries with Entity Framework
public async Task<Order?> GetOrderByIdAsync(Guid orderId)
{
    return await _context.Orders
        .FirstOrDefaultAsync(o => o.Id == orderId);
}

// DO: Use parameters with raw SQL
public async Task<IEnumerable<Order>> SearchOrdersAsync(string status)
{
    return await _context.Orders
        .FromSqlInterpolated($"SELECT * FROM Orders WHERE Status = {status}")
        .ToListAsync();
}

// DON'T: Concatenate SQL strings
public async Task<IEnumerable<Order>> SearchOrdersUnsafe(string status)
{
    // BAD: SQL Injection vulnerability
    var sql = $"SELECT * FROM Orders WHERE Status = '{status}'";
    return await _context.Orders.FromSqlRaw(sql).ToListAsync();
}
```

### A04: Insecure Design

**Protection:**
- Threat modeling from design
- Security by design
- Defense in depth
- Rate limiting

```csharp
// DO: Implement rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User?.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});

// DO: Implement account lockout
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.AllowedForNewUsers = true;
});
```

### A05: Security Misconfiguration

```csharp
// Program.cs - Security headers
var app = builder.Build();

if (app.Environment.IsProduction())
{
    app.UseHsts();
}

app.UseHttpsRedirection();

// Security headers middleware
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    // X-XSS-Protection est déprécié — s'appuyer sur CSP Level 3
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; upgrade-insecure-requests");
    context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin");
    context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "require-corp");
    context.Response.Headers.Append("Cross-Origin-Resource-Policy", "same-origin");
    await next();
});

// DO: Configure CORS properly
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://myapp.com", "https://www.myapp.com")
              .AllowCredentials()
              .WithMethods("GET", "POST", "PUT", "DELETE")
              .WithHeaders("Content-Type", "Authorization");
    });
});
```

### A06: Vulnerable Components

```bash
# Check for vulnerable packages
dotnet list package --vulnerable

# Update packages
dotnet outdated --upgrade
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "nuget"
    directory: "/"
    schedule:
      interval: "daily"
```

### A07: Authentication Failures

```csharp
// DO: Configure secure authentication
// Voir section JWT ci-dessous pour la config EdDSA (OWASP 2026 prioritaire)
// Exemple minimal avec ES256 (ECDSA P-256) — remplacer SymmetricSecurityKey par ECDsaSecurityKey
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            // NOTE: Remplacer SymmetricSecurityKey par ECDsaSecurityKey (ES256/EdDSA) en production
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero
        };
    });

// DO: Use secure cookie settings
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.ExpireTimeSpan = TimeSpan.FromHours(1);
    options.SlidingExpiration = true;
});

// DO: Enforce strong passwords
builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 12;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredUniqueChars = 4;
});
```

### A08: Data Integrity Failures

```csharp
// DO: Use anti-forgery tokens
[ValidateAntiForgeryToken]
[HttpPost]
public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
{
    // Process order
}

// DO: Validate file uploads
public async Task<IActionResult> UploadFile(IFormFile file)
{
    var allowedTypes = new[] { ".pdf", ".docx", ".xlsx" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!allowedTypes.Contains(extension))
        return BadRequest("Invalid file type");

    if (file.Length > 10 * 1024 * 1024) // 10MB
        return BadRequest("File too large");

    var safeFileName = $"{Guid.NewGuid()}{extension}";
    var path = Path.Combine(_uploadPath, safeFileName);

    using var stream = new FileStream(path, FileMode.Create);
    await file.CopyToAsync(stream);

    return Ok(new { FileName = safeFileName });
}
```

### A09: Logging & Monitoring Failures

```csharp
// DO: Implement security logging
public class SecurityAuditService
{
    private readonly ILogger<SecurityAuditService> _logger;

    public void LogAuthenticationAttempt(string username, bool success, string ipAddress)
    {
        if (success)
        {
            _logger.LogInformation(
                "Authentication successful for user {Username} from IP {IpAddress}",
                username, ipAddress);
        }
        else
        {
            _logger.LogWarning(
                "Authentication failed for user {Username} from IP {IpAddress}",
                username, ipAddress);
        }
    }

    public void LogAuthorizationFailure(string userId, string resource, string action)
    {
        _logger.LogWarning(
            "Authorization denied: User {UserId} attempted {Action} on {Resource}",
            userId, action, resource);
    }
}

// Configure Serilog
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .WriteTo.Console()
        .WriteTo.Seq("http://seq:5341");
});
```

### A10: SSRF

```csharp
// DO: Validate and restrict URLs
public class SafeHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly HashSet<string> _allowedHosts;

    public async Task<string> FetchAsync(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
            throw new ArgumentException("Invalid URL format");

        if (IsPrivateIp(uri.Host))
            throw new SecurityException("Access to internal resources not allowed");

        if (!_allowedHosts.Contains(uri.Host))
            throw new SecurityException("Host not in allowed list");

        return await _httpClient.GetStringAsync(uri);
    }

    private static bool IsPrivateIp(string host)
    {
        if (!IPAddress.TryParse(host, out var ip))
            return false;
        var bytes = ip.GetAddressBytes();
        return bytes[0] switch
        {
            10 => true,
            127 => true,
            172 => bytes[1] >= 16 && bytes[1] <= 31,
            192 => bytes[1] == 168,
            _ => false
        };
    }
}
```

---

## Input Validation

### Golden Rule

> **Never trust user data.** Validate server-side, ALWAYS.

### Validation Types

| Type | Description | Example |
|------|-------------|---------|
| **Whitelist** | Accept only expected | `status in ["pending", "done"]` |
| **Type check** | Verify type | `id is Guid` |
| **Format** | Verify format | `email.matches(EMAIL_REGEX)` |
| **Range** | Verify bounds | `1 <= page <= 100` |
| **Length** | Verify length | `name.Length <= 255` |

**Prefer VALIDATION (reject) over SANITIZATION (transform)**

---

## Authentication

### Passwords

- Minimum 12 characters
- Uppercase, lowercase, digits, special chars
- Not in compromised password lists
- Hash with **Argon2id** (OWASP 2026 primary — `Konscious.Security.Cryptography.Argon2`, m=19456 KiB, t=2, p=1 minimum)
- bcrypt (cost ≥ 12) acceptable as secondary/legacy option
- NEVER MD5, SHA-1, SHA-256, or unsalted hashes
- Unique random salt per user (16 bytes minimum)

### Sessions

```
Session config:
  cookie:
    httpOnly: true     # Not accessible in JS
    secure: true       # HTTPS only
    sameSite: strict   # CSRF protection
```

### JWT

- **Algorithme (priorité OWASP 2026) : EdDSA (Ed25519) > ES256 (ECDSA P-256) > RS256 (RSA-2048)**
- Ne jamais utiliser HS256 avec un secret faible (clé symétrique partagée)
- Expiration courte (15 min), refresh token sécurisé (7 jours, rotation obligatoire)
- Vérifier signature ET claims (iss, aud, exp) à chaque requête
- Ne jamais stocker de données sensibles dans le payload (lisible sans clé)

```csharp
// DO: JWT Bearer avec ES256 (ECDSA P-256) — algorithme OWASP-approuvé, natif .NET 10
// NuGet: Microsoft.IdentityModel.Tokens (inclus dans Microsoft.AspNetCore.Authentication.JwtBearer)
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Charger la clé publique ECDSA P-256 (PEM ou depuis Key Vault)
        var ecdsaKey = ECDsa.Create();
        // ecdsaKey.ImportFromPem(File.ReadAllText("public.pem")); // production: Key Vault

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            // ES256 : ECDsaSecurityKey avec courbe NIST P-256
            IssuerSigningKey = new ECDsaSecurityKey(ecdsaKey),
            // RS256 (migration legacy) :
            // IssuerSigningKey = new RsaSecurityKey(rsa),
            ClockSkew = TimeSpan.Zero  // Pas de marge sur l'expiration
        };
    });

// Génération de token ES256 (côté Identity Provider)
public string GenerateToken(string userId, string issuer, string audience)
{
    using var ecdsa = ECDsa.Create(ECCurve.NamedCurves.nistP256); // ES256
    var signingCredentials = new SigningCredentials(
        new ECDsaSecurityKey(ecdsa), SecurityAlgorithms.EcdsaSha256);

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: [new Claim(JwtRegisteredClaimNames.Sub, userId)],
        expires: DateTime.UtcNow.AddMinutes(15),
        signingCredentials: signingCredentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

> **Note :** L'exemple ci-dessus implémente **ES256 (ECDSA P-256)**, algorithme OWASP-approuvé pour .NET 10. Si EdDSA (Ed25519) est requis : le primitif Ed25519 a été ajouté à `System.Security.Cryptography` dans .NET 9+, mais `Microsoft.IdentityModel.Tokens` n'expose pas encore de type de clé OKP/EdDSA. Pour un vrai JWT EdDSA, utiliser **NSec.Cryptography** (NuGet: `NSec.Cryptography`, wraps libsodium) avec un `CryptoProviderFactory` personnalisé, ou **BouncyCastle**. ES256 est le choix correct pour .NET 10 jusqu'à ce que le support OKP arrive dans `Microsoft.IdentityModel.Tokens`.

### MFA

When to enable:
- Admin access
- Sensitive operations (payment, deletion)
- Password change
- Login from new device

---

## Authorization

### Least Privilege Principle

```csharp
// BAD
user.Role = "admin";  // Access to everything

// GOOD
user.Permissions = new[] { "read:users", "write:orders" };
```

### Row-Level Security

```csharp
// Verify user has access to THE specific resource
public async Task<Order> GetOrder(Guid orderId, Guid currentUserId)
{
    var order = await _context.Orders.FindAsync(orderId);

    if (order?.UserId != currentUserId)
        throw new ForbiddenException("Not your order");

    return order;
}
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

### Transmission

- HTTPS mandatory (TLS 1.3)
- Valid certificates
- HSTS enabled
- No sensitive data in URLs

---

## Security Headers

```http
# XSS protection via CSP Level 3 — X-XSS-Protection est déprécié, ne pas l'utiliser
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests
X-Content-Type-Options: nosniff

# Clickjacking protection
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Cross-Origin Isolation (2026)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

---

## Secrets Management

### User Secrets (Development)

```bash
dotnet user-secrets init
dotnet user-secrets set "Database:Password" "my-secret"
```

### Azure Key Vault (Production)

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{config["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential());
```

---

## Logging & Monitoring

### Events to Log

**DO log:**
- Login attempts (success/failure)
- Permission changes
- Access to sensitive data
- Authorization errors
- Configuration changes
- Data exports

**DON'T log:**
- Passwords
- Tokens
- Full personal data
- Credit card numbers

### Critical Alerts

- 5+ login failures on same account
- Admin access from new IP
- Permission modifications
- Series of 500 errors
- Abnormal request volume

---

## Checklist

### Development

- [ ] Server-side input validation
- [ ] Parameterized queries (no SQL concatenation)
- [ ] Output escaping (XSS prevention)
- [ ] Passwords hashed with Argon2id (Konscious.Security.Cryptography.Argon2, m=19456, t=2, p=1)
- [ ] Secure sessions (httpOnly, secure, sameSite)
- [ ] Permission checks on every request
- [ ] Secrets in environment variables
- [ ] Dependencies audited

### Configuration

- [ ] HTTPS enabled (TLS 1.3)
- [ ] Security headers configured
- [ ] Generic error messages in prod
- [ ] Debug mode disabled in prod
- [ ] Rate limiting enabled
- [ ] CORS strictly configured

### C# Specific

- [ ] Policy-based authorization used
- [ ] Anti-forgery tokens for forms
- [ ] File uploads validated
- [ ] SSRF protection implemented
- [ ] Azure Key Vault for production secrets
- [ ] Serilog for structured logging
- [ ] JWT signé avec EdDSA (Ed25519) ou ES256 — jamais HS256 avec secret faible

### Monitoring

- [ ] Security event logging
- [ ] Alerting on anomalies
- [ ] Regular access audits
- [ ] Periodic vulnerability scans

### Compliance (if applicable)

- [ ] GDPR: Consent, right to be forgotten
- [ ] PCI-DSS: Payment data
- [ ] HIPAA: Health data
- [ ] SOC2: Security controls

---

## Resources

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Last updated:** 2026-06
**Version:** 2.1.0 (JWT EdDSA OWASP 2026 alignment)
**Author:** The Bearded CTO
