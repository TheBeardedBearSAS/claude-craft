# Go 1.26+ - Quick Reference

> ⚠️ **Experimental** — This stack is community-maintained. For authoritative guidance refer to the official Go documentation: https://go.dev/doc/.

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| Go | 1.26+ | Improved type inference, telemetry opt-in (1.25), stable iter, slog, math/rand/v2 |
| gopls | 0.19+ | LSP officiel Go |
| golangci-lint | 1.67+ | Meta-linter 2026 |
| govulncheck | latest | Scan CVE intégré stdlib |

## Architecture Clean + Hexagonal

```
cmd/
├── api/              # Point d'entrée HTTP
└── worker/           # Point d'entrée workers

internal/
├── domain/           # Entités, Value Objects, Interfaces
├── usecase/          # Business Logic, Use Cases
├── infrastructure/   # DB, Cache, HTTP clients, Adapters
└── delivery/         # HTTP handlers, gRPC, CLI

pkg/                  # Packages publics réutilisables
api/                  # OpenAPI specs, Protobuf
test/                 # Tests intégration E2E
```

**Règle d'or** : `internal/domain/` ne dépend de RIEN d'externe. Zéro import tiers.

## Frameworks Web 2026

| Framework | Quand l'utiliser | Notes |
|-----------|------------------|-------|
| **net/http stdlib** | APIs simples, microservices légers | Zero dependency, performance excellente |
| **chi (v5+)** | Routing flexible, middlewares légers | Idiomatique Go, 100% compatible stdlib |
| **echo (v5+)** | APIs complètes, validation, binding | Batteries included, auto-docs OpenAPI |
| **gin** | Legacy, performance brute | Maintenance mode, préférer chi/echo |
| **fiber (v3+)** | Performance ultra-haute, FastHTTP | Non stdlib net/http, écosystème limité |

**Recommandation 2026** : chi (léger) ou echo (complet). Stdlib pour microservices.

## ORM / Database 2026

| Outil | Approche | Quand l'utiliser |
|-------|----------|------------------|
| **sqlc** | Code-gen depuis SQL | Type-safe, zéro runtime overhead, SQL pur |
| **pgx** | Driver direct PostgreSQL | Performance maximale, contrôle total |
| **gorm** | ORM classique | Prototypage rapide, équipe junior |
| **ent** | Graph-based ORM | Relations complexes, type-safe |

**Best practice** : sqlc (queries complexes) + pgx (driver). GORM conservateur.

## Testing 2026

```go
// Table-driven tests idiomatiques
func TestCalculate(t *testing.T) {
    tests := []struct {
        name    string
        input   int
        want    int
        wantErr bool
    }{
        {"zero", 0, 0, false},
        {"positive", 5, 25, false},
        {"negative", -1, 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Calculate(tt.input)
            if (err != nil) != tt.wantErr {
                t.Errorf("error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            if got != tt.want {
                t.Errorf("got %v, want %v", got, tt.want)
            }
        })
    }
}
```

**Outils** :
- `testing` stdlib (base)
- `testify/assert` (assertions lisibles)
- `gomock` (mocks interfaces)
- `httptest` (tests HTTP)
- `testcontainers-go` (integration tests DB/Redis)

## Go 1.24 → 1.26 Features

```go
// Range-over-func stable (Go 1.24+)
func Items() iter.Seq[string] {
    return func(yield func(string) bool) {
        for _, item := range data {
            if !yield(item) { return }
        }
    }
}

for item := range Items() {
    fmt.Println(item)
}

// Enhanced vet : détection patterns dangereux
// Loop var scoping : chaque itération a sa propre var

// Type parameters (generics Go 1.18+)
func Map[T, U any](s []T, f func(T) U) []U {
    r := make([]U, len(s))
    for i, v := range s {
        r[i] = f(v)
    }
    return r
}
```

**Go 1.25** : Improved type inference, telemetry opt-in (stable)
**Go 1.26** : Encore plus de fixes type-inference, stdlib enrichie
**Sources** : https://go.dev/blog/go1.24 · https://go.dev/blog/go1.25 · https://go.dev/blog/go1.26

## Concurrency Patterns

```go
// Context propagation (toujours premier param)
func Process(ctx context.Context, data string) error {
    select {
    case <-ctx.Done():
        return ctx.Err()
    case result := <-process(data):
        return result
    }
}

// errgroup pour parallel ops avec error handling
g, ctx := errgroup.WithContext(ctx)
for _, item := range items {
    g.Go(func() error {
        return process(ctx, item)
    })
}
if err := g.Wait(); err != nil {
    return err
}

// semaphore pour rate limiting
sem := semaphore.NewWeighted(10) // max 10 concurrent
sem.Acquire(ctx, 1)
defer sem.Release(1)
```

## Observability 2026

```go
// slog stdlib (Go 1.21+)
logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Info("request", "method", r.Method, "path", r.URL.Path)

// OpenTelemetry
import "go.opentelemetry.io/otel"
tracer := otel.Tracer("app")
ctx, span := tracer.Start(ctx, "operation")
defer span.End()

// pprof (profiling CPU/memory)
import _ "net/http/pprof"
go func() {
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

## Dependency Injection

```go
// wire (Google) — code-gen DI
// +build wireinject

func InitializeApp() (*App, error) {
    wire.Build(
        NewDB,
        NewRepo,
        NewService,
        NewHandler,
        NewApp,
    )
    return &App{}, nil
}

// Alternative : DI manuelle (idiomatique Go)
type App struct {
    repo    Repository
    service Service
}

func NewApp(repo Repository, service Service) *App {
    return &App{repo: repo, service: service}
}
```

## Commandes Docker

```bash
# Qualité
make lint           # golangci-lint run
make vet            # go vet ./...
make fmt            # gofmt -s -w .
make quality        # Tout en un

# Tests
make test           # go test -v -race ./...
make test-coverage  # go test -cover
make test-integration # testcontainers
make bench          # go test -bench
```

## Best Practices 2026

### Error Handling

```go
// errors.Is/As (Go 1.13+)
if errors.Is(err, sql.ErrNoRows) {
    // handle not found
}

var e *ValidationError
if errors.As(err, &e) {
    // handle validation error
}

// Wrap errors avec contexte
return fmt.Errorf("process user %s: %w", id, err)

// Sentinel errors
var ErrNotFound = errors.New("not found")
```

### Interfaces

```go
// Accept interfaces, return structs
func NewService(repo Repository) *Service {
    return &Service{repo: repo}
}

// Interfaces petites (1-3 méthodes)
type Repository interface {
    Get(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
}

// Interface à la frontière (consumer side)
// Pas dans le package qui l'implémente
```

## Documentation Complète

- `rules/01-architecture.md` - Clean + Hexagonal détaillée
- `rules/02-testing.md` - Testing patterns + outils
- `rules/03-security.md` - OWASP + security checklist

## Checklist Rapide

- [ ] Go 1.26+, modules activés
- [ ] `internal/domain/` sans dépendances externes
- [ ] golangci-lint passe (0 erreur)
- [ ] Tests coverage > 80%
- [ ] Context propagation (premier param)
- [ ] Error wrapping avec %w
- [ ] Interfaces côté consumer
- [ ] govulncheck OK (0 CVE)
