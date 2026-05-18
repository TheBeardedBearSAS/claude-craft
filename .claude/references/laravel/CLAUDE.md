# Laravel 13 — Framework Reference

**Version :** Laravel 13.4.0 (publiée le 17 mars 2026)
**PHP :** 8.5+
**Sources :** https://laravel.com/docs/13.x/releases

---

## Table des Matières

| Fichier | Sujet |
|---------|-------|
| `@architecture.md` | Clean Architecture, Actions, DTOs, Repositories |
| `@coding-standards.md` | PHP 8.5, Conventions Laravel, Enums, Match |
| `@testing.md` | Pest 4 + Mutation Testing, Arch Presets |
| `@quality-tools.md` | PHPStan 2.0 Level 10, Pint, Rector |
| `@security.md` | OWASP Top 10, Sanctum, Passkey Auth |
| `@project-context.md` | Template contexte projet |
| `@tooling.md` | Artisan, Docker, CI/CD, LSP |
| `@laravel13-features.md` | AI SDK, Vector Search, Passkey, Team Management |

---

## Nouveautés Laravel 13

### AI SDK Stable
- API unifiée OpenAI, Anthropic, Gemini, Ollama
- Outils (Tools), Agents, Embeddings, Streaming
- https://laravel.com/docs/13.x/ai-sdk

### Vector Search Natif
- Support pgvector pour PostgreSQL
- Recherche sémantique, RAG (Retrieval-Augmented Generation)
- https://laravel.com/docs/13.x/vector-search

### Passkey Authentication
- WebAuthn intégré dans Breeze, Jetstream, Fortify
- Authentification sans mot de passe
- https://laravel.com/docs/13.x/passkey

### Pest 4 Mutation Testing
- Mutation Testing natif pour garantir la qualité des tests
- https://pestphp.com/docs/pest4-now-available

### Arch Presets
- Tests d'architecture préconfigurés pour Laravel
- https://laravel.com/docs/13.x/testing#architecture-presets

### Team Management Amélioré
- Rôles et permissions plus granulaires dans Jetstream
- https://laravel.com/docs/13.x/teams

---

## Stack Technologique

| Composant | Version | Description |
|-----------|---------|-------------|
| **PHP** | 8.5+ | Constructor promotion, readonly, enums, match |
| **Laravel** | 13.x | Framework fullstack avec AI SDK |
| **Pest** | 4.x | Tests + Mutation Testing |
| **PHPStan** | 2.0 Level 10 | Analyse statique stricte |
| **Pint** | 1.x | Formatage PSR-12 / Laravel |
| **Sanctum** | 4.x | API Token Authentication + Passkey |
| **PostgreSQL** | 16+ | Base de données avec pgvector |
| **Redis** | 7+ | Cache et Queue |

---

## Architecture

Laravel 13 recommande **Clean Architecture** avec le pattern **Actions** :

```
app/
├── Domain/              # Logique métier pure (Models, ValueObjects, Events, Contracts)
├── Application/         # Use cases (Actions, DTOs, Handlers)
├── Infrastructure/      # Implémentations externes (Repositories, Services)
└── Http/                # Présentation (Controllers, Requests, Resources)
```

### Principes

- **Actions** : une Action = une opération métier
- **DTOs readonly** : typage strict PHP 8.5
- **Form Requests** : validation externalisée
- **API Resources** : transformation des réponses
- **Policies** : autorisation déclarative
- **Events/Listeners** : découplage des effets secondaires

---

## Patterns Essentiels

### 1. Action Pattern

```php
final readonly class CreateUser
{
    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function handle(CreateUserDTO $dto): User
    {
        $user = $this->users->create($dto);
        event(new UserRegistered($user));
        return $user;
    }
}
```

### 2. DTO Pattern

```php
final readonly class CreateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
    ) {}
}
```

### 3. Repository Pattern

```php
interface UserRepositoryInterface
{
    public function find(int $id): ?User;
    public function create(CreateUserDTO $dto): User;
}
```

### 4. AI SDK Pattern (Laravel 13)

```php
$response = AI::driver('anthropic')
    ->chat()
    ->messages([['role' => 'user', 'content' => 'Hello']])
    ->generate();
```

### 5. Vector Search Pattern (Laravel 13)

```php
$relevantDocs = Document::similarTo($question, limit: 3)->get();
```

---

## Tests

### Pest 4 avec Mutation Testing

```bash
# Tests classiques
php artisan test --coverage --min=80

# Mutation Testing (Pest 4)
./vendor/bin/pest --mutate --min=80
```

### Architecture Tests avec Presets

```php
use Pest\Arch\Preset;

uses(Preset::laravel());

arch('Actions are final')->expect('App\Actions')->toBeFinal();
```

---

## Qualité Code

### PHPStan 2.0 Level 10

```neon
parameters:
    level: 10
    paths: [app, database, tests]
```

### Pint (Formatage)

```bash
./vendor/bin/pint
./vendor/bin/pint --test
```

---

## Sécurité

### OWASP Top 10
- Sanctum pour API tokens
- Passkey pour authentification sans mot de passe (Laravel 13)
- Policies pour autorisation
- Form Requests pour validation
- Rate limiting, CSRF, XSS, SQL injection protection

### Passkey Auth (Laravel 13)

```php
// config/fortify.php
'features' => [
    Features::passkeys(),  // Nouveauté Laravel 13
],
```

---

## Checklist Laravel 13

- [ ] Clean Architecture (Domain/Application/Infrastructure/Http)
- [ ] Actions pour logique métier
- [ ] DTOs readonly PHP 8.5
- [ ] Form Requests + Policies
- [ ] PHPStan Level 10 (PHPStan 2.0)
- [ ] Pest 4 + Mutation Testing >= 80%
- [ ] Arch Presets Laravel appliqués
- [ ] AI SDK configuré (si LLM)
- [ ] Vector Search / pgvector (si RAG)
- [ ] Passkey Authentication (si auth sans mot de passe)
- [ ] Team Management (si Jetstream)

---

**Version :** 1.0
**Dernière mise à jour :** 2026-04
**Auteur :** The Bearded CTO
