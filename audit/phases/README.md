# Audit Claude Craft v8.1.0 — Phases Exécutables

> **Source** : `audit/00-SYNTHESIS.md` (roadmap 0-1 / 1-3 / 3-6 / 6-12 mois)
> **Objectif** : exécuter la roadmap audit via équipes d'agents parallélisées.

## Index

| Phase | Durée | Effort | Fichier | Statut |
|-------|-------|--------|---------|--------|
| 1. Survie | 0-1 mois | ~79h | [phase-1-survie.md](phase-1-survie.md) | Automatable scope livré (cf. [human-actions](phase-1-human-actions.md)) |
| 2. Stabilisation | 1-3 mois | ~324h | [phase-2-stabilisation.md](phase-2-stabilisation.md) | Automatable scope livré (cf. [human-actions](phase-2-human-actions.md)) |
| 3. Différenciation | 3-6 mois | ~668h | [phase-3-differenciation.md](phase-3-differenciation.md) | Automatable scope livré (cf. [human-actions](phase-3-human-actions.md)) |
| 4. Domination | 6-12 mois | ~1380h | [phase-4-domination.md](phase-4-domination.md) | Bloquée par P3 |

**Total** : 2451h ≈ équipe 3-4 dev temps plein sur 12 mois, budget €155K, ROI 29% an 1.

## Méthodologie de parallélisation

### Règles d'or

1. **Max 3 agents `Explore` simultanés** pour recherche/lecture codebase (évite contention).
2. **Max 5 agents spécialisés simultanés** sur batches indépendants (pas de conflit de fichiers/zones).
3. **Séquentiel obligatoire** si dépendance : refactor après tests E2E, publication après validation.
4. Chaque agent reçoit un prompt **self-contained** : objectif + fichiers + contexte synthèse + DoD + commande de validation.
5. **Tech reviewers** (`@{symfony,react,flutter,python,...}-reviewer`) lancés **après** chaque refactor stack-specific comme validation croisée.

### Pattern d'invocation

```javascript
// Lancer 3 agents en parallèle (un seul message, 3 tool uses)
Agent({ subagent_type: "security-auditor", prompt: "...SEC-001 RTK pipe curl..." })
Agent({ subagent_type: "accessibility-expert", prompt: "...A11Y-002 Kanban clavier..." })
Agent({ subagent_type: "research-assistant", prompt: "...LEG-018 PRIVACY.md..." })
```

### Mapping constat → agent

| Domaine audit | Agent principal | Agents validation |
|---------------|-----------------|-------------------|
| Sécurité / supply chain | `@security-auditor` | `@devops-engineer` |
| Architecture / refactor | `@refactoring-specialist` | `@{stack}-reviewer` |
| Tests E2E / mutation | `@tdd-coach` | `@performance-auditor` |
| Accessibilité WCAG | `@accessibility-expert` | `@ui-designer`, `@ux-ergonome` |
| Documentation / ADR | `@research-assistant` | — |
| I18n parité | `@research-assistant` | traducteurs humains |
| Produit / API | `@api-designer` + `@ui-designer` | `@ux-ergonome` |
| CI / SBOM / supply chain | `@devops-engineer` | `@security-auditor` |
| Legal / compliance | `@research-assistant` (drafts) | legal humain (review) |
| Migrations breaking | `@migration-specialist` | `@tech-lead` |
| Perf / tokens / FinOps | `@cost-optimizer` | `@performance-auditor` |
| Coordination multi-agents | `@ralph-conductor` | — |

### Slash commands réutilisables

- `/team:security` — audit sécurité multi-dimension (phase 1 & ongoing)
- `/team:audit` — audit complet multi-stack (phase 2 & 3 validation)
- `/team:delivery` — cycle sprint complet (phase 2 stabilisation)
- `/team:sprint` — implémentation parallèle stories (toutes phases)
- `/common:ralph-run` — boucle continue jusqu'à DoD (phase 4 autonomous)
- `/common:audit-freshness` — fraîcheur versions / best practices (trimestriel)

## Workflow recommandé par phase

1. **Kickoff** : lire le fichier `phase-N-*.md`, vérifier prérequis et accès.
2. **Batch research** (agents `Explore` en parallèle) : valider constats audit encore d'actualité (docs drift possible depuis 2026-04-15).
3. **Batch action** (agents spécialisés en parallèle) : exécuter selon tableau "Batches parallèles".
4. **Batch validation** (tech reviewers) : review croisée des changements.
5. **DoD check** : exécuter commandes de validation listées.
6. **Commit & PR** : respecter conventional commits + DCO (une fois CLA en place en phase 1).

## Conventions des fichiers de phase

Chaque `phase-N-*.md` a la structure :

```
# Phase N — Titre
## Objectif
## Prérequis
## Actions (tableau 10 lignes)
## Batches parallèles (3-5 batches)
## Équipe d'agents
## Recherches web / MCP pré-rédigées
## DoD & Validation
## Risques & rollback
## Prochaine phase
```

## Gouvernance

- **Review hebdomadaire** : avancement actions, métriques North Star (WAU, activation, bus factor).
- **Review mensuelle** : passage phase suivante si ≥80% DoD phase courante.
- **Tracking** : utiliser `TaskCreate` / `TaskUpdate` dans session pour suivre progression intra-phase.

## Références

- `audit/00-SYNTHESIS.md` — synthèse exhaustive 11 247 lignes
- `audit/0X-*.md` — 14 rapports détaillés (sécurité, ergonomie, concurrentiel, etc.)
- `.claude/CLAUDE.md` — framework claude-craft v8.1.0
- `docs/AGENTS.md` — catalogue complet agents
