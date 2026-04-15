# Sécurité Go — OWASP 2025

## Vue d'ensemble

La sécurité Go suit les recommandations **OWASP Top 10:2025** avec des outils spécifiques Go.

**Principes** :
- ✅ govulncheck obligatoire (scan CVE stdlib)
- ✅ Requêtes SQL paramétrées (sqlc/pgx)
- ✅ Secrets JAMAIS en code
- ✅ TLS 1.3 minimum
- ✅ SBOM automatique (syft)

---

## OWASP Top 10:2025 — Go

| # | Menace | Défense Go |
|---|--------|-----------|
| 1 | Broken Access Control | Middleware auth + RBAC explicite |
| 2 | Cryptographic Failures | TLS 1.3, argon2id, crypto/rand |
| 3 | Injection | sqlc/pgx parameterized, validation input |
| 4 | Insecure Design | Threat modeling, defense in depth |
| 5 | Security Misconfiguration | Config explicite, erreurs génériques prod |
| 6 | **Supply Chain Failures** | govulncheck, SBOM, go.sum pinning |
| 7 | **Exceptional Conditions** | Error wrapping, panic recovery, logs |

---

## Injection SQL

### Parameterized Queries (sqlc)

```go
// queries.sql
-- name: GetUser :one
SELECT id, email, name FROM users WHERE id = $1;

-- name: CreateUser :exec
INSERT INTO users (id, email, name) VALUES ($1, $2, $3);

// Code généré type-safe
user, err := queries.GetUser(ctx, userID)

// ❌ JAMAIS
query := fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", userID) // DANGER
```

### pgx (driver direct)

```go
// ✅ BON : parameterized
err := conn.QueryRow(ctx, 
    "SELECT email FROM users WHERE id = $1", 
    userID,
).Scan(&email)

// ❌ MAUVAIS
query := fmt.Sprintf("SELECT email FROM users WHERE id = '%s'", userID)
```

---

## Authentification

### JWT

```go
// golang-jwt/jwt v5
import "github.com/golang-jwt/jwt/v5"

type Claims struct {
    UserID string `json:"user_id"`
    jwt.RegisteredClaims
}

func GenerateToken(userID string) (string, error) {
    claims := Claims{
        UserID: userID,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
            Issuer:    "myapp",
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func ValidateToken(tokenString string) (*Claims, error) {
    token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
        // Vérifier algorithme
        if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
            return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
        }
        return []byte(os.Getenv("JWT_SECRET")), nil
    })

    if err != nil {
        return nil, err
    }

    if claims, ok := token.Claims.(*Claims); ok && token.Valid {
        return claims, nil
    }

    return nil, errors.New("invalid token")
}
```

### Password Hashing (Argon2id)

```go
// golang.org/x/crypto/argon2
import "golang.org/x/crypto/argon2"

type ArgonParams struct {
    Memory      uint32
    Iterations  uint32
    Parallelism uint8
    SaltLength  uint32
    KeyLength   uint32
}

// OWASP 2026 : 128 MiB RAM, t=3-5, p=1
var defaultParams = ArgonParams{
    Memory:      128 * 1024, // 128 MiB
    Iterations:  4,
    Parallelism: 1,
    SaltLength:  16,
    KeyLength:   32,
}

func HashPassword(password string) (string, error) {
    salt := make([]byte, defaultParams.SaltLength)
    if _, err := rand.Read(salt); err != nil {
        return "", err
    }

    hash := argon2.IDKey(
        []byte(password),
        salt,
        defaultParams.Iterations,
        defaultParams.Memory,
        defaultParams.Parallelism,
        defaultParams.KeyLength,
    )

    // Encoder salt + hash en base64
    b64Salt := base64.RawStdEncoding.EncodeToString(salt)
    b64Hash := base64.RawStdEncoding.EncodeToString(hash)

    return fmt.Sprintf("$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
        argon2.Version, defaultParams.Memory, defaultParams.Iterations,
        defaultParams.Parallelism, b64Salt, b64Hash,
    ), nil
}

func VerifyPassword(password, encodedHash string) (bool, error) {
    // Parser encodedHash
    parts := strings.Split(encodedHash, "$")
    if len(parts) != 6 {
        return false, errors.New("invalid hash format")
    }

    var memory, iterations uint32
    var parallelism uint8
    _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &memory, &iterations, &parallelism)
    if err != nil {
        return false, err
    }

    salt, err := base64.RawStdEncoding.DecodeString(parts[4])
    if err != nil {
        return false, err
    }

    storedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
    if err != nil {
        return false, err
    }

    hash := argon2.IDKey(
        []byte(password),
        salt,
        iterations,
        memory,
        parallelism,
        uint32(len(storedHash)),
    )

    return subtle.ConstantTimeCompare(hash, storedHash) == 1, nil
}
```

---

## TLS

### Configuration TLS 1.3

```go
import "crypto/tls"

func NewTLSConfig() *tls.Config {
    return &tls.Config{
        MinVersion:               tls.VersionTLS13,
        PreferServerCipherSuites: true,
        CipherSuites: []uint16{
            tls.TLS_AES_256_GCM_SHA384,
            tls.TLS_AES_128_GCM_SHA256,
            tls.TLS_CHACHA20_POLY1305_SHA256,
        },
    }
}

// HTTP server avec TLS
server := &http.Server{
    Addr:      ":8443",
    Handler:   mux,
    TLSConfig: NewTLSConfig(),
}

log.Fatal(server.ListenAndServeTLS("cert.pem", "key.pem"))
```

---

## Secrets Management

### Variables d'environnement

```go
// ❌ JAMAIS en dur
const apiKey = "sk-abc123" // DANGER

// ✅ BON : env vars
apiKey := os.Getenv("API_KEY")
if apiKey == "" {
    log.Fatal("API_KEY not set")
}

// Viper pour config complexe
import "github.com/spf13/viper"

viper.AutomaticEnv()
viper.SetEnvPrefix("MYAPP")
apiKey := viper.GetString("API_KEY")
```

### HashiCorp Vault

```go
import "github.com/hashicorp/vault/api"

func GetSecret(path string) (string, error) {
    client, err := api.NewClient(api.DefaultConfig())
    if err != nil {
        return "", err
    }

    secret, err := client.Logical().Read(path)
    if err != nil {
        return "", err
    }

    return secret.Data["value"].(string), nil
}
```

---

## Input Validation

### ozzo-validation

```go
import (
    validation "github.com/go-ozzo/ozzo-validation/v4"
    "github.com/go-ozzo/ozzo-validation/v4/is"
)

type User struct {
    Email string
    Age   int
}

func (u User) Validate() error {
    return validation.ValidateStruct(&u,
        validation.Field(&u.Email, validation.Required, is.Email),
        validation.Field(&u.Age, validation.Required, validation.Min(18), validation.Max(120)),
    )
}
```

### go-playground/validator

```go
import "github.com/go-playground/validator/v10"

type User struct {
    Email string `validate:"required,email"`
    Age   int    `validate:"required,min=18,max=120"`
}

func ValidateUser(u User) error {
    validate := validator.New()
    return validate.Struct(u)
}
```

---

## HTTP Security Headers

```go
// Middleware headers
func SecurityHeaders(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("X-Content-Type-Options", "nosniff")
        w.Header().Set("X-Frame-Options", "DENY")
        w.Header().Set("X-XSS-Protection", "1; mode=block")
        w.Header().Set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload")
        w.Header().Set("Content-Security-Policy", "default-src 'self'")
        w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
        w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")
        w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")

        next.ServeHTTP(w, r)
    })
}
```

---

## CORS

```go
import "github.com/rs/cors"

func main() {
    mux := http.NewServeMux()
    
    c := cors.New(cors.Options{
        AllowedOrigins:   []string{"https://example.com"},
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE"},
        AllowedHeaders:   []string{"Authorization", "Content-Type"},
        AllowCredentials: true,
        MaxAge:           300,
    })

    handler := c.Handler(mux)
    http.ListenAndServe(":8080", handler)
}
```

---

## Rate Limiting

```go
import "golang.org/x/time/rate"

var limiter = rate.NewLimiter(10, 20) // 10 req/s, burst 20

func RateLimitMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        if !limiter.Allow() {
            http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
            return
        }
        next.ServeHTTP(w, r)
    })
}
```

---

## Supply Chain Security

### govulncheck (stdlib)

```bash
# Installer
go install golang.org/x/vuln/cmd/govulncheck@latest

# Scan
govulncheck ./...

# CI : exit code != 0 si CVE trouvées
govulncheck -json ./... | jq -e '.Vulns == null'
```

### Trivy (multi-scanner)

```bash
# Scan Go dependencies
trivy fs --scanners vuln .

# Scan image Docker
trivy image myapp:latest
```

### SBOM (syft)

```bash
# Générer SBOM
syft . -o cyclonedx-json > sbom.json

# CI : générer SBOM à chaque build
syft packages dir:. -o spdx-json=sbom.spdx.json
```

### go.sum pinning

```bash
# Vérifier go.sum en CI
go mod verify

# Audit dependencies
go list -json -m all | go-mod-outdated -update
```

---

## Container Security

### Distroless Image

```dockerfile
# Multi-stage build
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

# Distroless image (aucun shell, aucun package OS)
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /app/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

### Scratch Image (ultra-minimal)

```dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o app .

FROM scratch
COPY --from=builder /app/app /app
USER 1000:1000
ENTRYPOINT ["/app"]
```

---

## Logging Sécurisé

```go
import "log/slog"

// ✅ Loguer : connexions, changements permissions, erreurs auth
slog.Info("user login", "user_id", userID, "ip", r.RemoteAddr)

// ❌ NE PAS loguer : mots de passe, tokens, données sensibles
slog.Info("auth failed", "password", password) // DANGER
```

---

## Checklist Sécurité

- [ ] govulncheck 0 CVE
- [ ] Requêtes SQL paramétrées (sqlc/pgx)
- [ ] Secrets dans env vars / Vault
- [ ] Passwords : Argon2id (128 MiB, t=4, p=1)
- [ ] JWT expiration courte (15 min)
- [ ] TLS 1.3 minimum
- [ ] Headers sécurité (CSP, HSTS, X-Frame-Options)
- [ ] CORS strict (whitelist origins)
- [ ] Rate limiting activé
- [ ] Input validation (ozzo/validator)
- [ ] SBOM généré (syft)
- [ ] Container distroless/scratch + non-root user
- [ ] Logs sans données sensibles

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
