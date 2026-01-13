# C#/.NET Security Best Practices

## OWASP Top 10 Protection

### A01: Broken Access Control

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

// DON'T: Trust client-provided IDs without verification
public async Task<IActionResult> GetOrder(Guid orderId)
{
    // BAD: No ownership verification
    var order = await _orderService.GetOrderAsync(orderId);
    return Ok(order);
}
```

### A02: Cryptographic Failures

```csharp
// DO: Use strong encryption
public class EncryptionService
{
    private readonly byte[] _key;

    public EncryptionService(IConfiguration config)
    {
        // Key should be 256 bits (32 bytes) for AES-256
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

        // Prepend IV to ciphertext
        var result = new byte[aes.IV.Length + encryptedBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(encryptedBytes, 0, result, aes.IV.Length, encryptedBytes.Length);

        return Convert.ToBase64String(result);
    }
}

// DO: Use proper password hashing (ASP.NET Core Identity does this by default)
public class PasswordHasher
{
    public string HashPassword(string password)
    {
        // Uses PBKDF2 with SHA-256, 100,000 iterations by default
        return new PasswordHasher<object>().HashPassword(null!, password);
    }

    public bool VerifyPassword(string hashedPassword, string providedPassword)
    {
        var result = new PasswordHasher<object>()
            .VerifyHashedPassword(null!, hashedPassword, providedPassword);

        return result != PasswordVerificationResult.Failed;
    }
}

// DON'T: Store sensitive data in plain text
public class User
{
    public string Password { get; set; } // BAD: Plain text password
    public string CreditCardNumber { get; set; } // BAD: Unencrypted
}
```

### A03: Injection

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

// DO: Prevent Command Injection
public async Task<string> RunReportAsync(string reportName)
{
    // Validate against whitelist
    var allowedReports = new[] { "sales", "inventory", "customers" };
    if (!allowedReports.Contains(reportName.ToLowerInvariant()))
    {
        throw new ArgumentException("Invalid report name");
    }

    // Use ProcessStartInfo with arguments array
    var process = new Process
    {
        StartInfo = new ProcessStartInfo
        {
            FileName = "report-generator",
            ArgumentList = { "--report", reportName },
            RedirectStandardOutput = true,
            UseShellExecute = false
        }
    };

    process.Start();
    return await process.StandardOutput.ReadToEndAsync();
}
```

### A04: Insecure Design

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

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        await context.HttpContext.Response.WriteAsync("Too many requests", token);
    };
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
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

    await next();
});

// DO: Disable detailed errors in production
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/error");
}

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

// DON'T: Use wildcard CORS in production
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()  // BAD in production
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
```

### A06: Vulnerable and Outdated Components

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
    open-pull-requests-limit: 10
    reviewers:
      - "security-team"
```

### A07: Identification and Authentication Failures

```csharp
// DO: Configure secure authentication
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
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.Zero // Don't allow clock skew
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

### A08: Software and Data Integrity Failures

```csharp
// DO: Use anti-forgery tokens
[ValidateAntiForgeryToken]
[HttpPost]
public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
{
    // Process order
}

// For APIs, use custom header validation
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
});

// DO: Validate file uploads
public async Task<IActionResult> UploadFile(IFormFile file)
{
    // Validate file type
    var allowedTypes = new[] { ".pdf", ".docx", ".xlsx" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!allowedTypes.Contains(extension))
    {
        return BadRequest("Invalid file type");
    }

    // Validate content type
    var allowedContentTypes = new[]
    {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };

    if (!allowedContentTypes.Contains(file.ContentType))
    {
        return BadRequest("Invalid content type");
    }

    // Validate file size
    if (file.Length > 10 * 1024 * 1024) // 10MB
    {
        return BadRequest("File too large");
    }

    // Scan file content (first bytes magic number validation)
    // Generate safe filename
    var safeFileName = $"{Guid.NewGuid()}{extension}";

    // Save to secure location
    var path = Path.Combine(_uploadPath, safeFileName);
    using var stream = new FileStream(path, FileMode.Create);
    await file.CopyToAsync(stream);

    return Ok(new { FileName = safeFileName });
}
```

### A09: Security Logging and Monitoring Failures

```csharp
// DO: Implement comprehensive security logging
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

    public void LogSuspiciousActivity(string description, string ipAddress)
    {
        _logger.LogError(
            "Suspicious activity detected: {Description} from IP {IpAddress}",
            description, ipAddress);
    }
}

// Configure structured logging with Serilog
builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console()
        .WriteTo.Seq("http://seq:5341"); // Centralized logging
});
```

### A10: Server-Side Request Forgery (SSRF)

```csharp
// DO: Validate and restrict URLs
public class SafeHttpClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SafeHttpClient> _logger;
    private readonly HashSet<string> _allowedHosts;

    public SafeHttpClient(HttpClient httpClient, IConfiguration config, ILogger<SafeHttpClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _allowedHosts = config.GetSection("AllowedExternalHosts").Get<HashSet<string>>()
            ?? new HashSet<string>();
    }

    public async Task<string> FetchAsync(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            throw new ArgumentException("Invalid URL format");
        }

        // Block private IP ranges
        if (IsPrivateIp(uri.Host))
        {
            _logger.LogWarning("Blocked SSRF attempt to private IP: {Url}", url);
            throw new SecurityException("Access to internal resources is not allowed");
        }

        // Whitelist check
        if (!_allowedHosts.Contains(uri.Host))
        {
            _logger.LogWarning("Blocked request to non-whitelisted host: {Host}", uri.Host);
            throw new SecurityException("Host not in allowed list");
        }

        return await _httpClient.GetStringAsync(uri);
    }

    private static bool IsPrivateIp(string host)
    {
        if (!IPAddress.TryParse(host, out var ip))
        {
            // Resolve hostname
            try
            {
                var addresses = Dns.GetHostAddresses(host);
                return addresses.Any(IsPrivateIpAddress);
            }
            catch
            {
                return false;
            }
        }

        return IsPrivateIpAddress(ip);
    }

    private static bool IsPrivateIpAddress(IPAddress ip)
    {
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

## Secrets Management

### User Secrets (Development)

```bash
# Initialize user secrets
dotnet user-secrets init

# Set secrets
dotnet user-secrets set "Database:Password" "my-secret-password"
dotnet user-secrets set "Jwt:Key" "your-256-bit-secret"
```

### Azure Key Vault (Production)

```csharp
// Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{builder.Configuration["KeyVault:Name"]}.vault.azure.net/"),
    new DefaultAzureCredential());

// Access secrets like normal configuration
var dbPassword = builder.Configuration["Database:Password"];
```

### Environment Variables

```csharp
// appsettings.json - use placeholders
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=myapp;Username=${DB_USER};Password=${DB_PASSWORD}"
  }
}

// Or direct environment variable access
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
```

## Security Checklist

- [ ] HTTPS enforced in production
- [ ] Security headers configured (CSP, X-Frame-Options, etc.)
- [ ] CORS properly configured (no wildcards in production)
- [ ] Authentication with strong password policies
- [ ] Authorization with least privilege principle
- [ ] All user input validated and sanitized
- [ ] Parameterized queries (no SQL concatenation)
- [ ] Anti-forgery tokens for state-changing operations
- [ ] Rate limiting implemented
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Secrets stored securely (not in code)
- [ ] Security logging and monitoring enabled
- [ ] Dependencies regularly updated
- [ ] Security headers in all responses
- [ ] File uploads validated and sanitized
