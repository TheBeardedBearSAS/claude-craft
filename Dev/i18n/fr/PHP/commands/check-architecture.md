---
description: Audit Architecture PHP
argument-hint: [arguments]
---

# Audit Architecture PHP

## Arguments

$ARGUMENTS (optionnel : chemin du projet PHP à auditer, répertoire courant par défaut)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Tu es un architecte logiciel expert PHP. Audite l'architecture d'un projet PHP natif (sans framework) selon les principes de Clean Architecture, Architecture Hexagonale, patterns tactiques DDD et règles d'autoloading PSR-4.

**Règles de référence** : `.claude/rules/php-architecture.md`

### Étape 1 : Analyse de la Structure du Projet

1. Identifier la racine du projet (utiliser $ARGUMENTS ou le répertoire courant)
2. Lire `composer.json` — vérifier la version PHP (≥ 8.4, idéalement 8.5) et le mapping PSR-4
3. Cartographier la structure de `src/` et les couches attendues
4. Lister tous les namespaces de premier niveau

**Structure attendue** (PHP natif) :

```
src/
├── Domain/              # Logique métier pure (Entities, Value Objects, Domain Events)
│   ├── Entity/
│   ├── ValueObject/
│   ├── Event/
│   └── Exception/
├── Application/         # Use Cases / Commands / Queries, orchestration
│   ├── UseCase/
│   ├── DTO/
│   └── Port/            # Interfaces consommées par Application
└── Infrastructure/      # Adapters (DB, HTTP, filesystem, APIs externes)
    ├── Persistence/
    ├── Http/
    └── Adapter/
tests/
├── Unit/
├── Integration/
└── Fixtures/
```

### Étape 2 : Séparation des Couches (6 pts)

- [ ] Le Domain n'a **aucune** dépendance sur Application ou Infrastructure
- [ ] L'Application dépend **uniquement** des abstractions du Domain (interfaces/ports)
- [ ] L'Infrastructure implémente les ports du Domain/Application, jamais l'inverse
- [ ] Aucun code framework ne fuit dans le Domain
- [ ] `declare(strict_types=1);` en tête de chaque fichier

**Commande de détection** :

```bash
docker compose exec app grep -rn "use.*Infrastructure" src/Domain/ src/Application/
# Attendu : aucune correspondance
```

### Étape 3 : Ports et Adapters (5 pts)

- [ ] Ports entrants (interfaces) définis dans `Application/Port/In/` ou équivalent
- [ ] Ports sortants définis dans `Application/Port/Out/` ou `Domain/Port/`
- [ ] Les adapters de `Infrastructure/` implémentent ces ports
- [ ] Injection de dépendance par constructeur (pas de service locator, pas d'état statique)

### Étape 4 : Modélisation Domain (5 pts)

- [ ] Les Entities ont une identité et des invariants appliqués dans les constructeurs / named constructors
- [ ] Les Value Objects sont immuables (classes `readonly` PHP 8.2+, ou propriétés readonly)
- [ ] Les Aggregates encapsulent les invariants ; mutation externe impossible
- [ ] Domain events émis pour les changements d'état pertinents
- [ ] Exceptions spécifiques au domaine (héritent d'une base `DomainException`)

### Étape 5 : Use Cases (4 pts)

- [ ] Un use case = une classe avec une seule méthode publique (`execute()`, `handle()`, ou `__invoke()`)
- [ ] Entrée sous forme de DTO / Command / Query dédié
- [ ] Sortie sous forme de DTO de retour ou void (pour les commands)
- [ ] Frontières transactionnelles gérées au niveau Application, pas Domain

### Étape 6 : PSR-4 & Règles de Dépendances (3 pts)

- [ ] L'autoload de `composer.json` est conforme PSR-4
- [ ] Les namespaces correspondent exactement à la structure de dossiers
- [ ] Aucune dépendance circulaire (`deptrac` ou `phparkitect` pour vérifier)
- [ ] Couplage entre modules explicite et documenté

**Commande de détection** :

```bash
docker compose exec app composer dump-autoload --strict-psr
docker compose exec app vendor/bin/deptrac analyse --fail-on-uncovered
```

### Étape 7 : Patterns Alternatifs (2 pts)

Accepter les alternatives pragmatiques quand justifiées :

| Pattern | Quand c'est acceptable |
|---|---|
| **Vertical Slice Architecture** | Petite app, majoritairement CRUD, pas de réutilisation inter-features |
| **Modular Monolith** | Plusieurs bounded contexts dans un seul déployable |
| **Layered simple** | Domaine trivial — ne pas sur-ingénierer |

Signaler la sur-ingénierie (abstractions vides, mapping DTO excessif) comme un problème.

## FORMAT DE SORTIE

```
AUDIT ARCHITECTURE PHP
======================

SCORE : XX/25

SÉPARATION DES COUCHES (X/6)
  Points forts :
  - [...]
  Problèmes :
  - [fichier:ligne] description

PORTS & ADAPTERS (X/5)
  [...]

MODÉLISATION DOMAIN (X/5)
  [...]

USE CASES (X/4)
  [...]

PSR-4 & RÈGLES DE DÉPENDANCES (X/3)
  [...]

ADÉQUATION DU PATTERN (X/2)
  [...]

TOP 3 ACTIONS :
1. [CRITIQUE] Description
   Fichiers : src/...
   Effort : Faible/Moyen/Élevé
2. [...]
3. [...]

PATTERN RECOMMANDÉ : [Clean / Hexagonal / VSA / Modular Monolith]
```

## NOTES IMPORTANTES

- Utiliser Docker pour tous les outils d'analyse (`composer`, `deptrac`, `phparkitect`)
- Citer des références `fichier:ligne` concrètes pour chaque problème
- Ne pas imposer la Clean Architecture si le domaine est trivial — favoriser le pragmatisme
- Signaler immédiatement les fuites de framework (un projet PHP natif ne doit pas dépendre de classes Symfony/Laravel)
