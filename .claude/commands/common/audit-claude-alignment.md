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
- `--full` : force les 7 lentilles, effort `high` sur sécurité et modèles — cadence mensuelle
- `--lens=<nom>` : une seule lentille (`cli-release`, `models-pricing`, `prompt-context`, `cc-features`, `security-cve`, `community`, `internal-conformance`)
- `--since=YYYY-MM-DD` : force la date de baseline — rattrapage après un trou de cadence
- `--dry-run` : pré-collecte + liste des agents qui seraient lancés. **Aucun agent, aucune écriture**
- `--no-pr` : rapport seul, ni branche ni PR

## MISSION

### Étape 0 — Pré-vol et pré-collecte

1. **Worktree propre obligatoire.** `git status --porcelain` ; si la sortie n'est pas vide, **arrêter** et le signaler. Des agents d'audit ont déjà pollué le worktree par le passé — on ne construit pas une PR par-dessus des modifications non validées.
2. Lancer la pré-collecte déterministe (coût LLM nul) :
   ```bash
   node scripts/collect-claude-signals.mjs [--since=<date>] [--dry-run]
   ```
   Elle lit `config/claude-alignment-baseline.json`, interroge le registry npm, les avis de sécurité GitHub, le catalogue communautaire et les pages de doc suivies par empreinte, puis écrit `docs/audit/claude-alignment/signals-<date>.json`.
3. Lire ce fichier. Le champ **`agents_to_launch`** est la liste exacte des lentilles à réveiller. Une lentille absente n'est **pas** auditée : écrire `✅ aucun changement depuis <baseline.last_run>` dans le rapport, sans lancer d'agent. C'est le principal levier de coût de cette commande.
4. Calculer l'âge du dernier run (`baseline.last_run` → aujourd'hui). Au-delà de **10 jours**, ouvrir le rapport par un avertissement de cadence.
5. En `--full`, ignorer `agents_to_launch` et retenir les 7 lentilles. En `--lens=<nom>`, ne retenir que celle-là. En `--dry-run`, s'arrêter ici en affichant la liste retenue et le coût estimé.

### Étape 1 — Gates locaux (0 token)

Lancer, et consigner le résultat de chacun dans le rapport :

```bash
npm run lint:versions   # cohérence tech-registry ↔ versions.yaml + denylist dans les fichiers vitrine
npm run lint:includes   # liens @<path> fantômes
npm run docs:check      # dérive des références générées
npm run lint:i18n       # parité i18n (comptage + taille)
```

Un gate rouge est un finding **P1** au minimum. Ne pas le corriger ici : il alimente le patch-plan de l'étape 3.

### Étape 2 — Équipe d'agents (un seul message, N appels Task en parallèle)

Lancer **en un seul message** un agent par lentille retenue. Le routing modèle n'est pas négociable : il est ce qui rend l'audit hebdomadaire soutenable.

| Lentille | `subagent_type` | `model` | `effort` |
|---|---|---|---|
| `cli-release` | `general-purpose` | `sonnet` | `medium` |
| `models-pricing` | `general-purpose` | `sonnet` | `medium` (`high` en `--full`) |
| `cc-features` | `claude-code-guide` | *(défaut de l'agent)* | — |
| `prompt-context` | `general-purpose` | `sonnet` | `medium` |
| `security-cve` | `general-purpose` | `sonnet` | `medium` (`high` en `--full`) |
| `community` | `general-purpose` | `sonnet` | `medium` |
| `internal-conformance` | `general-purpose` | `haiku` | `low` |

`internal-conformance` est un scan mécanique 100 % local : son prompt lui **interdit explicitement** WebSearch et WebFetch. Les six autres reçoivent les URLs exactes issues de `signals-<date>.json` — ils font du WebFetch ciblé, pas de la découverte par WebSearch (non déterministe et multi-requêtes).

**Socle commun à injecter dans chaque prompt d'agent :**

```
Tu audites la lentille "<LENTILLE>" du dépôt claude-craft (framework Claude Code, v<version de package.json>).

CONTEXTE PRÉ-COLLECTÉ (ne pas re-chercher ce qui est déjà donné) :
<coller le bloc lenses["<LENTILLE>"] de docs/audit/claude-alignment/signals-<date>.json>
Baseline du dernier audit : <baseline.last_run>

ÉTAPES :
1. Lire les fichiers du dépôt listés ci-dessous : <PATHS>
2. Confronter au réel via les sources fournies (WebFetch sur les URLs exactes ci-dessus).
   Ne remonter QUE ce qui a changé depuis la baseline.
3. Retourner EXACTEMENT ce format (< 300 mots) :

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

| Lentille | Fichiers du dépôt à confronter |
|---|---|
| `cli-release` | `config/versions.yaml` (`claudeCode.*`), `.claude/COMPATIBILITY.md`, `.claude/rules/12-context-management.md`, `docs/PREREQUISITES.md` |
| `models-pricing` | `config/versions.yaml` (`claudeCode.models`, `denylist`), `.claude/rules/12-context-management.md`, `.claude/settings.json`, `.claude/settings.local.json.example` — charger le skill `claude-api` pour la référence modèles/pricing |
| `cc-features` | `.claude/COMPATIBILITY.md`, `.claude/settings.json`, `.claude-plugin/plugin.json`, `.claude/agents/*.md`, `.claude/skills/*/SKILL.md` — identifier les features de la plateforme non encore adoptées |
| `prompt-context` | `.claude/rules/12-context-management.md`, `.claude/rules/23-karpathy-principles.md`, `.claude/CLAUDE.md` |
| `security-cve` | `.claude/rules/11-security.md`, `.claude/settings.json` (permissions), `.claude/COMPATIBILITY.md` (section CVE) |
| `community` | `.claude/skills/ecosystem-tools/SKILL.md`, `docs/ECOSYSTEM.md` |
| `internal-conformance` | Les 3 inventaires : `.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, `.claude/commands/**/*.md`. Vérifier : frontmatter YAML parsable et `description` non vide ; `context: fork` présent sur tout skill de plus de 60 lignes ; cohérence `model:`/`effort:` (un agent `haiku` ne doit pas être en `effort: xhigh`) ; hooks lisant leur payload sur **stdin via `jq`** et jamais via `$TOOL_INPUT` ; aucun token de `denylist` hors fichiers vitrine |

### Étape 3 — Synthèse, rapport, patch-plan

1. Agréger les retours. Un agent qui a échoué laisse `⚠️ audit incomplet : <raison>` — ne jamais inventer sa section.
2. Écrire `docs/audit/claude-alignment/<date>.md` :

```markdown
# Audit d'alignement Claude — <date>

**Version claude-craft** : <package.json>
**Mode** : quick | full
**Baseline** : <date> (<N> jours) <⚠️ si > 10 jours>
**Lentilles auditées** : <n>/7 — <liste> (les autres inchangées depuis la baseline)

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

## Findings par lentille
<coller chaque rapport d'agent>

## Patch-plan appliqué
| Fichier | Avant | Après | Raison |
|---|---|---|---|

## Jugement humain requis
- [ ] <point> — <pourquoi>

## Méthodologie
- Pré-collecte : `scripts/collect-claude-signals.mjs` (npm registry, GitHub advisories, empreintes de pages, catalogue communautaire)
- Agents : <n> (routing sonnet/haiku documenté dans la commande)
- Sources : toutes citées dans les sections ci-dessus
```

3. Écrire le jumeau structuré `docs/audit/claude-alignment/<date>.json` : `{ audit_date, mode, baseline, lenses{}, summary{P0..P3}, patch_plan[], human_decisions_required[], gates{} }`.

### Étape 4 — Branche et PR

Sauter entièrement cette étape si `--no-pr`, `--dry-run`, ou si le patch-plan est vide.

1. `git checkout -b chore/claude-alignment-<date>` depuis `main` à jour.
2. Appliquer **uniquement** les entrées du patch-plan, et **uniquement** dans l'allowlist :
   - `config/versions.yaml` — `claudeCode.recommended|testedUpTo|models.*`, `meta.lastUpdated`, ajouts en `denylist`
   - `.claude/COMPATIBILITY.md` — bandeau d'en-tête et ajout de lignes dans la table `Version Requirements`
   - Substitutions de version littérales dans les fichiers de `SHOWCASE_FILES` (`scripts/verify-versions.mjs`)
   - `Dev/i18n/<lang>/Common/templates/settings.json.template` et `Dev/i18n/<lang>/Common/rules/12-context-management.md` (les 5 langues, en une seule passe cohérente)
   - `config/claude-alignment-baseline.json` — remplacer par `next_baseline` du fichier de signaux
3. **Interdit, sans exception** : `.github/workflows/` (le token `gh` n'a pas le scope `workflow`, la PR deviendrait non mergeable), tout fichier hors allowlist, toute reformulation de prose, tout fichier `.md` de documentation générée (`docs/*-FULL-REFERENCE.md` : passer par `npm run docs:generate`).
4. Rejouer les 4 gates. **Un seul rouge ⇒ pas de PR** : laisser la branche en place et l'expliquer dans le rapport.
5. `git add` limité aux fichiers de l'allowlist effectivement modifiés, puis commit en Conventional Commits :
   `chore(alignment): sync Claude Code <ancienne> → <nouvelle> + modèles`
6. `gh pr create` avec, dans le corps : le résumé exécutif, le tableau du patch-plan, et la checklist « jugement humain requis ». **Jamais de merge automatique.**
7. Revenir sur `main` et confirmer à l'utilisateur l'URL de la PR.

## Règles strictes

- **Worktree propre** en préalable absolu ; sinon, arrêt immédiat.
- **Aucune édition hors allowlist**, et aucune édition du tout tant que les gates ne sont pas verts.
- **Toute affirmation de version cite une source** (URL ou `path:ligne`).
- **Fail-open assumé** : une source injoignable rend la lentille « à auditer », jamais « rien à signaler ».
- **Un agent en échec** laisse `⚠️ audit incomplet : <raison>` — pas de section inventée.
- **Parallélisme obligatoire** : un seul message contenant tous les appels Task de l'étape 2.
- **Langue du rapport** : français, avec accents.

## Exemples

```
/common:audit-claude-alignment                          # rituel hebdomadaire
/common:audit-claude-alignment --dry-run                # quelles lentilles bougeraient ? coût nul
/common:audit-claude-alignment --full                   # passage mensuel approfondi
/common:audit-claude-alignment --lens=cli-release --no-pr
/common:audit-claude-alignment --since=2026-06-30       # rattrapage après un trou de cadence
```
