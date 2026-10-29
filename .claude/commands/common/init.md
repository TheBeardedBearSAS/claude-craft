---
description: "Bootstrap the Claude-Craft structure for a new project, or analyze the codebase and configure the project context (--context)"
argument-hint: "[--context [--auto|--full]]"
---

# /init - Bootstrap Claude-Craft Structure

Initialise la structure Claude-Craft pour un nouveau projet.

**$ARGUMENTS**

## Usage

| Mode / option | Ce que cela fait | Remplace |
|---------------|------------------|----------|
| `/common:init` | Amorce la structure Claude-Craft (technologie, `.claude/`, `project-context.md`) | — |
| `/common:init --context` | Analyse la codebase et configure `.claude/rules/00-project-context.md` de façon interactive | `/common:init --context` |
| `/common:init --context --auto` | Détection maximale, questions ignorées quand un défaut raisonnable existe | `/common:init --context --auto` |
| `/common:init --context --full` | Questionnaire complet (objectifs, dette technique, glossaire) | `/common:init --context --full` |

Sans `--context`, suivre les étapes ci-dessous. Avec `--context`, suivre la section « Mode `--context` » en fin de document.

## Étapes

### 1. Identifier la Technologie

Demander à l'utilisateur quelle technologie utiliser:
- **C# / .NET** - Clean Architecture, CQRS, MediatR
- **Symfony / PHP** - Clean Architecture, DDD, Hexagonal
- **Flutter / Dart** - Clean Architecture, BLoC/Riverpod

### 2. Créer la Structure

Selon la technologie choisie, créer:

```
.claude/
├── CLAUDE.md               # Quick reference (copie depuis template)
├── INDEX.md                # Index complet
└── references/
    └── [technology]/       # Références spécifiques
        └── project-context.md  # Personnalisé pour le projet
```

### 3. Personnaliser project-context.md

Demander les informations du projet:
- Nom du projet
- Description brève
- Entités principales
- Services externes
- Contraintes particulières

### 4. Templates par Technologie

#### C# / .NET

```markdown
# Claude-Craft - {{PROJECT_NAME}}

**Stack**: .NET 10 LTS, C# 14, Clean Architecture, CQRS, MediatR, EF Core, xUnit

## Quick Reference

See `@.claude/INDEX.md` for condensed checklists and patterns.

## Full Documentation

For detailed rules: `@.claude/references/csharp/`

## Available Commands

- `/csharp:check all` - Full compliance audit
- `/csharp:check architecture` - Architecture validation
- `/csharp:check code-quality` - Code quality analysis
- `/csharp:check testing` - Test coverage analysis
- `/csharp:check security` - Security audit (OWASP)
- `/csharp:generate-feature` - Generate CQRS feature

## Docker Requirement

Always use Docker for commands to abstract from local environment.
```

#### Symfony / PHP

```markdown
# Claude-Craft - {{PROJECT_NAME}}

**Stack**: PHP 8.5, Symfony 8.1, Clean Architecture, DDD, Doctrine ORM

## Quick Reference

See `@.claude/references/symfony/CLAUDE.md` for quick patterns.

## Full Documentation

For detailed rules: `@.claude/references/symfony/`

## Key Files

- `architecture.md` - Clean Architecture DDD
- `quality-tools.md` - PHPStan 2.x, Rector 2.x, Deptrac v4
- `json-streamer.md` - JSON Streamer Component
- `object-mapper.md` - ObjectMapper Component

## Docker Requirement

Always use Docker for commands to abstract from local environment.
```

#### Flutter / Dart

```markdown
# Claude-Craft - {{PROJECT_NAME}}

**Stack**: Flutter 3.47+, Dart 3.13+, Clean Architecture, Riverpod/BLoC

## Quick Reference

See `@.claude/references/flutter/CLAUDE.md` for quick patterns.

## Full Documentation

For detailed rules: `@.claude/references/flutter/`

## Key Files

- `wasm.md` - WebAssembly compilation
- `mcp-integration.md` - Model Context Protocol
- `web-performance-2026.md` - Web optimization

## Docker Requirement

Use Docker for CI/CD. Local dev with flutter CLI.
```

### 5. Vérification

Après création, afficher:
- Fichiers créés
- Prochaines étapes recommandées
- Commandes disponibles

## Exemple d'Utilisation

```
User: /init

Claude: Quelle technologie souhaitez-vous configurer?
- C# / .NET (Clean Architecture, CQRS)
- Symfony / PHP (DDD, Hexagonal)
- Flutter / Dart (BLoC/Riverpod)

User: Symfony

Claude: Parfait! Quelques questions:
1. Nom du projet?
2. Description brève?
3. Entités métier principales?

[... création des fichiers ...]

Structure créée avec succès!
- .claude/CLAUDE.md
- .claude/references/symfony/project-context.md

Prochaines étapes:
1. Personnaliser project-context.md avec vos entités
2. Consulter symfony/CLAUDE.md pour les patterns
3. Utiliser make quality pour vérifier le code
```

## Mode `--context` — Contexte projet

Configure `.claude/rules/00-project-context.md` en analysant la codebase puis en posant des questions ciblées.

### Phase 1 : Détection automatique

Analyser :

- **Configuration** : `package.json`, `composer.json`, `pubspec.yaml`, `requirements.txt` / `pyproject.toml`, `Cargo.toml`, `go.mod` (nom, dépendances, framework)
- **Environnement** : `.env`, `.env.example`, `config/`, `docker-compose.yml` (base de données, services, Redis…)
- **Structure** : `src/`, `lib/`, `app/`, `tests/`, `spec/`, `docs/`, `specifications/`, `.github/`, `.gitlab-ci.yml`
- **Domaine** : `src/Entity/`, `src/Domain/`, `lib/models/`, `lib/domain/`, `models/`, `schemas/`, `migrations/`

Afficher un tableau récapitulatif (nom du projet, langage, framework, base de données, tests, CI/CD), la structure détectée, la documentation trouvée et la liste de ce qui n'a pas été détecté (qui sera demandé).

### Phase 2 : Questions interactives

Ne poser que les informations NON détectées en phase 1. En mode `--auto`, ignorer les questions pour lesquelles un défaut raisonnable existe.

**Questions essentielles :**

1. **Type d'application** (si non détecté) : REST API, Web Application, Mobile App, CLI Tool, Library/Package, Monorepo
2. **Domaine métier** : E-commerce, SaaS Platform, FinTech, HealthTech, EdTech, Social/Community, Media/Content, IoT, autre
3. **Utilisateurs cibles** (2-3 personas) : rôle et objectif principal de l'utilisateur primaire, puis secondaire (optionnel)
4. **Conformité** : GDPR, HIPAA, PCI-DSS, SOC2, aucune

**Questions étendues** (mode `--full` uniquement) :

5. **Objectifs** : court terme (3-6 mois) et moyen terme (6-12 mois)
6. **Problèmes connus / dette technique** à documenter
7. **Glossaire** : termes métier clés à définir

### Phase 3 : Générer le fichier de contexte

Créer `.claude/rules/00-project-context.md` avec les sections suivantes (en-tête : « Auto-generated by `/common:init --context` on {DATE} ») :

| Section | Contenu |
|---------|---------|
| Plan Mode | Recommandation d'activer le plan mode avant de générer des artefacts |
| Overview | `{PROJECT_NAME}` est une application {TYPE} du domaine {DOMAIN}, description issue du README ou de l'utilisateur |
| Technical Stack | Langage, framework, base de données, cache, tests, CI/CD |
| Project Structure | Arborescence détectée |
| Business Domain | Concepts clés (entités détectées), bounded contexts si DDD |
| Users & Personas | Objectif, points de douleur et workflows clés par persona |
| Constraints | Conformité, cibles de performance (page < 3 s, API < 200 ms, disponibilité 99,9 %), exigences de sécurité (OWASP Top 10, validation des entrées, authentification) |
| Goals | Court et moyen terme (ou placeholder) |
| Known Issues / Technical Debt | Problèmes connus (ou placeholder) |
| Glossary | Termes métier (ou exemples) |

### Phase 4 : Validation et prochaines étapes

Afficher un résumé (fichier créé, projet, type, stack, domaine, conformité, nombre de personas) puis recommander :

1. Relire le fichier généré et compléter les sections placeholder
2. Ajouter les bounded contexts détaillés si DDD
3. Documenter les workflows métier clés
4. Lancer les agents spécialisés : `@database-architect` (schéma), `@api-designer` (endpoints)

Proposer d'ouvrir le fichier pour relecture.

### Modes

| Mode | Comportement |
|------|--------------|
| `--context` | Détection + questions essentielles (type, domaine, utilisateurs, conformité) |
| `--context --auto` | Auto-détection maximale, questions ignorées si défaut raisonnable |
| `--context --full` | Toutes les questions, y compris objectifs, problèmes et glossaire |

```bash
/common:init --context
/common:init --context --auto
/common:init --context --full
```
