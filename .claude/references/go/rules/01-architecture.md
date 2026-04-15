# Architecture Go — Clean + Hexagonal

## Vue d'ensemble

L'architecture Go suit les principes Clean Architecture et Hexagonal (Ports & Adapters), avec une organisation idiomatique Go.

**Principes** :
- ✅ Domain sans dépendances externes
- ✅ Dependency Inversion (DIP)
- ✅ Interfaces à la frontière (consumer side)
- ✅ Context propagation obligatoire
- ✅ Error handling explicite

---

## Structure Projet Recommandée

```
myapp/
├── cmd/
│   ├── api/              # Point d'entrée HTTP server
│   │   └── main.go
│   └── worker/           # Point d'entrée worker/consumer
│       └── main.go
│
├── internal/             # Code privé (non importable)
│   ├── domain/           # Entités, Value Objects, Interfaces
│   │   ├── user/
│   │   │   ├── user.go           # Entity
│   │   │   ├── email.go          # Value Object
│   │   │   └── repository.go    # Interface (port)
│   │   └── order/
│   │       ├── order.go
│   │       └── repository.go
│   │
│   ├── usecase/          # Business Logic (Use Cases)
│   │   ├── user/
│   │   │   ├── create_user.go
│   │   │   └── get_user.go
│   │   └── order/
│   │       ├── place_order.go
│   │       └── cancel_order.go
│   │
│   ├── infrastructure/   # Adapters (implémentations)
│   │   ├── postgres/
│   │   │   ├── user_repo.go
│   │   │   └── order_repo.go
│   │   ├── redis/
│   │   │   └── cache.go
│   │   └── http/
│   │       └── client.go
│   │
│   └── delivery/         # Controllers (HTTP/gRPC/CLI)
│       ├── http/
│       │   ├── handler.go
│       │   ├── user_handler.go
│       │   └── middleware.go
│       └── grpc/
│           └── server.go
│
├── pkg/                  # Code public réutilisable
│   ├── logger/
│   └── validator/
│
├── api/                  # OpenAPI specs, Protobuf
│   ├── openapi.yaml
│   └── proto/
│
└── test/                 # Tests intégration E2E
    └── integration/
```

---

## Domain Layer

### Entity

```go
// internal/domain/user/user.go
package user

import (
    "time"
)

// User est l'entité racine
type User struct {
    ID        string
    Email     Email         // Value Object
    Name      string
    CreatedAt time.Time
    UpdatedAt time.Time
}

// NewUser constructeur avec validation
func NewUser(email string, name string) (*User, error) {
    e, err := NewEmail(email)
    if err != nil {
        return nil, err
    }

    return &User{
        Email:     e,
        Name:      name,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }, nil
}

// Méthode métier
func (u *User) ChangeName(newName string) error {
    if newName == "" {
        return ErrInvalidName
    }
    u.Name = newName
    u.UpdatedAt = time.Now()
    return nil
}
```

### Value Object

```go
// internal/domain/user/email.go
package user

import (
    "errors"
    "regexp"
)

var emailRegex = regexp.MustCompile(`^[^@]+@[^@]+\.[^@]+$`)

type Email struct {
    value string
}

func NewEmail(email string) (Email, error) {
    if !emailRegex.MatchString(email) {
        return Email{}, errors.New("invalid email format")
    }
    return Email{value: email}, nil
}

func (e Email) String() string {
    return e.value
}
```

### Repository Interface (Port)

```go
// internal/domain/user/repository.go
package user

import "context"

// Repository interface définie côté domain
// Implémentée dans infrastructure/
type Repository interface {
    Get(ctx context.Context, id string) (*User, error)
    Save(ctx context.Context, user *User) error
    Delete(ctx context.Context, id string) error
    FindByEmail(ctx context.Context, email Email) (*User, error)
}
```

---

## UseCase Layer

```go
// internal/usecase/user/create_user.go
package user

import (
    "context"
    "fmt"

    "myapp/internal/domain/user"
)

type CreateUserInput struct {
    Email string
    Name  string
}

type CreateUserOutput struct {
    ID string
}

type CreateUserUseCase struct {
    repo user.Repository
}

func NewCreateUserUseCase(repo user.Repository) *CreateUserUseCase {
    return &CreateUserUseCase{repo: repo}
}

func (uc *CreateUserUseCase) Execute(ctx context.Context, input CreateUserInput) (*CreateUserOutput, error) {
    // Vérifier si email existe
    email, err := user.NewEmail(input.Email)
    if err != nil {
        return nil, fmt.Errorf("invalid email: %w", err)
    }

    existing, err := uc.repo.FindByEmail(ctx, email)
    if err == nil && existing != nil {
        return nil, user.ErrEmailAlreadyExists
    }

    // Créer user
    u, err := user.NewUser(input.Email, input.Name)
    if err != nil {
        return nil, fmt.Errorf("create user: %w", err)
    }

    // Sauvegarder
    if err := uc.repo.Save(ctx, u); err != nil {
        return nil, fmt.Errorf("save user: %w", err)
    }

    return &CreateUserOutput{ID: u.ID}, nil
}
```

---

## Infrastructure Layer (Adapters)

```go
// internal/infrastructure/postgres/user_repo.go
package postgres

import (
    "context"
    "database/sql"
    "errors"

    "myapp/internal/domain/user"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Get(ctx context.Context, id string) (*user.User, error) {
    var u user.User
    var email string

    err := r.db.QueryRowContext(ctx,
        "SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1",
        id,
    ).Scan(&u.ID, &email, &u.Name, &u.CreatedAt, &u.UpdatedAt)

    if errors.Is(err, sql.ErrNoRows) {
        return nil, user.ErrNotFound
    }
    if err != nil {
        return nil, err
    }

    u.Email, err = user.NewEmail(email)
    if err != nil {
        return nil, err
    }

    return &u, nil
}

func (r *UserRepository) Save(ctx context.Context, u *user.User) error {
    _, err := r.db.ExecContext(ctx,
        `INSERT INTO users (id, email, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            updated_at = EXCLUDED.updated_at`,
        u.ID, u.Email.String(), u.Name, u.CreatedAt, u.UpdatedAt,
    )
    return err
}
```

---

## Delivery Layer (HTTP)

```go
// internal/delivery/http/user_handler.go
package http

import (
    "encoding/json"
    "net/http"

    "myapp/internal/usecase/user"
)

type UserHandler struct {
    createUserUC *user.CreateUserUseCase
}

func NewUserHandler(createUserUC *user.CreateUserUseCase) *UserHandler {
    return &UserHandler{createUserUC: createUserUC}
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req struct {
        Email string `json:"email"`
        Name  string `json:"name"`
    }

    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    output, err := h.createUserUC.Execute(r.Context(), user.CreateUserInput{
        Email: req.Email,
        Name:  req.Name,
    })

    if err != nil {
        // Map domain errors to HTTP status
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"id": output.ID})
}
```

---

## Dependency Injection

### Wire (Google)

```go
// cmd/api/wire.go
// +build wireinject

package main

import (
    "database/sql"

    "github.com/google/wire"
    "myapp/internal/delivery/http"
    "myapp/internal/infrastructure/postgres"
    "myapp/internal/usecase/user"
)

func InitializeApp(db *sql.DB) (*App, error) {
    wire.Build(
        // Repositories
        postgres.NewUserRepository,
        wire.Bind(new(user.Repository), new(*postgres.UserRepository)),

        // Use Cases
        user.NewCreateUserUseCase,

        // Handlers
        http.NewUserHandler,

        // App
        NewApp,
    )
    return &App{}, nil
}
```

### DI Manuelle (idiomatique)

```go
// cmd/api/main.go
package main

import (
    "database/sql"
    "log"
    "net/http"

    _ "github.com/lib/pq"
    "myapp/internal/delivery/http"
    "myapp/internal/infrastructure/postgres"
    "myapp/internal/usecase/user"
)

func main() {
    // DB
    db, err := sql.Open("postgres", "postgres://...")
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Repositories
    userRepo := postgres.NewUserRepository(db)

    // Use Cases
    createUserUC := user.NewCreateUserUseCase(userRepo)

    // Handlers
    userHandler := http.NewUserHandler(createUserUC)

    // Routes
    mux := http.NewServeMux()
    mux.HandleFunc("POST /users", userHandler.CreateUser)

    log.Println("Server starting on :8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

---

## Error Handling

```go
// Sentinel errors
var (
    ErrNotFound           = errors.New("not found")
    ErrInvalidInput       = errors.New("invalid input")
    ErrEmailAlreadyExists = errors.New("email already exists")
)

// Custom error types
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}

// Error wrapping
if err != nil {
    return fmt.Errorf("save user %s: %w", id, err)
}

// Error unwrapping
if errors.Is(err, sql.ErrNoRows) {
    return domain.ErrNotFound
}

var validErr *ValidationError
if errors.As(err, &validErr) {
    // handle validation error
}
```

---

## Context Propagation

```go
// Context toujours en premier paramètre
func (r *Repository) Get(ctx context.Context, id string) (*User, error) {
    // Utiliser ctx pour timeout, cancellation, values
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
        // process
    }
}

// Timeout
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()

result, err := service.Process(ctx, data)

// Cancellation
ctx, cancel := context.WithCancel(context.Background())
go func() {
    <-stopChan
    cancel()
}()
```

---

## Checklist Architecture

- [ ] Domain sans import externe (stdlib uniquement)
- [ ] Interfaces définies côté domain (ports)
- [ ] Infrastructure implémente les interfaces (adapters)
- [ ] Use Cases orchestrent domain + repos
- [ ] Delivery layer mappe HTTP ↔ Use Cases
- [ ] Context premier paramètre partout
- [ ] Error wrapping avec %w
- [ ] DI explicite (wire ou manuelle)
- [ ] Packages `internal/` pour code privé
- [ ] Accept interfaces, return structs

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
