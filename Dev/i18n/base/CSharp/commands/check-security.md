---
description: Security audit for C#/.NET applications following OWASP guidelines
---

# C#/.NET Security Audit

You are a security expert for .NET applications. Conduct a comprehensive security audit based on OWASP Top 10 and .NET security best practices.

## Security Checks

### A01: Broken Access Control

**Check for:**

```csharp
// ❌ VULNERABLE: No authorization
[HttpGet("{id}")]
public async Task<IActionResult> GetOrder(Guid id)
{
    return Ok(await _orderService.GetOrderAsync(id));
}

// ✅ SECURE: Authorization required
[Authorize]
[HttpGet("{id}")]
public async Task<IActionResult> GetOrder(Guid id)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    var order = await _orderService.GetOrderAsync(id);

    if (order.CustomerId.ToString() != userId)
        return Forbid();

    return Ok(order);
}

// ✅ BETTER: Policy-based authorization
[Authorize(Policy = "OrderOwner")]
[HttpGet("{id}")]
public async Task<IActionResult> GetOrder(Guid id) { }
```

**Verify:**
- [ ] All endpoints have `[Authorize]` or explicit `[AllowAnonymous]`
- [ ] Resource ownership validated before access
- [ ] Role/policy-based authorization for sensitive operations
- [ ] Admin endpoints properly protected

### A02: Cryptographic Failures

**Check for:**

```csharp
// ❌ VULNERABLE: Weak hashing
var hash = MD5.Create().ComputeHash(Encoding.UTF8.GetBytes(password));
var hash = SHA1.Create().ComputeHash(Encoding.UTF8.GetBytes(password));

// ✅ SECURE: Use ASP.NET Core Identity (PBKDF2)
var hasher = new PasswordHasher<User>();
var hashed = hasher.HashPassword(user, password);

// ❌ VULNERABLE: Secrets in code
var connectionString = "Server=db;Password=MySecretPassword123";
var apiKey = "sk-1234567890abcdef";

// ✅ SECURE: Configuration/secrets management
var connectionString = Configuration.GetConnectionString("DefaultConnection");
var apiKey = Configuration["ApiKey"]; // From User Secrets or Key Vault
```

**Verify:**
- [ ] No hardcoded secrets in code
- [ ] Passwords hashed with strong algorithms (PBKDF2, Argon2, bcrypt)
- [ ] Sensitive data encrypted at rest
- [ ] TLS/HTTPS enforced

### A03: Injection

**SQL Injection:**

```csharp
// ❌ VULNERABLE: String concatenation
var sql = $"SELECT * FROM Orders WHERE Status = '{status}'";
await _context.Orders.FromSqlRaw(sql).ToListAsync();

// ✅ SECURE: Parameterized queries
await _context.Orders
    .FromSqlInterpolated($"SELECT * FROM Orders WHERE Status = {status}")
    .ToListAsync();

// ✅ SECURE: LINQ (always parameterized)
await _context.Orders.Where(o => o.Status == status).ToListAsync();
```

**Command Injection:**

```csharp
// ❌ VULNERABLE: Unsanitized input in process
Process.Start("cmd", $"/c report {userInput}");

// ✅ SECURE: Whitelist validation
var allowed = new[] { "sales", "inventory" };
if (!allowed.Contains(reportName))
    throw new ArgumentException("Invalid report");

var process = new Process();
process.StartInfo.ArgumentList.Add("--report");
process.StartInfo.ArgumentList.Add(reportName);
```

### A04: Insecure Design

**Check for:**
- [ ] Rate limiting implemented
- [ ] Account lockout after failed attempts
- [ ] CAPTCHA for sensitive operations
- [ ] Input length limits

```csharp
// ✅ Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(
        context => RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1)
            }));
});
```

### A05: Security Misconfiguration

**Check Program.cs:**

```csharp
// ❌ VULNERABLE: Detailed errors in production
app.UseDeveloperExceptionPage();  // Should be dev only!

// ✅ SECURE: Proper error handling
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

// ✅ Security headers — X-XSS-Protection est déprécié, s'appuyer sur CSP Level 3
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
    context.Response.Headers.Append("Cross-Origin-Opener-Policy", "same-origin");
    await next();
});
```

**CORS Configuration:**

```csharp
// ❌ VULNERABLE: Allow any origin
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// ✅ SECURE: Explicit origins
builder.Services.AddCors(o => o.AddPolicy("Production", p =>
    p.WithOrigins("https://myapp.com")
     .WithMethods("GET", "POST")
     .WithHeaders("Content-Type", "Authorization")));
```

### A06: Vulnerable Components

```bash
# Check for vulnerable packages
dotnet list package --vulnerable

# Check for outdated packages
dotnet outdated
```

### A07: Authentication Failures

**Check JWT Configuration:**

```csharp
// ❌ VULNERABLE: Weak validation
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = false,        // Should validate!
    ValidateAudience = false,      // Should validate!
    ValidateLifetime = false,      // Should validate!
    ClockSkew = TimeSpan.FromDays(1)  // Too much skew!
};

// ✅ SECURE: Strict validation
options.TokenValidationParameters = new TokenValidationParameters
{
    ValidateIssuer = true,
    ValidateAudience = true,
    ValidateLifetime = true,
    ValidateIssuerSigningKey = true,
    ValidIssuer = configuration["Jwt:Issuer"],
    ValidAudience = configuration["Jwt:Audience"],
    IssuerSigningKey = new SymmetricSecurityKey(key),
    ClockSkew = TimeSpan.Zero
};
```

### A08: Data Integrity Failures

**Anti-forgery:**

```csharp
// ❌ VULNERABLE: No CSRF protection
[HttpPost]
public async Task<IActionResult> CreateOrder(CreateOrderRequest request) { }

// ✅ SECURE: CSRF token required
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<IActionResult> CreateOrder(CreateOrderRequest request) { }
```

### A09: Security Logging

**Check for proper logging:**

```csharp
// ✅ SECURE: Log security events
_logger.LogWarning(
    "Authentication failed for user {Username} from IP {IpAddress}",
    username, ipAddress);

_logger.LogWarning(
    "Authorization denied: User {UserId} attempted {Action} on {Resource}",
    userId, action, resource);
```

### A10: SSRF Protection

```csharp
// ❌ VULNERABLE: Unvalidated URL
var content = await _httpClient.GetStringAsync(userProvidedUrl);

// ✅ SECURE: Whitelist validation
private static readonly HashSet<string> AllowedHosts = new() { "api.trusted.com" };

public async Task<string> FetchAsync(string url)
{
    var uri = new Uri(url);
    if (!AllowedHosts.Contains(uri.Host))
        throw new SecurityException("Host not allowed");

    return await _httpClient.GetStringAsync(uri);
}
```

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## Output Format

```
══════════════════════════════════════════════════════════════
C#/.NET SECURITY AUDIT REPORT
══════════════════════════════════════════════════════════════

Project: {ProjectName}
Scan Date: {Date}
Framework: .NET {Version}

──────────────────────────────────────────────────────────────
CRITICAL VULNERABILITIES
──────────────────────────────────────────────────────────────

[CRITICAL] A03: SQL Injection
  File: OrderRepository.cs:45
  Code: FromSqlRaw($"SELECT * FROM Orders WHERE Status = '{status}'")
  Fix: Use FromSqlInterpolated or parameterized queries

[CRITICAL] A02: Hardcoded Secret
  File: appsettings.json:12
  Issue: Database password in plain text
  Fix: Use User Secrets or Azure Key Vault

──────────────────────────────────────────────────────────────
HIGH SEVERITY
──────────────────────────────────────────────────────────────

[HIGH] A01: Missing Authorization
  File: OrdersController.cs:23
  Endpoint: GET /api/orders/{id}
  Fix: Add [Authorize] attribute and ownership check

[HIGH] A05: Insecure CORS
  File: Program.cs:34
  Issue: AllowAnyOrigin() in production
  Fix: Specify allowed origins explicitly

──────────────────────────────────────────────────────────────
MEDIUM SEVERITY
──────────────────────────────────────────────────────────────

[MEDIUM] A07: Weak JWT Validation
  File: Program.cs:78
  Issue: ClockSkew set to 1 day
  Fix: Set ClockSkew to TimeSpan.Zero

[MEDIUM] A08: Missing Anti-Forgery
  File: OrdersController.cs:45
  Fix: Add [ValidateAntiForgeryToken]

──────────────────────────────────────────────────────────────
LOW SEVERITY
──────────────────────────────────────────────────────────────

[LOW] A05: Missing Security Headers
  Issue: X-Frame-Options header not set
  Fix: Add security headers middleware

──────────────────────────────────────────────────────────────
VULNERABLE DEPENDENCIES
──────────────────────────────────────────────────────────────

Package                     | Current | Vulnerable | Fixed
----------------------------|---------|------------|--------
Newtonsoft.Json             | 12.0.1  | Yes        | 13.0.3
System.Text.RegularExpressions | 4.3.0 | Yes      | 4.3.1

──────────────────────────────────────────────────────────────
COMPLIANCE SUMMARY
──────────────────────────────────────────────────────────────

OWASP Top 10 Coverage:
  A01 Broken Access Control    [✗] 2 issues
  A02 Cryptographic Failures   [✗] 1 issue
  A03 Injection                [✗] 1 issue
  A04 Insecure Design          [✓] No issues
  A05 Security Misconfiguration [✗] 2 issues
  A06 Vulnerable Components    [✗] 2 packages
  A07 Auth Failures            [✗] 1 issue
  A08 Data Integrity           [✗] 1 issue
  A09 Logging Failures         [✓] No issues
  A10 SSRF                     [✓] No issues

══════════════════════════════════════════════════════════════
SECURITY SCORE: 45/100 (FAIL)
══════════════════════════════════════════════════════════════

Immediate Actions Required:
1. Fix SQL injection in OrderRepository.cs
2. Remove hardcoded secrets from configuration
3. Add authorization to all endpoints
4. Update vulnerable NuGet packages
```

## Scoring

| Severity | Points Deducted |
|----------|----------------|
| Critical | -25 per issue |
| High | -15 per issue |
| Medium | -8 per issue |
| Low | -3 per issue |

Passing score: 70/100
