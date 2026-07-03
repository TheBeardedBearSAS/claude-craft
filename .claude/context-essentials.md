# Claude Craft - Contexte Essentiel

## Projet
- **Version:** 8.19.2
- **Type:** Framework multi-technologie pour Claude Code
- **Stacks:** 19 (Symfony, React, Flutter, Python, Angular, Vue.js, Laravel, React Native, C#/.NET, PHP, Paperclip, Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hcloud, PgBouncer, FrankenPHP)
- **Agents:** 72 | **Commandes:** 211 | **Namespaces:** 26

## Structure du Repo
- `Dev/` — Contenu i18n, scripts d'installation
- `.claude/` — Agents, commandes, skills, regles, templates
- `cli/` — CLI NPX (install, update, list)
- `tests/` — Tests Vitest (content, CLI, i18n)
- `docs/` — Documentation utilisateur

## Commandes de Test
- `npm test` — Suite complete (619+ tests)
- `npm run test:content` — Validation contenu (agents, commandes, skills)
- `npm run lint` — Linting (ESLint + shell)
- `npm run lint:i18n` — Parite i18n

## Conventions
- **Docker obligatoire** pour les commandes (pas d'env local)
- **Conventional commits** : feat/fix/docs/chore(scope): description
- **Agents en francais** (ASCII-safe, pas d'accents)
- **Ne pas stocker dans /tmp** — utiliser ./test-output/
- **Publish NPM par la CI** (pas manuellement)

## Workflow Release
bump version -> commit -> push -> tag -> push tag -> CI publie

## Architecture Rules
- **Clean Architecture** with DIP: domain defines interfaces, infrastructure implements
- **SOLID mandatory** — especially SRP (methods < 20 lines) and DIP (inject interfaces)
- **KISS**: max 3 indentation levels, max 4 params, early returns over nested if/else
- **TDD**: Red -> Green -> Refactor. Tests BEFORE implementation. Coverage >= 80%

## Stack Detection
- `composer.json` -> Symfony/Laravel/PHP -> `@.claude/references/{symfony,laravel,php}/`
- `package.json` + react -> React -> `@.claude/references/react/`
- `pubspec.yaml` -> Flutter -> `@.claude/references/flutter/`
- `pyproject.toml` / `requirements.txt` -> Python -> `@.claude/references/python/`
- `*.csproj` -> C#/.NET -> `@.claude/references/csharp/`

## Common Test Commands
- Symfony: `docker compose exec app ./vendor/bin/phpunit`
- React/Angular/Vue: `npm test` or `npx vitest run`
- Flutter: `flutter test`
- Python: `pytest`
- C#: `dotnet test`

## Active Workflow
- Check `.bmad/` for sprint state, backlog, current story
- Status routing: backlog -> ready-for-dev -> in-progress -> review -> done

## Key Index
- Condensed patterns: `@.claude/INDEX.md`
- Full rules: `@.claude/rules/`
- Tech references: `@.claude/references/{stack}/`
