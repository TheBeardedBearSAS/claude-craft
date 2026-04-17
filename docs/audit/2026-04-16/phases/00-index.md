# Audit Claude Craft v8.1.0 — Phases d'exécution consolidées

> **Date audit** : 2026-04-16 | **Score global** : 6.9/10 | **Version** : 8.1.0
> **Source** : 11 rapports `docs/audit/2026-04-16/` + phases existantes `audit/phases/`

## Radar

```
Sécurité           ████████░░  7.5
Ergonomie/DX       ███████░░░  6.8
Concurrentiel      ████████░░  7.5
Fonctionnalités    ███████░░░  7.2
Fiabilité          ███████░░░  7.2
Performance        ███████░░░  7.0
Architecture       ████████░░  7.8
Scalabilité        █████░░░░░  4.5  ⚠️ CRITIQUE
Conformité         ███████░░░  7.2
Innovation         ███████░░░  6.5
```

## Vue d'ensemble des phases

| Phase | Titre | Durée | Effort | Fichier | Cible score |
|-------|-------|-------|--------|---------|-------------|
| 1 | Stabilisation & Fondations | 0-1 mois | ~85h | [phase-1-stabilisation-fondations.md](phase-1-stabilisation-fondations.md) | 7.5 → 8.0 |
| 2 | Qualité & Performance | 1-3 mois | ~340h | [phase-2-qualite-performance.md](phase-2-qualite-performance.md) | 7.0 → 8.5 |
| 3 | DX & Ergonomie | 2-4 mois | ~280h | [phase-3-dx-ergonomie.md](phase-3-dx-ergonomie.md) | 6.8 → 8.5 |
| 4 | Différenciation & Écosystème | 3-6 mois | ~450h | [phase-4-differenciation-ecosysteme.md](phase-4-differenciation-ecosysteme.md) | 7.5 → 9.0 |
| 5 | Innovation & Croissance | 6-24 mois | ~2000h | [phase-5-innovation-croissance.md](phase-5-innovation-croissance.md) | 6.5 → 8.5 |

**Total** : ~3155h d'actions techniques + actions humaines (recrutement, partenariats, marketing)

## Dépendances inter-phases

```
Phase 1 ──────► Phase 2 ──────► Phase 4
  │               │                │
  │               └──► Phase 3 ───►│
  │                                │
  └────────────────────────────────► Phase 5

Légende :
  ──► = dépendance dure (≥80% DoD requis)
```

- **Phase 1 → Phase 2** : Tests fixés, sécurité de base, versions à jour.
- **Phase 2 → Phase 3** : Rules→Skills conversion libère le contexte pour les features DX.
- **Phase 2 → Phase 4** : Coverage E2E + bus factor ≥3 nécessaires avant expansion.
- **Phase 3 ↔ Phase 4** : Chevauchement possible sur les sprints 3.2+ et 4.1.
- **Phase 4 → Phase 5** : MRR ≥€2K, marketplace établie, compliance démarrée.

## Métriques North Star

| Métrique | Actuel | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|----------|--------|---------|---------|---------|---------|---------|
| Score global | 6.9 | 7.3 | 7.8 | 8.2 | 8.7 | 9.0 |
| Tests passants | 765/773 | 773/773 | 773+ | 800+ | 850+ | 900+ |
| Coverage | ~35% | 40% | 60% | 70% | 80% | 85% |
| Bus factor | 1 | 1 | 3 | 3 | 5+ | 10+ |
| Rules auto-load (tokens) | ~20K | ~20K | ~2.5K | ~2.5K | ~2.5K | ~2.5K |
| Stacks Tier 1 | 5 | 5 | 5 | 5 | 7 | 11 |
| Discord membres | 0 | 10+ | 100+ | 300+ | 1000+ | 3000+ |
| MRR (€) | 0 | 0 | 0 | 500 | 2K+ | 16K+ |

## Agents disponibles pour parallélisation

| Domaine | Agent principal | Agents validation |
|---------|-----------------|-------------------|
| Sécurité / supply chain | `@security-auditor` | `@devops-engineer` |
| Architecture / refactor | `@refactoring-specialist` | `@{stack}-reviewer` |
| Tests E2E / mutation | `@tdd-coach` | `@performance-auditor` |
| Accessibilité WCAG | `@accessibility-expert` | `@ui-designer`, `@ux-ergonome` |
| Documentation / ADR | `@research-assistant` | — |
| I18n parité | `@research-assistant` | traducteurs humains |
| Produit / API | `@api-designer` + `@ui-designer` | `@ux-ergonome` |
| CI / SBOM / supply chain | `@devops-engineer` | `@security-auditor` |
| Legal / compliance | `@research-assistant` (drafts) | legal humain (review) |
| Perf / tokens / FinOps | `@cost-optimizer` | `@performance-auditor` |
| Coordination multi-agents | `@ralph-conductor` | — |

## Règles de parallélisation

1. **Max 3 agents Explore** simultanés (évite contention lecture).
2. **Max 5 agents spécialisés** sur batches indépendants (pas de conflit fichiers).
3. **Séquentiel obligatoire** si dépendance fichiers/résultats.
4. Chaque agent reçoit un prompt **self-contained** : objectif + fichiers + DoD.
5. **Tech reviewers** lancés **après** chaque refactor comme validation croisée.

## Workflow d'exécution par phase

```
1. Lire phase-N-*.md, vérifier prérequis
2. Lancer recherches web/MCP pré-rédigées (agents Explore)
3. Lancer batch d'agents spécialisés (parallèle si indépendants)
4. Lancer tech reviewers (validation croisée)
5. Exécuter commandes DoD
6. Commit & PR (conventional commits)
7. Vérifier conditions de passage → phase suivante
```

## Correspondance rapports → phases

| Rapport | Ph.1 | Ph.2 | Ph.3 | Ph.4 | Ph.5 |
|---------|------|------|------|------|------|
| [01-securite](../01-securite.md) | SEC-01,02,04,10,13,14 | SEC-07,08 | SEC-03 | | |
| [02-ergonomie-dx](../02-ergonomie-dx.md) | DX-06 | | DX-05,07,09,16,17,18 | DX-25,26,27 | |
| [03-concurrentiel](../03-concurrentiel.md) | | | | R1,R2,R4,R6,R7 | R3,R5 |
| [04-fonctionnalites](../04-fonctionnalites.md) | FUNC-23 | FUNC-11,16 | FUNC-01,02,12,13,22,24 | FUNC-06,08,18,21 | FUNC-05 |
| [05-fiabilite](../05-fiabilite.md) | REL-01 | REL-02,03,04 | | REL-09,11 | |
| [06-optimisation](../06-optimisation-performance.md) | | PERF-03 | PERF-02,05,08,09 | | |
| [07-architecture](../07-architecture-qualite-code.md) | STD-12 | ARCH-15,16,25 | ARCH-03 | ARCH-29 | |
| [08-scalabilite](../08-scalabilite-maintenabilite.md) | SCAL-03,05,07,16,19 | SCAL-01,02,09,15 | SCAL-13,14 | SCAL-11 | |
| [09-conformite](../09-conformite-standards.md) | STD-02,12 | STD-03 | STD-01,09 | STD-05 | |
| [10-innovation](../10-innovation-roadmap.md) | | | OPP-06,07 | OPP-01,03,08 | OPP-02,04,05 |

## Références

- `docs/audit/2026-04-16/*.md` — 11 rapports d'audit source
- `audit/phases/*.md` — phases d'exécution détaillées (prompts agents pré-rédigés)
- `.claude/CLAUDE.md` — framework claude-craft v8.1.0
- `docs/AGENTS.md` — catalogue complet agents
