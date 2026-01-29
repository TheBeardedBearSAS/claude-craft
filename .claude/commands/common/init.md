# /init - Bootstrap Claude-Craft Structure

Initialise la structure Claude-Craft pour un nouveau projet.

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

- `/csharp:check-compliance` - Full compliance audit
- `/csharp:check-architecture` - Architecture validation
- `/csharp:check-code-quality` - Code quality analysis
- `/csharp:check-testing` - Test coverage analysis
- `/csharp:check-security` - Security audit (OWASP)
- `/csharp:generate-feature` - Generate CQRS feature

## Docker Requirement

Always use Docker for commands to abstract from local environment.
```

#### Symfony / PHP

```markdown
# Claude-Craft - {{PROJECT_NAME}}

**Stack**: PHP 8.5, Symfony 8.0, Clean Architecture, DDD, Doctrine ORM

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

**Stack**: Flutter 3.38+, Dart 3.10+, Clean Architecture, Riverpod/BLoC

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
