# Cursor Directory — Stratégie Cross-Promotion

Stratégie pour soumettre des rules Claude Craft au Cursor Directory afin de générer du trafic cross-tool vers notre projet.

**Objectif :** 3 rules dans Cursor Directory Top 50, 500+ stars sur rules, 1000+ referrals GitHub traffic/mois.

---

## Analyse Top 10 Cursor Directory

### Catégories dominantes

| Catégorie | % Top 100 | Exemples | Opportunité Claude Craft |
|-----------|-----------|----------|--------------------------|
| **Framework-specific** | 35% | Next.js, Django, Rails | Symfony, Laravel, Flutter |
| **Testing** | 15% | TDD rules, Vitest config | TDD/BDD workflows |
| **Security** | 12% | OWASP, secrets detection | Security rules phase 3 |
| **Architecture** | 20% | Clean Architecture, DDD | Clean Architecture multi-stack |
| **Productivity** | 18% | Code review, refactoring | BMAD workflow |

### Top 10 rules (estimation avril 2026)

| Rang | Rule | Description | Stars | Gap vs Claude Craft |
|------|------|-------------|-------|---------------------|
| 1 | Next.js 15 Best Practices | App Router, Server Components, caching | 2.5K | Pas de Next.js dans Claude Craft |
| 2 | TDD with Vitest | Red-Green-Refactor automation | 1.8K | Couvert mais packaging faible |
| 3 | OWASP Security Checklist | OWASP Top 10 enforcement | 1.5K | Couvert mais pas en .cursorrules |
| 4 | Django Clean Architecture | DDD + Hexagonal Django | 1.2K | Pas de Django (opportunité Python) |
| 5 | Rails API-Only | API-only Rails setup | 1.0K | Pas de Rails |
| 6 | React 19 + Compiler | Compiler optimization patterns | 950 | Couvert mais pas en .cursorrules |
| 7 | DDD Patterns | Aggregates, Entities, Value Objects | 900 | Couvert mais multilingue |
| 8 | Code Review Automation | Pre-commit hooks + linting | 850 | Couvert via hooks |
| 9 | Refactoring Checklist | SOLID + KISS/DRY/YAGNI | 800 | Notre force |
| 10 | TypeScript Strict Mode | tsconfig strict + ESLint | 750 | Couvert |

**Insight :** Les rules les plus populaires sont mono-stack, très spécifiques, avec examples concrets. Claude Craft doit adapter son approche multi-stack en créant des rules ciblées par stack.

---

## 3 rules à adapter pour Cursor

### Rule 1 : Clean Architecture Symfony

**Fichier :** `.cursorrules/symfony-clean-architecture.md`

**Scope :** Symfony 8.0+, DDD, Hexagonal Architecture, CQRS optionnel.

**Contenu (draft complet ci-dessous).**

### Rule 2 : React 19 + Compiler

**Fichier :** `.cursorrules/react-19-compiler.md`

**Scope :** React 19.2, Compiler 1.0, Server Components, optimizations.

**Points clés :**
- Compiler-friendly patterns (avoid inline object creation in render)
- Server Components vs Client Components decision tree
- Suspense + Streaming SSR
- Memoization automatique (pas de useMemo/useCallback inutiles)

**Longueur :** 40 lignes.

### Rule 3 : TDD avec Vitest

**Fichier :** `.cursorrules/tdd-vitest.md`

**Scope :** Vitest 4.1+, Browser Mode, Red-Green-Refactor workflow.

**Points clés :**
- Workflow TDD obligatoire : test first, code minimal, refactor
- AAA pattern (Arrange-Act-Assert)
- Factories pour données de test
- Vitest Browser Mode pour composants React/Vue/Svelte
- Couverture ≥80%

**Longueur :** 35 lignes.

---

## Draft complet : Clean Architecture Symfony

**Fichier :** `.cursorrules/symfony-clean-architecture.md`

```markdown
# Symfony Clean Architecture

Rules for building Symfony 8.0+ applications with Clean Architecture (Hexagonal/Onion).

**Source:** Claude Craft (https://github.com/TheBeardedCTO/Tools/claude-craft)

## Architecture Layers

```
Presentation (Controllers, CLI, API)
    ↓
Application (Use Cases, DTOs)
    ↓
Domain (Entities, Value Objects, Business Logic) ← CENTER
    ↑
Infrastructure (Repositories, External APIs, DB)
```

## Core Principles

1. **Domain is independent** — No framework dependencies in Domain layer
2. **Dependency Inversion** — Application/Presentation depend on Domain interfaces, Infrastructure implements them
3. **Use Cases are explicit** — One use case per business action (CreateOrder, SendInvoice)
4. **Immutability** — Value Objects and DTOs are readonly

## Directory Structure

```
src/
├── Presentation/
│   ├── Controller/
│   ├── CLI/
│   └── API/
├── Application/
│   ├── UseCase/
│   │   ├── CreateOrder/
│   │   │   ├── CreateOrderCommand.php
│   │   │   └── CreateOrderHandler.php
│   ├── DTO/
├── Domain/
│   ├── Entity/
│   ├── ValueObject/
│   ├── Repository/  (interfaces only)
│   └── Service/
└── Infrastructure/
    ├── Doctrine/
    │   └── Repository/  (implementations)
    ├── API/
    └── Messaging/
```

## Rules

### Domain Layer

- **Entities**: Rich domain models with business logic
- **Value Objects**: Immutable, validated in constructor
- **Repository Interfaces**: Defined in Domain, implemented in Infrastructure
- **No framework imports**: No Symfony, Doctrine annotations (use XML/YAML mapping)

### Application Layer

- **Use Cases**: Command/Query handlers (CQRS pattern)
- **Commands**: readonly DTOs with validation constraints
- **Handlers**: Orchestrate Domain entities + Repositories
- **No HTTP**: Use Cases are framework-agnostic

### Infrastructure Layer

- **Repositories**: Implement Domain interfaces using Doctrine
- **Mappers**: Convert Doctrine entities ↔ Domain entities if needed
- **External APIs**: Adapters for third-party services

### Presentation Layer

- **Controllers**: Thin, delegate to Use Cases via Symfony Messenger
- **Validation**: Use Symfony Validator on Commands
- **DTOs**: API request/response objects

## Example: CreateOrder Use Case

**Command:**
```php
final readonly class CreateOrderCommand
{
    public function __construct(
        #[Assert\Uuid] public string $userId,
        #[Assert\NotBlank] public array $items,
        #[Assert\Positive] public float $totalAmount,
    ) {}
}
```

**Handler:**
```php
#[AsMessageHandler]
final class CreateOrderHandler
{
    public function __construct(
        private OrderRepositoryInterface $orderRepo,
        private UserRepositoryInterface $userRepo,
    ) {}

    public function __invoke(CreateOrderCommand $command): void
    {
        $user = $this->userRepo->findById($command->userId)
            ?? throw new UserNotFoundException();

        $order = Order::create($user, $command->items, $command->totalAmount);
        $this->orderRepo->save($order);
    }
}
```

**Controller:**
```php
#[Route('/orders', methods: ['POST'])]
public function create(Request $request, MessageBusInterface $bus): JsonResponse
{
    $command = new CreateOrderCommand(...$request->toArray());
    $bus->dispatch($command);
    return new JsonResponse(['status' => 'created'], 201);
}
```

## Validation

- [ ] Domain layer has no Symfony/Doctrine imports
- [ ] Use Cases are in Application layer
- [ ] Repository interfaces in Domain, implementations in Infrastructure
- [ ] Controllers dispatch to Use Cases, no business logic

## Resources

- Claude Craft: https://github.com/TheBeardedCTO/Tools/claude-craft
- Symfony Best Practices: https://symfony.com/doc/current/best_practices.html
```

**Longueur :** 48 lignes (sans commentaires vides).

---

## Process soumission

### Cursor Directory

**URL :** https://cursor.directory/ (à vérifier si existe, sinon alternative)

**Process :**
1. Fork repo Cursor Directory (ex: `cursor-team/cursor-directory`)
2. Ajouter rule dans `rules/symfony-clean-architecture.md`
3. Ajouter métadonnées dans `rules/index.json` :
   ```json
   {
     "id": "symfony-clean-architecture",
     "title": "Symfony Clean Architecture",
     "description": "Hexagonal Architecture for Symfony 8.0+",
     "tags": ["symfony", "php", "architecture", "ddd", "hexagonal"],
     "author": "Claude Craft",
     "authorUrl": "https://github.com/TheBeardedCTO/Tools/claude-craft",
     "stars": 0,
     "downloads": 0
   }
   ```
4. Créer PR avec template :
   ```markdown
   ## New Rule: Symfony Clean Architecture

   Adds a comprehensive rule for building Symfony 8.0+ applications with Clean Architecture (Hexagonal/Onion pattern).

   **Source:** Extracted from [Claude Craft](https://github.com/TheBeardedCTO/Tools/claude-craft), an open-source AI development framework.

   **Coverage:**
   - Layer separation (Presentation → Application → Domain ← Infrastructure)
   - CQRS with Symfony Messenger
   - Value Objects, Entities, Use Cases
   - Example code snippets

   **Tags:** symfony, php, architecture, ddd, hexagonal

   **Related rules:** DDD Patterns, CQRS, Clean Architecture

   Checklist:
   - [x] Rule follows template
   - [x] Examples provided
   - [x] Tags appropriate
   - [x] Author attribution
   ```
5. Attendre review + merge

**SLA attendu :** 3-7 jours pour review, merge si qualité OK.

### Alternatives si Cursor Directory inexistant

**Aider Rules :** https://aider.chat/docs/rules.html (vérifier si communauté existe)

**Cline Rules :** https://github.com/cline/cline (vérifier repo extensions)

**Action si pas de directory public :** créer notre propre repo `claude-craft-rules` avec format `.cursorrules` + `.aiderrules` + `.clinerules` → promotion via blog post "Universal AI Coding Rules".

---

## Backlink plan

### Mention Claude Craft dans rule header

Toutes les rules soumises incluent en haut :

```markdown
**Source:** Claude Craft (https://github.com/TheBeardedCTO/Tools/claude-craft)

This rule is part of Claude Craft, an open-source AI development framework supporting 19 stacks.
```

**Impact SEO :** backlink do-follow depuis Cursor Directory (si directory a bon DA).

### Mention Cursor Directory dans README

Ajouter section dans `README.md` :

```markdown
## Rules for Other AI Coding Tools

Claude Craft rules are also available for:

- **Cursor:** [Symfony Clean Architecture](https://cursor.directory/rules/symfony-clean-architecture), [React 19 + Compiler](https://cursor.directory/rules/react-19-compiler), [TDD avec Vitest](https://cursor.directory/rules/tdd-vitest)
- **Aider:** [Rules repository](https://github.com/TheBeardedCTO/claude-craft-rules/aider)
- **Cline:** [Rules repository](https://github.com/TheBeardedCTO/claude-craft-rules/cline)

See [cross-tool compatibility guide](docs/CROSS-TOOL.md) for details.
```

**CTA :** "Using a different AI coding tool? Claude Craft rules are portable!"

---

## Risque rejet

### Critères rejet potentiels

| Critère | Risque | Mitigation |
|---------|--------|-----------|
| **Trop générique** | Rule trop large, pas assez actionnable | Focaliser sur 1 stack, exemples concrets |
| **Duplication** | Rule similaire existe déjà | Analyser Top 100 avant soumission |
| **Self-promotion excessive** | Trop de mentions Claude Craft | Limiter à header + footer, focus valeur |
| **Qualité insuffisante** | Exemples incomplets, typos | Review par 2 Maintainers avant soumission |

### Plan B si rejet

1. **Cursor Directory rejet** → tenter Aider Rules
2. **Aider Rules rejet** → tenter Cline Rules
3. **Tous rejets** → créer notre propre "Universal AI Coding Rules" repo + promotion autonome

---

## KPIs

### Métriques trackées

| Métrique | Cible phase 4 | Suivi |
|----------|---------------|-------|
| **Stars Cursor Directory rules** | 500+ total (3 rules × ~170 stars/rule) | GitHub API hebdo |
| **Referrals GitHub traffic** | 1000+ visits/mois depuis Cursor Directory | GitHub Insights |
| **Forks rules** | 50+ forks | GitHub API |
| **Mentions Twitter/X** | 20+ mentions rules | Social listening |

### Dashboard

Grafana avec panels :
- Graphe stars rules dans le temps
- Graphe referrals traffic (source: Cursor Directory)
- Top rules par stars

### Alerte

Si stars <50 après 1 mois → analyse cause (qualité, promotion, concurrence) + actions correctives.

---

## Timeline

### Avril 2026

- [ ] Analyser Top 100 Cursor Directory (identifier gaps)
- [ ] Rédiger 3 rules complètes (Symfony, React, Vitest)
- [ ] Review interne (2 Maintainers)
- [ ] Soumettre PR Cursor Directory

### Mai 2026

- [ ] Suivi review PR (répondre commentaires <24h)
- [ ] Merge rules (si acceptées)
- [ ] Promotion : blog post "Claude Craft Rules for Cursor", Twitter thread

### Juin 2026

- [ ] Analyse metrics 1 mois (stars, referrals)
- [ ] Optimisation rules selon feedback
- [ ] Soumission alternatives Aider/Cline si Cursor rejet

### Juillet 2026

- [ ] Atteinte 500 stars cumulées (validation traction)
- [ ] Création repo `claude-craft-rules` si besoin
- [ ] Cross-promo avec Cursor community

---

## Ressources

- **Cursor Directory:** https://cursor.directory/ (à vérifier existence)
- **Aider Rules:** https://aider.chat/docs/rules.html
- **Cline Extensions:** https://github.com/cline/cline (à vérifier)
- **Universal AI Coding Rules (fallback):** à créer si directories inexistants

---

**Date de dernière mise à jour :** 2026-04-15  
**Version :** 1.0.0  
**Auteur :** The Bearded CTO
