---
description: "Audit de fraîcheur multi-stack (versions + best practices) : pré-collecte déterministe des registres officiels, agents uniquement sur les stacks en écart"
argument-hint: "[--wave=1|2|3|all] [--stack=<clé versions.yaml>] [--full] [--dry-run]"
model: sonnet
---

# Audit de Fraîcheur claude-craft

Vérifie que les stacks, l'infra et les règles transverses de claude-craft suivent les dernières versions stables et best practices des outils déclarés.

Le périmètre n'est **jamais codé en dur** : il découle de `config/versions.yaml` (SSOT des versions) et de `config/freshness-sources.yaml` (où lire la version stable et quels fichiers confronter). Ajouter un stack sans source fait échouer `tests/scripts/collect-freshness-signals.test.mjs`.

Complémentaire de `/common:audit-claude-alignment`, qui couvre Claude Code lui-même.

**Résultat :** rapport `docs/audit/freshness-<date>.md`. Aucune modification automatique des skills, commands, agents, references ou rules : le traitement des findings se fait ensuite, sur une branche dédiée.

## Arguments

$ARGUMENTS

- *(défaut)* : vagues 1 et 3. Seuls les stacks et outils dont la version stable a dépassé la version déclarée reçoivent un agent.
- `--full` : audite tout, y compris les stacks à jour et la vague 2 (transverse). Cadence trimestrielle.
- `--wave=1|2|3|all` : `1` stacks, `2` familles transverses, `3` infra.
- `--stack=<clé>` : une seule clé de `versions.yaml` (`react`, `ruby`, `pgbouncer`…), auditée même si elle est à jour.
- `--dry-run` : pré-collecte et liste des agents qui seraient lancés. **Aucun agent, aucune écriture.**

## MISSION

### Étape 0 — Pré-vol et pré-collecte (0 token)

1. **Aucune modification suivie.** `git status --porcelain --untracked-files=no` doit être vide, sinon **arrêter** et le signaler.
2. **Instantané des non suivis** : `git ls-files --others --exclude-standard > <scratchpad>/untracked-before.txt`. Des agents d'audit ont déjà pollué le worktree, l'instantané sera comparé à l'étape 3.
3. Lancer la pré-collecte, qui interroge les registres officiels (npm, PyPI, Packagist, crates.io, RubyGems, endoflife.date, GitHub releases, flutter releases, api.wordpress.org) :
   ```bash
   docker run --rm -v "$PWD:/app" -w /app node:24 node scripts/collect-freshness-signals.mjs [--wave=…] [--stack=…] [--full] [--dry-run]
   ```
   Elle écrit `docs/audit/freshness/signals-<date>.json`. Pour chaque clé, ce fichier donne `declared`, `stable`, `gap` (`aucun` | `mineur` | `majeur` | `inconnu`), `source_url` et `paths`. Il donne aussi `claude_craft_version`, `previous_report` et **`agents_to_launch`**.
4. **`agents_to_launch` est la liste exacte des agents.** Une clé absente n'est pas auditée : elle figure dans le rapport en `✅ à jour (<stable>, <source_url>)`. Un écart `inconnu`, dû à une source injoignable, est **toujours** audité (fail-open).
5. En `--dry-run`, s'arrêter ici en affichant la table du collecteur, puis les agents avec leur routing et leur nombre.

Les versions stables du fichier de signaux font foi. Les agents ne les recherchent pas, ils les reçoivent. Au run du 2026-10-13, plusieurs index Context7 avaient des releases de retard (Symfony, Vue, Vite, Paperclip).

### Étape 1 — Agents (vagues 1 et 3, puis 2)

Un agent par élément de `agents_to_launch`. Le routing est fixe :

| Élément | `subagent_type` | `model` | `effort` |
|---|---|---|---|
| Stack ou outil infra (`entries`) | `general-purpose` | `sonnet` | `medium` |
| Famille transverse (`families`) | `general-purpose` | `sonnet` | `medium` |

Les agents sont envoyés **en un seul message, au plus 10 appels Agent par message**. Au-delà, enchaîner un second message une fois le premier lot revenu. Une salve d'une vingtaine d'agents a déjà déclenché le rate-limit serveur.

**Prompt pour une entrée (stack ou outil infra) :**

```
Tu audites la fraîcheur de « <CLÉ> » dans le dépôt claude-craft (v<claude_craft_version>).

FAITS PRÉ-COLLECTÉS (registre officiel, ne pas re-chercher) :
<coller le bloc entries["<CLÉ>"] de signals-<date>.json>

ÉTAPES :
1. Lire les fichiers du dépôt listés dans `paths` (dossiers : SKILL.md, references, agents,
   commandes). Relever les versions et patterns affirmés, avec chemin:ligne.
2. Entre la version déclarée et la version stable, récupérer les release notes et le guide
   de migration / breaking changes officiels : Context7 (resolve-library-id puis query-docs)
   d'abord, puis WebFetch sur l'URL officielle. WebSearch seulement si aucune URL officielle n'est connue.
3. Identifier : best practices obsolètes dans le dépôt, breaking changes non documentés,
   patterns nouveaux absents, versions secondaires (outils, SDK, plugins) périmées.
4. Retourner EXACTEMENT ce format (< 300 mots) :

## <CLÉ>
- **Version déclarée** : <declared_raw> (source: config/versions.yaml)
- **Version stable** : <stable> (source: <source_url>)
- **Écart** : aucun | mineur | majeur | critique (critique = vulnérabilité ou code généré cassé)
- **Best practices à revoir** :
  - <constat> — fichier: <path>:<ligne> — source: <URL ou context7 ID>
- **Patterns manquants** :
  - <pattern> — source: <URL>
- **Fichiers impactés** : <path1>, <path2>
- **Sources consultées** : context7=<ids> / web=<urls>

CONTRAINTES :
- Citer une source pour chaque affirmation. Si une info est introuvable, écrire « non trouvé ».
- Ne rien inventer, ne pas extrapoler une version depuis un numéro voisin.
- Ne JAMAIS modifier ni créer de fichier. Tu es en lecture seule.
```

**Prompt pour une famille transverse (vague 2) :** il reprend le même socle avec ces différences.

- **Faits pré-collectés** : le bloc `families["<FAMILLE>"]`.
- **Étape 2** : identifier l'état de l'art des standards cités dans les fichiers. Exemples : OWASP, NIST, CycloneDX, OpenAPI, Conventional Commits, versions des frameworks de test. Pour chacun, vérifier sur la source officielle la version citée par le dépôt.
- **Ligne « Version »** : remplacée par « Standards cités → version officielle actuelle ».

Ne pas injecter de versions cibles dans le prompt : l'agent les établit à partir des sources.

### Étape 2 — Contrôle de pollution

Refaire `git ls-files --others --exclude-standard` et comparer à l'instantané de l'étape 0, et vérifier que `git status --porcelain --untracked-files=no` est toujours vide. Tout écart signifie qu'un agent a écrit malgré sa consigne : le signaler en tête de rapport, **ne rien nettoyer automatiquement**.

### Étape 3 — Agrégation et rapport

1. Agréger les retours. Un agent en échec laisse `⚠️ audit incomplet : <raison>`, jamais une section inventée.
2. L'orchestrateur peut reclasser une sévérité. Par exemple, un « majeur » devient « critique » si la règle concernée est chargée à chaque session ou si le code généré casse. Le reclassement est justifié dans le résumé.
3. Lire `previous_report`, le dernier `docs/audit/freshness-*.md`, pour la section delta.
4. Écrire `docs/audit/freshness-<date>.md` en fin de run. Ne pas créer le fichier avant le retour des agents.

```markdown
# Audit de Fraîcheur claude-craft — <date>

**Version claude-craft** : <claude_craft_version>
**Mode** : défaut | full | wave=<n> | stack=<clé>
**Agents lancés** : <n> (<x> stacks + <y> infra + <z> transverse) — <n>/<n> terminés
**Audit précédent** : <previous_report>
**Pré-collecte** : `docs/audit/freshness/signals-<date>.json`

**Légende écarts** : 🔴 critique | 🟠 majeur | 🟡 mineur | ✅ aucun | ⚠️ inconnu

## Résumé exécutif

| Sévérité | Nombre | Périmètres |
|----------|--------|------------|

## Tableau global — Versions

<une ligne par entrée du fichier de signaux, auditée ou non>

| Stack / Outil | Déclarée | Stable | Écart | Source |
|---------------|----------|--------|-------|--------|

## Delta vs audit précédent

- Écarts résorbés depuis <previous_report>
- Nouveaux écarts
- Findings précédents non traités (à reporter)

## Findings détaillés

### Vague 1 — Stacks
### Vague 3 — Infrastructure
### Vague 2 — Transverse   (si auditée)

## Top 10 actions prioritaires

## Méthodologie

- Pré-collecte : `scripts/collect-freshness-signals.mjs` (registres officiels, voir `source_url`)
- Agents : <n>, `general-purpose` / `sonnet` / `medium`
- Limites : sources secondaires signalées « source tierce » ; miroirs `Dev/i18n/<lang>` hors `en` non audités
- Aucune modification du dépôt hors `docs/audit/`
```

5. Rappeler en conclusion la procédure de traitement : chaque bump passe d'abord par `config/versions.yaml` (gate `npm run lint:versions`), puis est propagé à `.claude/`, `Dev/i18n/<lang>/` et `Infra/i18n/<lang>/`. Ces couches divergent et doivent toutes être traitées.

## Règles strictes

- **Aucune modification suivie** en préalable. Les fichiers non suivis sont tolérés, mais comparés avant et après les agents.
- **NE JAMAIS modifier** skills, commands, agents, references, rules ou CLAUDE.md : seuls `docs/audit/` (gitignored) et le scratchpad sont écrits.
- **Toute version citée a une source** (URL du registre, `path:ligne` ou ID context7).
- **Fail-open** : `inconnu` signifie « à auditer », jamais « à jour ».
- **Lots de 10 agents maximum** par message, chaque lot en parallèle.
- **Langue du rapport** : français, avec accents.

## Exemples

```
/common:audit-freshness                    # mensuel : agents sur les seuls écarts
/common:audit-freshness --dry-run          # quels stacks ont bougé ? coût nul
/common:audit-freshness --full             # trimestriel : tout, y compris transverse
/common:audit-freshness --stack=ruby       # un stack, même à jour
/common:audit-freshness --wave=3           # infra seule
```
