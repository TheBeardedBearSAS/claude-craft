# Phase 2 — Stabilisation (1-3 mois, ~324h)

> **Source** : `audit/00-SYNTHESIS.md` §"1-3 Mois : Stabilisation (Qualité + Communauté)"
> **Objectif** : Atteindre standards production + amorcer croissance communautaire + défendre vs menace Anthropic Skills.
> **Owner-types requis** : QA, Dev senior, DevOps, Traducteurs, Marketing, CEO (recrutement).
> **Rapports sources** : 05 (Fiabilité), 07 (Architecture), 08 (Doc), 09 (I18n), 10 (Communauté), 12 (Dette), 03 (Concurrentiel), 13 (Légal).

## Pourquoi cette phase

- **Coverage 30% vs 80% prêché** → bugs production inévitables sur Ralph, RTK, Kanban, QA Recette.
- **I18n frauduleuse ES/DE/PT 48%** → réputation ternie, adoption internationale échoue.
- **Bus factor = 1** → mort projet à 6 mois si Flavien s'arrête.
- **Menace Anthropic Skills** → fenêtre 6-12 mois pour prendre position sur marketplace.
- **Dette 42.5j** → refactor install scripts critique (26 scripts 80% dupliqués).

## Prérequis

- [ ] Phase 1 ≥80% DoD (voir `phase-1-survie.md`).
- [ ] CLA opérationnel (P1-02) pour accepter PRs externes.
- [ ] Budget traduction validé (€3.75K estimé, ~150h × €25/h).
- [ ] Compte marketplace Anthropic Skills créé (si disponible).
- [ ] Job description co-mainteneurs publiée (via phase 1 COMMUNITY).

## Actions (10)

| ID | Action | Effort | Impact | Rapport | Agent principal |
|----|--------|--------|--------|---------|-----------------|
| P2-11 | E2E tests bash `Tools/` (Ralph, RTK, statusline) dockerisés | 40h | Fiabilité garantie | 05 C-01/08/09 | `@tdd-coach` |
| P2-12 | `set -euo pipefail` + shellcheck sur 38 scripts bash | 8h | Robustesse bash | 05 C-02 | `@devops-engineer` |
| P2-13 | Mutation testing (Stryker JS + custom bash mutator) | 24h | Coverage vraie qualité | 05 C-10 | `@tdd-coach` + `@performance-auditor` |
| P2-14 | Refactor install scripts (DRY 26 → 3 génériques) | 32h | Dette -80%, maint ÷10 | 07 ARCH-003 / 12 M-03 | `@refactoring-specialist` |
| P2-15 | Compléter parité i18n ES/DE/PT (~95 KB/langue manquant) | 60h | Promesse "5 langues" tenue | 08 DOC-004 / 09 I18N-001 | `@research-assistant` + traducteurs |
| P2-16 | SBOM automatique CI (CycloneDX) + SLSA L2 | 8h | NIS2 compliance supply chain | 01 SEC-002 / 13 LEG-029 | `@devops-engineer` |
| P2-17 | 3 showcases clients documentés (case studies) | 40h | Crédibilité, social proof | 10 COMM-006 | `@research-assistant` + Marketing |
| P2-18 | Roadmap publique vote communautaire (GitHub Discussions + Milestones) | 8h | Transparence, engagement | 10 COMM-013 | `@research-assistant` |
| P2-19 | Recruter 2 co-mainteneurs (bus factor 1 → 3) | 80h | Survie garantie | 12 M-01 / 10 COMM-001 | CEO / humain |
| P2-20 | Publier skills Claude Craft sur marketplace Anthropic | 24h | Défense menace Anthropic | 03 COMP-002 | `@api-designer` + `@research-assistant` |

**Total** : ~324h.

## Batches parallèles

### Batch A — Qualité code (parallèle, 3 agents)

Scopes disjoints : tests, lint/bash, refactor install scripts.

```
Agent({
  subagent_type: "tdd-coach",
  description: "E2E bash Tools/ dockerisé",
  prompt: `
Contexte : 0 test E2E sur Tools/ (Ralph 1500 LOC, RTK installer, statusline). Rapport 05 C-01/08/09.
Scope :
  1. Créer test/e2e/tools/ avec docker-compose.test.yml (image Ubuntu + bash + node).
  2. Tests E2E couvrant :
     - ralph.sh : lancer avec tâche triviale, vérifier DoD atteint + exit 0.
     - install-rtk.sh : installer dans conteneur vierge, vérifier binaire + 'rtk --version'.
     - statusline.sh : générer prompt, vérifier format + variables.
  3. Activer dans CI (.github/workflows/test.yml) avec job séparé 'e2e-tools'.
  4. Target coverage Tools/ ≥ 60% (réaliste) mesuré via bashcov.
DoD : 3 suites E2E passent en CI, bashcov >= 60%, README badge ajouté.
Contrainte Docker : obligatoire (CLAUDE.md règle).
`
})

Agent({
  subagent_type: "devops-engineer",
  description: "Bash hardening + shellcheck CI",
  prompt: `
Contexte : 38 scripts bash sans 'set -euo pipefail' (C-02 rapport 05).
Actions :
  1. Ajouter 'set -euo pipefail' + 'IFS=$'\\n\\t'' en tête de chaque script.
  2. Exécuter shellcheck -S error sur tous les scripts, corriger les erreurs.
  3. Ajouter job 'shellcheck' au workflow CI, bloquant.
  4. Pre-commit hook local via husky ou lefthook appelant shellcheck.
DoD : shellcheck 0 erreur sur 140 scripts bash, CI bloque les régressions.
Fichiers probables : Tools/, scripts/, hooks/.
`
})

Agent({
  subagent_type: "refactoring-specialist",
  description: "DRY 26 install scripts → 3 génériques",
  prompt: `
Contexte : 26 install scripts à 80% dupliqués (ARCH-003 / M-03). Violation DRY + YAGNI.
Scope :
  1. Analyser scripts install-*.sh et identifier les 3 familles :
     - install-tech-with-refs.sh (stacks avec CLAUDE.md + references/)
     - install-infra.sh (agents devops/coolify/k8s/etc.)
     - install-skill-pack.sh (packs de skills)
  2. Créer 3 scripts génériques paramétrés par stack/pack.
  3. Remplacer les 26 scripts par des wrappers de 3-5 lignes appelant le générique.
  4. Tests E2E existants (phase 2 batch A) doivent toujours passer.
  5. Benchmark : lignes de code Tools/install avant vs après (attendu -70%).
DoD : -70% LOC install, tests E2E verts, aucun usage cassé, PR unique reviewable.
Dépend de : Batch A tâche 1 (E2E tests en place avant refactor pour éviter régression silencieuse).
ORDRE : lancer CE batch SÉQUENTIELLEMENT APRÈS completion des E2E tests.
`
})
```

⚠ **Dépendance** : Le refactor install scripts doit venir **après** les E2E tests (sinon régression silencieuse).

### Batch B — Supply chain & mutation testing (parallèle, 2 agents)

```
Agent({
  subagent_type: "devops-engineer",
  description: "SBOM CycloneDX + SLSA L2",
  prompt: `
Contexte : LEG-029 / SEC-002 — absence SBOM bloque NIS2 et enterprise.
Actions :
  1. Ajouter workflow .github/workflows/sbom.yml :
     - Génère SBOM CycloneDX JSON à chaque release (npm, composer, pip selon stacks).
     - Publie en GitHub release asset.
     - Optionnel : upload Dependency-Track si instance disponible.
  2. SLSA L2 provenance via SLSA GitHub generator (slsa-framework/slsa-github-generator).
  3. Sigstore keyless signing des artefacts NPM (npm audit signatures).
  4. Documenter dans SECURITY.md : supply chain policy, SBOM access.
Recherches :
  - WebSearch "CycloneDX npm SBOM GitHub Actions 2026"
  - context7 resolve-library-id 'cyclonedx/cyclonedx-node-npm'
DoD : SBOM attaché à la prochaine release, SLSA provenance OK, SECURITY.md mis à jour.
`
})

Agent({
  subagent_type: "tdd-coach",
  description: "Mutation testing Stryker + bash",
  prompt: `
Contexte : Coverage 30% trompeur (C-10). Need mutation score > 60%.
Actions :
  1. Intégrer Stryker Mutator (JS/TS) :
     - Config stryker.config.mjs (vitest runner).
     - Scope : src/, .claude/scripts/*.js (exclure node_modules, dist).
     - Threshold initial : 50%, cible 70%.
  2. Mutation bash : scripts/mutation-bash.sh custom :
     - Remplace '==' par '!=', '-eq' par '-ne', commente 'set -e', etc.
     - Lance tests E2E (batch A) après chaque mutation, compte les kills.
  3. Intégrer en CI (job nightly, pas bloquant initialement).
  4. Dashboard mutation score dans README badge.
Références :
  - context7 resolve-library-id 'stryker-mutator/stryker-js'
  - WebSearch "bash mutation testing 2026"
DoD : Stryker run vert avec >=50%, bash mutator fonctionne sur 5 scripts représentatifs.
`
})
```

### Batch C — Documentation & i18n (parallèle, 2 agents + humains)

```
Agent({
  subagent_type: "research-assistant",
  description: "I18n parité ES/DE/PT",
  prompt: `
Contexte : EN 135KB, FR 149KB, ES/DE/PT ~38KB (48% parité). Promesse "5 langues" mensongère (I18N-001, DOC-004).
Actions :
  1. Audit fichier-par-fichier : générer audit/phases/i18n-gap.csv avec colonnes (fichier, taille_EN, taille_ES/DE/PT, ratio, status).
  2. Prioriser top 20 fichiers les plus consultés (README, QUICKSTART, commandes common/*, rules/*).
  3. Rédiger prompt de traduction standardisé pour chaque fichier manquant (machine translation DeepL/Claude puis review humaine native).
  4. Setup Crowdin ou i18n-ally pour continuous translation (optionnel mais souhaité).
  5. Update parity-validator CI pour bloquer régression (actuellement bypassable, I18N validator rapport 09).
Recherches :
  - WebSearch "Crowdin open source project 2026"
  - WebSearch "i18n-ally translation workflow 2026"
DoD : i18n-gap.csv produit, top 20 traduits (draft machine + review humaine), parity-validator bloquant en CI.
Humains requis : 3 traducteurs natifs ES/DE/PT (~50h chacun).
`
})

Agent({
  subagent_type: "research-assistant",
  description: "Showcases + roadmap publique",
  prompt: `
Contexte : 0 showcase client, 0 roadmap publique (COMM-006, COMM-013).
Actions :
  1. Identifier 3 early adopters (via Discord phase 1, via Flavien network).
  2. Template case-study.md : contexte, problème, solution Claude Craft, métriques (TTFV, coverage, velocity), quote.
  3. Publier docs/showcases/ avec 3 études de cas (ou 2 internes + 1 externe si pas d'externe disponible).
  4. Créer GitHub Project 'Claude Craft Roadmap' avec :
     - Colonnes : Backlog / Voting / In Progress / Shipped
     - Milestones v9.0, v9.1, v9.2 mappés sur roadmap audit (phases 3/4).
     - Issue template 'Feature Request' avec reactions 👍 pour voting.
  5. Ouvrir GitHub Discussions catégories : Ideas, Q&A, Show and Tell, Announcements.
DoD : 3 showcases publiés, GitHub Project public, Discussions activé avec 5 topics initiaux.
`
})
```

### Batch D — Recrutement & Marketplace (parallèle, humain + 1 agent)

```
// Action humaine parallèle (P2-19)
// CEO/Flavien : entretiens 2 co-mainteneurs via :
//  - Post LinkedIn + Discord + Reddit r/ClaudeCode
//  - Recherche dans contributors early adopters (batch C)
//  - Budget : €35-60K/an/personne selon séniorité

Agent({
  subagent_type: "api-designer",
  description: "Publier skills sur marketplace Anthropic",
  prompt: `
Contexte : Défense menace COMP-002. Fenêtre 6-12 mois avant Anthropic Skills marketplace mature.
Actions :
  1. Identifier le spec officiel : WebSearch "Anthropic Skills marketplace spec 2026 publish"
  2. Sélectionner 10 skills Claude-Craft les plus génériques (pas stack-specific) :
     - architect, testing, security, git-workflow, documentation, solid-principles, kiss-dry-yagni, debug-methodical, socratic-brainstorm, atomic-tasks.
  3. Adapter format pour marketplace (frontmatter spec officiel, disable-model-invocation où pertinent).
  4. Publier sous namespace 'claude-craft/' avec attribution 'by The Bearded CTO'.
  5. README marketplace : lien vers https://github.com/.../claude-craft, Discord, showcases.
  6. Monitorer adoption (downloads, ratings) via dashboard marketplace.
DoD : 10 skills publiés, visibles sur marketplace, lien bidirectionnel avec repo GitHub.
Risque : si marketplace pas encore GA → soumettre comme early access et préparer launch day.
`
})
```

## Équipe d'agents recommandée

| Rôle | Agent | Scope |
|------|-------|-------|
| Tests E2E | `@tdd-coach` | P2-11, P2-13 |
| Bash hardening | `@devops-engineer` | P2-12 |
| Refactor install | `@refactoring-specialist` | P2-14 |
| Review stack-specific | `@symfony-reviewer`, `@react-reviewer`, `@flutter-reviewer`, `@python-reviewer` | Validation P2-14 par stack |
| SBOM / supply chain | `@devops-engineer` | P2-16 |
| I18n audit | `@research-assistant` | P2-15 (drafts, humains pour review) |
| Showcases & roadmap | `@research-assistant` | P2-17, P2-18 |
| Marketplace | `@api-designer` | P2-20 |
| Recrutement | humain (CEO) | P2-19 |
| Coordination globale | `@ralph-conductor` | Orchestration batches A/B/C/D |

## Recherches web / MCP pré-rédigées

```javascript
WebSearch({ query: "Anthropic Skills marketplace publish spec April 2026" })
WebSearch({ query: "CycloneDX SBOM GitHub Actions NPM 2026" })
WebSearch({ query: "SLSA GitHub generator Level 2 NPM package 2026" })
WebSearch({ query: "Crowdin open source translation workflow 2026" })
WebSearch({ query: "Stryker Mutator TypeScript Vitest 2026" })
WebSearch({ query: "bashcov bash coverage Docker CI 2026" })
WebSearch({ query: "open source co-maintainer hiring compensation 2026" })

// Context7 lookups
ToolSearch({ query: "select:mcp__context7__resolve-library-id,mcp__context7__query-docs", max_results: 2 })
// puis pour : stryker-mutator/stryker-js, cyclonedx/cyclonedx-node-npm, slsa-framework/slsa-github-generator
```

## DoD & Validation

### Par action

- **P2-11** : Job CI `e2e-tools` vert, bashcov report >=60%.
- **P2-12** : `shellcheck -S error Tools/**/*.sh` retourne 0, job CI bloquant.
- **P2-13** : Stryker score ≥50%, badge README, job nightly.
- **P2-14** : `wc -l Tools/install-*.sh` divisé par ≥3, tests E2E toujours verts.
- **P2-15** : i18n-gap.csv publié, parity-validator bloquant, top 20 fichiers ≥90% parité.
- **P2-16** : SBOM CycloneDX présent sur release v8.2, SLSA provenance attaché.
- **P2-17** : 3 fichiers `docs/showcases/*.md` publiés avec métriques.
- **P2-18** : GitHub Project public, ≥10 issues votées via reactions 👍.
- **P2-19** : 2 co-mainteneurs avec commit access + au moins 5 commits chacun.
- **P2-20** : 10 skills sur marketplace Anthropic (ou early access), ≥100 downloads total.

### Validation globale

```bash
# Suite complète
/team:audit --scope=phase-2 --parallel
npm run test:e2e:tools
shellcheck -S error Tools/**/*.sh
npm run mutation  # Stryker
bashcov -- ./Tools/test-runner.sh

# Métriques North Star phase 2
# - Bus factor ≥ 3 (GitHub contributors stats)
# - Coverage E2E Tools ≥ 60%
# - Mutation score ≥ 50%
# - Parité i18n top 20 ≥ 90%
# - 3 showcases publiés
# - 10 skills marketplace
```

## Risques & rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Aucun candidat co-mainteneur qualifié | Haute | Plan B : sponsor payant via GitHub Sponsors, pay-per-feature |
| Refactor install casse setups existants | Moyenne | Feature flag + dual mode pendant 1 release |
| Marketplace Anthropic pas encore ouvert | Moyenne | Skills restent dans repo + canal GitHub Discussions |
| Traducteurs humains indisponibles | Moyenne | Machine translation review community via Discord |
| Burnout mainteneur avant fin phase | Haute | Strict respect 1 release/semaine (P1-08), vacances planifiées |

## Prochaine phase

**Conditions de passage vers phase 3** :
- [ ] Bus factor effectif ≥ 3 (2 co-mainteneurs actifs avec write access)
- [ ] Coverage E2E Tools/ ≥ 60%
- [ ] Mutation score ≥ 50%
- [ ] Parité i18n top 20 fichiers ≥ 90%
- [ ] 10 skills publiés sur marketplace Anthropic
- [ ] Discord ≥ 100 membres actifs

→ [phase-3-differenciation.md](phase-3-differenciation.md)
