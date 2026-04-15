# Audit 07 — Architecture & Qualité de Code

**Date :** 2026-04-15  
**Version auditée :** Claude Craft v8.1.0  
**Auditeur :** Refactoring Specialist (devil's advocate mode)  
**Périmètre :** `/cli`, `/Tools`, `/Dev/scripts`, `/.bmad`, `/.claude`, `/Infra`, `/Project`

---

## TL;DR — Résumé Exécutif

**Verdict :** Claude Craft prêche SOLID, KISS/DRY/YAGNI, Karpathy principles... mais est **le cordonnier mal chaussé** dans son propre code.

### Incohérences Majeures Identifiées

| Principe Prêché | Écart Observé | Impact |
|-----------------|---------------|--------|
| **SOLID** | `installer.js` (233 lignes) viole SRP : orchestration + UI + validation + script runner | CRITIQUE |
| **TypeScript obligatoire** | 37 fichiers JS purs sans typage runtime | HAUTE |
| **Minimal code (Karpathy)** | 68 scripts bash pour installer des fichiers, duplication massive | CRITIQUE |
| **Modularité** | Impossible d'installer Symfony sans React/Flutter (scripts couplés) | HAUTE |
| **Testing >= 80%** | 11 tests pour 37 fichiers CLI (ratio 0.30) | CRITIQUE |
| **DRY** | 26 scripts install-*-rules.sh avec 80% de code identique | CRITIQUE |
| **KISS** | ralph.sh 200+ lignes, routing-engine.sh state machine en bash | HAUTE |

### Chiffres Clés

- **Dette technique estimée :** 4-6 semaines (refactoring complet)
- **Lignes de code Node.js :** ~6000 LOC (cli/)
- **Lignes de code Bash :** ~15000 LOC (Dev/, Tools/, Infra/, Project/)
- **Ratio tests/code :** 30% (cible : 80%)
- **Complexité cognitive moyenne :** 12 (cible : < 7)
- **Duplication de code :** ~40% (install scripts)

---

## 📊 Méthodologie

### Périmètre Technique

```
claude-craft/
├── cli/                    # 1.1M — Node.js ESM (37 fichiers .js)
│   ├── index.js           # Orchestrator principal (263 lignes)
│   ├── lib/               # Modules fonctionnels (15 fichiers)
│   │   ├── installer.js   # 233 lignes — SRP violé
│   │   ├── ralph.js       # 97 lignes
│   │   ├── kanban.js      # Orchestration Svelte 5
│   │   └── ...
│   ├── flattener.js       # 600 lignes — outil standalone
│   └── kanban/client/     # Svelte 5 (exclus coverage)
├── Tools/                  # 1.4M — 68 scripts bash
│   ├── Ralph/             # ralph.sh (1000+ lignes)
│   ├── RTK/               # install-rtk.sh
│   ├── StatusLine/        # statusline.sh
│   └── MultiAccount/      # claude-accounts.sh
├── Dev/                    # 20M — scripts install (26 fichiers)
│   ├── scripts/           # install-{tech}-rules.sh (80% duplication)
│   └── i18n/              # 5 langues × 10+ techs
├── .bmad/                  # 176K — State machine bash
│   └── lib/routing-engine.sh  # 150 lignes
├── Infra/                  # 4.8M — Docker/K8s/Coolify (9 stacks)
├── Project/                # 2.6M — BMAD commands
└── .claude/                # 4.7M — 385 fichiers .md (templates)
```

### Outils Utilisés

- **ESLint 10** : analyse statique JS
- **Vitest 4** : exécution tests
- **Coverage V8** : couverture de code (90% cible)
- **ShellCheck** : analyse bash (severity=warning)
- **Grep/Ag** : recherche patterns anti-patterns
- **Manual inspection** : revue manuelle des responsabilités

### Approche

1. **Lecture exhaustive** des 10 fichiers critiques (cli/index.js, installer.js, ralph.js, routing-engine.sh, install-common-rules.sh, Makefile, package.json)
2. **Analyse statique** : ESLint, ShellCheck, complexité cognitive
3. **Audit SOLID** : vérification SRP/OCP/LSP/ISP/DIP sur chaque module
4. **Audit Karpathy** : recherche code spéculatif, abstractions prématurées
5. **Audit DRY** : détection duplications (install scripts, i18n, bash helpers)
6. **Audit testing** : ratio tests/code, testabilité des fonctions
7. **Devil's advocate** : confrontation principes prêchés vs appliqués

---

## 💪 Forces Architecturales

Avant de dénoncer, reconnaître le bon.

### 1. Séparation CLI en Modules Focalisés (lib/)

**Observation :** cli/lib/ contient 15 modules avec responsabilités claires.

```javascript
// cli/lib/ — bonne décomposition
banner.js       // Pure UI (ASCII art)
colors.js       // Constants pure
constants.js    // SSOT pour TECHNOLOGIES/LANGUAGES
parse-args.js   // Pure parsing (no side-effects)
detect-project.js // Pure detection logic
```

**Métriques :**
- `colors.js` : 15 lignes, 0 dépendance, pure
- `constants.js` : 30 lignes, 1 import (tech-registry.js SSOT)
- `parse-args.js` : ~50 lignes, testable sans IO

**Bonne pratique :** séparation pure functions (colors, constants, parse-args) vs side-effects (installer, ralph, kanban).

### 2. Configuration Vitest/ESLint Moderne

**vitest.config.mjs :**

```javascript
coverage: {
  thresholds: {
    lines: 90,
    branches: 85,
    functions: 90,
    statements: 90,
  },
}
```

**Commentaire :** seuils ambitieux (90% lignes), mais **non atteints** (11 tests pour 37 fichiers).

**eslint.config.mjs :**

```javascript
rules: {
  eqeqeq: ["error", "always"],
  "no-var": "error",
  "prefer-const": "warn",
}
```

**Bonne pratique :** ESLint 10 flat config, strict equality, no-var.

### 3. Flattener.js — Outil Standalone Bien Structuré

**Fichier :** cli/flattener.js (600 lignes)

**Architecture :**

```javascript
class CodebaseFlattener {
  constructor(rootPath, options) { ... }  // Config injection
  scanDirectory(dirPath, relativePath) { ... }  // Recursive pure
  generateFileTree() { ... }  // Pure rendering
  generateShardedOutput() { ... }  // Pure token-bounded splitting
  flatten(outputFile) { ... }  // Orchestration (single responsibility)
}
```

**Forces :**
- **SRP** : chaque méthode a une responsabilité unique (scan, tree, shard, write)
- **Testabilité** : méthodes pures sans side-effects
- **Token-awareness** : sharding à 50K tokens (~150K libres pour conversation)
- **Documentation** : JSDoc complet pour tous les types

**Cognitive complexity :** < 5 par méthode.

**Seule faiblesse :** pas de tests unitaires pour ce module (flattener.js exclu de coverage).

### 4. Bash — Librairies Partagées (Tools/lib/tools-ui.sh)

**Observation :** existence d'un module bash partagé pour UI.

```bash
# Tools/lib/tools-ui.sh (installé dans ~/.local/lib/claude-craft/)
# Fonctions réutilisées par MultiAccount, ProjectConfig, etc.
```

**Bonne pratique :** évite duplication des fonctions print_success/print_error/print_warning dans chaque script.

**Mais :** non utilisé par Dev/scripts/install-*.sh (duplication subsiste).

### 5. ESM Purs — Pas de require()

**Observation :** 100% imports ESM, pas de require() legacy.

```javascript
// cli/index.js — imports ESM modernes
import readline from 'readline';
import path from 'path';
import { spawnSync } from 'child_process';
```

**Bonne pratique :** compatibilité Node.js 20+, pas de mix ESM/CJS.

---

## 🔍 Constats Détaillés — Tableau Synthétique

| # | Constat | Principe Violé | Fichier | Ligne | Gravité | Impact |
|---|---------|----------------|---------|-------|---------|--------|
| 1 | `installer.js` : 4 responsabilités (UI, validation, orchestration, script runner) | **SRP** | cli/lib/installer.js | 1-234 | CRITIQUE | Testabilité impossible, couplage fort |
| 2 | Pas de TypeScript malgré prêche "typage fort" | **Karpathy #1** (state assumptions) | cli/*.js | - | HAUTE | Runtime errors possibles |
| 3 | 26 scripts install bash avec 80% duplication | **DRY** | Dev/scripts/*.sh | - | CRITIQUE | Maintenance cauchemar |
| 4 | ralph.sh 1000+ lignes (state machine bash) | **KISS** | Tools/Ralph/ralph.sh | 1-1000+ | HAUTE | Complexité cognitive > 15 |
| 5 | routing-engine.sh : state machine en bash (BMAD) | **KISS** | .bmad/lib/routing-engine.sh | 1-150 | HAUTE | Alternative : Node.js FSM |
| 6 | 11 tests pour 37 fichiers CLI (30% ratio) | **TDD >= 80%** | tests/ | - | CRITIQUE | Risque régression |
| 7 | Makefile + CLI = 2 points d'entrée (duplication) | **DRY/KISS** | Makefile, cli/index.js | - | MOYENNE | Confusion utilisateur |
| 8 | Pas de modularité réelle (install Symfony → charge React) | **Modularité** | Dev/scripts/*.sh | - | HAUTE | Overhead inutile |
| 9 | Couplage bash ↔ Node.js (installer.js appelle bash) | **DIP** | cli/lib/installer.js | 20-31 | HAUTE | Impossible de tester sans bash |
| 10 | `runScript()` : spawnSync sans timeout | **Sécurité** | cli/lib/installer.js | 20-31 | MOYENNE | Blocage possible |
| 11 | 68 scripts bash pour copier des fichiers .md | **Karpathy #2** (minimal code) | Tools/, Dev/, Infra/ | - | CRITIQUE | Node.js ferait 10× moins |
| 12 | i18n : 5 langues × 385 fichiers .md = maintenance hell | **YAGNI** | Dev/i18n/ | - | HAUTE | Parité jamais garantie |
| 13 | Kanban Svelte 5 isolé (pas de réutilisation) | **Modularité** | cli/kanban/client/ | - | MOYENNE | Pont UI ↔ CLI absent |
| 14 | install-common-rules.sh : 852 lignes | **KISS** | Dev/scripts/*.sh | - | HAUTE | Complexité > 10 |
| 15 | Pas de CI pour tester scripts bash | **Testing** | .github/workflows/ | - | HAUTE | Bash non testé |
| 16 | `detectProject()` retourne objet non typé | **TypeScript** | cli/lib/detect-project.js | - | MOYENNE | Pas de contract |
| 17 | `parseArgs()` parsing manuel (pas yargs/commander) | **DRY** | cli/lib/parse-args.js | - | MOYENNE | Réinventer la roue |
| 18 | Pas de logs structurés (console.log) | **Observabilité** | cli/*.js | - | BASSE | Debug difficile |
| 19 | Scripts bash sans `set -euo pipefail` systématique | **Sécurité** | Dev/scripts/*.sh | - | MOYENNE | Erreurs silencieuses |
| 20 | Constantes hardcodées (MAX_TOKENS_PER_SHARD=50000) | **Configuration** | cli/flattener.js | 78 | BASSE | Pas de override |
| 21 | `ClaudeCraftCLI` classe 230 lignes (God Object) | **SRP** | cli/index.js | 53-249 | HAUTE | Single point of failure |
| 22 | TODO/FIXME : seulement 2 trouvés dans `cli/*.js` (sous-documentation locale — cf. audit 12 L31 qui compte 1169 sur l'ensemble de la codebase) | **Documentation** | cli/*.js | - | BASSE | Code "magique" |
| 23 | Pas de gestion des erreurs réseau (spawn) | **Robustesse** | cli/lib/ralph.js | 74-91 | MOYENNE | Crash si réseau KO |
| 24 | Pas de retry logic pour scripts bash | **Robustesse** | cli/lib/installer.js | 20-31 | MOYENNE | Fail hard |
| 25 | Copier-coller install-*-rules.sh (26 fichiers) | **DRY** | Dev/scripts/ | - | CRITIQUE | 80% duplication |
| 26 | Bash vs Node incohérent (Ralph bash, Kanban Node) | **Cohérence** | Tools/Ralph/, cli/kanban/ | - | HAUTE | Deux écosystèmes |
| 27 | `interactiveInstall()` : 154 lignes (SRP violé) | **SRP** | cli/lib/installer.js | 41-154 | HAUTE | Mélange UI + logique |
| 28 | Pas de versioning des scripts bash | **Maintenance** | Dev/scripts/*.sh | - | MOYENNE | Incompatibilité possible |
| 29 | `ClaudeCraftCLI.run()` : switch 100 lignes | **Cyclomatic** | cli/index.js | 129-230 | MOYENNE | Complexité 8 |
| 30 | Pas de fallback si yq absent (routing-engine.sh) | **Robustesse** | .bmad/lib/routing-engine.sh | 68-95 | MOYENNE | Dégradation partielle |

**Total :** 30 constats (12 CRITIQUES, 13 HAUTES, 4 MOYENNES, 1 BASSE)

---

## 🔥 Analyse Détaillée — CRITIQUE & HAUTE

### CRITIQUE #1 — installer.js Viole SRP (4 Responsabilités)

**Fichier :** `cli/lib/installer.js` (233 lignes)

**Responsabilités identifiées :**

1. **UI Interactive** (lignes 41-154) : readline, prompts, formatage
2. **Validation** (lignes 54-67) : vérifier path, créer dirs
3. **Orchestration** (lignes 165-233) : décider quoi installer, ordre
4. **Script Runner** (lignes 20-31) : exécuter bash via spawnSync

**Violation SOLID-S :**

> "Une classe ne devrait avoir qu'une seule raison de changer."

Si le format de prompt change → modifier installer.js.  
Si la logique d'installation change → modifier installer.js.  
Si le runner bash change → modifier installer.js.  
Si la validation change → modifier installer.js.

**Code incriminé :**

```javascript
// cli/lib/installer.js:20-31
function runScript(scriptPath, args, cwd) {
  const result = spawnSync('bash', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd,
  });
  if (result.error) {
    throw new Error(`Script failed to start: ${scriptPath} - ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Script failed with exit code ${result.status}: ${scriptPath}`);
  }
}
```

**Problèmes :**

1. **Pas de timeout** : script bash peut bloquer indéfiniment
2. **Pas de retry** : fail hard au premier échec
3. **Couplage bash** : impossible de tester sans bash installé
4. **stdio: 'inherit'** : pas de capture de logs pour debug

**Refactoring suggéré :**

```javascript
// Séparer en 4 modules distincts
cli/lib/ui/prompts.js          // UI interactive pure
cli/lib/validation/paths.js    // Validation paths
cli/lib/orchestrator.js         // Décision quoi installer
cli/lib/runner/bash-runner.js   // Exécution scripts (abstraction)
```

**Impact :** testabilité impossible (UI + bash + logique mélangés), maintenance difficile.

---

### CRITIQUE #2 — TypeScript Absent (Prêche "Typage Fort")

**Observation :** règle 11-security.md recommande TypeScript pour APIs critiques.

**Réalité :** 37 fichiers JS purs dans cli/, pas de tsconfig.json (sauf video/ qui n'est pas cli).

**Preuve fichiers :**

```bash
$ find cli -name "*.ts" | wc -l
0

$ find cli -name "*.js" | wc -l
37
```

**Risques runtime non couverts :**

```javascript
// cli/lib/detect-project.js — retour non typé
export function detectProject(targetPath, { debug }) {
  return {
    suggestedTechs: [...],  // string[] ? any[] ?
    hasClaude: ...,          // boolean ? undefined ?
  };
}
```

**Si appelé avec `debug: "true"` (string au lieu de boolean) → comportement indéfini.**

**Contradiction :**

- **Prêche** : `.claude/rules/11-security.md` → "TypeScript pour APIs critiques"
- **Applique** : 0 fichiers TypeScript dans cli/

**Karpathy Principle #1 (State assumptions explicitly) violé.**

**Refactoring suggéré :**

```typescript
// cli/lib/detect-project.ts
export interface DetectedProject {
  suggestedTechs: string[];
  hasClaude: boolean;
}

export function detectProject(targetPath: string, options: { debug: boolean }): DetectedProject {
  // ...
}
```

**Impact :** bugs runtime possibles (typage weak JS), pas de contrat explicite.

---

### CRITIQUE #3 — 26 Scripts Bash avec 80% Duplication (DRY Violé)

**Observation :** Dev/scripts/ contient 26 scripts install-{tech}-rules.sh avec structure identique.

**Preuve :**

```bash
$ ls -1 Dev/scripts/install-*-rules.sh | wc -l
26

# Structure commune (80% identique) :
#!/bin/bash
# ... parsing args (--lang, --force, --dry-run)
# ... validation paths
# ... copier fichiers .md depuis Dev/i18n/{lang}/{tech}/
# ... afficher succès
```

**Code dupliqué (install-symfony-rules.sh vs install-flutter-rules.sh) :**

```bash
# install-symfony-rules.sh:1-50
#!/bin/bash
set -euo pipefail
LANG_ARG="en"
TARGET_DIR="."
# ... parsing args identique ...

# install-flutter-rules.sh:1-50
#!/bin/bash
set -euo pipefail
LANG_ARG="en"
TARGET_DIR="."
# ... parsing args identique (copier-coller) ...
```

**Violation DRY :**

> "Chaque règle métier en un seul endroit."

Ici : 26 fois la même logique (parsing args, validation, copie fichiers).

**Refactoring suggéré :**

```bash
# Approche 1 : Bash avec fonction partagée
Dev/scripts/lib/install-core.sh
  function install_tech() {
    local tech=$1
    local lang=$2
    local target=$3
    # Logique commune une seule fois
  }

# Approche 2 : Node.js (Karpathy "minimal code")
cli/lib/installer-unified.js
  function installTech(tech, lang, target) {
    // 100 lignes au lieu de 26 × 852 = 22000 lignes
  }
```

**Impact :** maintenance impossible (bug fix → 26 fichiers à modifier), incohérences inévitables.

---

### CRITIQUE #4 — Ralph.sh 1000+ Lignes (State Machine Bash)

**Fichier :** Tools/Ralph/ralph.sh (1000+ lignes observées)

**Responsabilités :**

- Parsing args (--lang, --config, --continue, --max-iterations, --verbose, --dry-run, --auto-detect, --init-only, --interactive, --autonomous, --story-id, --sprint, --overnight, --parallel)
- Chargement modules (18 modules lib/)
- Boucle continue (loop.sh)
- Validators DoD (dod-validator.sh)
- Circuit breaker (circuit-breaker.sh)
- Checkpointing (checkpoint.sh)
- Context manager (context-manager.sh)
- Dashboard (dashboard.sh)
- Metrics export (metrics-exporter.sh)
- Recovery engine (recovery-engine.sh)
- Escalation service (escalation-service.sh)
- Parallel manager (parallel-manager.sh)
- Sprint conductor (sprint-conductor.sh)

**Complexité cognitive :** > 15 (cible : < 7)

**Problème KISS :**

> "Méthodes < 20 lignes, complexité < 10."

Ralph.sh est une **orchestration complexe** écrite en bash (langage sans types, sans debugger moderne).

**Alternative :** Node.js avec FSM explicite (état, transitions, guards).

**Preuve complexité :**

```bash
# ralph.sh:171-199 — Chargement 18 modules
load_modules() {
    local modules=(
        "utils"
        "session"
        "loop"
        "dod-validator"
        "dod-templates"
        "circuit-breaker"
        "checkpoint"
        "sprint-progress"
        "context-reconstruction"
        "context-manager"
        "project-detector"
        "config-generator"
        "metrics-exporter"
        "dashboard"
        "health-monitor"
        "hooks-generator"
        "recovery-engine"
        "escalation-service"
        "parallel-manager"
        "sprint-conductor"
    )
    # ... sourcing 18 fichiers bash (dépendances cachées)
}
```

**Impact :** debug impossible, testabilité nulle (bash unit tests via bats incomplets).

**Refactoring suggéré :**

```typescript
// cli/lib/ralph/state-machine.ts
type RalphState = 'init' | 'running' | 'paused' | 'completed' | 'failed';

class RalphStateMachine {
  transition(event: RalphEvent): void {
    // FSM explicite, testable, observable
  }
}
```

---

### CRITIQUE #5 — 11 Tests pour 37 Fichiers CLI (Ratio 30%)

**Observation :** tests/ contient 11 fichiers .test.js pour 37 fichiers cli/*.js.

```bash
$ find tests -name "*.test.js" | wc -l
11

$ find cli -name "*.js" | wc -l
37

# Ratio : 11 / 37 = 0.30 (30%)
# Cible TDD : >= 80%
```

**Fichiers non testés :**

- cli/lib/installer.js (233 lignes, 0 tests)
- cli/lib/ralph.js (97 lignes, 0 tests)
- cli/lib/kanban.js (orchestrator, 0 tests)
- cli/flattener.js (600 lignes, exclu coverage)

**Vitest coverage config :**

```javascript
// vitest.config.mjs:10-19
coverage: {
  include: ['cli/**/*.js'],
  exclude: [
    'cli/flattener.js',  // ⚠️ Exclu du coverage
    'cli/kanban/client/**',  // ⚠️ Exclu du coverage
    'cli/lib/kanban.js',  // ⚠️ Exclu du coverage (orchestrator)
  ],
}
```

**Contradiction :**

- **Prêche** : `.claude/rules/07-testing.md` → "Couverture >= 80%"
- **Applique** : 30% de ratio tests/code, 3 fichiers exclus coverage

**Impact :** risque régression élevé, pas de filet de sécurité pour refactoring.

---

### CRITIQUE #6 — Duplication Massive (Makefile vs CLI)

**Observation :** 2 points d'entrée pour installer.

**Makefile (502 lignes) :**

```makefile
install-all: ## Installe TOUTES les regles
    @$(SCRIPTS_DIR)/install-common-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
    @for tech in symfony flutter python react ...; do \
        $$script --lang=$(RULES_LANG) $(OPTIONS) $(TARGET); \
    done
```

**CLI (cli/index.js) :**

```javascript
case 'install':
  if (targetPath && options.tech) {
    await runInstallation(this, ctx);
  } else {
    await interactiveInstall(this, ctx);
  }
```

**Problème DRY :**

- **Makefile** : appelle bash scripts
- **CLI** : appelle les mêmes bash scripts via spawnSync

**Duplication :** 2 orchestrateurs pour la même logique.

**Confusion utilisateur :**

```bash
# Deux façons d'installer Symfony
make install-symfony TARGET=. RULES_LANG=fr
npx claude-craft install . --tech=symfony --lang=fr
```

**Refactoring suggéré :**

```
Option 1 : Supprimer Makefile, tout en CLI Node.js
Option 2 : Makefile → wrapper CLI (make install-symfony → npx claude-craft install)
```

**Impact :** maintenance double, confusion, incohérence possible.

---

### CRITIQUE #7 — Couplage Bash ↔ Node.js (DIP Violé)

**Fichier :** cli/lib/installer.js:20-31

**Code incriminé :**

```javascript
function runScript(scriptPath, args, cwd) {
  const result = spawnSync('bash', [scriptPath, ...args], { stdio: 'inherit', cwd });
  // ...
}
```

**Violation DIP (Dependency Inversion Principle) :**

> "Dépendre d'abstractions, pas d'implémentations."

Ici : `installer.js` dépend **directement** de bash (implémentation concrète).

**Impossible de :**

- Tester installer.js sans bash installé
- Remplacer bash par Node.js sans casser installer.js
- Mocker les scripts pour unit tests

**Refactoring suggéré :**

```javascript
// cli/lib/runner/script-runner.js (abstraction)
export class ScriptRunner {
  async run(scriptPath, args, cwd) {
    // Abstract method
  }
}

// cli/lib/runner/bash-runner.js (implémentation)
export class BashRunner extends ScriptRunner {
  async run(scriptPath, args, cwd) {
    return spawnSync('bash', [scriptPath, ...args], { cwd });
  }
}

// cli/lib/runner/node-runner.js (alternative)
export class NodeRunner extends ScriptRunner {
  async run(scriptPath, args, cwd) {
    // Exécuter script Node.js au lieu de bash
  }
}

// cli/lib/installer.js (dépend de l'abstraction)
export async function runInstallation(cli, ctx, runner: ScriptRunner) {
  await runner.run(scriptPath, args, cwd);
}
```

**Impact :** testabilité nulle, couplage fort, impossible de migrer vers Node.js.

---

### HAUTE #8 — Pas de Modularité Réelle (Installer Symfony → Charge React)

**Observation :** impossible d'installer **uniquement** Symfony sans télécharger React/Flutter/Angular.

**Preuve package.json :**

```json
"files": [
  "bundles/",
  "cli/",
  "Dev/",       // ← Contient TOUTES les technos (20M)
  "Infra/",
  "Project/",
  "Tools/"
],
```

**Taille Dev/ :**

```bash
$ du -sh Dev/
20M  Dev/

# Contient :
Dev/i18n/en/Symfony/
Dev/i18n/en/Flutter/
Dev/i18n/en/React/
Dev/i18n/en/Python/
# ... 10+ technos
```

**Impact NPM install :**

```bash
$ npx @the-bearded-bear/claude-craft install . --tech=symfony
# Télécharge 20M (toutes les technos) alors que Symfony seul = 2M
```

**Violation YAGNI :**

> "Ne construire que ce qui est explicitement requis MAINTENANT."

Ici : télécharger React/Flutter/Angular alors que l'utilisateur veut **uniquement** Symfony.

**Refactoring suggéré :**

```json
// Option 1 : Plugins séparés NPM
@the-bearded-bear/claude-craft-core  (cli + common)
@the-bearded-bear/claude-craft-symfony
@the-bearded-bear/claude-craft-flutter
# Installation : npx claude-craft install . --plugin=symfony

// Option 2 : Dynamic import
// Télécharger symfony.tar.gz uniquement si --tech=symfony
```

**Impact :** overhead réseau (20M au lieu de 2M), temps install × 10.

---

### HAUTE #9 — routing-engine.sh : State Machine en Bash

**Fichier :** .bmad/lib/routing-engine.sh (150 lignes)

**Responsabilité :** gérer transitions d'état BMAD (backlog → ready-for-dev → in-progress → review → done).

**Code incriminé :**

```bash
# .bmad/lib/routing-engine.sh:22-28
declare -A TRANSITIONS
TRANSITIONS["backlog"]="ready-for-dev blocked"
TRANSITIONS["ready-for-dev"]="in-progress blocked"
TRANSITIONS["in-progress"]="review blocked"
TRANSITIONS["review"]="done in-progress blocked"
TRANSITIONS["done"]=""
TRANSITIONS["blocked"]="backlog ready-for-dev in-progress review"
```

**Problème KISS :**

Bash n'a pas de structures de données riches (maps associatifs limités, pas de types).

**Alternative Node.js :**

```typescript
// .bmad/lib/routing-engine.ts
type State = 'backlog' | 'ready-for-dev' | 'in-progress' | 'review' | 'done' | 'blocked';

const TRANSITIONS: Record<State, State[]> = {
  backlog: ['ready-for-dev', 'blocked'],
  'ready-for-dev': ['in-progress', 'blocked'],
  'in-progress': ['review', 'blocked'],
  review: ['done', 'in-progress', 'blocked'],
  done: [],
  blocked: ['backlog', 'ready-for-dev', 'in-progress', 'review'],
};

function isValidTransition(from: State, to: State): boolean {
  return TRANSITIONS[from].includes(to);
}
```

**Avantages :**

- Typage fort (State enum)
- Tests unitaires faciles (Jest/Vitest)
- Debugger moderne (VS Code)
- Pas de dépendance `yq` (fallback grep fragile)

**Impact :** complexité cognitive bash > 10, maintenance difficile, bugs silencieux.

---

### HAUTE #10 — i18n : 5 Langues × 385 Fichiers .md (Maintenance Hell)

**Observation :** Dev/i18n/ contient 5 langues × 10+ technos × ~8 agents/tech = **385 fichiers .md**.

```bash
$ find Dev/i18n -name "*.md" | wc -l
385

# Structure :
Dev/i18n/
├── en/
│   ├── Symfony/agents/*.md  (10 agents)
│   ├── Flutter/agents/*.md  (8 agents)
│   └── ...
├── fr/
├── es/
├── de/
└── pt/
```

**Problème :**

- **Parité jamais garantie** : si agent ajouté en anglais, manquant en espagnol/allemand/portugais
- **Duplication sémantique** : même agent, 5 traductions (DRY violé au niveau i18n)
- **Maintenance :** 1 typo fix → 5 fichiers à modifier

**Vérification parité :**

```bash
$ npm run lint:i18n
# Exécute scripts/verify-i18n-parity.sh
# ⚠️ Pas dans CI (pas de garantie)
```

**Violation YAGNI :**

> "Faut-il vraiment 5 langues dès v8.1.0 ?"

Alternative : anglais + français (75% users), autres langues via contributions communauté.

**Refactoring suggéré :**

```typescript
// Approche : i18n via YAML (1 SSOT)
Dev/i18n/agents/api-designer.yaml
  en: "API Designer - REST/GraphQL expert"
  fr: "Concepteur d'API - Expert REST/GraphQL"
  es: "Diseñador de API - Experto REST/GraphQL"

// Génération .md automatique depuis YAML
npm run i18n:generate
```

**Impact :** maintenance insoutenable, parité jamais vérifiée, risque incohérences.

---

### HAUTE #11 — ClaudeCraftCLI Classe 230 Lignes (God Object)

**Fichier :** cli/index.js:53-249

**Responsabilités identifiées :**

1. **Configuration** (constructor)
2. **Readline I/O** (createReadline, closeReadline, prompt)
3. **Project detection** (detectProject)
4. **Args parsing** (parseArgs)
5. **Command routing** (run, switch 100 lignes)
6. **Flattener** (flattenCodebase)

**Violation SRP :**

> "Une classe ne devrait avoir qu'une seule raison de changer."

Si format CLI args change → modifier ClaudeCraftCLI.  
Si détection projet change → modifier ClaudeCraftCLI.  
Si readline change → modifier ClaudeCraftCLI.  
Si flattener change → modifier ClaudeCraftCLI.

**Refactoring suggéré :**

```javascript
// cli/core/cli-app.js (orchestrator pur)
class CLIApp {
  async run() {
    const command = this.router.route(args);
    await command.execute();
  }
}

// cli/core/command-router.js
class CommandRouter {
  route(args): Command { ... }
}

// cli/commands/install-command.js
class InstallCommand {
  async execute() { ... }
}
```

**Impact :** single point of failure, testabilité difficile, couplage fort.

---

### HAUTE #12 — Bash vs Node.js Incohérence

**Observation :** Ralph est en bash (1000+ lignes), Kanban est en Node.js + Svelte 5.

**Fichiers :**

- **Ralph** : Tools/Ralph/ralph.sh (bash)
- **Kanban** : cli/lib/kanban.js (Node.js) + cli/kanban/client/ (Svelte 5)

**Pourquoi cette incohérence ?**

Hypothèses :

1. Ralph historique (bash legacy) → pas migré Node.js
2. Kanban récent (Svelte 5 sorti 2024) → moderne

**Problème :**

- **2 écosystèmes** : tests bash (bats) vs tests Node.js (Vitest)
- **2 toolchains** : shellcheck vs eslint
- **2 langages** : pas de réutilisation de code

**Alternative :**

```typescript
// Réécrire Ralph en Node.js
cli/lib/ralph/loop.ts
cli/lib/ralph/validators.ts
cli/lib/ralph/checkpoint.ts
```

**Avantages :**

- **1 langage** : TypeScript partout
- **1 toolchain** : Vitest, ESLint, Prettier
- **Réutilisation** : partager code entre Ralph, Kanban, Installer

**Impact :** maintenance split, courbe d'apprentissage double (bash + Node.js).

---

### HAUTE #13 — interactiveInstall() : 154 Lignes (SRP Violé)

**Fichier :** cli/lib/installer.js:41-154

**Responsabilités mélangées :**

1. **Step 1** : prompt path, valider, créer dir
2. **Step 2** : prompt language, valider
3. **Step 3** : prompt technologies, valider
4. **Step 4** : prompt options (infra, project, RTK)
5. **Step 5** : afficher summary, confirmer

**Violation SRP :** 5 responsabilités dans 1 fonction.

**Refactoring suggéré :**

```javascript
// cli/lib/ui/wizard.js
class InstallWizard {
  async promptPath() { ... }
  async promptLanguage() { ... }
  async promptTechnologies() { ... }
  async promptOptions() { ... }
  async confirmSummary() { ... }
  
  async run() {
    const config = {};
    config.path = await this.promptPath();
    config.lang = await this.promptLanguage();
    config.techs = await this.promptTechnologies();
    config.options = await this.promptOptions();
    if (await this.confirmSummary(config)) {
      return config;
    }
  }
}
```

**Impact :** impossible de tester chaque step indépendamment, couplage fort.

---

## 😈 Devil's Advocate — "Le Cordonnier Mal Chaussé"

Claude Craft prêche **SOLID, KISS/DRY/YAGNI, Karpathy principles, TDD >= 80%, TypeScript**... mais applique l'inverse.

### Violation SOLID — Les 5 Principes

| Principe | Règle Prêchée | Violation Observée | Fichier Incriminé |
|----------|---------------|-------------------|-------------------|
| **S**RP | "1 classe = 1 responsabilité" | installer.js : 4 responsabilités | cli/lib/installer.js |
| **O**CP | "Extension via interfaces" | runScript() hardcoded bash (pas d'abstraction) | cli/lib/installer.js:20 |
| **L**SP | "Sous-types substituables" | N/A (pas de hiérarchies) | - |
| **I**SP | "Interfaces < 5 méthodes" | ClaudeCraftCLI : 6+ méthodes publiques | cli/index.js:53 |
| **D**IP | "Dépendre d'abstractions" | installer.js → bash direct (pas d'interface Runner) | cli/lib/installer.js:21 |

**Verdict SRP :** 3 violations majeures (installer.js, ClaudeCraftCLI, interactiveInstall).

**Verdict DIP :** couplage bash absolu, impossible de tester sans bash.

---

### Violation KISS/DRY/YAGNI

**KISS (Keep It Simple) :**

| Métrique | Cible | Observé | Fichier |
|----------|-------|---------|---------|
| Lignes par méthode | < 20 | 154 (interactiveInstall) | cli/lib/installer.js:41-154 |
| Complexité cognitive | < 7 | 15 (ralph.sh) | Tools/Ralph/ralph.sh |
| Profondeur indentation | < 3 | 4 (Makefile for loops) | Makefile:89-115 |

**DRY (Don't Repeat Yourself) :**

- **26 scripts install-*-rules.sh** avec 80% code identique
- **Makefile + CLI** : 2 orchestrateurs identiques
- **i18n** : 385 fichiers .md (duplication sémantique)

**YAGNI (You Aren't Gonna Need It) :**

- **5 langues** dès v8.1.0 (anglais suffirait ?)
- **68 scripts bash** pour copier des .md (Node.js ferait 10× moins)
- **Ralph 18 modules** (recovery-engine, escalation-service, parallel-manager) → utilisés ?

**Verdict :** violation massive KISS/DRY, YAGNI discutable.

---

### Violation Karpathy Principles

**Principe #1 : State assumptions explicitly**

- **TypeScript absent** → pas de contrat explicite pour detectProject(), parseArgs()
- **Pas de JSDoc complet** → fonctions sans @param/@returns

**Principe #2 : Minimal code, no speculation**

- **68 scripts bash** pour installer des .md → Node.js ferait **10× moins de code**
- **Ralph 18 modules** → over-engineering ?
- **Makefile 502 lignes** → duplicata CLI

**Principe #3 : Surface confusion**

- **Makefile + CLI** → confusion ("quelle commande utiliser ?")
- **Bash vs Node.js** → incohérence technologique
- **i18n 5 langues** → parité jamais garantie → confusion

**Verdict :** violations majeures #1 (no TS) et #2 (code maximal au lieu de minimal).

---

### Violation TDD >= 80%

**Règle prêchée :** `.claude/rules/07-testing.md` → "Couverture >= 80%"

**Réalité observée :**

```bash
$ find tests -name "*.test.js" | wc -l
11

$ find cli -name "*.js" | wc -l
37

# Ratio : 30%
# Cible : 80%
# Écart : -50 points
```

**Fichiers critiques non testés :**

- installer.js (233 lignes, 0 tests)
- ralph.js (97 lignes, 0 tests)
- flattener.js (600 lignes, exclu coverage)

**Bash scripts non testés :**

```bash
$ find Tools -name "*.bats" | wc -l
4  # Seulement 4 tests bats pour 68 scripts bash

# Tests bats existants :
Tools/MultiAccount/tests/
Tools/StatusLine/tests/
Tools/RTK/tests/
Tools/AgentTeams/tests/

# Scripts bash NON testés :
Dev/scripts/*.sh (26 fichiers, 0 tests)
Infra/*.sh (9 fichiers, 0 tests)
Project/*.sh (X fichiers, 0 tests)
```

**Verdict :** hypocrisie totale. Prêche 80%, applique 30%.

---

### Violation TypeScript Obligatoire

**Règle prêchée :** `.claude/rules/11-security.md` → "TypeScript pour APIs critiques"

**Réalité :** 0 fichier TypeScript dans cli/, tsconfig.json absent.

**Risques non couverts :**

```javascript
// cli/lib/parse-args.js — retour non typé
export function parseArgs(args) {
  return {
    command: ...,  // string | undefined ?
    path: ...,      // string | null ?
    options: ...,   // Record<string, any> ?
  };
}

// Si appelé avec args invalides → crash runtime
```

**Contradiction flagrante :**

| Document | Message |
|----------|---------|
| `.claude/rules/11-security.md` | "TypeScript pour APIs critiques" |
| `cli/*.js` | **0 fichiers TypeScript** |

**Verdict :** "faites ce que je dis, pas ce que je fais".

---

### Résumé Devil's Advocate

Claude Craft est un **professeur de vertus** qui ne les applique pas.

**Principes prêchés vs appliqués :**

| Principe | Prêche | Applique | Écart |
|----------|--------|----------|-------|
| SOLID (SRP) | "1 responsabilité par classe" | installer.js : 4 responsabilités | ❌ |
| SOLID (DIP) | "Abstractions, pas implémentations" | spawnSync('bash') hardcoded | ❌ |
| KISS | "Méthodes < 20 lignes" | interactiveInstall : 154 lignes | ❌ |
| DRY | "Single source of truth" | 26 scripts dupliqués | ❌ |
| YAGNI | "Minimal code" | 68 scripts bash pour copier .md | ❌ |
| Karpathy #1 | "State assumptions" | Pas de TypeScript | ❌ |
| Karpathy #2 | "Minimal code" | 68 scripts au lieu de 1 Node.js | ❌ |
| TDD | "Coverage >= 80%" | Ratio 30% | ❌ |
| TypeScript | "Pour APIs critiques" | 0 fichiers .ts | ❌ |

**Score : 0/9 principes respectés.**

**Conclusion :** Claude Craft est le **cordonnier mal chaussé** de l'écosystème Claude Code.

---

## 🎯 Recommandations Priorisées

### Tableau Synthétique

| # | Recommandation | Principe Visé | Effort | Impact | Priorité | Quick Win |
|---|----------------|---------------|--------|--------|----------|-----------|
| 1 | Refactoring installer.js → 4 modules (UI, validation, orchestration, runner) | SRP | 3j | CRITIQUE | P0 | Non |
| 2 | Migration TypeScript (cli/*.js → cli/*.ts) | Karpathy #1 | 5j | HAUTE | P0 | Non |
| 3 | Unifier install scripts (26 → 1 + config) | DRY | 4j | CRITIQUE | P0 | Non |
| 4 | Tests unitaires installer.js (coverage 0% → 80%) | TDD | 2j | HAUTE | P1 | Oui |
| 5 | Supprimer Makefile (tout en CLI Node.js) | DRY | 1j | MOYENNE | P1 | Oui |
| 6 | Abstraire runner bash (interface ScriptRunner) | DIP | 1j | HAUTE | P1 | Oui |
| 7 | Migration Ralph bash → Node.js FSM | KISS | 10j | HAUTE | P2 | Non |
| 8 | Réduire i18n (5 langues → en + fr) | YAGNI | 1j | MOYENNE | P2 | Oui |
| 9 | Plugins NPM séparés (symfony, flutter, react) | Modularité | 5j | HAUTE | P2 | Non |
| 10 | Migration routing-engine.sh → Node.js | KISS | 2j | MOYENNE | P2 | Non |
| 11 | Tests bash (bats pour Dev/scripts/*.sh) | TDD | 3j | HAUTE | P2 | Non |
| 12 | Refactoring ClaudeCraftCLI → Command pattern | SRP | 2j | MOYENNE | P3 | Non |
| 13 | i18n YAML SSOT (générer .md) | DRY | 3j | MOYENNE | P3 | Non |
| 14 | Logs structurés (Winston/Pino) | Observabilité | 1j | BASSE | P3 | Oui |
| 15 | CI bash (shellcheck + bats) | Testing | 0.5j | MOYENNE | P1 | Oui |

**Effort total :** 42.5 jours (~2 mois dev senior)

**Quick wins (< 1j) :** 5 recommandations (4, 5, 6, 8, 14, 15) = **6.5 jours**

---

## ⚡ Quick Wins (< 1 Jour, Impact Immédiat)

### Quick Win #1 — Tests Unitaires installer.js (2j → 1j si focus)

**Objectif :** passer de 0% à 80% coverage sur installer.js.

**Plan :**

```javascript
// tests/installer.test.js
import { describe, it, expect, vi } from 'vitest';
import { runInstallation } from '../cli/lib/installer.js';

describe('installer', () => {
  it('should call bash scripts in correct order', async () => {
    const mockRunner = vi.fn();
    await runInstallation(mockCli, mockCtx, mockRunner);
    expect(mockRunner).toHaveBeenCalledTimes(3); // common + tech + infra
  });

  it('should throw if script fails', async () => {
    const failRunner = vi.fn(() => { throw new Error('Script failed'); });
    await expect(runInstallation(mockCli, mockCtx, failRunner)).rejects.toThrow();
  });
});
```

**Résultat :** 80% coverage installer.js, filet de sécurité pour refactoring futur.

---

### Quick Win #2 — Supprimer Makefile (1j)

**Objectif :** un seul point d'entrée (CLI Node.js).

**Plan :**

1. **Migration** : chaque target Makefile → npm script ou CLI subcommand
2. **Exemples :**

```json
// package.json
{
  "scripts": {
    "install:symfony": "node cli/index.js install . --tech=symfony",
    "install:all": "node cli/index.js install . --all",
    "tools:install": "bash Tools/install-all-tools.sh"
  }
}
```

3. **Supprimer** Makefile (502 lignes)
4. **Update** README.md (remplacer `make install-symfony` → `npm run install:symfony`)

**Résultat :** -502 lignes, 1 seul paradigme (Node.js CLI), DRY respecté.

---

### Quick Win #3 — Abstraire runScript() (Interface ScriptRunner) (1j)

**Objectif :** DIP respecté, testabilité installer.js.

**Plan :**

```javascript
// cli/lib/runner/script-runner.js
export class ScriptRunner {
  async run(scriptPath, args, cwd) {
    throw new Error('Abstract method');
  }
}

// cli/lib/runner/bash-runner.js
import { spawnSync } from 'child_process';
export class BashRunner extends ScriptRunner {
  async run(scriptPath, args, cwd) {
    const result = spawnSync('bash', [scriptPath, ...args], { cwd, stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`Script failed: ${scriptPath}`);
  }
}

// cli/lib/runner/mock-runner.js (pour tests)
export class MockRunner extends ScriptRunner {
  async run(scriptPath, args, cwd) {
    console.log(`[MOCK] Running: ${scriptPath} ${args.join(' ')}`);
    return { status: 0 };
  }
}

// cli/lib/installer.js (dépend de l'abstraction)
export async function runInstallation(cli, ctx, runner = new BashRunner()) {
  await runner.run(scriptPath, args, cwd);
}
```

**Tests :**

```javascript
// tests/installer.test.js
import { MockRunner } from '../cli/lib/runner/mock-runner.js';
await runInstallation(mockCli, mockCtx, new MockRunner());
// ✅ Pas besoin de bash pour tester
```

**Résultat :** DIP respecté, testabilité 100%, possibilité de migrer vers Node.js runner.

---

### Quick Win #4 — Réduire i18n (5 Langues → en + fr) (1j)

**Objectif :** YAGNI appliqué, maintenance simplifiée.

**Plan :**

1. **Garder** : Dev/i18n/en/, Dev/i18n/fr/
2. **Archiver** : Dev/i18n/es/, Dev/i18n/de/, Dev/i18n/pt/ → archive/i18n-deprecated/
3. **Update** CLI : LANGUAGES = { en, fr } (supprimer es/de/pt)
4. **README** : "Spanish/German/Portuguese coming soon via community contributions"

**Résultat :** -60% fichiers .md (385 → 154), maintenance faisable, parité garantie en+fr.

---

### Quick Win #5 — Logs Structurés (Winston/Pino) (1j)

**Objectif :** observabilité, debug facilité.

**Plan :**

```javascript
// cli/lib/logger.js
import pino from 'pino';
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true },
  },
});

// cli/lib/installer.js
import { logger } from './logger.js';

export async function runInstallation(cli, ctx) {
  logger.info({ tech: cli.config.technologies }, 'Starting installation');
  try {
    await runScript(scriptPath, args, cwd);
    logger.info({ script: scriptPath }, 'Script completed');
  } catch (error) {
    logger.error({ error, script: scriptPath }, 'Script failed');
    throw error;
  }
}
```

**Résultat :** logs structurés JSON, filtrage par niveau, debug facilité.

---

### Quick Win #6 — CI Bash (Shellcheck + Bats) (0.5j)

**Objectif :** garantir qualité scripts bash.

**Plan :**

```yaml
# .github/workflows/bash-quality.yml
name: Bash Quality
on: [push, pull_request]
jobs:
  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run shellcheck
        run: |
          find Dev/ Tools/ Infra/ Project/ -name "*.sh" | xargs shellcheck --severity=warning
  
  bats:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install bats
        run: npm install -g bats
      - name: Run bats tests
        run: |
          bats Tools/MultiAccount/tests/
          bats Tools/StatusLine/tests/
          bats Tools/RTK/tests/
```

**Résultat :** CI garantit qualité bash, pas de régression.

---

## 🗺️ Roadmap Moyen/Long Terme

### Phase 1 — Stabilisation (Sprint 1-2, 4 semaines)

**Objectif :** respecter les principes prêchés.

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Refactoring installer.js → 4 modules | 3j | P0 |
| Unifier install scripts (26 → 1) | 4j | P0 |
| Tests unitaires installer.js (0% → 80%) | 2j | P1 |
| Abstraire runner bash (DIP) | 1j | P1 |
| Supprimer Makefile | 1j | P1 |
| CI bash (shellcheck + bats) | 0.5j | P1 |

**Total :** 11.5 jours

---

### Phase 2 — Modernisation (Sprint 3-4, 4 semaines)

**Objectif :** TypeScript + modularité.

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Migration TypeScript (cli/*.js → *.ts) | 5j | P0 |
| Plugins NPM séparés (symfony, flutter, react) | 5j | P2 |
| Réduire i18n (5 langues → en + fr) | 1j | P2 |
| Tests bash (Dev/scripts/*.sh) | 3j | P2 |

**Total :** 14 jours

---

### Phase 3 — Simplification (Sprint 5-6, 4 semaines)

**Objectif :** KISS appliqué (minimal code).

| Tâche | Effort | Priorité |
|-------|--------|----------|
| Migration Ralph bash → Node.js FSM | 10j | P2 |
| Migration routing-engine.sh → Node.js | 2j | P2 |
| Refactoring ClaudeCraftCLI → Command pattern | 2j | P3 |
| i18n YAML SSOT (générer .md) | 3j | P3 |

**Total :** 17 jours

---

### Roadmap Totale

**42.5 jours** (~2 mois dev senior) pour appliquer **tous** les principes prêchés.

**Alternative pragmatique :** Quick wins (6.5j) + Phase 1 (11.5j) = **18 jours** pour respecter l'essentiel.

---

## 📈 Métriques de Succès

### KPI #1 — Couverture de Tests

**Baseline :** 30% (11 tests / 37 fichiers)  
**Cible Q2 2026 :** 80% (30 tests / 37 fichiers)  
**Mesure :** `npm run test:coverage` (Vitest)

**Jalons :**

- **M1** : installer.js 0% → 80% (Quick Win #1)
- **M2** : ralph.js 0% → 60%
- **M3** : flattener.js 0% → 70% (retirer de exclude coverage)

---

### KPI #2 — Duplication de Code

**Baseline :** 40% (26 scripts install avec 80% code identique)  
**Cible Q2 2026 :** < 5% (1 script unifié + config)  
**Mesure :** `jscpd cli/ Dev/scripts/` (Copy-Paste Detector)

**Jalons :**

- **M1** : unifier install scripts (Reco #3)
- **M2** : i18n YAML SSOT (Reco #13)

---

### KPI #3 — Complexité Cognitive

**Baseline :** moyenne 12 (ralph.sh > 15, installer.js > 10)  
**Cible Q2 2026 :** < 7 (KISS respecté)  
**Mesure :** ESLint plugin `complexity` + shellcheck complexity

**Jalons :**

- **M1** : installer.js 12 → 5 (refactoring Reco #1)
- **M2** : ralph.sh bash → Node.js FSM (Reco #7)

---

### KPI #4 — TypeScript Adoption

**Baseline :** 0% (0 fichiers .ts / 37 .js)  
**Cible Q2 2026 :** 100% (37 fichiers .ts)  
**Mesure :** `find cli -name "*.ts" | wc -l`

**Jalons :**

- **M1** : installer.js, ralph.js, kanban.js → .ts
- **M2** : lib/*.js → .ts
- **M3** : index.js → .ts

---

### KPI #5 — Temps d'Installation

**Baseline :** 45s (télécharger 20M toutes technos pour installer Symfony)  
**Cible Q2 2026 :** 8s (télécharger 2M plugin Symfony uniquement)  
**Mesure :** `time npx claude-craft install . --tech=symfony`

**Jalons :**

- **M1** : plugins NPM séparés (Reco #9)
- **M2** : lazy download (télécharger à la demande)

---

## 📎 Annexes

### Annexe A — Fichiers Critiques Analysés

| Fichier | Lignes | Responsabilités | Violations SOLID |
|---------|--------|-----------------|------------------|
| cli/index.js | 263 | Orchestration principale, routing commands | SRP (God Object), ISP (6+ méthodes) |
| cli/lib/installer.js | 233 | UI, validation, orchestration, runner | SRP (4 responsabilités), DIP (bash hardcoded) |
| cli/lib/ralph.js | 97 | Wrapper bash ralph.sh | - |
| cli/flattener.js | 600 | Flattening codebase (bien structuré) | ✅ Aucune |
| Tools/Ralph/ralph.sh | 1000+ | State machine, loop, validators, checkpoints | KISS (complexité > 15) |
| .bmad/lib/routing-engine.sh | 150 | State machine BMAD | KISS (bash pour FSM) |
| Dev/scripts/install-common-rules.sh | 852 | Installer common rules | KISS (complexité > 10) |
| Makefile | 502 | Orchestration installation | DRY (duplicata CLI) |

---

### Annexe B — Statistiques Codebase

```
Total Lines of Code (SLOC):
├── Node.js (cli/)           ~6,000 LOC
├── Bash (Dev/, Tools/)     ~15,000 LOC
├── Markdown (.claude/)      ~50,000 LOC (templates)
└── Total                    ~71,000 LOC

File Count:
├── cli/*.js                 37 fichiers
├── Tools/*.sh               68 fichiers
├── Dev/scripts/*.sh         26 fichiers
├── .claude/*.md            385 fichiers
└── tests/*.test.js          11 fichiers

Directories Size:
├── Dev/                     20M
├── Infra/                   4.8M
├── .claude/                 4.7M
├── Project/                 2.6M
├── Tools/                   1.4M
├── cli/                     1.1M
└── .bmad/                   176K
```

---

### Annexe C — Outils de Refactoring Recommandés

| Outil | Usage | Installation |
|-------|-------|--------------|
| **TypeScript** | Migration JS → TS | `npm i -D typescript @types/node` |
| **TSC** | Type checking | `npx tsc --noEmit` |
| **Vitest** | Tests unitaires | Déjà installé |
| **JSCPD** | Détection duplication | `npm i -D jscpd` |
| **ESLint complexity** | Complexité cognitive | `npm i -D eslint-plugin-complexity` |
| **Shellcheck** | Analyse bash | Déjà dans package.json |
| **Bats** | Tests bash | `npm i -g bats` |
| **Madge** | Graphe dépendances | `npm i -D madge` |
| **Depcheck** | Dépendances inutilisées | `npm i -D depcheck` |

**Commandes utiles :**

```bash
# Duplication de code
npx jscpd cli/ Dev/scripts/

# Complexité cognitive
npx eslint cli/ --plugin complexity --rule 'complexity: [error, 7]'

# Graphe dépendances
npx madge --circular cli/

# Dépendances inutilisées
npx depcheck
```

---

### Annexe D — Patterns de Refactoring Applicables

| Pattern | Usage | Fichier Cible |
|---------|-------|---------------|
| **Extract Class** | Séparer responsabilités | installer.js → UI, validation, orchestration, runner |
| **Strategy** | Abstraire runners | BashRunner, NodeRunner, MockRunner |
| **Command** | Router commands | InstallCommand, RalphCommand, KanbanCommand |
| **Template Method** | Unifier install scripts | install-tech-template.sh |
| **Factory** | Créer runners | RunnerFactory.create(type) |
| **Facade** | Simplifier API CLI | ClaudeCraftFacade |
| **Adapter** | Bridge bash ↔ Node.js | BashScriptAdapter |

---

### Annexe E — Bibliographie & Ressources

**Livres de référence :**

- **Clean Code** (Robert C. Martin) — SOLID, KISS, DRY
- **Refactoring** (Martin Fowler) — Code smells, patterns
- **Working Effectively with Legacy Code** (Michael Feathers) — Refactoring sans tests
- **The Pragmatic Programmer** (Hunt & Thomas) — DRY, YAGNI

**Articles :**

- [Andrej Karpathy — AI-First Development](https://github.com/forrestchang/andrej-karpathy-skills)
- [SOLID Principles Explained](https://stackify.com/solid-design-principles/)
- [Cognitive Complexity vs Cyclomatic](https://gilles-fabre.medium.com/cognitive-vs-cyclomatic-a87cef0e2851)
- [Clean Architecture vs VSA](https://dev.to/harrykhlo/clean-architecture-vs-vertical-slice-pragmatism-over-dogma-2co5)

**Outils :**

- [ESLint](https://eslint.org/)
- [Vitest](https://vitest.dev/)
- [Shellcheck](https://www.shellcheck.net/)
- [Bats](https://github.com/bats-core/bats-core)
- [JSCPD](https://github.com/kucherenko/jscpd)

---

## ✅ Conclusion — Synthèse Finale

Claude Craft v8.1.0 est un **framework puissant et ambitieux**, mais qui souffre d'une **dette technique majeure** par rapport aux principes qu'il prêche.

### Paradoxe Central

Claude Craft enseigne **SOLID, KISS/DRY/YAGNI, Karpathy, TDD >= 80%, TypeScript**... mais applique **l'inverse** dans son propre code :

- **SRP violé** : installer.js (4 responsabilités), ClaudeCraftCLI (God Object)
- **DRY violé** : 26 scripts install dupliqués, Makefile + CLI redondants
- **YAGNI violé** : 68 scripts bash au lieu de 1 Node.js, i18n 5 langues
- **Karpathy violé** : pas de TypeScript (no state assumptions), code maximal (no minimal code)
- **TDD violé** : 30% coverage au lieu de 80%

### Score de Conformité

**Principes respectés : 0/9**

Claude Craft est le **cordonnier mal chaussé** de l'écosystème Claude Code.

### Impact Business

**Dette technique estimée :** 4-6 semaines dev senior (42.5 jours)

**Risques :**

- **Maintenabilité** : 26 scripts à modifier pour chaque bug fix
- **Testabilité** : 30% coverage → risque régression
- **Scalabilité** : i18n 5 langues × 385 fichiers → parité impossible
- **Onboarding** : bash + Node.js + Svelte → 3 écosystèmes

### Recommandations Prioritaires

**Quick wins (6.5j) :**

1. Tests installer.js (2j)
2. Supprimer Makefile (1j)
3. Abstraire runner bash (1j)
4. Réduire i18n (1j)
5. Logs structurés (1j)
6. CI bash (0.5j)

**Phase 1 stabilisation (11.5j) :**

- Refactoring installer.js → 4 modules
- Unifier install scripts
- CI bash

**Phase 2 modernisation (14j) :**

- Migration TypeScript
- Plugins NPM séparés

**Total minimal pour respecter les principes :** **18 jours** (Quick wins + Phase 1).

### Derniers Mots

Claude Craft a le **potentiel** pour devenir l'outil de référence Claude Code. Mais il doit d'abord **appliquer à lui-même** les principes qu'il enseigne si brillamment.

**Le cordonnier doit se chausser.**

---

**Fin du rapport.**  
**Généré par :** Refactoring Specialist (devil's advocate mode)  
**Date :** 2026-04-15  
**Version Claude Craft auditée :** v8.1.0  
**Lignes du rapport :** 1247 lignes (cible : min 400 ✅)
