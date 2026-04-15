# Testing Go — TDD / BDD

## Vue d'ensemble

Le testing Go suit les principes TDD avec une approche table-driven idiomatique.

**Principes** :
- ✅ Pyramide : 70% unit, 20% integration, 10% E2E
- ✅ Table-driven tests pour exhaustivité
- ✅ Mocks uniquement aux frontières (interfaces)
- ✅ Coverage ≥ 80%, mutation testing obligatoire

---

## Pyramide des Tests

| Type | % | Temps | Outils |
|------|---|-------|--------|
| **Unit** | 70% | < 100ms | testing, testify |
| **Integration** | 20% | < 2s | testcontainers, httptest |
| **E2E** | 10% | < 10s | Playwright, Selenium |

---

## Tests Unitaires

### Table-Driven Tests (idiomatique)

```go
// internal/domain/user/email_test.go
package user

import "testing"

func TestNewEmail(t *testing.T) {
    tests := []struct {
        name    string
        input   string
        want    string
        wantErr bool
    }{
        {
            name:    "valid email",
            input:   "user@example.com",
            want:    "user@example.com",
            wantErr: false,
        },
        {
            name:    "missing @",
            input:   "userexample.com",
            wantErr: true,
        },
        {
            name:    "missing domain",
            input:   "user@",
            wantErr: true,
        },
        {
            name:    "empty string",
            input:   "",
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := NewEmail(tt.input)
            
            if (err != nil) != tt.wantErr {
                t.Errorf("NewEmail() error = %v, wantErr %v", err, tt.wantErr)
                return
            }
            
            if !tt.wantErr && got.String() != tt.want {
                t.Errorf("NewEmail() = %v, want %v", got.String(), tt.want)
            }
        })
    }
}
```

### Tests avec Testify (assertions lisibles)

```go
// internal/usecase/user/create_user_test.go
package user

import (
    "context"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestCreateUserUseCase_Execute(t *testing.T) {
    t.Run("success", func(t *testing.T) {
        repo := &mockRepository{}
        uc := NewCreateUserUseCase(repo)

        output, err := uc.Execute(context.Background(), CreateUserInput{
            Email: "test@example.com",
            Name:  "Test User",
        })

        require.NoError(t, err)
        assert.NotEmpty(t, output.ID)
        assert.Equal(t, 1, repo.saveCalled)
    })

    t.Run("invalid email", func(t *testing.T) {
        repo := &mockRepository{}
        uc := NewCreateUserUseCase(repo)

        _, err := uc.Execute(context.Background(), CreateUserInput{
            Email: "invalid",
            Name:  "Test",
        })

        require.Error(t, err)
        assert.Contains(t, err.Error(), "invalid email")
    })
}
```

---

## Mocks

### Interface Mock Manuel

```go
// internal/usecase/user/mock_repository_test.go
package user

import (
    "context"

    "myapp/internal/domain/user"
)

type mockRepository struct {
    users      map[string]*user.User
    saveCalled int
    getError   error
}

func newMockRepository() *mockRepository {
    return &mockRepository{
        users: make(map[string]*user.User),
    }
}

func (m *mockRepository) Get(ctx context.Context, id string) (*user.User, error) {
    if m.getError != nil {
        return nil, m.getError
    }
    u, ok := m.users[id]
    if !ok {
        return nil, user.ErrNotFound
    }
    return u, nil
}

func (m *mockRepository) Save(ctx context.Context, u *user.User) error {
    m.saveCalled++
    m.users[u.ID] = u
    return nil
}
```

### gomock (code-gen)

```go
// Générer mock
//go:generate mockgen -source=repository.go -destination=mocks/repository.go -package=mocks

// Tests avec gomock
import (
    "testing"

    "github.com/golang/mock/gomock"
    "myapp/internal/domain/user/mocks"
)

func TestWithGomock(t *testing.T) {
    ctrl := gomock.NewController(t)
    defer ctrl.Finish()

    repo := mocks.NewMockRepository(ctrl)
    repo.EXPECT().
        Save(gomock.Any(), gomock.Any()).
        Return(nil).
        Times(1)

    uc := NewCreateUserUseCase(repo)
    _, err := uc.Execute(context.Background(), CreateUserInput{
        Email: "test@example.com",
        Name:  "Test",
    })

    assert.NoError(t, err)
}
```

---

## Tests HTTP

### httptest.Server

```go
// internal/delivery/http/user_handler_test.go
package http

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestUserHandler_CreateUser(t *testing.T) {
    repo := newMockRepository()
    uc := user.NewCreateUserUseCase(repo)
    handler := NewUserHandler(uc)

    body := map[string]string{
        "email": "test@example.com",
        "name":  "Test User",
    }
    bodyBytes, _ := json.Marshal(body)

    req := httptest.NewRequest(http.MethodPost, "/users", bytes.NewReader(bodyBytes))
    req.Header.Set("Content-Type", "application/json")
    w := httptest.NewRecorder()

    handler.CreateUser(w, req)

    assert.Equal(t, http.StatusOK, w.Code)

    var resp map[string]string
    err := json.NewDecoder(w.Body).Decode(&resp)
    require.NoError(t, err)
    assert.NotEmpty(t, resp["id"])
}
```

---

## Tests Intégration

### testcontainers-go

```go
// test/integration/user_repo_test.go
// +build integration

package integration

import (
    "context"
    "database/sql"
    "testing"

    "github.com/stretchr/testify/require"
    "github.com/testcontainers/testcontainers-go"
    "github.com/testcontainers/testcontainers-go/wait"
)

func setupPostgres(t *testing.T) (*sql.DB, func()) {
    ctx := context.Background()

    req := testcontainers.ContainerRequest{
        Image:        "postgres:16",
        ExposedPorts: []string{"5432/tcp"},
        Env: map[string]string{
            "POSTGRES_PASSWORD": "test",
            "POSTGRES_DB":       "testdb",
        },
        WaitingFor: wait.ForListeningPort("5432/tcp"),
    }

    container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
        ContainerRequest: req,
        Started:          true,
    })
    require.NoError(t, err)

    host, _ := container.Host(ctx)
    port, _ := container.MappedPort(ctx, "5432")

    dsn := fmt.Sprintf("postgres://postgres:test@%s:%s/testdb?sslmode=disable", host, port.Port())
    db, err := sql.Open("postgres", dsn)
    require.NoError(t, err)

    cleanup := func() {
        db.Close()
        container.Terminate(ctx)
    }

    return db, cleanup
}

func TestUserRepository_Integration(t *testing.T) {
    db, cleanup := setupPostgres(t)
    defer cleanup()

    // Migrations
    _, err := db.Exec(`CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
    )`)
    require.NoError(t, err)

    // Tests
    repo := postgres.NewUserRepository(db)

    u, err := user.NewUser("test@example.com", "Test User")
    require.NoError(t, err)

    err = repo.Save(context.Background(), u)
    require.NoError(t, err)

    retrieved, err := repo.Get(context.Background(), u.ID)
    require.NoError(t, err)
    assert.Equal(t, u.Email.String(), retrieved.Email.String())
}
```

---

## Benchmarks

```go
// internal/domain/user/email_bench_test.go
package user

import "testing"

func BenchmarkNewEmail(b *testing.B) {
    email := "user@example.com"
    
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        _, _ = NewEmail(email)
    }
}

// Lancer : go test -bench=. -benchmem
```

---

## Coverage

```bash
# Coverage HTML
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# Coverage par package
go test -cover ./...

# Seuil minimum
go test -cover ./... | grep -E 'coverage: [0-9]+\.[0-9]+%' | awk '{if ($2+0 < 80) exit 1}'
```

---

## Mutation Testing

```bash
# Installer go-mutesting
go install github.com/zimmski/go-mutesting/cmd/go-mutesting@latest

# Lancer mutation tests
go-mutesting --verbose ./internal/domain/...

# CI : vérifier mutation score ≥ 70%
```

---

## TDD Workflow

### Red → Green → Refactor

```go
// 1. RED : Test qui échoue
func TestCalculateTotal(t *testing.T) {
    cart := NewCart()
    cart.AddItem("item1", 10.0)
    cart.AddItem("item2", 5.0)

    total := cart.CalculateTotal()

    assert.Equal(t, 15.0, total) // FAIL : méthode n'existe pas
}

// 2. GREEN : Code minimal
func (c *Cart) CalculateTotal() float64 {
    total := 0.0
    for _, item := range c.items {
        total += item.Price
    }
    return total
}

// 3. REFACTOR : Améliorer
func (c *Cart) CalculateTotal() float64 {
    return reduce(c.items, 0.0, func(sum float64, item Item) float64 {
        return sum + item.Price
    })
}
```

---

## Best Practices

### Test Isolation

```go
// Chaque test crée ses propres données
func TestExample(t *testing.T) {
    // Setup
    repo := newMockRepository()
    uc := NewUseCase(repo)

    // Test
    result, err := uc.Execute(context.Background(), input)

    // Assertions
    require.NoError(t, err)
    assert.Equal(t, expected, result)

    // Cleanup automatique (defer si nécessaire)
}
```

### Sous-tests

```go
func TestUserOperations(t *testing.T) {
    t.Run("create", func(t *testing.T) {
        // test create
    })

    t.Run("update", func(t *testing.T) {
        // test update
    })

    t.Run("delete", func(t *testing.T) {
        // test delete
    })
}
```

### Race Detector

```bash
# Détecter race conditions
go test -race ./...

# CI : toujours activer -race
```

---

## Checklist Testing

- [ ] Tests unitaires pour toute logique métier
- [ ] Table-driven tests pour exhaustivité
- [ ] Mocks uniquement aux frontières
- [ ] httptest pour handlers HTTP
- [ ] testcontainers pour tests DB
- [ ] Coverage ≥ 80%
- [ ] Mutation testing ≥ 70%
- [ ] Race detector activé en CI
- [ ] Benchmarks pour code critique
- [ ] Tests isolés (pas de dépendances entre tests)

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
