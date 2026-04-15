---
title: "Build a Symfony feature with `/team:delivery` in 3 hours (end-to-end)"
publishedAt: ""
canonical: ""
tags: ["symfony", "ai", "ddd", "pest", "claude-code"]
status: DRAFT
author: Flavien Métivier
wordCount: ~2000
---

# Build a Symfony feature with `/team:delivery` in 3 hours

**TL;DR** : je livre une feature Symfony (CRUD + Pest tests + migration Doctrine) en 3h chrono avec Claude Craft. Détails, pièges, métriques.

## Le cahier des charges

**User story** : "En tant que PM, je veux voir la liste des sessions de test QA filtrable par scope et statut, pour analyser la qualité des sprints."

**Contraintes projet** :
- Symfony 8.0 + PHP 8.4
- Clean Architecture (DDD, hexagonal)
- Pest 4 (browser testing)
- Doctrine + API Platform
- Coverage ≥ 80%

## Étape 1 — Plan (15 min)

```bash
/workflow:plan
```

Le PO agent rédige la story :

```markdown
## US-101 — Filtrable QA sessions list

**As a** Product Manager
**I want** to list QA sessions filtered by scope and status
**So that** I can analyze sprint quality

### Acceptance Criteria

- [ ] GET /api/qa-sessions returns paginated list
- [ ] Filter by scope (story|sprint|regression)
- [ ] Filter by status (passed|failed|running|aborted)
- [ ] Sort by createdAt DESC by default
- [ ] Pagination 20 items/page
- [ ] Auth required (JWT)
```

INVEST score : 6/6.

## Étape 2 — Design (45 min)

```bash
/workflow:design
```

L'agent `@symfony-reviewer` propose :

- **Domain** :
  - `QaSession` aggregate root
  - `QaSessionStatus` value object
  - `QaScope` value object
- **Application** :
  - `ListQaSessionsQuery` (CQRS, rule 21)
  - `ListQaSessionsHandler`
- **Infrastructure** :
  - `DoctrineQaSessionRepository`
  - `QaSessionController` (API Platform State Provider)

Tech spec compliance : 94%.

## Étape 3 — Red (45 min)

```bash
/symfony:check-testing --generate US-101
```

Génère les tests Pest :

```php
// tests/Feature/QaSessions/ListQaSessionsTest.php
it('lists QA sessions filtered by scope', function () {
    // Arrange
    QaSession::factory()->create(['scope' => 'story']);
    QaSession::factory()->create(['scope' => 'sprint']);

    // Act
    $response = $this->getJson('/api/qa-sessions?scope=story', [
        'Authorization' => "Bearer {$this->jwt}",
    ]);

    // Assert
    $response->assertOk();
    $response->assertJsonCount(1, 'data');
    $response->assertJsonPath('data.0.scope', 'story');
});

it('returns 401 without auth', function () {
    $this->getJson('/api/qa-sessions')->assertStatus(401);
});

it('paginates 20 items per page', function () {
    QaSession::factory()->count(25)->create();

    $response = $this->getJson('/api/qa-sessions?page=1', [
        'Authorization' => "Bearer {$this->jwt}",
    ]);

    $response->assertJsonCount(20, 'data');
    $response->assertJsonPath('meta.total', 25);
});
```

Lancer : `docker compose exec app ./vendor/bin/pest` → **tests rouges** (implémentation vide). ✓

## Étape 4 — Green (60 min)

```bash
/team:delivery --story=US-101
```

Multi-agent parallèle :

- `@tech-lead` : valide architecture
- `@symfony-reviewer` : génère migration + entités + repo
- `@api-designer` : génère State Provider API Platform
- `@tdd-coach` : boucle red-green-refactor jusqu'à tests verts

Durée : 45 min wall-clock. L'équipe multi-agent évite l'allez-retour humain "prompt → code → relecture → prompt".

Livrables :

```
src/
├── Domain/Qa/
│   ├── QaSession.php
│   ├── QaSessionId.php
│   ├── QaSessionStatus.php  (VO)
│   └── QaScope.php           (VO)
├── Application/Qa/
│   ├── ListQaSessions/
│   │   ├── ListQaSessionsQuery.php
│   │   └── ListQaSessionsHandler.php
├── Infrastructure/
│   ├── Persistence/DoctrineQaSessionRepository.php
│   └── Api/QaSessionStateProvider.php
└── migrations/
    └── Version20260415120000.php
```

Tests verts. Coverage : 87% sur le module.

## Étape 5 — Refactor + Review (30 min)

```bash
/symfony:check-architecture
/symfony:check-security
/symfony:check-compliance
```

Remonte :
- 1 warning : méthode `ListQaSessionsHandler::handle` à 22 lignes → extraire mapping (rule 05 KISS)
- 1 security : filter `status` injecté sans validation enum → refactor VO

Corrections en 15 min. Re-run tests, re-run mutation testing via `/symfony:check-testing --mutation` → **81% mutation score**.

## Étape 6 — PR (5 min)

```bash
/git-workflow
```

- Branche `feature/us-101-qa-sessions-list` pushée
- Conventional commit : `feat(qa): list QA sessions with scope/status filters (US-101)`
- PR ouverte avec template auto-rempli (lien story, checklist DoD, screenshots)

## Métriques finales

| Étape | Temps humain | Temps agent |
|---|---|---|
| Plan | 5 min | 15 min |
| Design | 10 min | 45 min |
| Red | 10 min | 45 min |
| Green | 15 min | 60 min |
| Refactor | 15 min | 15 min |
| PR | 5 min | 0 |
| **Total** | **1h** | **3h wall-clock** |

Sans Claude Craft, même feature : ~8h humain solo, ~12h en équipe.

## Les pièges

### 1. Laisser l'agent décider du découpage DDD

Dangereux. Le domaine est **business**. J'interviens toujours sur le découpage aggregates/VO (5 min suffisent).

### 2. Skipper le mutation testing

Coverage 87% sans mutation testing = faux sentiment de sécurité. `/symfony:check-testing --mutation` est non négociable avant merge.

### 3. Générer API Platform sans révision sécu

API Platform expose par défaut. Toujours `/symfony:check-security` avant PR.

## Conclusion

`/team:delivery` n'est pas magique. C'est un orchestrateur qui parallélise les agents et enforce les règles (SOLID, OWASP, coverage). La qualité finale dépend du cadre posé en amont (Plan + Design phase).

---

*Essayer :*
```bash
npx @the-bearded-bear/claude-craft install . --tech=symfony
/workflow:init
/workflow:plan
```
