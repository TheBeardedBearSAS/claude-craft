# Laravel 13 - Nouvelles Fonctionnalités Majeures

**Version :** Laravel 13.x (série 13 lancée le 17 mars 2026 — dernière version vérifiée : 13.42.0 au 2026-11-11)
**Source :** https://laravel.com/docs/13.x/releases

---

## AI SDK — API Unifiée pour LLM

**Source :** https://laravel.com/docs/13.x/ai-sdk

Laravel 13 fournit un **AI SDK** officiel (package `laravel/ai`, namespace `Laravel\Ai`) qui unifie texte, agents, outils, images, audio et embeddings derrière une API commune. Il n'existe **pas** de façade `Illuminate\Support\Facades\AI`.

### Installation

```bash
composer require laravel/ai
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
php artisan migrate   # crée agent_conversations et agent_conversation_messages
```

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **Providers** | OpenAI, Anthropic, Gemini (enum `Laravel\Ai\Enums\Lab`) + driver `openai-compatible` pour endpoints auto-hébergés |
| **Agents** | Classes `Agent` + trait `Promptable` (`php artisan make:agent`) |
| **Outils (Tools)** | Contrat `Laravel\Ai\Contracts\Tool` (`php artisan make:tool`) |
| **Sortie structurée** | `HasStructuredOutput` + `schema(JsonSchema $schema)` |
| **Embeddings** | `Embeddings::for([...])->generate()` ou `Str::of(...)->toEmbeddings()` |
| **Streaming** | `->stream()` |
| **Failover** | Tableau de providers/modèles, bascule sur `FailoverableException` |
| **Tests** | `fake()` sur chaque capacité |

### Configuration

```php
// config/ai.php
'providers' => [
    'openai' => [
        'driver' => 'openai',
        'key' => env('OPENAI_API_KEY'),
        'url' => env('OPENAI_URL'),
    ],
    'anthropic' => [
        'driver' => 'anthropic',
        'key' => env('ANTHROPIC_API_KEY'),
        'url' => env('ANTHROPIC_URL'),
    ],
],
```

### Exemple : Agent avec sortie structurée et outils

```php
<?php

namespace App\Ai\Agents;

use App\Ai\Tools\RetrievePreviousTranscripts;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Promptable;
use Stringable;

class SalesCoach implements Agent, HasTools, HasStructuredOutput
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are a sales coach, analyzing transcripts and providing feedback and an overall sales strength score.';
    }

    public function tools(): iterable
    {
        return [new RetrievePreviousTranscripts];
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'feedback' => $schema->string()->required(),
            'score' => $schema->integer()->min(1)->max(10)->required(),
        ];
    }
}
```

```php
use Laravel\Ai\Enums\Lab;

$response = (new SalesCoach)->prompt(
    'Analyze this sales transcript...',
    provider: Lab::Anthropic,
    model: 'claude-sonnet-5-5',
    timeout: 120,
);

return $response['score'];   // sortie structurée

// Streaming
Route::get('/coach', fn () => (new SalesCoach)->stream('Analyze this sales transcript...'));
```

### Exemple : Agent anonyme

```php
use function Laravel\Ai\{agent};

$response = agent(
    instructions: 'You are an expert at software development.',
)->prompt('Tell me about Laravel');

return (string) $response;
```

### Exemple : Tool (appel de fonction)

```php
<?php

namespace App\Ai\Tools;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class RandomNumberGenerator implements Tool
{
    public function description(): Stringable|string
    {
        return 'This tool may be used to generate cryptographically secure random numbers.';
    }

    public function handle(Request $request): Stringable|string
    {
        return (string) random_int($request['min'], $request['max']);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'min' => $schema->integer()->min(0)->required(),
            'max' => $schema->integer()->required(),
        ];
    }
}
```

> **Sécurité :** les tools qui implémentent `Approvable` suspendent l'exécution en attente d'une approbation humaine — à utiliser pour toute action destructive.

---

## Vector Search — Recherche Sémantique Native

**Source :** https://laravel.com/docs/13.x/vector-search

Laravel 13 intègre le **Vector Search natif** avec support pgvector pour la recherche sémantique et RAG.

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **pgvector** | Support natif PostgreSQL avec extension pgvector |
| **Embeddings** | Génération automatique via AI SDK |
| **Similarity Search** | Recherche par cosinus, euclidienne, dot product |
| **RAG** | Retrieval-Augmented Generation simplifié |

### Migration pgvector

Supporté sur PostgreSQL (extension `pgvector`) et MariaDB 11.7+.

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::ensureVectorExtensionExists();   // PostgreSQL : charge pgvector

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->vector('embedding', dimensions: 1536)->index();  // index vectoriel (distance cosinus)
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
```

### Recherche par similarité (Query Builder)

`whereVectorSimilarTo` filtre par similarité cosinus (`minSimilarity` de 0.0 à 1.0) et trie par pertinence ; une chaîne de caractères est convertie en embedding automatiquement.

```php
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley', minSimilarity: 0.4)
    ->limit(10)
    ->get();

// Contrôle fin
$documents = DB::table('documents')
    ->select('*')
    ->selectVectorDistance('embedding', $queryEmbedding, as: 'distance')
    ->whereVectorDistanceLessThan('embedding', $queryEmbedding, maxDistance: 0.3)
    ->orderByVectorDistance('embedding', $queryEmbedding)
    ->limit(10)
    ->get();
```

### Génération d'embeddings (AI SDK)

```php
use Laravel\Ai\Embeddings;

$response = Embeddings::for(['Napa Valley has great wine.'])->generate();
$vector = $response->embeddings[0];

// Raccourci
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

### Exemple : RAG (Retrieval-Augmented Generation)

```php
<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;

use function Laravel\Ai\{agent};

class RagController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->string('question')->toString();

        // 1. Rechercher les documents similaires
        $relevantDocs = Document::query()
            ->whereVectorSimilarTo('embedding', $question, minSimilarity: 0.4)
            ->limit(3)
            ->get();

        // 2. Construire le contexte
        $context = $relevantDocs->pluck('content')->join("\n\n");

        // 3. Générer la réponse avec le contexte
        $response = agent(
            instructions: "Réponds en te basant sur le contexte suivant :\n\n{$context}",
        )->prompt($question);

        return response()->json([
            'answer' => (string) $response,
            'sources' => $relevantDocs->pluck('title'),
        ]);
    }
}
```

---

## Passkey Authentication — WebAuthn Intégré

**Source :** https://laravel.com/docs/13.x/passkey

Laravel 13 intègre **WebAuthn** nativement dans Breeze, Jetstream, et Fortify pour une authentification sans mot de passe.

### Activation dans Fortify

```php
// config/fortify.php
use Laravel\Fortify\Features;

return [
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
];
```

### User Model — Requis

Le modèle `User` doit implémenter le contrat `PasskeyUser` et utiliser le trait `PasskeyAuthenticatable` pour que Fortify puisse résoudre les endpoints WebAuthn :

```php
<?php
// app/Models/User.php
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

> **Important :** Sans cette implémentation, les endpoints de passkey de Fortify lèvent une erreur de résolution fatale lors de la première tentative WebAuthn réelle.

### Migration

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('passkeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('credential_id');
            $table->text('public_key');
            $table->unsignedInteger('sign_count')->default(0);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('passkeys');
    }
};
```

### Controller

```php
<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\RegisterPasskeyRequest;

class PasskeyController extends Controller
{
    public function register(RegisterPasskeyRequest $request)
    {
        $passkey = $request->user()->passkeys()->create([
            'name' => $request->name,
            'credential_id' => $request->credentialId,
            'public_key' => $request->publicKey,
        ]);

        return response()->json([
            'message' => 'Passkey registered successfully',
            'passkey' => $passkey,
        ]);
    }

    public function authenticate(Request $request)
    {
        // WebAuthn challenge automatiquement géré par Fortify
        return response()->json([
            'message' => 'Authentication successful',
        ]);
    }
}
```

---

## Pest Mutation Testing Intégré (natif depuis Pest 3)

**Source :** https://pestphp.com/docs/mutation-testing

Laravel 13 recommande **Pest 5** (PHP 8.4+ ; Pest 4 si PHP 8.3) avec le **Mutation Testing natif** (intégré depuis Pest 3, pas de plugin à installer) pour garantir la qualité des tests.

### Installation

```bash
composer require pestphp/pest --dev --with-all-dependencies
composer require pestphp/pest-plugin-laravel --dev
php artisan pest:install
```

### Mutation Testing

```bash
# Lancer le mutation testing
./vendor/bin/pest --mutate

# Avec score minimum
./vendor/bin/pest --mutate --min=80
```

### Configuration

```php
// tests/Pest.php
use Pest\Mutate\Mutators;

pest()->mutate(
    ignoring: [
        Mutators\UnwrapArrayDiff::class,
    ],
    minScore: 80,
);
```

---

## Arch Presets — Architecture Tests Préconfigurés

**Source :** https://laravel.com/docs/13.x/testing#architecture-presets

Laravel 13 fournit des **Arch Presets** pour tester automatiquement l'architecture Laravel.

### Utilisation

```php
<?php

use Pest\Arch\Preset;

// Appliquer les presets Laravel
uses(Preset::laravel());

// Tests personnalisés
arch('Actions are final')
    ->expect('App\Actions')
    ->toBeFinal();
```

### Presets inclus

| Preset | Vérifications |
|--------|--------------|
| `Preset::laravel()` | Controllers, Models, Requests, Resources, Policies, Jobs |
| `Preset::strict()` | No debugging, strict types, no unused imports |
| `Preset::clean()` | Clean Architecture boundaries |

---

## Team Management Amélioré

**Source :** https://laravel.com/docs/13.x/teams

Laravel 13 améliore la gestion des équipes dans Jetstream avec des rôles et permissions plus granulaires.

### Configuration

```php
// config/jetstream.php
return [
    'features' => [
        Features::termsAndPrivacyPolicy(),
        Features::profilePhotos(),
        Features::api(),
        Features::teams([
            'invitations' => true,
            'roles' => true,
        ]),
        Features::accountDeletion(),
    ],

    'team_roles' => [
        'owner' => [
            'name' => 'Owner',
            'permissions' => ['*'],
        ],
        'admin' => [
            'name' => 'Administrator',
            'permissions' => ['read', 'create', 'update', 'delete'],
        ],
        'member' => [
            'name' => 'Member',
            'permissions' => ['read'],
        ],
    ],
];
```

---

## PHP Native Attributes Eloquent (Laravel 13)

**Source :** https://laravel.com/docs/13.x/eloquent

Laravel 13 étend massivement le support des **PHP native attributes** pour les modèles Eloquent. Ils constituent une alternative déclarative non-breaking aux propriétés de classe traditionnelles.

### Attributs Eloquent disponibles

| Attribut | Description |
|----------|-------------|
| `#[Table('orders')]` | Nom de table personnalisé |
| `#[Fillable(['name', 'email'])]` | Champs mass-assignable |
| `#[Guarded(['id'])]` | Champs protégés du mass-assignment |
| `#[Hidden(['password'])]` | Champs cachés à la sérialisation |
| `#[Visible(['name'])]` | Champs visibles à la sérialisation |
| `#[Appends(['full_name'])]` | Accesseurs inclus dans la sérialisation |
| `#[ObservedBy(UserObserver::class)]` | Attacher un ou plusieurs observers |
| `#[ScopedBy(ActiveScope::class)]` | Appliquer un global scope |
| `#[UseFactory(UserFactory::class)]` | Lier une factory explicite |
| `#[UsePolicy(UserPolicy::class)]` | Lier une policy au modèle |
| `#[UseResource(UserResource::class)]` | Lier une API Resource au modèle |
| `#[UseEloquentBuilder(UserBuilder::class)]` | Builder Eloquent personnalisé |
| `#[WithoutTimestamps]` | Désactiver la gestion des timestamps |
| `#[WithoutIncrementing]` | Désactiver l'auto-increment |

### Exemple avant / après

```php
// AVANT : propriétés de classe (toujours valide en Laravel 13)
class User extends Authenticatable
{
    protected $table = 'users';
    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password', 'remember_token'];

    protected static function booted(): void
    {
        static::observe(UserObserver::class);
        static::addGlobalScope(new ActiveScope());
    }
}

// APRÈS : PHP native attributes (Laravel 13, alternative non-breaking)
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\ObservedBy;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('users')]
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
#[ObservedBy(UserObserver::class)]
#[ScopedBy(ActiveScope::class)]
class User extends Authenticatable
{
    // Configuration déclarative, aucune propriété ni booted() nécessaire
}
```

> **Note :** Les deux styles sont valides et peuvent coexister. Les propriétés de classe ont priorité si les deux sont définis. Préférer la cohérence au sein d'un projet.

---

## JSON:API Resources (Laravel 13)

**Source :** https://laravel.com/docs/13.x/eloquent-resources#jsonapi-resources

Laravel 13 inclut `JsonApiResource`, une classe de ressource conforme à la [spécification JSON:API](https://jsonapi.org/), en natif dans le framework (pas de package tiers requis).

### Caractéristiques vs JsonResource classique

| Fonctionnalité | `JsonResource` | `JsonApiResource` |
|----------------|---------------|-------------------|
| Format | Libre | JSON:API strict |
| Content-Type | `application/json` | `application/vnd.api+json` |
| Structure réponse | Libre | `{ data: { id, type, attributes, relationships } }` |
| Sparse fieldsets | Manuel | Automatique (`?fields[posts]=title,body`) |
| Includes (relations) | Manuel | Automatique (`?include=author,comments`) |
| Lazy evaluation | Non | Oui (closures dans `toAttributes`) |

### Génération via Artisan

```bash
php artisan make:resource PostResource --json-api
```

### Structure générée

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\JsonApi\JsonApiResource;

class PostResource extends JsonApiResource
{
    /**
     * The resource's attributes.
     */
    public $attributes = [
        'title',
        'body',
        'created_at',
        'updated_at',
    ];

    /**
     * The resource's relationships.
     */
    public $relationships = [
        'author',
        'comments',
    ];
}
```

### Exemple d'utilisation

```php
// Dans un controller
use App\Http\Resources\PostResource;
use App\Models\Post;

class PostController extends Controller
{
    public function show(Post $post): PostResource
    {
        return new PostResource($post);
    }

    public function index(): JsonResponse
    {
        return PostResource::collection(Post::all())->response();
    }
}
```

Réponse JSON:API produite :

```json
{
    "data": {
        "id": "1",
        "type": "posts",
        "attributes": {
            "title": "Hello World",
            "body": "This is my first post."
        }
    }
}
```

### Attributs avancés (lazy evaluation)

```php
// Contrôle total via toAttributes()
public function toAttributes(Request $request): array
{
    return [
        'title' => $this->title,
        'body' => $this->body,
        'is_published' => fn () => $this->published_at !== null,
        'created_at' => $this->created_at,
    ];
}
```

### Relations explicites

```php
use App\Http\Resources\UserResource;
use App\Http\Resources\CommentResource;

public $relationships = [
    'author' => UserResource::class,
    'comments' => CommentResource::class,
];
```

> **Note :** Pour parser les query parameters JSON:API entrants (filtres, sorts), utiliser [Spatie Laravel Query Builder](https://spatie.be/docs/laravel-query-builder) en complément.

---

## Autres nouveautés 13.x (queues, cache, sécurité, recherche vectorielle)

**Source :** https://laravel.com/docs/13.x/releases

```php
// Routage de queue par classe (centralisé, ex. AppServiceProvider::boot)
Queue::route(ProcessPodcast::class, connection: 'redis', queue: 'podcasts');

// Prolonger le TTL d'une entrée sans la relire/réécrire
Cache::touch('user:42:profile', now()->addHour());

// Attributs de contrôleur (Illuminate\Routing\Attributes\Controllers\{Middleware, Authorize})
#[Middleware('auth')]
class CommentController
{
    #[Middleware('subscribed')]
    #[Authorize('create', [Comment::class, 'post'])]
    public function store(Post $post) { /* ... */ }
}

// Attributs de job : #[Tries], #[Backoff], #[Timeout], #[FailOnTimeout]

// Recherche vectorielle native (Query Builder) et embeddings
$documents = DB::table('documents')
    ->whereVectorSimilarTo('embedding', 'Best wineries in Napa Valley')
    ->limit(10)
    ->get();
$embeddings = Str::of('Napa Valley has great wine.')->toEmbeddings();
```

- **Sécurité :** le middleware `PreventRequestForgery` (groupe `web`) vérifie d'abord `Sec-Fetch-Site` puis retombe sur le jeton CSRF.

---

## Migration 12 → 13 — Points d'attention

**Source :** https://laravel.com/docs/13.x/upgrade

| Impact | Changement | Action |
|--------|-----------|--------|
| Élevé | `VerifyCsrfToken` renommé `PreventRequestForgery` (vérification d'origine via `Sec-Fetch-Site` ; anciens noms conservés comme alias dépréciés) | Mettre à jour les `withoutMiddleware([...])` |
| Élevé | Dépendances : `laravel/framework ^13.0`, `laravel/boost ^2.0`, `laravel/tinker ^3.0`, `phpunit/phpunit ^12.0`, `pestphp/pest ^4.0` (valeurs du skeleton) | Mettre à jour `composer.json` et l'installer Laravel |
| Moyen | Config `cache` : `'serializable_classes' => false` par défaut (bloque `unserialize` d'objets arbitraires) | Lister explicitement les classes mises en cache, ou cacher des tableaux |
| Moyen | `upsert` MySQL/MariaDB : un `uniqueBy` vide lève `InvalidArgumentException` | Passer des colonnes `uniqueBy` valides |
| Faible | Préfixes de cache et nom du cookie de session : `_` remplacé par `-` (fallbacks uniquement) | Fixer `CACHE_PREFIX`, `REDIS_PREFIX`, `SESSION_COOKIE` pour conserver les anciennes valeurs |
| Faible | `config/session.php` : `serialization` passe de `php` à `json` (invalide les sessions actives) | Garder `php` si des objets PHP sont stockés en session |
| Faible | Polyfill `symfony/polyfill-php85` : définit `array_first()`/`array_last()` globaux sur PHP < 8.5 ; conflit avec `laravel/helpers` ; plus de callback | Utiliser `Arr::first($array, fn ($v) => ...)` pour filtrer |
| Faible | `JobAttempted::$exceptionOccurred` devient `$exception` ; `QueueBusy::$connection` devient `$connectionName` ; vues de pagination `pagination::default` devient `pagination::bootstrap-3` | Adapter les listeners et vues |

---

## Checklist Laravel 13

- [ ] AI SDK configuré pour OpenAI/Anthropic/Gemini
- [ ] Vector Search avec pgvector pour RAG
- [ ] Passkey Authentication activé dans Fortify
- [ ] Pest 5 avec Mutation Testing >= 80%
- [ ] Arch Presets Laravel appliqués
- [ ] PHPStan Level 10 (PHPStan 2.0)
- [ ] Team Management configuré (si Jetstream)
- [ ] PHP native attributes Eloquent utilisés (si projet greenfield)
- [ ] JsonApiResource si API JSON:API requise
- [ ] `Queue::route()` / attributs `#[Tries]`/`#[Backoff]`/`#[Timeout]` pour les jobs

---

**Version :** 1.0
**Dernière mise à jour :** 2026-04
**Auteur :** The Bearded CTO
