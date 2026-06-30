# .NET Aspire & Cloud-Native Development

## What is .NET Aspire?

.NET Aspire is Microsoft's opinionated stack for building observable, production-ready distributed applications. It simplifies orchestration, observability, and configuration management for cloud-native .NET apps.

## Project Structure

```
MySolution/
├── src/
│   ├── MySolution.AppHost/           # Orchestration (Aspire Host)
│   │   ├── Program.cs
│   │   └── MySolution.AppHost.csproj
│   │
│   ├── MySolution.ServiceDefaults/   # Shared configuration
│   │   ├── Extensions.cs
│   │   └── MySolution.ServiceDefaults.csproj
│   │
│   ├── MySolution.WebAPI/            # API service
│   │   ├── Program.cs
│   │   └── MySolution.WebAPI.csproj
│   │
│   ├── MySolution.Worker/            # Background worker
│   │   ├── Program.cs
│   │   └── MySolution.Worker.csproj
│   │
│   └── MySolution.Web/               # Frontend (Blazor/React)
│       ├── Program.cs
│       └── MySolution.Web.csproj
│
└── tests/
```

## AppHost Configuration

### Basic Orchestration

```csharp
// MySolution.AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Add infrastructure
var postgres = builder.AddPostgres("postgres")
    .WithPgAdmin()
    .AddDatabase("ordersdb");

var redis = builder.AddRedis("cache");

var rabbitmq = builder.AddRabbitMQ("messaging")
    .WithManagementPlugin();

// Add services
var api = builder.AddProject<Projects.MySolution_WebAPI>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .WithReference(rabbitmq)
    .WithExternalHttpEndpoints();

var worker = builder.AddProject<Projects.MySolution_Worker>("worker")
    .WithReference(postgres)
    .WithReference(rabbitmq);

var web = builder.AddProject<Projects.MySolution_Web>("web")
    .WithReference(api)
    .WithExternalHttpEndpoints();

builder.Build().Run();
```

### Advanced Configuration

```csharp
var builder = DistributedApplication.CreateBuilder(args);

// PostgreSQL with persistence
var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin()
    .AddDatabase("ordersdb");

// Redis with persistence
var redis = builder.AddRedis("cache")
    .WithDataVolume()
    .WithRedisCommander();

// Kafka for event streaming
var kafka = builder.AddKafka("kafka")
    .WithKafkaUI();

// Elasticsearch for search
var elasticsearch = builder.AddElasticsearch("search")
    .WithDataVolume();

// Configure API with all dependencies
var api = builder.AddProject<Projects.MySolution_WebAPI>("api")
    .WithReference(postgres)
    .WithReference(redis)
    .WithReference(kafka)
    .WithReference(elasticsearch)
    .WithEnvironment("ASPNETCORE_ENVIRONMENT", "Development")
    .WithReplicas(2); // Scale to 2 instances

builder.Build().Run();
```

## Service Defaults

### Shared Configuration

```csharp
// MySolution.ServiceDefaults/Extensions.cs
public static class Extensions
{
    public static IHostApplicationBuilder AddServiceDefaults(this IHostApplicationBuilder builder)
    {
        // OpenTelemetry
        builder.ConfigureOpenTelemetry();

        // Health checks
        builder.AddDefaultHealthChecks();

        // Service discovery
        builder.Services.AddServiceDiscovery();

        // HTTP resilience
        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            http.AddStandardResilienceHandler();
            http.AddServiceDiscovery();
        });

        return builder;
    }

    public static IHostApplicationBuilder ConfigureOpenTelemetry(this IHostApplicationBuilder builder)
    {
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            .WithMetrics(metrics =>
            {
                metrics.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            .WithTracing(tracing =>
            {
                tracing.AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddEntityFrameworkCoreInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    private static IHostApplicationBuilder AddOpenTelemetryExporters(this IHostApplicationBuilder builder)
    {
        var useOtlpExporter = !string.IsNullOrWhiteSpace(
            builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        if (useOtlpExporter)
        {
            builder.Services.AddOpenTelemetry().UseOtlpExporter();
        }

        return builder;
    }

    public static IHostApplicationBuilder AddDefaultHealthChecks(this IHostApplicationBuilder builder)
    {
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"]);

        return builder;
    }

    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        // Health check endpoints
        app.MapHealthChecks("/health");

        app.MapHealthChecks("/alive", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("live")
        });

        app.MapHealthChecks("/ready", new HealthCheckOptions
        {
            Predicate = r => r.Tags.Contains("ready")
        });

        return app;
    }
}
```

### Using Service Defaults

```csharp
// MySolution.WebAPI/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Add Aspire service defaults
builder.AddServiceDefaults();

// Add application services
// .NET 10: OpenAPI natif + Scalar UI (Swashbuckle retiré du template depuis .NET 9)
// Packages: Microsoft.AspNetCore.OpenApi + Scalar.AspNetCore (voir Directory.Packages.props)
builder.Services.AddOpenApi();

// Add database (Aspire provides connection string automatically)
builder.AddNpgsqlDbContext<ApplicationDbContext>("ordersdb");

// Add Redis caching
builder.AddRedisDistributedCache("cache");

var app = builder.Build();

// Map Aspire endpoints (health, metrics)
app.MapDefaultEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapOrderEndpoints();

app.Run();
```

## Aspire Components

### Database Components

```csharp
// PostgreSQL
builder.AddNpgsqlDbContext<ApplicationDbContext>("ordersdb");

// SQL Server
builder.AddSqlServerDbContext<ApplicationDbContext>("sqldb");

// MongoDB
builder.AddMongoDBClient("mongodb");

// CosmosDB
builder.AddAzureCosmosClient("cosmos");
```

### Caching Components

```csharp
// Redis distributed cache
builder.AddRedisDistributedCache("cache");

// Redis output cache
builder.AddRedisOutputCache("cache");

// Hybrid cache (combines memory + distributed)
builder.Services.AddHybridCache();
```

### Messaging Components

```csharp
// RabbitMQ
builder.AddRabbitMQClient("messaging");

// Azure Service Bus
builder.AddAzureServiceBusClient("servicebus");

// Kafka
builder.AddKafkaProducer<string, Order>("kafka");
builder.AddKafkaConsumer<string, Order>("kafka");
```

### Storage Components

```csharp
// Azure Blob Storage
builder.AddAzureBlobClient("blobs");

// Azure Queue Storage
builder.AddAzureQueueClient("queues");

// MinIO (S3-compatible)
builder.AddMinio("storage");
```

## Resilience Patterns

### HTTP Client Resilience

```csharp
// Automatic resilience with Aspire defaults
builder.Services.ConfigureHttpClientDefaults(http =>
{
    // Adds retry, circuit breaker, timeout policies
    http.AddStandardResilienceHandler();
});

// Custom resilience policies
builder.Services.AddHttpClient<IOrderService, OrderService>(client =>
{
    client.BaseAddress = new Uri("https+http://api");
})
.AddResilienceHandler("custom", builder =>
{
    builder.AddRetry(new HttpRetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        Delay = TimeSpan.FromMilliseconds(500),
        BackoffType = DelayBackoffType.Exponential,
        UseJitter = true
    });

    builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
    {
        SamplingDuration = TimeSpan.FromSeconds(10),
        FailureRatio = 0.5,
        MinimumThroughput = 10,
        BreakDuration = TimeSpan.FromSeconds(30)
    });

    builder.AddTimeout(TimeSpan.FromSeconds(10));
});
```

### Database Resilience

```csharp
// EF Core with resilience
builder.AddNpgsqlDbContext<ApplicationDbContext>("ordersdb", settings =>
{
    settings.DisableRetry = false; // Enable automatic retry
});

// Or configure manually
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorCodesToAdd: null);
    });
});
```

## Observability

### Distributed Tracing

```csharp
// Traces are automatically collected when using Aspire
// Custom spans can be added:
public class OrderService
{
    private static readonly ActivitySource _activitySource = new("OrderService");

    public async Task<Order> CreateOrderAsync(CreateOrderCommand command)
    {
        using var activity = _activitySource.StartActivity("CreateOrder");
        activity?.SetTag("customer.id", command.CustomerId);

        // Create order...

        activity?.SetTag("order.id", order.Id);
        return order;
    }
}
```

### Metrics

```csharp
// Custom metrics
public class OrderMetrics
{
    private readonly Counter<long> _ordersCreated;
    private readonly Histogram<double> _orderProcessingTime;

    public OrderMetrics(IMeterFactory meterFactory)
    {
        var meter = meterFactory.Create("OrderService");

        _ordersCreated = meter.CreateCounter<long>(
            "orders_created_total",
            "orders",
            "Total number of orders created");

        _orderProcessingTime = meter.CreateHistogram<double>(
            "order_processing_duration_seconds",
            "seconds",
            "Time to process an order");
    }

    public void OrderCreated(string status)
    {
        _ordersCreated.Add(1, new KeyValuePair<string, object?>("status", status));
    }

    public void RecordProcessingTime(double seconds)
    {
        _orderProcessingTime.Record(seconds);
    }
}
```

### Structured Logging

```csharp
// Logs are automatically enriched with trace context
_logger.LogInformation(
    "Order {OrderId} created for customer {CustomerId} with total {Total}",
    order.Id,
    order.CustomerId,
    order.TotalAmount);
```

## Deployment

### Azure Container Apps

```csharp
// azd-compatible deployment
// Run: azd init && azd up

// Aspire automatically generates:
// - Bicep/ARM templates
// - Container configurations
// - Service connections
```

### Kubernetes with Aspirate

```bash
# Install aspirate
dotnet tool install -g aspirate

# Generate Kubernetes manifests
aspirate generate

# Apply to cluster
kubectl apply -f ./aspirate-output/
```

### Docker Compose (Development)

```bash
# Generate docker-compose from Aspire manifest
aspirate generate --output-format compose

# Run
docker-compose up
```

## Best Practices

### Service Communication

```csharp
// Use service discovery names (not URLs)
builder.Services.AddHttpClient<IOrderClient>(client =>
{
    // "api" is resolved by Aspire service discovery
    client.BaseAddress = new Uri("https+http://api");
});

// Configuration is automatically provided
var connectionString = builder.Configuration.GetConnectionString("ordersdb");
```

### Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, tags: ["ready", "db"])
    .AddRedis(redisConnectionString, tags: ["ready", "cache"])
    .AddRabbitMQ(rabbitConnectionString, tags: ["ready", "messaging"]);
```

### Configuration Management

```csharp
// Aspire injects connection strings and endpoints automatically
// Access via standard configuration patterns:
var dbConnection = builder.Configuration.GetConnectionString("ordersdb");
var cacheEndpoint = builder.Configuration["ConnectionStrings:cache"];

// Environment-specific overrides still work
// appsettings.Production.json takes precedence
```

## Aspire Checklist

- [ ] AppHost orchestrates all services and dependencies
- [ ] ServiceDefaults shared across all projects
- [ ] OpenTelemetry configured (traces, metrics, logs)
- [ ] Health checks implemented (/health, /ready, /alive)
- [ ] Resilience handlers configured for HTTP clients
- [ ] Service discovery used instead of hardcoded URLs
- [ ] Database retry policies configured
- [ ] Components use Aspire-provided configuration
- [ ] Observability dashboard accessible during development
- [ ] Deployment manifests generated (ACA, K8s, or Compose)
