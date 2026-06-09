# QA Recette — Architecture Standalone

> **Status** : DRAFT (P3-21). Requiert review `@tech-lead` avant extraction repo séparé.
> **Objectif** : extraire QA Recette en outil indépendant **entièrement open-source MIT** (SDK + extension Chrome + backend optionnel) — adoption large et auditable par la communauté.

## Hypothèses explicites (Karpathy §1)

1. **QA Recette actuel** : implémenté dans `.claude/commands/qa/` (recette.md, fix.md, tdd.md, status.md, report.md, regression.md) + Chrome extension v1.0.36+ externe (non versionnée dans ce repo).
2. **Workflow cible** : local-first (aucun backend obligatoire), cloud optionnel pour sync multi-devices et stockage sessions longues.
3. **Modèle de distribution** : tout open-source MIT — SDK (`@claude-craft/qa-recette-sdk` sur NPM) + extension Chrome (Chrome Web Store) + backend optionnel self-hostable.
4. **Repo cible** : `github.com/the-bearded-cto/qa-recette` (séparé de claude-craft pour positionnement produit).
5. **Stack** : Node.js 20+, TypeScript 5.9, Vitest 4 (browser mode), Playwright (tests).
6. **Audience** : dev QA, tech leads, PM ayant besoin de tests d'acceptance reproductibles sans Selenium/Cypress setup complexe.

## Non-goals (YAGNI §2)

- ❌ Pas d'orchestrateur CI/CD intégré (use GitHub Actions / GitLab CI existant)
- ❌ Pas de BDD Gherkin parser initialement (Markdown suffit v1)
- ❌ Pas de self-hosted enterprise v1 (cloud EU + local seulement)
- ❌ Pas d'IA agent interne — délégué Claude Code existant

## Vue d'ensemble

```
┌───────────────────────────────────────────────────┐
│  Utilisateur                                      │
│    ↓ /qa:recette --scope=story --id=US-001        │
│  Claude Code (CLI existant)                       │
│    ↓ invoke SDK                                   │
│  @claude-craft/qa-recette-sdk (OPEN SOURCE MIT)   │
│    ├─ createSession({scope, id})                  │
│    ├─ runTests(config) → Report                   │
│    ├─ resume(sessionId)                           │
│    └─ storage adapter (local FS ou cloud API)     │
│           ↓                                       │
│  Chrome Extension QA Recette (OPEN SOURCE MIT)    │
│    ├─ Exécution tests navigateur (Playwright-like)│
│    ├─ Screenshots, traces, assertions DOM         │
│    └─ Cloud sync optionnel                        │
│           ↓                                       │
│  [OPTIONNEL] Backend self-hostable (MIT)          │
│    ├─ Auth (magic link)                           │
│    ├─ Stockage sessions (PostgreSQL EU)           │
│    └─ Webhooks CI (POST /v1/sessions)             │
└───────────────────────────────────────────────────┘
```

## Licences des composants (tout MIT)

| Composant | Licence | Raison |
|---|---|---|
| SDK Node (`qa-recette-sdk`) | MIT | Adoption large, audit communautaire, intégration Claude Code |
| CLI (`qa-recette run`) | MIT | Outil dev, scriptable CI |
| Schéma session JSON | MIT (spec publique) | Interopérabilité |
| Extension Chrome | MIT | Auditable, fork-friendly |
| Backend cloud API | MIT (self-hostable) | Pas de lock-in, déployable par chacun |
| Dashboards reporting | MIT | Valeur communautaire |

## API publique SDK (v1.0.0)

Signatures TypeScript — cf. `api-spec.yaml` pour la spec REST cloud.

```typescript
import { createSession, runTests, resume, type Session, type Report } from '@claude-craft/qa-recette-sdk';

// Démarrer une session
const session: Session = await createSession({
  scope: 'story' | 'sprint' | 'regression',
  id: 'US-001',
  config: { baseUrl: 'https://localhost:3000', timeout: 30000 },
});

// Exécuter
const report: Report = await runTests(session, { headless: true });

// Reprendre une session interrompue
const resumed: Session = await resume('REC-20260430-143022');
```

## Flux stockage (local-first)

```
~/.qa-recette/
├── sessions/
│   └── REC-20260430-143022/
│       ├── config.json
│       ├── steps/
│       │   ├── 001-login.json
│       │   └── 002-checkout.json
│       ├── screenshots/
│       └── report.md
└── registry.json   # index regression
```

Sync cloud opt-in (backend self-hosté) : `qa-recette config set cloud.enabled=true` → POST sur `/v1/sessions` à chaque step.

## RFC communautaire

Avant publication NPM SDK v1.0.0, publier un RFC via GitHub Discussions `qa-recette` pour recueillir feedback sur :
- API `createSession` / `runTests` (breaking changes avant v1 acceptés)
- Format session JSON (stabilité long-terme après v1)

Cf. `RFC.md`.

## Roadmap extraction

1. **Sprint 1 (2 semaines)** : scaffolding repo `qa-recette/`, migration `.claude/commands/qa/` → package `cli/`.
2. **Sprint 2 (2 semaines)** : SDK API publique + tests Vitest 4.
3. **Sprint 3 (2 semaines)** : Chrome extension refactor avec SDK.
4. **Sprint 4 (2 semaines)** : backend self-hostable minimal (Hono + Postgres EU), optionnel.
5. **Release v1.0.0** : publication NPM + Chrome Web Store + image Docker self-host.

## Risques

| Risque | Mitigation |
|---|---|
| Cannibalisation par Claude Code natif (acceptance tests) | Se positionner sur "test reproductibility + CI-native" vs "AI-assisted one-shot" |
| Chrome Web Store review delay | Soumettre dès Sprint 3, en parallèle du dev backend |
| Complexité cross-browser (Firefox, Safari) | v1 Chromium only, Firefox en backlog v1.5 |

## DoD extraction

- [ ] Repo `github.com/the-bearded-cto/qa-recette` créé, README clair (tout MIT)
- [ ] SDK publié NPM `@claude-craft/qa-recette-sdk@1.0.0`
- [ ] OpenAPI spec `api-spec.yaml` validée via Redocly CLI
- [ ] RFC publié GitHub Discussions, ≥5 commentaires communauté
- [ ] Review `@tech-lead` signée
- [ ] Intégration rétro-compatible dans `.claude/commands/qa/recette.md` (wrapper appelle SDK)
