# Claude Craft - Contexte Essentiel

## Projet
- **Version:** 7.18.0
- **Type:** Framework multi-technologie pour Claude Code
- **Stacks:** 10 (Symfony, React, Flutter, Python, Angular, Vue.js, Laravel, React Native, C#/.NET, PHP)
- **Agents:** 33 | **Commandes:** 160 | **Namespaces:** 20

## Structure du Repo
- `Dev/` — Contenu i18n, scripts d'installation
- `.claude/` — Agents, commandes, skills, regles, templates
- `cli/` — CLI NPX (install, update, list)
- `tests/` — Tests Vitest (content, CLI, i18n)
- `docs/` — Documentation utilisateur

## Commandes de Test
- `npm test` — Suite complete (550+ tests)
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
