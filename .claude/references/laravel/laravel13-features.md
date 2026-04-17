# Laravel 13 - Nouvelles Fonctionnalités Majeures

**Version :** Laravel 13.4.0 (publiée le 17 mars 2026)
**Source :** https://laravel.com/docs/13.x/releases

---

## AI SDK — API Unifiée pour LLM

**Source :** https://laravel.com/docs/13.x/ai-sdk

Laravel 13 introduit un **AI SDK stable** qui unifie les intégrations OpenAI, Anthropic, Gemini, et autres LLMs sous une API commune.

### Caractéristiques

| Fonctionnalité | Description |
|----------------|-------------|
| **API unifiée** | Interface commune pour OpenAI, Anthropic, Gemini, Ollama |
| **Outils (Tools)** | Appels de fonctions structurés |
| **Agents** | Workflows multi-étapes avec mémoire |
| **Embeddings** | Génération de vecteurs pour RAG |
| **Streaming** | Réponses en temps réel |

### Exemple : Chat Completion

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\AI;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $response = AI::driver('anthropic')
            ->chat()
            ->messages([
                ['role' => 'user', 'content' => $request->input('message')],
            ])
            ->model('claude-sonnet-4.5')
            ->temperature(0.7)
            ->maxTokens(1024)
            ->generate();

        return response()->json([
            'response' => $response->text(),
        ]);
    }
}
```

### Exemple : Tools (Appels de Fonctions)

```php
<?php

use Illuminate\Support\Facades\AI;

$tools = [
    [
        'name' => 'get_weather',
        'description' => 'Obtenir la météo pour une ville donnée',
        'parameters' => [
            'type' => 'object',
            'properties' => [
                'city' => [
                    'type' => 'string',
                    'description' => 'Le nom de la ville',
                ],
            ],
            'required' => ['city'],
        ],
    ],
];

$response = AI::driver('openai')
    ->chat()
    ->messages([
        ['role' => 'user', 'content' => 'Quelle est la météo à Paris ?'],
    ])
    ->tools($tools)
    ->generate();

if ($response->hasToolCalls()) {
    foreach ($response->toolCalls() as $toolCall) {
        if ($toolCall->name === 'get_weather') {
            $weather = $this->fetchWeather($toolCall->arguments['city']);
            // Renvoyer le résultat à l'AI
        }
    }
}
```

### Configuration

```php
// config/ai.php
return [
    'default' => env('AI_DRIVER', 'anthropic'),

    'drivers' => [
        'anthropic' => [
            'api_key' => env('ANTHROPIC_API_KEY'),
            'model' => 'claude-sonnet-4.5',
        ],
        'openai' => [
            'api_key' => env('OPENAI_API_KEY'),
            'model' => 'gpt-4-turbo',
        ],
        'gemini' => [
            'api_key' => env('GEMINI_API_KEY'),
            'model' => 'gemini-2.5-flash',
        ],
    ],
];
```

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

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('content');
            $table->vector('embedding', 1536);  // OpenAI text-embedding-ada-002
            $table->timestamps();

            $table->index('embedding', 'documents_embedding_idx')->algorithm('ivfflat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        DB::statement('DROP EXTENSION IF EXISTS vector');
    }
};
```

### Model avec Vector Search

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\AI;

class Document extends Model
{
    protected $fillable = ['title', 'content', 'embedding'];

    protected $casts = [
        'embedding' => 'array',
    ];

    // Générer l'embedding automatiquement
    protected static function booted(): void
    {
        static::creating(function (Document $document) {
            $document->embedding = AI::embeddings()
                ->create($document->content)
                ->vector();
        });
    }

    // Recherche par similarité
    public function scopeSimilarTo($query, string $text, int $limit = 10)
    {
        $embedding = AI::embeddings()->create($text)->vector();

        return $query
            ->selectRaw('*, embedding <=> ? as distance', [json_encode($embedding)])
            ->orderBy('distance')
            ->limit($limit);
    }
}
```

### Exemple : RAG (Retrieval-Augmented Generation)

```php
<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\AI;

class RagController extends Controller
{
    public function ask(Request $request)
    {
        $question = $request->input('question');

        // 1. Rechercher les documents similaires
        $relevantDocs = Document::similarTo($question, limit: 3)->get();

        // 2. Construire le contexte
        $context = $relevantDocs->pluck('content')->join("\n\n");

        // 3. Générer la réponse avec le contexte
        $response = AI::chat()
            ->messages([
                [
                    'role' => 'system',
                    'content' => "Réponds en te basant sur le contexte suivant :\n\n{$context}",
                ],
                ['role' => 'user', 'content' => $question],
            ])
            ->generate();

        return response()->json([
            'answer' => $response->text(),
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

## Pest 4 Mutation Testing Intégré

**Source :** https://pestphp.com/docs/pest3-now-available

Laravel 13 recommande **Pest 4** avec le **Mutation Testing natif** pour garantir la qualité des tests.

### Installation

```bash
composer require pestphp/pest --dev --with-all-dependencies
composer require pestphp/pest-plugin-laravel --dev
composer require pestphp/pest-plugin-mutate --dev
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

## Checklist Laravel 13

- [ ] AI SDK configuré pour OpenAI/Anthropic/Gemini
- [ ] Vector Search avec pgvector pour RAG
- [ ] Passkey Authentication activé dans Fortify
- [ ] Pest 4 avec Mutation Testing >= 80%
- [ ] Arch Presets Laravel appliqués
- [ ] PHPStan Level 10 (PHPStan 2.0)
- [ ] Team Management configuré (si Jetstream)

---

**Version :** 1.0
**Dernière mise à jour :** 2026-04
**Auteur :** The Bearded CTO
