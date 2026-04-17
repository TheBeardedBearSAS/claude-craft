# Phase 2 — Qualité & Performance (1-3 mois, ~340h)

## Objectif
Atteindre les standards production : coverage ≥60%, mutation score ≥50%, rules auto-load < 3K tokens, bus factor ≥3. Score cible : 7.0 → 8.5 sur fiabilité/performance.

## Statut actuel
- Phase 2 stabilisation (`audit/phases/phase-2-stabilisation.md`) : automatable scope livré (E2E skeleton, shellcheck, SBOM workflow, marketplace readiness)
- Actions humaines restantes (`audit/phases/phase-2-human-actions.md`) : refactor install scripts, recrutement, i18n, showcases
- Nouveaux items à intégrer : PERF-03 (rules→skills), ARCH-15 (Makefile), ARCH-25 (tests), STD-03 (skills longs)

## Prérequis
- Phase 1 ≥80% DoD (tests verts, versions à jour, sécurité de base)
- CLA/DCO opérationnel pour PRs externes

## Actions restantes

### Sprint 2.1 — Rules→Skills & Tests (semaine 1-4)

#### Batch parallèle A — Conversion rules→skills (CRITIQUE, 1 agent)

Agent 1: `@refactoring-specialist`
Prompt self-contained:
```
Contexte : Les rules auto-chargées dans .claude/rules/ totalisent 2650 lignes (~20K tokens), contredisant la recommandation <200 lignes du CLAUDE.md. Rapport 06 PERF-03/04.

Tâche : Convertir 7 rules lourdes (>100 lignes) en skills à la demande :
1. 17-async.md (490 lignes) → .claude/skills/async/SKILL.md
2. 14-multitenant.md (401 lignes) → .claude/skills/multitenant/SKILL.md
3. 12-context-management.md (366 lignes) → .claude/skills/context-management/SKILL.md (DÉJÀ un skill "12-context-management" ? vérifier)
4. 21-cqrs.md (316 lignes) → .claude/skills/cqrs/SKILL.md
5. 10-documentation.md (292 lignes) → .claude/skills/documentation/SKILL.md (EXISTE DÉJÀ, fusionner)
6. 09-git-workflow.md (261 lignes) → .claude/skills/git-workflow/SKILL.md (EXISTE DÉJÀ, fusionner)
7. 01-workflow-analysis.md (236 lignes) → .claude/skills/workflow-analysis/SKILL.md (EXISTE DÉJÀ, fusionner)

Pour chaque conversion :
- Garder un résumé 10-15 lignes dans .claude/rules/XX-name.md avec lien @.claude/skills/name/SKILL.md
- Déplacer le contenu détaillé dans le SKILL.md avec frontmatter Anthropic valide
- Vérifier que les skills existants ne sont pas écrasés mais enrichis

Impact attendu : ~20K tokens → ~2.5K tokens auto-chargés.

Fichiers : .claude/rules/*.md, .claude/skills/*/SKILL.md
DoD : wc -l .claude/rules/*.md total < 500 lignes, tous les skills référencés avec @
```

#### Batch parallèle B — Tests & Coverage (2 agents, parallèle avec A)

Agent 2: `@tdd-coach`
Prompt:
```
Contexte : Coverage ~35% vs 80% cible. 154 scripts shell non testés. Rapport 05 REL-02/03/04, rapport 07 ARCH-25.

Tâche :
1. Étoffer tests/e2e/tools/ avec BATS tests pour :
   - Ralph (Tools/ralph.sh) : lancer tâche triviale, DoD atteint, exit 0
   - RTK installer : installer dans Docker, vérifier binaire + rtk --version
   - StatusLine : générer prompt, vérifier format
   - Install scripts : tester 3 familles (tech-with-refs, infra, skill-pack)
2. Ajouter tests unitaires manquants pour CLI (installer.js, doctor.js, detect-project.js, check.js)
3. Target : coverage Tools/ ≥60% (bashcov), coverage CLI ≥60% (vitest)
4. Contrainte Docker obligatoire (CLAUDE.md règle)

Fichiers : tests/e2e/tools/, tests/unit/, .github/workflows/test.yml
DoD : npm run test:e2e:tools vert, bashcov ≥60%, vitest --coverage ≥60%
```

Agent 3: `@tdd-coach` + `@performance-auditor`
Prompt:
```
Contexte : Mutation testing configuré (Stryker) mais jamais exécuté. Rapport 05 REL-02 / rapport 07 ARCH-26.

Tâche :
1. Configurer et exécuter Stryker Mutator (vitest runner)
   - Scope : cli/*.js (exclure node_modules, dist)
   - Seuil initial : 50%
2. Créer scripts/mutation-bash.sh : mutateur custom pour bash
   - Remplacer == par !=, -eq par -ne, commenter set -e
   - Lancer tests E2E après chaque mutation
3. Intégrer en CI (job nightly, pas bloquant initialement)
4. Badge mutation score dans README

Recherches : context7 resolve-library-id 'stryker-mutator/stryker-js'
Fichiers : stryker.config.mjs, scripts/mutation-bash.sh, .github/workflows/test.yml
DoD : Stryker run ≥50% mutation score, bash mutator sur 5 scripts
```

#### Batch parallèle C — Shell hardening (1 agent, parallèle avec A et B)

Agent 4: `@devops-engineer`
Prompt:
```
Contexte : 38 scripts bash sans set -euo pipefail. ShellCheck recommandé mais non en CI. Rapport 05 REL-03 / rapport 07 ARCH-16.

Tâche :
1. Ajouter set -euo pipefail + IFS=$'\n\t' en tête de chaque script bash
2. Exécuter shellcheck -S error sur tous les scripts, corriger les erreurs
3. Ajouter job shellcheck au workflow CI (.github/workflows/lint.yml), bloquant
4. Quoter les variables non-quotées problématiques (SEC-11)

Fichiers : Tools/*.sh, scripts/*.sh, .github/workflows/
DoD : shellcheck -S error **/*.sh = 0 erreur, job CI bloquant
```

### Sprint 2.2 — Refactor & Supply chain (semaine 5-8)

#### Batch séquentiel E — Refactor install scripts (APRÈS Sprint 2.1 Batch B)

Agent 5: `@refactoring-specialist`
Prompt:
```
Contexte : 26 install scripts à 80% dupliqués. Rapport 07 ARCH-03 / rapport 08 SCAL-09.
DÉPENDANCE : les tests E2E (Sprint 2.1 Batch B) DOIVENT être en place avant ce refactor.

Tâche :
1. Analyser les 26 scripts install-*.sh, identifier les 3 familles :
   - install-tech-with-refs.sh (stacks avec CLAUDE.md + references/)
   - install-infra.sh (agents devops/coolify/k8s/etc.)
   - install-skill-pack.sh (packs de skills)
2. Créer 3 scripts génériques paramétrés par stack/pack
3. Remplacer les 26 scripts par des wrappers 3-5 lignes
4. Tests E2E doivent toujours passer après refactor
5. Benchmark : wc -l avant vs après (cible -70%)

Fichiers : Tools/install-*.sh, Dev/scripts/install-*.sh, Infra/install-*.sh
DoD : -70% LOC install, tests E2E verts, aucun usage cassé
```

Validation croisée (après Agent 5) :
```
Agent({ subagent_type: "symfony-reviewer", prompt: "Review refactor install scripts pour Symfony" })
Agent({ subagent_type: "react-reviewer", prompt: "Review refactor install scripts pour React" })
Agent({ subagent_type: "flutter-reviewer", prompt: "Review refactor install scripts pour Flutter" })
Agent({ subagent_type: "python-reviewer", prompt: "Review refactor install scripts pour Python" })
```

#### Batch parallèle F — Supply chain & Skills (2 agents, parallèle avec E)

Agent 6: `@devops-engineer`
Prompt:
```
Contexte : SBOM et SLSA L2 nécessaires pour NIS2. Rapport 01 SEC-12 / rapport 08 SCAL-08.

Tâche :
1. Workflow .github/workflows/sbom.yml : SBOM CycloneDX JSON à chaque release
2. SLSA L2 provenance via slsa-framework/slsa-github-generator
3. Sigstore keyless signing des artefacts NPM
4. Documenter dans SECURITY.md

Recherches :
  WebSearch "CycloneDX npm SBOM GitHub Actions 2026"
  context7 resolve-library-id 'cyclonedx/cyclonedx-node-npm'
Fichiers : .github/workflows/sbom.yml, SECURITY.md
DoD : SBOM attaché à la prochaine release, SLSA provenance OK
```

Agent 7: `@refactoring-specialist`
Prompt:
```
Contexte : 9 skills > 80 lignes (max 239 lignes). Rapport 09 STD-03/07.

Tâche :
1. Identifier les 9 skills > 80 lignes dans .claude/skills/
2. Pour chaque skill : extraire contenu détaillé vers un REFERENCE.md dans le même dossier
3. Le SKILL.md garde le frontmatter + résumé actionnable < 80 lignes
4. Le REFERENCE.md est chargé via @ pointer depuis le SKILL.md

Fichiers : .claude/skills/*/SKILL.md
DoD : aucun SKILL.md > 80 lignes, contenu préservé dans REFERENCE.md
```

#### Batch parallèle G — Makefile & Documentation (1 agent)

Agent 8: `@devops-engineer`
Prompt:
```
Contexte : Makefile = 507 lignes avec duplication. Rapport 07 ARCH-15/21.

Tâche :
1. Court terme : extraire les commandes dupliquées vers des shell scripts modulaires dans scripts/
2. Makefile réduit = orchestrateur qui appelle les scripts
3. Cible : Makefile < 200 lignes
4. Long terme (Phase 4) : migration vers CLI Node.js natif

Fichiers : Makefile, scripts/
DoD : Makefile < 200 lignes, make install-symfony fonctionne toujours
```

### Sprint 2.3 — Audit dette & communauté (semaine 9-12)

#### Batch parallèle H — TODO audit + I18n (2 agents)

Agent 9: `@research-assistant`
Prompt:
```
Contexte : 1237 TODO/FIXME/HACK dans la codebase. Rapport 08 SCAL-15.

Tâche :
1. Grep tous les TODO/FIXME/HACK (hors node_modules, dist)
2. Catégoriser : bug (P0), tech-debt (P1), nice-to-have (P2), obsolète (supprimer)
3. Créer issues GitHub pour les P0 et P1 (draft)
4. Supprimer les TODO obsolètes
5. Rapport : audit/todo-audit.md avec statistiques

Fichiers : tous (hors node_modules)
DoD : rapport produit, TODO P0 = 0, issues drafts créés
```

Agent 10: `@research-assistant`
Prompt:
```
Contexte : I18n parité ES/DE/PT à 48%. Rapport 08 SCAL-03, déjà gelé en phase 1.

Tâche :
1. Vérifier que le gel i18n (EN+FR only, ES/DE/PT community-maintained) est documenté
2. Créer audit/phases/i18n-gap.csv si pas déjà fait (fichier, taille_EN, taille_ES/DE/PT, ratio)
3. Identifier le top 20 fichiers les plus critiques pour traduction communautaire
4. Préparer prompt de traduction standardisé pour DeepL/Claude

Fichiers : audit/phases/i18n-gap*.*, CONTRIBUTING.md
DoD : documentation gel à jour, top 20 identifié
```

## Actions humaines (non automatisables)

| Action | Description | Effort | Owner |
|--------|-------------|--------|-------|
| P2-19 | Recruter 2 co-mainteneurs (bus factor 1→3) | 80h | CEO/CTO |
| P2-17 | 3 showcases clients documentés | 40h | Marketing |
| P2-18 | Roadmap publique GitHub Project | 8h | CEO |
| P2-20 | Publier skills sur marketplace Anthropic (si ouvert) | 24h | DevRel |

## Recherches web/MCP pré-rédigées

```javascript
WebSearch({ query: "Stryker Mutator TypeScript Vitest configuration 2026" })
WebSearch({ query: "CycloneDX SBOM GitHub Actions NPM 2026" })
WebSearch({ query: "SLSA GitHub generator Level 2 NPM 2026" })
WebSearch({ query: "bashcov bash coverage Docker CI 2026" })
WebSearch({ query: "shellcheck GitHub Actions CI blocking 2026" })
// Context7
mcp__context7__resolve-library-id({ libraryName: "stryker-mutator/stryker-js" })
mcp__context7__resolve-library-id({ libraryName: "cyclonedx/cyclonedx-node-npm" })
```

## DoD & Validation globale

```bash
# Rules tokens
wc -l .claude/rules/*.md  # Total < 500 lignes

# Coverage
npm run test:coverage  # ≥60%
npm run test:e2e:tools  # Vert

# Mutation
npm run mutation  # Score ≥50%

# Shell
shellcheck -S error Tools/**/*.sh  # 0 erreurs

# Install scripts
wc -l Tools/install-*.sh  # Divisé par ≥3 vs baseline

# Skills
find .claude/skills -name "SKILL.md" -exec wc -l {} + | awk '$1 > 80'  # 0 résultats

# Makefile
wc -l Makefile  # < 200
```

## Risques & Rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Rules→Skills casse les references @ | Moyenne | Grep tous les @.claude/rules/ avant conversion |
| Refactor install casse setups | Moyenne | Feature flag + dual mode pendant 1 release |
| Stryker trop lent en CI | Faible | Job nightly, pas bloquant |
| Makefile refactor casse make targets | Moyenne | Tester chaque target avant merge |

## Condition de passage à Phase 3

- [ ] Rules auto-load < 3K tokens (vs 20K actuel)
- [ ] Coverage CLI ≥60%, Coverage Tools/ E2E ≥60%
- [ ] Mutation score ≥50%
- [ ] ShellCheck 0 erreur en CI
- [ ] Install scripts -70% LOC
- [ ] Makefile < 200 lignes
- [ ] Tous les SKILL.md < 80 lignes
- [ ] Bus factor ≥3 (dépend action humaine)

→ [phase-3-dx-ergonomie.md](phase-3-dx-ergonomie.md)
