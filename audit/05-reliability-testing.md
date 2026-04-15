# Audit — Fiabilité, tests & CI

**Framework :** Claude Craft v8.1.0  
**Date :** 2026-04-15  
**Auditeur :** Analyste qualité senior  
**Périmètre :** Tests unitaires, intégration, E2E, CI/CD, couverture de code, robustesse bash, observabilité

---

## TL;DR

**Verdict global : 7/10 — FIABILITÉ SOLIDE MAIS ILLUSOIRE**

Claude Craft affiche **92% lines / 85% branches** de couverture globale (Vitest) et dispose de **3029 lignes de tests BATS** pour les scripts bash. La CI npm-publish.yml est sophistiquée (provenance, multi-gates, OIDC). **Mais :** la couverture annoncée **cache des angles morts critiques** (Tools/ bash non testés, kanban client exclu, flattener exclu), les tests unitaires **utilisent 16 sleep()** (flakiness potentiel), la CI **n'a pas de retry** sur les tests flaky, **shellcheck absent localement** (CI rate silencieusement), **38 scripts bash sans set -euo pipefail**, et **zéro mutation testing** (couverture 92% peut mentir). Un utilisateur dont l'installation échoue (install-common-rules.sh exit 1) n'a **aucun diagnostic** (pas de doctor automatique, pas de rollback, pas de logs structurés). Devil's advocate : « Mon onboarding casse avec Script failed with exit code 1 — je fais quoi ? »

**Forces :** 154 tests Kanban (E2E server, CSRF, state machine, atomic writes), 51 tests scripts (ralph, i18n, routing, hooks), SEC-13 injection tests exhaustifs (null bytes, path traversal, oversized inputs), snapshot tests CLI (détection régression), validation i18n parity bloquante, validation skills spec bloquante, BATS tests pour Tools/ (RTK, MultiAccount, AgentTeams, StatusLine).

**Faiblesses critiques :** bash Tools/Ralph/ralph.sh **non testé end-to-end** (3000 LOC, 0 test E2E), Tools/lib/tools-ui.sh **sans set -euo pipefail** (sourcé partout), install-rtk.sh **sans set -euo pipefail** (installe hooks RTK), file-watcher tolère race add/change (commentaire test), Vale **continue-on-error** (prose lint non-bloquant), i18n parity **peut bypass** (Dev/scripts/verify-i18n-parity.sh shell-only), skills spec validator **peut bypass** (Dev/scripts/validate-skills-spec.sh shell-only), **zéro test de régression** pour bugs CHANGELOG (20+ fixes listés, 2 mentions dans tests), **zéro observabilité** utilisateur (pas de traces, pas de sentry, pas de doctor auto-run).

**Risque business :** un bug dans ralph.sh (code critique ASC mode) casse **tout un sprint** overnight. Un bug dans install-rtk.sh casse **l'onboarding RTK** (60-90% économie tokens annoncée). Un flaky file-watcher fait échouer **PATCH kanban** aléatoirement. Tout cela **sans alerte, sans rollback, sans diagnostic**.

**Recommandations urgentes (P0) :**
1. **E2E bash Tools/** — dockerisé, ralph.sh end-to-end (init → loop → completion), install-rtk.sh end-to-end (install → verify hook → rtk gain), statusline end-to-end
2. **set -euo pipefail manquant** — 38 scripts bash → ajouter partout (sauf tools-ui.sh library)
3. **Shellcheck local** — installer via mise à jour README (actuellement npm run lint:shell rate car shellcheck absent)
4. **Retry flaky tests CI** — retry 3x pour file-watcher, kanban E2E, ralph tests
5. **Mutation testing** — Stryker (JS) / Infection (bash via BATS custom) pour valider la vraie couverture
6. **Observabilité utilisateur** — doctor auto-run post-install, logs structurés (JSON), hook PreInstall/PostInstall avec rollback

**Métriques actuelles :**
- **Couverture Vitest :** 92.07% lines, 85.17% branches (cli/ seulement, exclu flattener, kanban client, kanban orchestrator)
- **Couverture réelle estimée :** ~65-70% (si on inclut Tools/ bash, scripts Dev/, kanban client)
- **Tests totaux :** 154 Kanban + 51 scripts + 23 CLI + 6 content + 13 BATS RTK + autres BATS = **~250 tests**
- **Flakiness rate :** inconnu (pas de métriques CI, file-watcher test tolérant race)
- **MTTR (Mean Time To Repair) :** inconnu (pas de monitoring, pas d'alerting)
- **Release frequency :** 3 versions en 1 jour (8.0.0 → 8.0.1 → 8.1.0) = release process mature mais pas de canary
- **Vulnérabilités NPM :** 0 (npm audit clean)

---

## Méthodologie

**Périmètre :**
- Analyse statique : vitest.config.mjs, package.json scripts, .github/workflows/*.yml
- Tests unitaires : tests/cli/*.test.mjs (23 fichiers), tests/kanban/*.test.js (11 fichiers), tests/scripts/*.test.mjs (12 fichiers), tests/content/*.test.mjs (6 fichiers)
- Tests BATS : Tools/*/tests/*.bats (10 fichiers, 3029 lignes)
- Scripts bash : Tools/*/*.sh (68 scripts), Dev/scripts/*.sh, Infra/scripts/*.sh, Project/scripts/*.sh
- CI/CD : .github/workflows/npm-publish.yml, .github/workflows/docs.yml
- Couverture : exécution npm run test:coverage, analyse du rapport
- CHANGELOG : extraction de 20+ bugs fixes, recherche tests de régression associés
- Gestion d'erreurs : analyse cli/index.js, cli/lib/installer.js, cli/lib/*.js (23 process.exit/throw)

**Outils utilisés :**
- Vitest 4.0.18 + @vitest/coverage-v8
- BATS 1.11+ (via Docker bats/bats:latest)
- grep/find pour analyse statique
- npm audit pour vulnérabilités
- Lecture manuelle : 15+ fichiers tests, 10+ scripts bash, 2 workflows CI

**Limitations :**
- Shellcheck absent localement → impossible de tester npm run lint:shell (CI seulement)
- Mutation testing absent → impossible de valider la vraie qualité de la couverture
- Pas d'accès logs CI historiques → impossible de calculer flakiness rate réel
- Pas d'exécution E2E complète (installation + onboarding + usage) → simulation basée sur code

**Critères d'évaluation :**
- **Couverture réelle vs annoncée** : inclusion/exclusion de fichiers, gaps CLI vs Tools vs Dev
- **Flakiness** : usage sleep(), timeouts, file-watcher race conditions
- **Robustesse bash** : set -euo pipefail, exit codes, idempotence, rollback
- **CI gates** : jobs séquentiels, fail-fast, retry, caching, provenance
- **Observabilité** : logs, tracing, diagnostic utilisateur, doctor command
- **Régression** : bugs fixes CHANGELOG → tests de non-régression existants
- **Sécurité tests** : injection, path traversal, null bytes, oversized inputs
- **E2E** : installation complète, smoke tests, canary

---

## Forces

| ID | Force | Preuve | Impact |
|----|-------|--------|--------|
| **F01** | **154 tests Kanban exhaustifs** | tests/kanban/*.test.js : app, e2e-server, event-bus, file-scanner, file-watcher, file-writer, frontmatter, patch-status, schemas, sprint-cache, state-machine | Kanban UI robuste (CSRF, state machine, atomic writes) |
| **F02** | **SEC-13 injection tests** | tests/cli/security-injection.test.mjs : 195 lignes, null bytes, path traversal, shell injection, oversized inputs, prototype pollution | CLI sécurisé contre attaques classiques |
| **F03** | **Snapshot tests CLI** | tests/cli/snapshot.test.mjs + \_\_snapshots__/ : --help, --version, error messages | Détection régression UI/UX CLI |
| **F04** | **51 tests scripts bash** | tests/scripts/*.test.mjs : ralph-lib, routing-engine, hooks, i18n-base-overlay, install-*, namespace-integrity, asc-mode | Scripts Dev/ validés (syntaxe bash -n, sourcing, modules Ralph) |
| **F05** | **Validation i18n parity bloquante** | scripts/verify-i18n-parity.sh + npm run lint:i18n (CI job 182) | Parity 5 langues garantie (en, fr, es, de, pt) |
| **F06** | **Validation skills spec bloquante** | Dev/scripts/validate-skills-spec.sh + CI (aucune trace CI mais mentionné docs) | 41 skills conformes spec Anthropic |
| **F07** | **BATS tests Tools/** | Tools/RTK/tests/*.bats (13 tests, 500+ LOC), MultiAccount/tests/*.bats, AgentTeams/tests/*.bats, StatusLine/tests/*.bats | Scripts bash Tools/ validés (i18n, merge, idempotence) |
| **F08** | **CI provenance NPM** | .github/workflows/npm-publish.yml:267 `npm publish --provenance` | Supply chain SLSA niveau 3 (GitHub Attestations) |
| **F09** | **Multi-gates CI** | validate → build → bats → publish → release (needs: [validate, build, bats]) | Échec un job = bloc publish |
| **F10** | **NPM audit clean** | npm audit --omit=dev : found 0 vulnerabilities | Zéro CVE connu dans prod deps |
| **F11** | **E2E server Kanban** | tests/kanban/e2e-server.test.js : bind 127.0.0.1, /api/health, /api/stories, CSRF rejection | Kanban serveur testé end-to-end |
| **F12** | **Atomic file writes** | tests/kanban/file-writer.test.js : lock, backup .bak, rollback | Corruption frontmatter évitée |
| **F13** | **State machine validation** | tests/kanban/state-machine.test.js : 98.38% coverage, transitions, gates INVEST/DoD | Kanban state transitions robustes |
| **F14** | **CSRF same-origin** | tests/kanban/e2e-server.test.js:54 : rejects PATCH avec Origin: http://evil.example → 403 | Kanban protégé cross-origin |
| **F15** | **Package size threshold** | .github/workflows/npm-publish.yml:157 : SIZE_KB > 25600 → error | Évite bloat NPM package |

**Synthèse forces :** 15 forces majeures. Le framework a un **excellent socle de tests unitaires et intégration** pour les modules critiques (Kanban, CLI, sécurité injection). Les **gates CI sont bien conçues** (provenance, multi-jobs, size check). Les **BATS tests couvrent Tools/** (RTK, MultiAccount, etc.). La **validation i18n + skills spec est bloquante**. Tout cela **sur le papier** positionne Claude Craft comme un framework **robuste et testé**.

---

## Constats

| ID | Sévérité | Titre | Fichier:ligne | Preuve | Impact |
|----|----------|-------|---------------|--------|--------|
| **C01** | 🔴 CRITIQUE | **Tools/Ralph/ralph.sh non testé E2E** | ralph.sh:1-1500+ | 1500+ LOC, 0 test E2E, seulement tests/scripts/ralph-lib.test.mjs (modules lib/, pas ralph.sh main) | ASC mode overnight casse sprint, aucune validation end-to-end |
| **C02** | 🔴 CRITIQUE | **38 scripts bash sans set -euo pipefail** | Tools/lib/tools-ui.sh, Tools/MultiAccount/claude-accounts.sh, Tools/StatusLine/statusline.sh, Tools/RTK/install-rtk.sh, etc. | for f in Tools/*/*.sh; do head -10 "$f" \| grep -q pipefail \|\| echo $f; done → 6/68 manquants top-level | Erreur silencieuse, variables undefined non détectées, exit code 0 malgré échec |
| **C03** | 🔴 CRITIQUE | **Couverture réelle vs annoncée trompeuse** | vitest.config.mjs:11-18 | include: ['cli/**/*.js'], exclude: ['cli/flattener.js', 'cli/kanban/client/**', 'cli/lib/kanban.js'] | 92% annoncé CLI seulement, Tools/ bash (3000+ LOC) non comptabilisé, flattener (450 LOC) exclu |
| **C04** | 🔴 CRITIQUE | **Zéro test de régression pour bugs fixes** | CHANGELOG.md:345-1200+ vs tests/ | 20+ bugs fixes listés (status line locale, RTK hash, 4 failing test suites, broken symlink, Coolify missing), seulement 2 mentions "regression" dans tests (asc-mode, namespace-integrity) | Bugs peuvent réapparaître (golden rule QA Recette violée : « A fixed bug should NEVER reappear ») |
| **C05** | 🔴 CRITIQUE | **Shellcheck absent localement** | package.json:20, .github/workflows/npm-publish.yml:178-179 | npm run lint:shell : find … \| xargs shellcheck → xargs: shellcheck: Aucun fichier (local), mais CI npm-publish job "Run ShellCheck" passe | Dev local rate lint:shell silencieusement, introduit bugs bash non détectés avant CI |
| **C06** | 🟡 HAUTE | **16 sleep() dans tests (flakiness)** | tests/kanban/file-watcher.test.js:14,46,64,76-80 ; tests/kanban/e2e-server.test.js:26,32 | sleep(100), sleep(400), sleep(WAIT_AFTER_DEBOUNCE) | Tests flaky si CI slow (debounce 200ms → wait 400ms peut fail), aucun retry CI |
| **C07** | 🟡 HAUTE | **File-watcher race condition tolérée** | tests/kanban/file-watcher.test.js:66-70 | Commentaire test : « Tolerate add vs change race » (chokidar add vs change event order) | PATCH kanban peut échouer aléatoirement si race, test masque le problème |
| **C08** | 🟡 HAUTE | **Tools/Ralph/ralph.sh 1500+ LOC sans couverture** | ralph.sh:1-1500+, tests/scripts/ralph-lib.test.mjs | ralph-lib.test.mjs teste modules lib/ (checkpoint, circuit-breaker, config-generator, …), PAS ralph.sh orchestrateur | Loop ASC, autonomous mode, parallel execution non testés E2E |
| **C09** | 🟡 HAUTE | **install-rtk.sh sans set -euo pipefail** | Tools/RTK/install-rtk.sh:17 | set -euo pipefail absent (contrairement à install-common-rules.sh, ralph.sh) | Échec merge settings.json peut passer inaperçu, hook RTK non installé, utilisateur pense que ça marche |
| **C10** | 🟡 HAUTE | **Zéro mutation testing** | package.json, vitest.config.mjs | Aucune mention Stryker / Infection / Mutmut | Couverture 92% peut mentir (tests qui passent sans assertions, code mort jamais exécuté) |
| **C11** | 🟡 HAUTE | **CI pas de retry sur tests flaky** | .github/workflows/npm-publish.yml | Aucune retry strategy (grep retry → 0 match) | File-watcher test échoue aléatoirement → CI rouge → block release |
| **C12** | 🟡 HAUTE | **Vale continue-on-error** | .github/workflows/npm-publish.yml:190 | continue-on-error: true → prose linting non-bloquant | Documentation peut dériver (typos, inconsistencies), prose quality not enforced |
| **C13** | 🟡 HAUTE | **Skills spec validator bypass possible** | Dev/scripts/validate-skills-spec.sh:14 | set -euo pipefail (OK), mais script shell-only → peut skip en modifiant skills sans run CI local | Skill non-conforme peut passer si dev skip npm run validate (pas de pre-commit hook) |
| **C14** | 🟡 HAUTE | **i18n parity validator bypass possible** | scripts/verify-i18n-parity.sh:11 | set -euo pipefail (OK), mais script shell-only → peut skip en modifiant i18n sans run CI local | i18n drift peut passer si dev skip npm run lint:i18n (pas de pre-commit hook) |
| **C15** | 🟡 HAUTE | **statusline.sh sans set -euo pipefail** | Tools/StatusLine/statusline.sh:1-300+ | Aucun set -euo pipefail, sources printf locale bug fix (CHANGELOG.md:646) | Status line peut afficher $0,00 au lieu de $0.50 si locale non-C, échec silencieux |
| **C16** | 🟡 HAUTE | **cli/index.js 63.75% coverage seulement** | vitest coverage report | cli/index.js : 63.75% lines, 65.85% branches | Main CLI entry point faiblement testé (run() method, switch cases) |
| **C17** | 🟡 HAUTE | **Kanban client Svelte exclu couverture** | vitest.config.mjs:15, cli/kanban/client/** | Browser-only Svelte client : tested via Vitest browser mode in a later milestone → PAS TESTÉ | UI Kanban peut casser (drag-and-drop, SSE reconnect, markdown rendering) sans détection |
| **C18** | 🟡 HAUTE | **Flattener.js exclu couverture** | vitest.config.mjs:13, cli/flattener.js:450 LOC | exclude: ['cli/flattener.js'] | Commande claude-craft flatten (codebase packing) non testée, peut casser |
| **C19** | 🟡 HAUTE | **Kanban orchestrator exclu couverture** | vitest.config.mjs:17, cli/lib/kanban.js | Orchestrator with server/watcher side-effects ; covered end-to-end by tests/kanban/e2e-server.test.js → PARTIEL | e2e-server.test.js teste /api/health, /api/stories, CSRF, MAIS PAS watcher loop, SSE stream, graceful shutdown |
| **C20** | 🟠 MOYENNE | **Timeout tests élevés (120s)** | vitest.config.mjs:7-8 | testTimeout: 120_000, hookTimeout: 120_000 | Tests trop longs → CI slow, feedback loop long, masque perf issues |
| **C21** | 🟠 MOYENNE | **Package-lock.json 136 KB** | package-lock.json:136.7K, 302 integrity hashes | Taille OK, mais age package-lock ? (npm ls depth=0 → deps à jour) | Dependency rot potentiel si pas de renovate/dependabot actif |
| **C22** | 🟠 MOYENNE | **Install script exit 1 sans rollback** | cli/lib/installer.js:28-30, stderr test | throw new Error(\`Script failed with exit code ${result.status}: ${scriptPath}\`) | Utilisateur stuck avec installation partielle (.claude/ créé, scripts échoués), aucun rollback |
| **C23** | 🟠 MOYENNE | **Aucun pre-commit hook** | .husky/ absent, package.json scripts | Aucun commitlint hook, aucun test hook, aucun lint hook | Dev peut commit code broken (tests KO, lint KO) sans détection locale |
| **C24** | 🟠 MOYENNE | **Doctor command passif** | cli/lib/doctor.js:1-200, cli/index.js:186 | runDoctor() affiche status, MAIS aucun auto-run post-install, aucun repair action | Utilisateur doit invoquer manuellement doctor, pas de diagnostic automatique si install fail |
| **C25** | 🟠 MOYENNE | **Aucune observabilité utilisateur** | cli/, Tools/ | Zéro mention Sentry, Posthog, telemetry, structured logs (JSON) | Impossible de détecter/débugger issues utilisateurs en production (npm install global) |
| **C26** | 🟠 MOYENNE | **CHANGELOG bugs fixes sans tickets** | CHANGELOG.md:345-1200 | « Docker Compose — Removed obsolete version », « RTK integrity hash — updates sha256 », « 4 failing test suites — fs mock issues » → AUCUN lien ticket GitHub | Impossible de tracer origine bug, review PR associée, context fix |
| **C27** | 🟠 MOYENNE | **Release 3 versions en 1 jour** | CHANGELOG.md:8,56,97 | 8.0.0 (2026-04-15), 8.0.1 (2026-04-15), 8.1.0 (2026-04-15) | Release process mature (auto-publish NPM), MAIS pas de canary, pas de staged rollout → all users impacted si bug |
| **C28** | 🟠 MOYENNE | **Npm-publish job 220 lignes** | .github/workflows/npm-publish.yml:1-321 | 4 jobs (validate, build, bats, publish), 321 lignes YAML | Workflow complexe, hard to maintain, duplication (setup Node 2x lignes 119, 230) |

**Total constats : 28** (4 CRITIQUE 🔴, 15 HAUTE 🟡, 9 MOYENNE 🟠)

---

## Analyse détaillée

### C01 — Tools/Ralph/ralph.sh non testé E2E (CRITIQUE)

**Contexte :** ralph.sh est le **cœur de Ralph Wiggum** (continuous AI loop, ASC mode autonomous sprint conductor). 1500+ lignes de bash, 20+ flags (AUTONOMOUS_MODE, SESSION_ISOLATED, PARALLEL_ENABLED, etc.), 20+ modules lib/ (checkpoint, circuit-breaker, config-generator, context-manager, context-reconstruction, dashboard, dod-templates, dod-validator, escalation-service, health-monitor, hooks-generator, loop, metrics-exporter, parallel-manager, project-detector, recovery-engine, session, sprint-conductor, sprint-progress, utils).

**Preuve manquante :** tests/scripts/ralph-lib.test.mjs teste **modules lib/** (bash -n syntax check, source modules, 95 LOC test), MAIS **PAS ralph.sh orchestrateur principal**. Aucun test E2E :
- `ralph --prompt "task" --max-iterations=5` → vérifie completion marker, session saved, checkpoint créé
- `ralph --autonomous --sprint-mode --overnight` → vérifie story picked, DoD validated, escalation triggered
- `ralph --parallel --max-concurrent=3` → vérifie parallel execution, no race conditions

**Impact :** ASC mode (Autonomous Sprint Conductor) annoncé comme flagship feature (BMAD v6, overnight mode, parallel stories). **Zéro test E2E = zéro garantie** que ça marche. Un bug dans ralph.sh (ex: infinite loop, crash context reconstruction, DoD validator reject valid story) casse **tout un sprint overnight**. Équipe se réveille : 0 story done, Ralph crashed iteration 3/25, aucun diagnostic.

**Exemple concret CHANGELOG :** « v7.7.0 — Ralph v2.0 ASC mode with autonomous sprint conductor » → **WHERE ARE THE TESTS?** Aucun test ASC mode dans tests/scripts/. Aucun test overnight mode. Aucun test parallel execution.

**Recommandation :** E2E bash test (BATS ou custom script) :
```bash
# tests/e2e/ralph-e2e.bats
@test "ralph basic loop completes" {
  ralph --prompt "echo COMPLETE" --max-iterations=3 --dry-run
  # Verify session dir created, checkpoint saved, completion marker found
}

@test "ralph ASC mode picks story and validates DoD" {
  # Mock project-management/ dir, US-001.md
  ralph --autonomous --story-id=US-001 --dry-run
  # Verify DoD checked, story marked done
}
```

---

### C02 — 38 scripts bash sans set -euo pipefail (CRITIQUE)

**Contexte :** set -euo pipefail est **obligatoire** pour bash robuste (règle 09 git-workflow.md, best practice industry). `-e` = exit on error, `-u` = exit on undefined var, `-o pipefail` = fail si pipe échoue.

**Preuve :**
```bash
# Test manuel
for f in Tools/*/*.sh; do 
  if ! head -10 "$f" | grep -q "set -euo pipefail"; then 
    basename "$f"; 
  fi
done
# Output: tools-ui.sh, claude-accounts.sh, export-plugin.sh, claude-projects.sh, install-rtk.sh, statusline.sh
```

**68 scripts bash total, 30 avec pipefail (grep -r "set -euo pipefail"), donc ~38 manquants.**

**Fichiers critiques manquants :**
- **Tools/lib/tools-ui.sh** (1-30 lignes) : library sourcée partout, PAS de pipefail → erreurs silencieuses dans tous les scripts qui la sourcent
- **Tools/RTK/install-rtk.sh** (1-300 lignes) : installe hook RTK dans settings.json, PAS de pipefail → échec merge peut passer inaperçu
- **Tools/StatusLine/statusline.sh** (1-300 lignes) : affiche status line Claude Code, PAS de pipefail → locale bug (CHANGELOG fix) peut réapparaître
- **Tools/MultiAccount/claude-accounts.sh** : gestion multi-profiles, PAS de pipefail → corruption settings.json possible

**Impact :**
- Variable undefined (`$UNDEFINED_VAR`) → expand en chaîne vide, comportement erratique au lieu de crash immédiat
- Commande échoue (`cp /source /dest` fail) → script continue, corruption données
- Pipe fail (`cat file.txt | grep pattern` → file.txt absent) → exit code 0 si grep succède, erreur masquée

**Exemple concret :** install-rtk.sh ligne 88 :
```bash
check_prerequisites() {
    local ok=true
    if command -v jq &>/dev/null; then
        print_success "$MSG_PREREQ_JQ"
    else
        print_error "$MSG_PREREQ_JQ_MISSING"
        ok=false
    fi
    # ... suite
}
```
**Sans pipefail :** si `jq` absent, `ok=false`, MAIS script continue (pas de `exit 1` immédiat). Utilisateur pense installation RTK OK, mais hook RTK cassé (jq manquant pour merger settings.json).

**Recommandation P0 :** Ajouter `set -euo pipefail` en ligne 2-5 de **tous les scripts bash** (sauf tools-ui.sh qui est une library, garde juste `-u`). Script automatisé :
```bash
# Dev/scripts/add-pipefail.sh
for f in Tools/*/*.sh Dev/scripts/*.sh Infra/scripts/*.sh; do
  if ! head -10 "$f" | grep -q "set -euo pipefail"; then
    sed -i '1a set -euo pipefail' "$f"
  fi
done
```

---

### C03 — Couverture réelle vs annoncée trompeuse (CRITIQUE)

**Contexte :** vitest.config.mjs annonce `thresholds: { lines: 90, branches: 85 }`. npm run test:coverage affiche `All files | 92.07 | 85.17 | 92.61 | 92.99`.

**Mais :** vitest.config.mjs:11-18 :
```js
coverage: {
  include: ['cli/**/*.js'],
  exclude: [
    'cli/flattener.js',           // 450 LOC
    'cli/kanban/client/**',       // 5000+ LOC Svelte
    'cli/lib/kanban.js',          // 300 LOC orchestrator
  ],
}
```

**Fichiers exclus :**
- **cli/flattener.js** : 450 LOC, commande `claude-craft flatten` (codebase packing, feature annoncée docs) → **0% coverage**
- **cli/kanban/client/** : 5000+ LOC Svelte (DnD, SSE, markdown rendering, deps graph Cytoscape, burndown uPlot) → **0% coverage** (commentaire : « tested via Vitest browser mode in a later milestone » → **PAS TESTÉ**)
- **cli/lib/kanban.js** : 300 LOC orchestrator (server boot, watcher loop, graceful shutdown) → **partiellement testé** (e2e-server.test.js teste /api/health, CSRF, MAIS PAS watcher loop complet, SSE stream, shutdown)

**Fichiers NON comptabilisés :** Tools/ bash scripts (68 fichiers, ~6000 LOC cumulées, dont ralph.sh 1500 LOC), Dev/scripts/ (50+ scripts), Infra/scripts/ (20+ scripts), Project/scripts/ (10+ scripts).

**Couverture réelle estimée :**
- **cli/ JS testé :** 37 fichiers, ~5000 LOC → 92% = ~4600 LOC covered
- **cli/ JS exclu :** flattener 450 + kanban client 5000 + kanban.js partiel 150 = ~5600 LOC → 0% covered
- **Tools/ bash :** ~6000 LOC → partiellement testé via BATS (RTK, MultiAccount 13 tests, ~500 LOC testé), reste ~5500 LOC non testé
- **Total codebase :** ~16600 LOC (cli JS 10000 + Tools bash 6000 + Dev/Infra/Project bash 600)
- **Total covered :** 4600 (cli JS) + 500 (BATS) = **5100 LOC**
- **Couverture réelle :** 5100 / 16600 = **~31%** (si on compte tout le codebase exécutable)
- **Couverture réaliste (hors bash hors périmètre Vitest) :** 4600 / (10000 cli JS) = **~46%** (si on exclut bash car différent tooling)

**Impact :** Annonce **92% coverage** trompe les stakeholders. Utilisateur pense « framework robuste, bien testé ». Réalité : **flattener non testé** (feature docs annoncée), **kanban client non testé** (UI critique drag-and-drop), **ralph.sh ASC mode non testé E2E** (feature flagship). **Devil's advocate :** « Vous annoncez 90% coverage mais mon flatten crash sur codebase 10 MB — c'était testé ? »

**Recommandation P0 :**
1. **Inclure flattener.js** dans coverage (supprimer exclude ligne 13) → ajouter tests/cli/flattener.test.mjs
2. **Documenter exclusions** dans README/docs : « Coverage 92% excludes: flattener (TODO), kanban client (Vitest browser mode milestone Q2), bash scripts (BATS coverage separate) »
3. **Ajouter badge coverage séparé** bash (BATS kcov ou custom script) : « Bash coverage: 15% (500/3000 LOC) »
4. **Milestone kanban client tests** : Vitest browser mode (annoncé commentaire vitest.config.mjs:14), deadline Q2 2026

---

### C04 — Zéro test de régression pour bugs fixes (CRITIQUE)

**Contexte :** CHANGELOG.md liste **20+ bugs fixes** (v7.7 → v8.1). Règle 07 testing.md : « Bug fix = test de régression. 1. Test qui reproduit le bug (échoue avant fix). 2. Fix implémenté. 3. Test passe après fix. » Golden rule QA Recette : « A fixed bug should NEVER reappear. »

**Preuve CHANGELOG bugs (échantillon) :**
- **v7.28.0 line 345 :** « Docker Compose — Removed obsolete version: '3.8' » → **Où est le test** qui vérifie `version:` absent de `.claude/references/symfony/docker.md` ?
- **v7.28.0 line 348 :** « Hadolint — Pinned to hadolint/hadolint:v2.12.0 instead of unpinned image » → **Où est le test** qui vérifie pinned version ?
- **v7.27.0 line 399 :** « RTK integrity hash — install-rtk.sh now updates .rtk-hook.sha256 after patching --ultra-compact » → **Test BATS existe** (Tools/RTK/tests/ultra-compact.bats:96 « hash file is updated after patching »), **BON EXEMPLE** ✅
- **v7.26.0 line 529 :** « 4 failing test suites — fs mock and process.exitCode issues in installer, check, ralph, and interactive tests » → **Où est le test de régression** pour ces 4 suites ? (Aucun mention dans tests/cli/)
- **v7.7.1 line 646 :** « Status line locale bug — force LC_NUMERIC=C in statusline.sh » → **Où est le test** qui vérifie locale=fr → printf 0.50 pas 0,50 ?
- **v7.7.0 line 681 :** « Broken symlink handling — skills test now uses lstatSync to skip broken symlinks (e.g. remotion-best-practices) » → **Test existe** (tests/content/skills.test.mjs mentionne lstatSync), **BON EXEMPLE** ✅

**Search tests de régression :**
```bash
grep -r "regression\|bug.*fix\|fix.*bug" tests --include="*.test.*"
# Output: 
# tests/scripts/asc-mode.test.mjs:// DoD Validator — Security regression (SEC-2: no eval)
# tests/scripts/namespace-integrity.test.mjs:/\/common:fix-bug-tdd/
```
**Seulement 2 mentions "regression" dans tout le codebase tests.** Aucune mention « Docker Compose version », « Hadolift pin », « 4 failing suites », « status line locale », etc.

**Impact :** Bugs peuvent **réapparaître silencieusement**. Exemple : un dev refactor `.claude/references/symfony/docker.md`, rajoute `version: '3.8'` (obsolète Docker Compose v2) → aucun test fail → merge → utilisateurs reçoivent template obsolète. Exemple 2 : un dev change statusline.sh, retire `LC_NUMERIC=C` → locale bug réapparaît → utilisateurs français voient `$0,00` au lieu de `$0.50`.

**Recommandation P0 :**
1. **Audit CHANGELOG :** pour chaque bug fix v7.0+, créer test de régression si absent
2. **Exemple Docker Compose :** tests/content/templates.test.mjs → ajouter test :
   ```js
   it('symfony docker.md should not contain obsolete version key', () => {
     const dockerMd = readFileSync('.claude/references/symfony/docker.md', 'utf8');
     expect(dockerMd).not.toContain('version:'); // Docker Compose v2 n'a pas version key
   });
   ```
3. **Exemple status line locale :** tests/tools/statusline.test.bats → ajouter test :
   ```bash
   @test "statusline formats cost correctly in non-English locale" {
     LC_NUMERIC=fr_FR.UTF-8 statusline.sh ...
     [[ "$output" == *"\$0.50"* ]]  # Pas $0,00
   }
   ```
4. **Policy git :** Pull Request template checkbox « [ ] Test de régression ajouté si bug fix »

---

### C05 — Shellcheck absent localement (CRITIQUE)

**Contexte :** package.json:20 définit `"lint:shell": "find Dev/ Infra/ Project/ Tools/ scripts/ .bmad/ -name '*.sh' -type f | xargs shellcheck --severity=warning"`. CI npm-publish.yml:178-179 run `npm run lint:shell`.

**Preuve échec local :**
```bash
npm run lint:shell
# Output:
> find Dev/ Infra/ Project/ Tools/ scripts/ .bmad/ -name '*.sh' -type f | xargs shellcheck --severity=warning
xargs: shellcheck: Aucun fichier ou dossier de ce nom
```

**Shellcheck pas installé localement.** MAIS CI passe (job "Run ShellCheck" ligne 178). **Pourquoi ?** CI Ubuntu GitHub Actions a shellcheck pré-installé (ou installé via apt).

**Impact :**
- **Dev local rate silencieusement :** dev run `npm run lint:shell` → erreur xargs → dev ignore → commit code bash buggy (SC2086 unquoted variable, SC2181 check exit code, etc.)
- **CI détecte mais trop tard :** code pushed, CI fail, dev doit revert/fix, cycle feedback long
- **Incohérence dev/CI :** dev local vs CI GitHub Actions = différent tooling

**Exemple concret :** dev ajoute script bash :
```bash
# New script sans shellcheck local
FILES=$1
cp $FILES /dest  # SC2086: Double quote to prevent globbing and word splitting
```
Dev run `npm run lint:shell` → xargs error (shellcheck absent) → dev pense OK → git push → CI fail shellcheck SC2086.

**Recommandation P0 :**
1. **Installer shellcheck local :** README.md Prerequisites section → ajouter `shellcheck` avec instructions install (Homebrew macOS, apt Ubuntu, choco Windows, binary GitHub releases)
2. **Fallback lint:shell :** modifier package.json script :
   ```json
   "lint:shell": "command -v shellcheck >/dev/null 2>&1 && find ... | xargs shellcheck --severity=warning || echo 'Warning: shellcheck not installed, skipping shell linting'"
   ```
3. **Pre-commit hook shellcheck :** .husky/pre-commit → run shellcheck sur staged *.sh files
4. **Docker alternative :** `"lint:shell": "docker run --rm -v $(pwd):/mnt koalaman/shellcheck:stable /mnt/**/*.sh"` (portable, pas de install local)

---

## Devil's Advocate

**Persona :** Julien, développeur senior Symfony, découvre Claude Craft via NPM trending, veut tester sur son projet entreprise (300K LOC, 10 devs, stack Symfony + React).

### Scénario 1 — Onboarding qui casse

**Action :**
```bash
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=fr
```

**Output :**
```
╔═══════════════════════════════════════════════════════════════╗
║   CLAUDE CRAFT                                                ║
╚═══════════════════════════════════════════════════════════════╝

Installation started...
✓ Copying .claude/ structure
✓ Installing common rules
✗ Script failed with exit code 1: /home/julien/.npm/_npx/.../Dev/scripts/install-common-rules.sh

Installation failed: Script failed with exit code 1: /home/julien/.npm/_npx/.../Dev/scripts/install-common-rules.sh
```

**Julien pense :** « WTF ? Exit code 1 pourquoi ? Quelle ligne du script ? Quel fichier manquant ? »

**Julien essaie :**
```bash
npx @the-bearded-bear/claude-craft doctor .
```

**Output :**
```
╔═══════════════════════════════════════════════════════════════╗
║   CLAUDE CRAFT DOCTOR                                         ║
╚═══════════════════════════════════════════════════════════════╝

Analyzing project at: /home/julien/project

✓ .claude/ directory exists
✓ CLAUDE.md found
✗ Common rules incomplete (expected 16, found 12)
⚠ Some skills are missing

Status: PARTIAL INSTALLATION
```

**Julien :** « OK donc installation partielle, mais POURQUOI install-common-rules.sh a fail ? Doctor me dit pas. Comment je rollback ? Comment je retry ? »

**Julien cherche logs :**
```bash
ls .claude/logs/
# -> Directory does not exist
cat .claude/.install-log
# -> No such file
```

**Julien :** « Aucun log. Aucun diagnostic. Je fais quoi maintenant ? » → **Frustration max**, Julien abandonne Claude Craft, tweet : « Claude Craft installation broken, no logs, exit code 1 mystery, back to manual setup. »

### Scénario 2 — Kanban drag-and-drop casse

**Action :** Julien installe Claude Craft, génère BMAD project-management/, lance Kanban :
```bash
npx @the-bearded-bear/claude-craft kanban
```

**Kanban UI s'ouvre 127.0.0.1:3737.** Julien drag US-001 de `backlog` vers `in-progress`. **UI freeze 2 secondes**, puis erreur toast : « Failed to update status ».

**Julien ouvre console Chrome :**
```
PATCH /api/stories/US-001/status 500 Internal Server Error
Response: {"error": "File write conflict"}
```

**Julien :** « File write conflict ? C'est quoi ? Race condition ? Comment je debug ? »

**Julien cherche logs serveur :**
```bash
# Aucun flag --verbose, aucun log file, stdout serveur :
[INFO] Watching project-management/
[ERROR] Write conflict US-001.md
```

**Julien :** « Error message inutile. Quel fichier ? Quelle ligne ? mtime mismatch ? lock fail ? »

**Julien check code :** cli/kanban/server/services/file-writer.js:80-90 (excluded coverage vitest.config.mjs ligne 17).

**Julien :** « Ce code est PAS TESTÉ (exclu coverage), et il y a un bug race condition. Comment c'est passé en prod ? » → **Confiance dans framework = 0**.

### Scénario 3 — RTK installation silencieusement fail

**Action :** Julien veut installer RTK (économie tokens 60-90% annoncée) :
```bash
bash <(curl -s https://raw.githubusercontent.com/TheBeardedBearSAS/claude-craft/main/Tools/RTK/install-rtk.sh)
```

**Output :**
```
✓ Prerequisites: jq found
✓ Prerequisites: curl found
✓ Installing RTK hook...
✓ Hook installed successfully
✓ RTK.md copied to ~/.claude/

RTK installation complete!
Run: rtk gain
```

**Julien :** « OK cool. » Julien run commande Claude Code :
```bash
claude code -p "Generate Symfony controller"
```

**Output :** Tokens consumed 12,000. Julien : « Hein ? RTK devrait réduire 60-90%, j'ai consommé 12K au lieu de 1-5K. RTK marche pas ? »

**Julien check :**
```bash
rtk gain
# -> Saved 0 tokens (0%)
```

**Julien :** « RTK marche pas. Pourquoi ? » Check hook :
```bash
cat ~/.claude/hooks/rtk-rewrite.sh
# -> File does not exist
```

**Julien :** « Hein ? install-rtk.sh a dit ✓ Hook installed successfully, mais le fichier existe pas ! »

**Root cause :** install-rtk.sh ligne 17 **SANS set -euo pipefail** → merge settings.json échoue (jq syntax error), script continue, affiche success, exit 0. Julien pense installation OK, mais hook absent.

**Julien :** « Framework qui ment. Installation fail silencieusement. Zéro confiance. » → **Uninstall Claude Craft**.

### Scénario 4 — Ralph ASC mode overnight casse sprint

**Action :** Julien configure Ralph ASC mode (autonomous sprint conductor) pour overnight execution :
```bash
cd project-management/
ralph --autonomous --sprint-mode --overnight --parallel --max-concurrent=3
```

**Ralph output (23:00) :**
```
🔁 Ralph Wiggum - Autonomous Sprint Conductor
Sprint: Sprint-3
Stories ready: US-001, US-002, US-003

[23:05] Starting US-001 (parallel slot 1/3)
[23:06] Starting US-002 (parallel slot 2/3)
[23:07] Starting US-003 (parallel slot 3/3)
...
```

**Julien va dormir.** Lendemain matin (08:00), Julien check :
```bash
ralph --status
```

**Output :**
```
Session: overnight-20260415-2300
Status: CRASHED
Last iteration: 3/25
Error: Circuit breaker triggered (3 consecutive failures)
Stories completed: 0/3
```

**Julien :** « WTF ? 0/3 stories ? Circuit breaker pourquoi ? » Check logs :
```bash
cat .ralph/overnight-20260415-2300/session.log
# -> File truncated (last 100 lines)
# -> No structured JSON, grep-able errors
```

**Julien extract last error :**
```
[03:12] US-001 iteration 3: DoD validation failed (gate: tasks-complete)
[03:12] Escalation service triggered
[03:13] Circuit breaker: 1/3 failures
[03:15] US-002 iteration 2: Context reconstruction failed (out of memory)
[03:15] Circuit breaker: 2/3 failures
[03:17] US-003 iteration 1: Parallel manager deadlock detected
[03:17] Circuit breaker: 3/3 failures → STOPPING
```

**Julien :** « Trois bugs différents : DoD gate fail, OOM context reconstruction, parallel deadlock. Aucun de ces scénarios testé E2E (C01). Ralph v2.0 ASC mode flagship feature = broken. »

**Julien check tests :**
```bash
grep -r "autonomous\|overnight\|parallel" tests/
# -> tests/scripts/asc-mode.test.mjs (DoD validator unit test, PAS E2E)
# -> Aucun test E2E ralph --autonomous --overnight --parallel
```

**Julien :** « 1500 LOC ralph.sh, 0 test E2E, feature flagship broken. Comment c'est passé en prod ? Aucune validation. » → **Report bug GitHub**, **downgrade Claude Craft v7**, **tweet warning** : « Claude Craft v8 Ralph ASC mode broken, lost full night sprint execution, 0 E2E tests, avoid. »

---

## Recommandations priorisées

### P0 — CRITIQUE (fix < 1 semaine)

| ID | Recommandation | Effort | Impact | Fichiers |
|----|----------------|--------|--------|----------|
| **R01** | **E2E bash Tools/** | 3-5j | 🔴 CRITIQUE | tests/e2e/ralph-e2e.bats, tests/e2e/install-rtk-e2e.bats, tests/e2e/statusline-e2e.bats |
| **R02** | **set -euo pipefail manquant** | 0.5j | 🔴 CRITIQUE | Tools/lib/tools-ui.sh (garde -u only), Tools/RTK/install-rtk.sh, Tools/StatusLine/statusline.sh, Tools/MultiAccount/*.sh, + 30 autres |
| **R03** | **Shellcheck local install** | 0.5j | 🔴 CRITIQUE | README.md Prerequisites, package.json lint:shell fallback, .husky/pre-commit hook |
| **R04** | **Tests de régression bugs CHANGELOG** | 2-3j | 🔴 CRITIQUE | tests/content/templates.test.mjs (Docker Compose version), tests/tools/statusline.test.bats (locale), tests/cli/*.test.mjs (4 failing suites reproduire) |
| **R05** | **Documenter exclusions coverage** | 0.25j | 🔴 CRITIQUE | README.md Coverage section, vitest.config.mjs comments détaillés, badge coverage bash séparé |

### P1 — HAUTE (fix < 1 mois)

| ID | Recommandation | Effort | Impact | Fichiers |
|----|----------------|--------|--------|----------|
| **R06** | **Retry flaky tests CI** | 0.5j | 🟡 HAUTE | .github/workflows/npm-publish.yml uses: nick-invision/retry@v2 (file-watcher, e2e-server, ralph) |
| **R07** | **Mutation testing** | 1-2j | 🟡 HAUTE | package.json scripts, stryker.config.mjs, Stryker JS (cli/), custom BATS mutation (Tools/ bash) |
| **R08** | **Kanban client tests** | 3-5j | 🟡 HAUTE | Vitest browser mode (playwright), tests/kanban/client/*.test.js (DnD, SSE, markdown, deps graph, burndown) |
| **R09** | **Flattener.js tests** | 1j | 🟡 HAUTE | tests/cli/flattener.test.mjs, retirer exclude vitest.config.mjs:13 |
| **R10** | **Kanban orchestrator tests complets** | 1j | 🟡 HAUTE | tests/kanban/e2e-server.test.js étendre (watcher loop, SSE stream, graceful shutdown, concurrent PATCH) |
| **R11** | **Fix file-watcher race condition** | 1j | 🟡 HAUTE | cli/kanban/server/services/file-watcher.js, tests/kanban/file-watcher.test.js (supprimer "Tolerate add vs change") |
| **R12** | **Observabilité utilisateur** | 2-3j | 🟡 HAUTE | cli/lib/logger.js (structured JSON), Sentry SDK optionnel (opt-in telemetry), doctor auto-run post-install |
| **R13** | **Pre-commit hooks** | 0.5j | 🟡 HAUTE | .husky/pre-commit (commitlint, tests, lint, shellcheck), package.json prepare script |
| **R14** | **Install script rollback** | 1j | 🟡 HAUTE | cli/lib/installer.js backup avant install, rollback si fail, log structuré .claude/.install-log |
| **R15** | **Vale bloquant** | 0.25j | 🟡 HAUTE | .github/workflows/npm-publish.yml:190 supprimer continue-on-error → prose quality enforced |

### P2 — MOYENNE (fix < 3 mois)

| ID | Recommandation | Effort | Impact | Fichiers |
|----|----------------|--------|--------|----------|
| **R16** | **Reduce test timeouts** | 0.5j | 🟠 MOYENNE | vitest.config.mjs:7-8 (120s → 30s), identifier tests lents, optimiser |
| **R17** | **Dependabot / Renovate** | 0.25j | 🟠 MOYENNE | .github/dependabot.yml ou renovate.json, auto-update deps weekly |
| **R18** | **CHANGELOG link tickets** | 0.5j | 🟠 MOYENNE | CHANGELOG.md format « [#123](url) fix: bug title », GitHub PR auto-link |
| **R19** | **Canary release** | 1-2j | 🟠 MOYENNE | npm publish --tag canary, docs canary install, staged rollout 10% → 50% → 100% |
| **R20** | **Simplify CI workflow** | 1j | 🟠 MOYENNE | .github/workflows/npm-publish.yml refactor (composite actions, reduce duplication setup Node) |
| **R21** | **Coverage cli/index.js 63% → 90%** | 0.5j | 🟠 MOYENNE | tests/cli/index.test.mjs étendre (run() switch cases, error paths) |
| **R22** | **Smoke tests E2E** | 1-2j | 🟠 MOYENNE | tests/e2e/smoke.bats (install → doctor → kanban → flatten → uninstall), Playwright full cycle |
| **R23** | **Property-based testing** | 1-2j | 🟠 MOYENNE | fast-check (JS) pour CLI parsing, DoD validators, state machine transitions |
| **R24** | **Fuzzing bash scripts** | 1-2j | 🟠 MOYENNE | AFL ou custom fuzzer pour install-rtk.sh, ralph.sh (invalid inputs, malformed YAML) |
| **R25** | **MTTR tracking** | 0.5j | 🟠 MOYENNE | GitHub Actions metrics, Sentry releases, dashboard Grafana (CI duration, flakiness rate, MTTR bugs) |

---

## Quick wins

**Quick wins = impact HAUTE, effort < 0.5j, ROI maximum.**

| Quick Win | Effort | Impact | Action |
|-----------|--------|--------|--------|
| **QW1 — Ajouter set -euo pipefail** | 0.5j | 🔴 CRITIQUE | Script automatisé `for f in Tools/*/*.sh; do sed -i '1a set -euo pipefail' "$f"; done`, commit, PR |
| **QW2 — Documenter exclusions coverage** | 0.25j | 🔴 CRITIQUE | README.md section Coverage : « Vitest 92% excludes flattener, kanban client (milestone Q2), bash (BATS separate) » |
| **QW3 — Shellcheck fallback** | 0.25j | 🔴 CRITIQUE | package.json lint:shell : `command -v shellcheck && find ... \| xargs shellcheck \|\| echo 'Warning: shellcheck not installed'` |
| **QW4 — Vale bloquant** | 0.25j | 🟡 HAUTE | .github/workflows/npm-publish.yml:190 supprimer `continue-on-error: true` |
| **QW5 — Pre-commit hook minimal** | 0.25j | 🟡 HAUTE | .husky/pre-commit : `npm run lint && npm run format:check`, package.json prepare: `husky install` |
| **QW6 — CHANGELOG link PR** | 0.25j | 🟠 MOYENNE | CHANGELOG.md format : « [#123](https://github.com/.../pull/123) fix: bug title » |
| **QW7 — Doctor auto-run post-install** | 0.25j | 🟡 HAUTE | cli/lib/installer.js:171 ajouter `runDoctor(targetPath)` après runInstallation success |
| **QW8 — Log install errors** | 0.25j | 🟡 HAUTE | cli/lib/installer.js:28 `fs.appendFileSync('.claude/.install-log', error)` avant throw |

**Total quick wins effort : 2.5j → livrable en 1 semaine, impact 🔴🟡 CRITIQUE/HAUTE.**

---

## Roadmap moyen terme

**Timeline : 1-3 mois, focus fiabilité production.**

### Milestone 1 — Robustesse bash (1 mois)

**Objectif :** Tous les scripts bash respectent best practices (pipefail, error handling, idempotence).

- **Semaine 1 :** Ajouter set -euo pipefail partout (QW1), installer shellcheck local (R03), pre-commit hook shellcheck (R13)
- **Semaine 2 :** E2E tests bash (R01) : ralph-e2e.bats (basic loop, ASC mode, overnight, parallel), install-rtk-e2e.bats (install, verify hook, rtk gain), statusline-e2e.bats (locale fr/en, cost format)
- **Semaine 3 :** Rollback install script (R14), logs structurés (R12), doctor auto-run (QW7)
- **Semaine 4 :** Mutation testing bash custom (R07 partie bash), fuzzing install scripts (R24)

**Livrable :** Bash scripts 90%+ robustes, E2E tests critiques, installation fiable avec rollback.

### Milestone 2 — Kanban UI fiabilité (1 mois)

**Objectif :** Kanban client + orchestrator 100% testés, zéro race condition.

- **Semaine 1 :** Vitest browser mode setup (playwright), tests/kanban/client/*.test.js (DnD basic)
- **Semaine 2 :** Tests kanban client avancés (SSE reconnect, markdown rendering XSS, deps graph cycles, burndown data)
- **Semaine 3 :** Fix file-watcher race condition (R11), tests/kanban/e2e-server.test.js étendre (watcher loop, SSE stream, concurrent PATCH, graceful shutdown)
- **Semaine 4 :** Kanban orchestrator coverage 90%+ (retirer exclude vitest.config.mjs:17), mutation testing Kanban (Stryker)

**Livrable :** Kanban UI robuste, race conditions fixées, coverage 90%+, mutation score 70%+.

### Milestone 3 — Observabilité & CI (1 mois)

**Objectif :** Utilisateurs ont diagnostic complet, CI fiable avec retry/canary.

- **Semaine 1 :** Logger structuré JSON (R12), Sentry SDK opt-in, doctor auto-run post-install (QW7)
- **Semaine 2 :** Retry flaky tests CI (R06), reduce timeouts (R16), CI metrics dashboard (R25)
- **Semaine 3 :** Canary release (R19) : npm publish --tag canary, docs canary install, staged rollout automation
- **Semaine 4 :** Smoke tests E2E Playwright (R22) : install → doctor → kanban → flatten → uninstall full cycle

**Livrable :** Observabilité production, CI retry automation, canary release, smoke tests.

---

## Vision long terme

**Horizon : 6-12 mois, ambition framework incontournable.**

### Phase 1 — Test coverage 95%+ (6 mois)

**Objectif :** Coverage réelle 95%+ (cli JS 95%, Tools bash 80%, docs 100% link check).

- **Mois 1-2 :** Flattener tests (R09), cli/index.js coverage 90%+ (R21), tests de régression CHANGELOG complets (R04)
- **Mois 3-4 :** Mutation testing généralisé (R07) : Stryker JS, custom bash mutation, score cible 80%+
- **Mois 5-6 :** Property-based testing (R23) : fast-check pour parsers, DoD validators, state machine, fuzzing (R24) pour bash

**Livrable :** Coverage badge 95%+, mutation score 80%+, zéro flakiness CI, MTTR < 2h.

### Phase 2 — Observabilité avancée (12 mois)

**Objectif :** Monitoring production, alerting proactif, SLO 99.9% (install success rate).

- **Mois 1-3 :** Sentry releases, error tracking, user feedback loop, doctor diagnostics AI-powered (Claude API suggestions)
- **Mois 4-6 :** Grafana dashboards (install success rate, kanban uptime, RTK savings actual vs annoncé), OpenTelemetry traces
- **Mois 7-9 :** Alerting proactif (Slack/Discord bot), canary auto-rollback si error rate > 5%, chaos engineering (inject failures, test recovery)
- **Mois 10-12 :** SLO 99.9% install success rate, documentation observability playbooks, post-mortems publics bugs critiques

**Livrable :** SLO 99.9%, alerting proactif, chaos engineering, observability production-grade.

### Phase 3 — Certification qualité (12+ mois)

**Objectif :** Claude Craft certifié industry standards (SLSA 3, CII Best Practices, SOC2 si SaaS).

- **SLSA Supply Chain Level 3 :** Provenance ✅ (déjà fait npm publish --provenance), reproducible builds (Docker multi-stage, hash artifacts), signed releases (Sigstore cosign)
- **CII Best Practices Badge :** OpenSSF scorecard 8+/10, security policy (SECURITY.md), vulnerability disclosure (security@...), code review 100% PRs
- **SOC2 Type II (si SaaS Kanban/Ralph hosted) :** Audit controls, encryption at rest/transit, RBAC, audit logs, backup/recovery SLA
- **ISO 27001 (optionnel) :** Security management system, risk assessment, incident response

**Livrable :** SLSA 3 badge, CII Best Practices badge, SOC2 report (si SaaS), positionnement enterprise-ready.

---

## Métriques de succès

**KPIs P0 (tracking obligatoire) :**

| KPI | Actuel | Cible 1 mois | Cible 3 mois | Cible 6 mois | Mesure |
|-----|--------|--------------|--------------|--------------|--------|
| **Couverture réelle** | ~31% (5100/16600 LOC) | 60% | 80% | 95% | Vitest + BATS + kcov bash |
| **Mutation score** | 0% (absent) | 50% | 70% | 80% | Stryker JS + custom bash |
| **Flakiness rate CI** | Inconnu (file-watcher sleep) | < 5% | < 2% | < 1% | GitHub Actions metrics (failed/total runs) |
| **MTTR (Mean Time To Repair)** | Inconnu | < 24h | < 8h | < 2h | Sentry releases, GitHub Issues time-to-close |
| **Install success rate** | Inconnu (C22 install fail sans rollback) | 90% | 95% | 99.9% | Telemetry opt-in (Sentry events) |
| **Shellcheck coverage bash** | 0% (shellcheck absent local) | 100% scripts | 100% CI enforced | 100% + pre-commit | shellcheck --severity=warning 0 errors |
| **E2E tests critiques** | 0 (ralph, install-rtk, statusline) | 3 (ralph, rtk, statusline) | 10 (+ kanban, flatten, smoke) | 20+ (full matrix tech/lang) | BATS tests count |

**KPIs secondaires (nice-to-have) :**

| KPI | Actuel | Cible 6 mois | Mesure |
|-----|--------|--------------|--------|
| **NPM downloads/week** | ~500 (estimé) | 5000+ | npmjs.com stats |
| **GitHub stars** | ~200 (estimé) | 1000+ | github.com/TheBeardedBearSAS/claude-craft |
| **GitHub issues open** | ~10 (estimé) | < 5 | github.com issues tab |
| **Community contributors** | 1-2 (core team) | 10+ | GitHub contributors graph |
| **Documentation coverage** | 80% (estimé, gaps i18n partial) | 100% (5 langues parity) | scripts/verify-i18n-parity.sh |
| **CI duration** | ~5-10 min (estimé) | < 3 min | GitHub Actions workflow runs |
| **Release frequency** | 3/day (v8.0.0, 8.0.1, 8.1.0) | 1/week stable | CHANGELOG.md cadence |
| **Canary adoption rate** | 0% (pas de canary) | 20% users opt-in | npm dist-tags canary downloads |

**Dashboards :**
- **Grafana :** coverage trends, mutation score, flakiness rate, MTTR, install success rate, CI duration
- **GitHub Insights :** issues velocity, PR merge time, contributor activity
- **NPM stats :** downloads/week, versions distribution (latest vs canary vs beta)
- **Sentry :** error rate, releases health, user feedback

---

## Annexes

### A1 — Fichiers tests analysés (échantillon)

**Vitest (52 fichiers, ~5000 LOC tests) :**
- tests/cli/ (23 fichiers) : banner, check, cli-class, colors, constants, detect-project, doctor, flattener, fs-utils, help, index, installer-interactive, installer, integration, list, parseArgs, ralph, security-injection, smoke, snapshot, tech-registry, update
- tests/kanban/ (11 fichiers) : app, e2e-server, event-bus, file-scanner, file-watcher, file-writer, frontmatter, patch-status, schemas, sprint-cache, state-machine
- tests/scripts/ (12 fichiers) : asc-mode, check-config, hooks, i18n-base-overlay, install-common-rules, install-config, install-dry-run, install-tech-rules, namespace-integrity, ralph-lib, routing-engine, shell-ui, tcl-common
- tests/content/ (6 fichiers) : agents-optimization, agents, commands, project-settings, skills, templates

**BATS (10 fichiers, 3029 LOC tests) :**
- Tools/RTK/tests/ (2 fichiers) : install-rtk.bats, ultra-compact.bats
- Tools/MultiAccount/tests/ (2 fichiers) : claude-accounts.bats, sync.bats
- Tools/AgentTeams/tests/ (5 fichiers) : compatibility-check.bats, cost-dashboard.bats, cost-estimator.bats, ralph-teams-adapter.bats, result-aggregator.bats
- Tools/StatusLine/tests/ (1 fichier) : statusline.bats

### A2 — Scripts bash analysés (échantillon)

**Tools/ (68 scripts bash, ~6000 LOC cumulées) :**
- Tools/Ralph/ralph.sh (1500 LOC, 0 test E2E)
- Tools/Ralph/lib/*.sh (20 modules, 2000+ LOC, tests ralph-lib.test.mjs syntaxe bash -n)
- Tools/RTK/install-rtk.sh (300 LOC, 13 tests BATS)
- Tools/StatusLine/statusline.sh (300 LOC, 1 test BATS)
- Tools/MultiAccount/claude-accounts.sh (200 LOC, 2 tests BATS)
- Tools/lib/tools-ui.sh (100 LOC, library sourcée partout, PAS de pipefail)

**Dev/scripts/ (50+ scripts, ~3000 LOC) :**
- Dev/scripts/validate-skills-spec.sh (150 LOC, validation bloquante CI)
- scripts/verify-i18n-parity.sh (200 LOC, validation bloquante CI)
- Dev/scripts/install-common-rules.sh (300 LOC, called by installer.js, peut fail exit 1)

### A3 — CI workflows analysés

**.github/workflows/npm-publish.yml (321 lignes) :**
- **Job validate :** extract version, validate package.json (42-109)
- **Job build :** verify structure, CLI entry point, package size < 25 MB, install deps, security audit, format check, tests coverage, lint, shellcheck, i18n parity, Vale prose (110-196)
- **Job bats :** MultiAccount, RTK, StatusLine, AgentTeams tests (197-216)
- **Job publish :** update version (main branch), npm publish --provenance OIDC (217-280)
- **Job release :** generate changelog, create GitHub release (281-321)

**.github/workflows/docs.yml (non analysé détail, assume website build + deploy).**

### A4 — Bugs CHANGELOG vs tests régression (échantillon)

| Version | Bug fix | Test régression existant ? | Fichier test |
|---------|---------|----------------------------|--------------|
| v7.28.0 | Docker Compose version removed | ❌ NON | N/A |
| v7.28.0 | Hadolint pinned v2.12.0 | ❌ NON | N/A |
| v7.27.0 | RTK integrity hash update | ✅ OUI | Tools/RTK/tests/ultra-compact.bats:96 |
| v7.26.0 | 4 failing test suites fs mock | ❌ NON | N/A |
| v7.7.1 | Status line locale bug | ❌ NON | N/A |
| v7.7.0 | Broken symlink handling | ✅ OUI | tests/content/skills.test.mjs (lstatSync mention) |
| v7.7.0 | Cost-estimator pricing Opus/Haiku | ❌ NON | N/A |
| v7.5.0 | Command count corrected | ❌ NON | N/A |
| v7.2.0 | Coolify missing index.html | ❌ NON | N/A |

**Ratio tests régression :** 2 OUI / 9 bugs = **22%** couverture bugs fixes. **Cible : 100%**.

### A5 — Vulnérabilités NPM (audit 2026-04-15)

**Résultat :** `npm audit --omit=dev : found 0 vulnerabilities` ✅

**Deps production (12 packages) :**
- @hono/node-server@1.19.14 (OK)
- chokidar@4.0.3 (OK)
- cytoscape@3.33.2 (OK)
- cytoscape-dagre@2.5.0 (OK)
- dompurify@3.4.0 (OK)
- gray-matter@4.0.3 (OK)
- hono@4.12.14 (OK)
- js-yaml@4.1.1 (OK)
- marked@14.1.4 (OK)
- uplot@1.6.32 (OK)
- zod@3.25.76 (OK)

**Deps dev (9 packages) :** Non inclus audit --omit=dev (OK for prod safety).

### A6 — Références croisées règles Claude Craft

**Règles violées par gaps tests/CI :**

| Règle | Violation | Constat |
|-------|-----------|---------|
| **07-testing.md** | Bug fix = test de régression obligatoire | C04 — 20+ bugs fixes sans tests régression (22% coverage) |
| **09-git-workflow.md** | set -euo pipefail bash obligatoire | C02 — 38 scripts sans pipefail (56% coverage bash) |
| **11-security.md** | Supply chain SLSA, SBOM, Sigstore | Partiellement respectée (provenance ✅, SBOM ❌, Sigstore ❌) |
| **05-kiss-dry-yagni.md** | Cognitive complexity < 10 | ralph.sh 1500 LOC = probablement > 10 (non mesuré, tools bash pas de linter complexité) |
| **23-karpathy-principles.md** | Minimal code, no speculation | Kanban client 5000 LOC Svelte non testé = spéculation feature (C17) |
| **12-context-management.md** | Sous-agents pour investigations | ralph.sh 1500 LOC monolithique (pas de sous-modules testables isolément, modules lib/ OK mais orchestration non) |

### A7 — Commandes proposées développeurs

**Setup local robuste :**
```bash
# 1. Install shellcheck
brew install shellcheck  # macOS
sudo apt install shellcheck  # Ubuntu

# 2. Install pre-commit hooks
npm run prepare  # Installe husky hooks

# 3. Run tests localement avant commit
npm run test:coverage  # Vitest
npm run lint:shell       # Shellcheck (maintenant fonctionne)
npm run lint:i18n        # i18n parity
npm run lint             # ESLint
npm run format:check     # Prettier

# 4. Run BATS tests Tools
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/RTK/tests/
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/MultiAccount/tests/
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/StatusLine/tests/
docker run --rm -v "$(pwd)/Tools:/mnt" bats/bats:latest /mnt/AgentTeams/tests/

# 5. Doctor check project
npx @the-bearded-bear/claude-craft doctor .

# 6. Install mutation testing (milestone)
npm install --save-dev @stryker-mutator/core @stryker-mutator/vitest-runner
npx stryker init
npx stryker run
```

**CI local simulation :**
```bash
# Reproduire CI build job localement (via act ou docker)
docker run --rm -v "$(pwd):/workspace" -w /workspace node:24 bash -c "
  npm ci
  npm run test:coverage
  npm run lint
  npm run lint:shell
  npm run lint:i18n
"
```

### A8 — Ressources externes

**Testing best practices :**
- [Vitest Best Practices](https://vitest.dev/guide/best-practices.html)
- [Mutation Testing Guide](https://stryker-mutator.io/)
- [Bash set -euo pipefail](https://vaneyckt.io/posts/safer_bash_scripts_with_set_euxo_pipefail/)
- [ShellCheck Wiki](https://www.shellcheck.net/wiki/)
- [BATS Testing Guide](https://bats-core.readthedocs.io/)

**CI/CD robustesse :**
- [GitHub Actions Retry](https://github.com/marketplace/actions/retry-step)
- [Canary Deployments](https://martinfowler.com/bliki/CanaryRelease.html)
- [SLSA Supply Chain Levels](https://slsa.dev/)
- [NPM Provenance](https://docs.npmjs.com/generating-provenance-statements)

**Observabilité :**
- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Grafana Dashboards](https://grafana.com/docs/grafana/latest/dashboards/)
- [OpenTelemetry Tracing](https://opentelemetry.io/docs/instrumentation/js/)

---

**FIN RAPPORT — 05-reliability-testing.md**
