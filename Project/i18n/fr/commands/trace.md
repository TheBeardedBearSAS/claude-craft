---
name: trace
description: "Matrice de traçabilité bidirectionnelle (exigence → story → code → tests) ; --gaps liste les exigences non couvertes, --by-priority regroupe par priorité MoSCoW"
argument-hint: "[all|requirement|story|code] [ID] [--gaps] [--by-priority] [--level=story|code|test|all] [--format=table|mermaid|json]"
---

# /project:trace

## Mission

Relier chaque exigence du PRD aux user stories, au code et aux tests. La vue par défaut est la matrice bidirectionnelle complète ; `--gaps` la transforme en rapport de couverture qui ne liste que ce qui n'est pas couvert (c'est l'ancienne commande `/project:trace --gaps`) ; `--by-priority` regroupe le résultat par priorité MoSCoW.

## Utilisation

| Invocation | Effet | Remplace |
|------------|-------|----------|
| `/project:trace` ou `/project:trace all` | Matrice complète : exigence → story → code → tests | `/project:trace` |
| `/project:trace requirement FR-001` | Trace une exigence vers le bas | `/project:trace --scope requirement --id FR-001` |
| `/project:trace story US-001` | Trace une story vers le haut (exigences) et vers le bas (code, tests) | `/project:trace --scope story` |
| `/project:trace code` | Fichiers de code avec et sans référence à une story | `/project:trace --scope code` |
| `/project:trace --gaps` | Rapport de couverture : exigences non couvertes par des stories, du code ou des tests, avec actions recommandées | `/project:trace --gaps` |
| `/project:trace --gaps --level test` | Idem, limité à un niveau de couverture (`story`, `code`, `test`, `all` ; défaut `all`) | `/project:trace --gaps --level test` |
| `/project:trace --by-priority` | Regroupe exigences et pourcentages de couverture par priorité MoSCoW | nouveau (section de coverage-map auparavant) |

Les options se combinent : `/project:trace --gaps --by-priority` produit le rapport de couverture avec la ventilation par priorité.

## Arguments

Analyser `$ARGUMENTS` :
- Premier argument positionnel parmi `all|requirement|story|code` → périmètre (défaut `all`).
- Argument positionnel suivant correspondant à `FR-\d+` ou `US-\d+` → ID à tracer (nécessaire pour `requirement` et `story`).
- `--gaps` → mode couverture. `--level` n'est lu que dans ce mode.
- `--by-priority` → regroupement par priorité : P0 = Must have, P1 = Should have, P2 = Could have / Nice to have.
- `--format` → `table` (défaut), `mermaid`, `json`.

## Prérequis

- `project-management/prd.md` existe avec des identifiants d'exigences FR-xxx
- `project-management/backlog/` contient des user stories avec des références `Implements:`
- Base de code avec des commentaires `// Story: US-xxx` ou `# Story: US-xxx` (optionnel pour `--gaps --level story`)
- Fichiers de tests avec des références aux stories/exigences

## Plan Mode

> **Le Plan Mode est obligatoire.** Avant l'exécution, Claude active le Plan Mode pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Scans partagés

Les deux modes exécutent une seule fois les mêmes quatre scans ; les résultats alimentent soit la matrice, soit le rapport de couverture. Le **statut** d'une story provient toujours de `.bmad/sprint-status.yaml` (source unique de vérité) ; les fichiers markdown ne fournissent que le contenu.

### Scan 1 : Exigences

1. Lire `project-management/prd.md`
2. Extraire tous les identifiants FR-xxx de la section des exigences fonctionnelles
3. Enregistrer le texte, la priorité (P0/P1/P2) et les critères d'acceptation
4. Registre : `{FR-001: {text, priority}}` ; compter les exigences par priorité

### Scan 2 : User stories

1. Parcourir `project-management/backlog/` à la recherche de `US-*.md` (ou de fichiers `user-stories/`)
2. Dans chaque story, lire la ligne `Implements:` ou la section `Traceability`
3. Correspondance : `{US-001: [FR-001, FR-003]}` ; lire le statut et le sprint dans `.bmad/sprint-status.yaml`
4. Une exigence qu'aucune story ne référence est « No Story »

### Scan 3 : Code

1. Rechercher dans le code `// Story: US-xxx`, `# Story: US-xxx`, `@story US-xxx`
2. Correspondance avec fichier et ligne : `{US-001: [src/Service/OrderService.php:42]}`
3. Une story sans référence est « No Code » ; lister les fichiers de code sans référence à une story

### Scan 4 : Tests

1. Rechercher dans les répertoires de tests les références `US-xxx` / `FR-xxx` et examiner les noms de tests
2. Correspondance : `{US-001: [tests/OrderServiceTest.php]}`
3. Une story avec du code mais sans référence de test est « No Tests »

```
╔══════════════════════════════════════════════════════════╗
║ Requirements: {n} | Stories: {n} | Files: {n} | Tests: {n}║
╚══════════════════════════════════════════════════════════╝
```

## Mode matrice (défaut)

Combiner les quatre correspondances. Sortie (format table) :

```
Bidirectional Traceability Matrix
=================================

FR-001 (P0) User Authentication
  ├── US-001: Login with email/password
  │   ├── src/Service/AuthService.php:25
  │   ├── tests/AuthServiceTest.php ✅
  │   └── tests/AuthControllerTest.php ✅
  └── US-002: Password reset flow
      ├── src/Service/PasswordResetService.php:10
      └── tests/PasswordResetServiceTest.php ✅

FR-002 (P0) User Registration
  └── US-003: Register with email
      ├── src/Service/RegistrationService.php:12
      └── ⚠️ NO TESTS

FR-010 (P1) Export to CSV
  └── ⚠️ NO STORIES

Coverage Summary
================
| Level | Covered | Total | Percentage |
|-------|---------|-------|------------|
| Requirements → Stories | 8 | 10 | 80% |
| Stories → Code | 7 | 8 | 87% |
| Stories → Tests | 6 | 8 | 75% |
| End-to-End (FR → Test) | 6 | 10 | 60% |

Gaps Identified
===============
| Type | ID | Description | Action Needed |
|------|----|-------------|---------------|
| No Stories | FR-010 | Export to CSV | Create user story |
| No Tests | US-003 | Register with email | Add test coverage |
```

Avec un ID, seule cette branche est affichée, avec le statut de la story et le nombre de tests (par ex. `US-001: Login [Done]`, `tests/AuthServiceTest.php ✅ (12 tests)`), puis `Status: Fully covered (2/2 stories, 3/3 code files, 3/3 test files)`.

### Mermaid (`--format mermaid`)

`graph LR` avec quatre sous-graphes (Requirements, Stories, Code, Tests) ; flèches pleines pour les liens, flèches pointillées (`-.->|NO STORY|`) vers un nœud d'écart pour les liens manquants ; écarts stylés `fill:#ff6b6b`.

### JSON (`--format json`)

```json
{
  "generated_at": "2026-02-19T10:00:00Z",
  "requirements": {"FR-001": {"text": "User Authentication", "priority": "P0", "stories": ["US-001"], "covered": true}},
  "stories": {"US-001": {"title": "Login", "implements": ["FR-001"], "code_files": ["src/Service/AuthService.php"], "test_files": ["tests/AuthServiceTest.php"], "covered": true}},
  "coverage": {"requirements_to_stories": 0.80, "stories_to_code": 0.87, "stories_to_tests": 0.75, "end_to_end": 0.60},
  "gaps": [{"type": "no_stories", "id": "FR-010", "description": "Export to CSV"}]
}
```

## Mode écarts (`--gaps`)

Réutilise les scans partagés, calcule la couverture par couche et ne liste que ce qui manque. `--level` restreint les couches calculées : `story` (scans 1-2), `code` (1-3), `test` (1-4), `all` (défaut).

```
Requirement Coverage Map
========================
| Layer | Covered | Total | Coverage | Status |
|-------|---------|-------|----------|--------|
| Stories | 8 | 10 | 80% | ⚠️ |
| Code | 7 | 8 | 87% | ⚠️ |
| Tests | 6 | 8 | 75% | ❌ |
| End-to-End | 6 | 10 | 60% | ❌ |

Uncovered Requirements
| ID | Requirement | Priority | Missing |
|----|-------------|----------|---------|
| FR-005 | Bulk export | P0 | Tests |
| FR-010 | CSV import | P1 | Story, Code, Tests |

Recommended Actions
1. 🔴 CRITICAL: FR-005 (P0) a du code mais pas de tests — ajouter la couverture de tests
2. ⚠️ HIGH: FR-010 (P1) n'a pas de story — créer une user story
3. 📝 LOW: FR-020 (P2) non démarrée — à planifier dans de futurs sprints

Next Commands
- /project:trace requirement FR-005   → trace détaillée d'une exigence
- /project:backlog add story         → créer les user stories manquantes
- /project:generate-backlog          → régénérer le backlog avec les écarts
```

Avec `--level test`, afficher une ligne par story : `US-003 | ❌ | 0 files | 0 tests` et l'action (par ex. « Créer tests/RegistrationServiceTest.php »).

Mermaid (`--format mermaid`) : `graph TD` avec un sous-graphe par priorité ; nœuds `FR-001 ✅`, `FR-005 ⚠️ No Tests`, `FR-010 ❌ No Story` ; styles `#4caf50` (couvert), `#ff9800` (partiel), `#f44336` (manquant).

### Seuils de couverture

| Seuil | Statut | Action |
|-------|--------|--------|
| >= 90% | ✅ Excellent | Maintenir |
| 80-89% | ⚠️ Bon | Examiner les écarts |
| 60-79% | ⚠️ À améliorer | Prioriser la couverture |
| < 60% | ❌ Critique | Action immédiate requise |

## Regroupement par priorité (`--by-priority`)

Fonctionne dans les deux modes. En mode matrice, les exigences sont listées sous les titres `P0 Must have`, `P1 Should have`, `P2 Could have`. En mode écarts, ajouter :

```
Coverage by Priority
| Priority | Requirements | Story Coverage | Code Coverage | Test Coverage |
|----------|-------------|----------------|---------------|---------------|
| P0 (Must Have) | 5 | 100% ✅ | 100% ✅ | 80% ⚠️ |
| P1 (Should Have) | 3 | 66% ⚠️ | 50% ❌ | 33% ❌ |
| P2 (Could Have) | 2 | 0% ❌ | 0% ❌ | 0% ❌ |
```

Les actions recommandées sont alors ordonnées en commençant par P0.

## Exemple de session

```
User: /project:trace
Claude: 10 exigences trouvées (5 P0, 3 P1, 2 P2), 8 stories, 24 fichiers de code, 18 fichiers de tests.
        [matrice complète] Couverture : 60% de bout en bout

User: /project:trace requirement FR-001
Claude: [branche FR-001 uniquement]

User: /project:trace --gaps --by-priority
Claude: [rapport de couverture avec tableau par priorité, 2 exigences P0 demandent de l'attention]
```

## Commandes associées

- `/project:generate-prd` - Générer le PRD avec des identifiants d'exigences
- `/project:generate-backlog` - Créer le backlog à partir du PRD
- `/project:generate-tech-spec` - Générer la spécification technique
- `/project:migrate --stories` - Ajouter les champs manquants (comme `Implements:`) aux stories
