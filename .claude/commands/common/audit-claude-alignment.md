---
description: "Audit hebdomadaire d'alignement sur l'écosystème Claude (CLI, modèles, best practices Anthropic, communauté) via équipe d'agents + PR de correction"
argument-hint: "[--quick|--full] [--lens=<nom>] [--since=YYYY-MM-DD] [--dry-run] [--no-pr]"
model: sonnet
---

# Audit d'alignement Claude — claude-craft

Vérifie que claude-craft reste aligné sur l'état réel de l'écosystème Claude : version du CLI Claude Code, modèles et pricing, best practices Anthropic, features de la plateforme, avis de sécurité, et pratiques de la communauté.

Complémentaire de `/common:audit-freshness`, qui couvre les stacks applicatifs (React, Symfony, Flutter…) et **jamais Claude Code lui-même**.

**Résultat :** rapport `docs/audit/claude-alignment/<date>.md` + `<date>.json`, et une **PR** portant uniquement les corrections mécaniques. Tout ce qui demande un jugement part en checklist dans le corps de la PR, jamais en édition automatique.

## Arguments

$ARGUMENTS

- `--quick` (défaut) : n'audite que les lentilles dont la source externe a bougé depuis la baseline
- `--full` : force les 6 lentilles, effort `high` sur sécurité et modèles — cadence mensuelle
- `--lens=<nom>` : une seule lentille (`cli-release`, `models-pricing`, `prompt-context`, `cc-features`, `security-cve`, `community`)
- `--since=YYYY-MM-DD` : force la date de baseline — rattrapage après un trou de cadence
- `--dry-run` : pré-collecte + liste des agents qui seraient lancés. **Aucun agent, aucune écriture**
- `--no-pr` : rapport seul, ni branche ni PR ; `next_baseline` est écrite sur disque sans commit

La conformité interne (frontmatters YAML, `context: fork`, cohérence `model`/`effort`, hooks lisant stdin, denylist) n'est **pas** une lentille : elle est couverte par les tests de `tests/content/` lancés en gate à l'étape 1. Un contrôle mécanique confié à un agent haiku ratait des cas (22 YAML invalides vus sur 71 réels au run du 2026-10-28).

## MISSION

### Étape 0 — Pré-vol et pré-collecte

1. **Aucune modification suivie.** `git status --porcelain --untracked-files=no` doit être vide ; sinon, **arrêter** et le signaler. On ne construit pas une PR par-dessus des modifications non validées.
2. **Instantané des fichiers non suivis** : `git ls-files --others --exclude-standard > <scratchpad>/untracked-before.txt`. Les fichiers non suivis préexistants (notes, brouillons) sont tolérés, mais des agents d'audit ont déjà pollué le worktree : l'instantané est comparé après l'étape 2.
3. Lancer la pré-collecte déterministe (coût LLM nul) :
   ```bash
   docker run --rm -v "$PWD:/app" -w /app node:24 node scripts/collect-claude-signals.mjs [--since=<date>] [--dry-run]
   ```
   Elle lit `config/claude-alignment-baseline.json` et `config/versions.yaml` (la version déclarée est la plus récente entre `claudeCode.testedUpTo` et la baseline), interroge le registry npm, les avis de sécurité GitHub, le catalogue communautaire et les pages de doc suivies par empreinte, puis écrit `docs/audit/claude-alignment/signals-<date>.json`.
4. Lancer l'**inventaire exhaustif** des affirmations Claude du dépôt (coût LLM nul, en `--quick` comme en `--full`) :
   ```bash
   docker run --rm -v "$PWD:/app" -w /app node:24 node scripts/scan-claude-claims.mjs
   ```
   Le scanner parcourt **tout** `git ls-files` (hors `claimScan.exclude` de `config/versions.yaml`) : IDs et noms de modèles, versions du CLI, prix, `CLAUDE_CODE_*`, termes dépréciés. Il classe chaque occurrence contre `claudeCode.*` (`models`, `limitedModels`, `legacyModels`, `pricing`, `recommended`, `testedUpTo`, `minimum`) et écrit `docs/audit/claude-alignment/claims-<date>.json` (`files_scanned`, `occurrences_by_category`, `stale[]`, `unknown[]`, `review[]`). À ce stade, `stale` mesure la **dérive interne** (le dépôt contredit sa propre source de vérité) : chaque occurrence `stale` est un finding P2 au minimum, même si aucune lentille ne se réveille. Les fichiers pivots des lentilles ne sont qu'un point d'entrée : sans ce scan, un audit ne couvre qu'une quinzaine de fichiers sur plus de 150 porteurs d'affirmations (run du 2026-11-10).
5. Lire le fichier de signaux. Le champ **`agents_to_launch`** est la liste exacte des lentilles à réveiller. Une lentille absente n'est **pas** auditée : écrire `✅ aucun changement depuis <baseline.last_run>` dans le rapport, sans lancer d'agent. C'est le principal levier de coût de cette commande.
6. Calculer l'âge du dernier run (`baseline.last_run` → aujourd'hui). Au-delà de **10 jours**, ouvrir le rapport par un avertissement de cadence.
7. En `--full`, ignorer `agents_to_launch` et retenir les 6 lentilles. En `--lens=<nom>`, ne retenir que celle-là. En `--dry-run`, s'arrêter ici en affichant les lentilles retenues avec leur routing (`subagent_type` / `model` / `effort`) et le nombre d'agents qui seraient lancés.

### Étape 1 — Gates locaux (0 token)

Lancer dans un conteneur (`D='docker run --rm -v "$PWD:/app" -w /app node:24'`), et consigner le résultat de chacun dans le rapport :

```bash
$D npm run lint:versions   # cohérence tech-registry ↔ versions.yaml + denylist dans les fichiers vitrine
$D npm run lint:includes   # liens @<path> fantômes
$D npm run docs:check      # dérive des références générées
$D npm run lint:i18n       # parité i18n (comptage + taille)
$D npx vitest run          # suite complète : conformité interne (tests/content/), doc-counts, collecteur
```

Les tests de conformité interne remplacent l'ancienne lentille agent : `skill-frontmatter-yaml` (YAML strict, `description` non vide), `skill-context-fork` (> 60 lignes ⇒ `context: fork`), `agents-optimization` (cohérence `model`/`effort`), `hooks-stdin` (aucun `$TOOL_INPUT` dans les `command`), `agent-bash-deny`.

Un gate rouge est un finding **P1** au minimum. Ne pas le corriger ici : il alimente le patch-plan de l'étape 3.

### Étape 2 — Équipe d'agents (un seul message, N appels Agent en parallèle)

Si aucune lentille n'est retenue, sauter cette étape. Sinon, lancer **en un seul message** un agent par lentille retenue. Le routing modèle n'est pas négociable : il est ce qui rend l'audit hebdomadaire soutenable. Cette commande demande explicitement les paramètres `model` et `effort` de l'outil Agent ci-dessous.

| Lentille | `subagent_type` | `model` | `effort` |
|---|---|---|---|
| `cli-release` | `general-purpose` | `sonnet` | `medium` |
| `models-pricing` | `general-purpose` | `sonnet` | `medium` (`high` en `--full`) |
| `cc-features` | `claude-code-guide` | *(défaut de l'agent)* | — |
| `prompt-context` | `general-purpose` | `sonnet` | `medium` |
| `security-cve` | `general-purpose` | `sonnet` | `medium` (`high` en `--full`) |
| `community` | `general-purpose` | `sonnet` | `medium` |

Les six lentilles reçoivent les URLs exactes issues de `signals-<date>.json` — ils font du WebFetch ciblé, pas de la découverte par WebSearch (non déterministe et multi-requêtes).

**Socle commun à injecter dans chaque prompt d'agent :**

```
Tu audites la lentille "<LENTILLE>" du dépôt claude-craft (framework Claude Code, v<version de package.json>).

CONTEXTE PRÉ-COLLECTÉ (ne pas re-chercher ce qui est déjà donné) :
<coller le bloc lenses["<LENTILLE>"] de docs/audit/claude-alignment/signals-<date>.json>
Baseline du dernier audit : <baseline.last_run>

OCCURRENCES DU DÉPÔT (inventaire exhaustif, scripts/scan-claude-claims.mjs) :
<coller les entrées stale[] + unknown[] + review[] de claims-<date>.json filtrées par
 les catégories de la lentille (table ci-dessous), au format path:ligne match — extrait,
 et les compteurs occurrences_by_category de ces catégories>

ÉTAPES :
1. Lire les fichiers pivots listés ci-dessous : <PATHS>
2. Confronter au réel via les sources fournies (WebFetch sur les URLs exactes ci-dessus).
   Ne remonter QUE ce qui a changé depuis la baseline.
3. Statuer sur CHAQUE occurrence fournie (périmée réelle, faux positif, historique légitime),
   et dire si la vérité de config/versions.yaml (claudeCode.*) doit elle-même changer :
   dans ce cas, le PATCH porte sur versions.yaml — le re-scan de l'étape 3 propagera.
4. Retourner EXACTEMENT ce format (< 300 mots) :

## <LENTILLE>
- **État déclaré dans le repo** : <valeur> (source: <path>:<ligne>)
- **État réel observé** : <valeur> (source: <URL>)
- **Écart** : aucun | mineur | majeur | critique
- **Findings** :
  - [<sévérité P0-P3>] <constat> — source: <URL>
- **PATCH** : (uniquement les substitutions mécaniques sûres, une par ligne)
  - <chemin> | <valeur actuelle> | <valeur cible> | <raison>
- **JUGEMENT REQUIS** : (ce qui demande un arbitrage humain, jamais de PATCH)
  - <point> — pourquoi ça ne peut pas être automatisé

CONTRAINTES :
- Citer une source pour CHAQUE affirmation. Si une info est introuvable, écrire "non trouvé".
- Ne rien inventer, ne pas extrapoler une version depuis un numéro voisin.
- Ne JAMAIS modifier un fichier. Tu es en lecture seule.
- Un PATCH n'est légitime que si la substitution est littérale et sans ambiguïté
  (numéro de version, identifiant de modèle, date). Toute reformulation de prose
  va en JUGEMENT REQUIS.
```

**Cibles par lentille :**

Les fichiers pivots ne sont qu'un point d'entrée ; la couverture vient des occurrences de l'inventaire, filtrées par catégorie.

| Lentille | Catégories de l'inventaire | Fichiers pivots |
|---|---|---|
| `cli-release` | `cli-version` | `config/versions.yaml` (`claudeCode.*`), `.claude/COMPATIBILITY.md`, `.claude/rules/12-context-management.md`, `docs/PREREQUISITES.md` |
| `models-pricing` | `model-id`, `model-name`, `pricing` | `config/versions.yaml` (`claudeCode.models`, `denylist`), `.claude/rules/12-context-management.md`, `.claude/settings.json`, `.claude/settings.local.json.example` — charger le skill `claude-api` pour la référence modèles/pricing |
| `cc-features` | `env-var` (inventaire seul : vérifier les noms retirés ou renommés) | `.claude/COMPATIBILITY.md`, `.claude/settings.json`, `.claude-plugin/plugin.json`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md` — identifier les features de la plateforme non encore adoptées |
| `prompt-context` | `deprecated-term` | `.claude/rules/12-context-management.md`, `.claude/rules/23-karpathy-principles.md`, `.claude/CLAUDE.md` |
| `security-cve` | — | `.claude/rules/11-security.md`, `.claude/settings.json` (permissions), `.claude/COMPATIBILITY.md` (section CVE) |
| `community` | — | `.claude/skills/ecosystem-tools/SKILL.md`, `docs/ECOSYSTEM.md` |

### Étape 3 — Synthèse, rapport, patch-plan

0. **Contrôle de pollution** : refaire `git ls-files --others --exclude-standard` et le comparer à l'instantané de l'étape 0, et vérifier que `git status --porcelain --untracked-files=no` est toujours vide. Tout écart ⇒ un agent a écrit malgré sa consigne : l'arrêter et le signaler, ne rien nettoyer automatiquement.
1. Agréger les retours. Un agent qui a échoué laisse `⚠️ audit incomplet : <raison>` — ne jamais inventer sa section.
2. **Propager la vérité.** Si des PATCH touchent `config/versions.yaml` (`claudeCode.*`), les appliquer d'abord sur une copie de travail puis relancer `scripts/scan-claude-claims.mjs --dry-run` : les nouvelles occurrences `stale` sont exactement les fichiers à aligner dans tout le dépôt. Chaque occurrence devient une ligne du patch-plan (substitution littérale) ou du jugement humain (prose à reformuler).
3. Écrire `docs/audit/claude-alignment/<date>.md` :

```markdown
# Audit d'alignement Claude — <date>

**Version claude-craft** : <package.json>
**Mode** : quick | full
**Baseline** : <date> (<N> jours) <⚠️ si > 10 jours>
**Lentilles auditées** : <n>/6 — <liste> (les autres inchangées depuis la baseline)

## Résumé exécutif

| Sévérité | Nombre |
|----------|--------|
| 🔴 P0 | N |
| 🟠 P1 | N |
| 🟡 P2 | N |
| 🔵 P3 | N |

## Gates locaux

| Gate | Résultat |
|------|----------|
| lint:versions | ✅ / ❌ <extrait> |
| lint:includes | … |
| docs:check | … |
| lint:i18n | … |
| vitest (conformité interne incluse) | … |
| audit:claude-claims --fail-on-stale | … |

## Couverture

| Indicateur | Valeur |
|---|---|
| Fichiers scannés | <files_scanned> |
| Occurrences (par catégorie) | <occurrences_by_category> |
| `stale` avant patch / après patch | <n> / <n> |
| `unknown` (à statuer) | <n> — liste ou justification |

## Findings par lentille
<coller chaque rapport d'agent>

## Patch-plan appliqué
| Fichier | Avant | Après | Raison |
|---|---|---|---|

## Jugement humain requis
- [ ] <point> — <pourquoi>

## Méthodologie
- Pré-collecte : `scripts/collect-claude-signals.mjs` (npm registry, GitHub advisories, empreintes de pages, catalogue communautaire)
- Inventaire : `scripts/scan-claude-claims.mjs` (tout `git ls-files`, classement contre `config/versions.yaml`)
- Agents : <n> (routing documenté dans la commande)
- Sources : toutes citées dans les sections ci-dessus
```

4. Écrire le jumeau structuré `docs/audit/claude-alignment/<date>.json` : `{ audit_date, mode, baseline, coverage{}, lenses{}, summary{P0..P3}, patch_plan[], human_decisions_required[], gates{} }`.

### Étape 4 — Baseline, branche et PR

**Baseline.** `next_baseline` (fichier de signaux) ne fait avancer que les lentilles effectivement auditées : pour une lentille dont l'agent a échoué, garder la valeur de l'ancienne baseline (hash, version ou advisories), sinon la semaine suivante la croirait vérifiée.

- `--dry-run` : rien n'est écrit, fin.
- `--no-pr` : écrire la baseline dans `config/claude-alignment-baseline.json` **sans commit** et le signaler dans le rapport, fin.
- **Patch-plan vide** : ouvrir quand même une PR `chore(alignment): baseline <date>` qui ne contient que `config/claude-alignment-baseline.json`, avec le résumé exécutif et la checklist « jugement humain requis » en corps (étapes 1, 5, 6, 7 ci-dessous). Sans elle, les mêmes lentilles se réveilleraient chaque semaine pour rien.
- Sinon, suivre toutes les étapes :

1. `git fetch origin refs/heads/main:refs/remotes/origin/main` puis `git checkout -b chore/claude-alignment-<date> origin/main` (toujours la ref de branche explicite : un tag `main` homonyme a déjà existé).
2. Appliquer **uniquement** les entrées du patch-plan, et **uniquement** dans l'allowlist :
   - `config/versions.yaml` — `claudeCode.recommended|testedUpTo|models.*|limitedModels|legacyModels|pricing`, `meta.lastUpdated`, ajouts en `denylist`
   - `.claude/COMPATIBILITY.md` — bandeau d'en-tête et ajout de lignes dans la table `Version Requirements`
   - Substitutions de version littérales dans les fichiers de `SHOWCASE_FILES` (`scripts/verify-versions.mjs`)
   - `Dev/i18n/base/Common/templates/settings.json.template` (copie unique) et `Dev/i18n/<lang>/Common/rules/12-context-management.md` (les 5 langues, en une seule passe cohérente)
   - `config/claude-alignment-baseline.json` — remplacer par `next_baseline` du fichier de signaux
   - **Toute occurrence `stale` du re-scan**, dans n'importe quel fichier distribué : substitution littérale d'un ID de modèle, d'une version du CLI ou d'un prix, sur la ligne signalée uniquement. Une occurrence dans un fichier traduit s'applique aux 5 langues en une passe. Code et tests qui embarquent la version (ex. `cli/lib/doctor.js`, `tests/cli/doctor.test.mjs`) suivent la même règle
3. **Interdit, sans exception** : `.github/workflows/` (le token `gh` n'a pas le scope `workflow`, la PR deviendrait non mergeable), tout fichier hors allowlist, toute reformulation de prose, tout fichier `.md` de documentation générée (`docs/*-FULL-REFERENCE.md` : passer par `npm run docs:generate`).
4. Rejouer les 5 gates de l'étape 1, plus `node scripts/scan-claude-claims.mjs --fail-on-stale` (6ᵉ gate : 0 occurrence `stale`, sinon chaque reste est justifié dans le rapport et reporté en jugement humain). **Un seul rouge ⇒ pas de PR** : laisser la branche en place et l'expliquer dans le rapport.
5. `git add` par chemins explicites, limité aux fichiers de l'allowlist effectivement modifiés, puis commit en Conventional Commits :
   `chore(alignment): sync Claude Code <ancienne> → <nouvelle> + modèles`
6. `gh pr create` avec, dans le corps : le résumé exécutif, le tableau du patch-plan, et la checklist « jugement humain requis ». **Jamais de merge automatique.**
7. Revenir sur `main` et confirmer à l'utilisateur l'URL de la PR.

## Règles strictes

- **Aucune modification suivie** en préalable absolu ; sinon, arrêt immédiat. Fichiers non suivis tolérés, mais comparés avant/après les agents.
- **Couverture exhaustive** : l'inventaire `scan-claude-claims` est lancé à chaque run ; les agents statuent sur ses occurrences, pas seulement sur les fichiers pivots.
- **Aucune édition hors allowlist**, et aucune édition du tout tant que les gates ne sont pas verts. Seule exception sans patch-plan : la baseline.
- **Toute affirmation de version cite une source** (URL ou `path:ligne`).
- **Fail-open assumé** : une source injoignable rend la lentille « à auditer », jamais « rien à signaler ».
- **Un agent en échec** laisse `⚠️ audit incomplet : <raison>` — pas de section inventée.
- **Parallélisme obligatoire** : un seul message contenant tous les appels Agent de l'étape 2.
- **Langue du rapport** : français, avec accents.

## Exemples

```
/common:audit-claude-alignment                          # rituel hebdomadaire
/common:audit-claude-alignment --dry-run                # quelles lentilles bougeraient ? coût nul
/common:audit-claude-alignment --full                   # passage mensuel approfondi
/common:audit-claude-alignment --lens=cli-release --no-pr
/common:audit-claude-alignment --since=2026-06-30       # rattrapage après un trou de cadence
```
