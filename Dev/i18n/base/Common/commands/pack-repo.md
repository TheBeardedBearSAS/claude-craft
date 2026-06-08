---
description: Pack la codebase en un fichier AI-friendly (Repomix wrapper + fallback shell). Token counting inclus.
argument-hint: [--format=xml|markdown|plain] [--output=<path>] [--compress] [--fallback]
---

# Pack Repo — Repomix wrapper

Packe la codebase entière en **un seul fichier** optimisé pour analyse LLM, avec token counting par fichier.

**Source :** [yamadashy/repomix](https://github.com/yamadashy/repomix) (23.4k+ stars) — standard de facto 2026.

## Quand utiliser

| Cas d'usage | Exemple |
|-------------|---------|
| **Onboarding** | Donner tout le projet à un agent pour contexte initial |
| **Audit** | Passer la codebase à un reviewer externe (IA ou humain) |
| **Migration** | Extraire un module pour réécriture dans une autre stack |
| **Génération Skills** | Produire un résumé du projet pour `.claude/skills/` |
| **Bug reports** | Joindre un pack minimal aux tickets |

## Usage

```bash
# Wrapper par défaut (Repomix npm)
/common:pack-repo

# Format explicite
/common:pack-repo --format=xml
/common:pack-repo --format=markdown --output=./docs/repo-snapshot.md

# Compression (réduit ~30% de tokens)
/common:pack-repo --compress

# Forcer le fallback shell (pas de dépendance npm)
/common:pack-repo --fallback
```

## Étapes d'exécution

### 1. Détection de l'outil disponible

```bash
if command -v repomix &>/dev/null; then
  TOOL="repomix"
elif command -v npx &>/dev/null && npx --yes repomix --version &>/dev/null; then
  TOOL="npx repomix"
else
  TOOL="fallback"
  echo "⚠️  repomix indisponible, utilisation du fallback shell natif"
fi
```

### 2. Exécution wrapper Repomix (préféré)

```bash
# Options par défaut : XML, respect de .gitignore, token counting
$TOOL \
  --output "${OUTPUT:-repomix-output.xml}" \
  --style "${FORMAT:-xml}" \
  --token-count-encoding o200k_base \
  ${COMPRESS:+--compress} \
  --ignore "node_modules,vendor,dist,build,.git,*.lock,coverage,.next,.nuxt"
```

**Avantages du wrapper Repomix :**
- Respect automatique de `.gitignore`
- Détection binaires (skip)
- Token counting par fichier
- Formats XML/Markdown/Plain/JSON
- MCP Server intégré (option `--mcp`)
- Compression intelligente (option `--compress`)

### 3. Fallback shell (si pas de npm)

Si Repomix n'est pas disponible, utiliser `Dev/scripts/pack-repo-fallback.sh` :

```bash
bash Dev/scripts/pack-repo-fallback.sh \
  --format "${FORMAT:-markdown}" \
  --output "${OUTPUT:-./pack-repo-output.md}"
```

**Limitations du fallback :**
- Pas de token counting précis (estimation basée sur caractères)
- Pas de compression
- Formats limités (markdown, plain)
- Exclusions manuelles seulement

### 4. Rapport

Afficher :
- Fichier généré + taille
- Nombre de fichiers inclus / exclus
- Token count estimé (o200k_base)
- Avertissement si > 200k tokens (limite contexte)

## Options

| Flag | Valeur | Description |
|------|--------|-------------|
| `--format` | `xml` (défaut), `markdown`, `plain`, `json` | Format de sortie |
| `--output` | chemin | Fichier de sortie (défaut : `repomix-output.xml`) |
| `--compress` | - | Active la compression Repomix (~30% moins de tokens) |
| `--fallback` | - | Force le fallback shell (skip Repomix) |
| `--include` | glob | Inclure uniquement ces fichiers (ex: `src/**/*.ts`) |
| `--exclude` | glob | Exclure des fichiers supplémentaires |
| `--mcp` | - | Lance Repomix en mode MCP server |

## Exemples concrets

### Pack minimal pour audit sécurité

```bash
/common:pack-repo \
  --format=xml \
  --include="src/**/*.{ts,js,php}" \
  --output=./audits/security-snapshot.xml
```

### Pack compressé pour analyse LLM

```bash
/common:pack-repo --compress --format=markdown
```

### Pack fallback (environnement sans npm)

```bash
/common:pack-repo --fallback --format=markdown
```

## Intégration

- **`/workflow:init`** — propose pack-repo pour contexte initial nouveau projet
- **`/common:setup-project-context`** — utilise pack-repo pour alimenter `.claude/INDEX.md`
- **`/team:audit`** — packe avant audit multi-stack
- **Skill `atomic-tasks`** — pack léger par feature pour subagent frais

## Avertissements

- **Ne JAMAIS committer** le fichier de sortie (`repomix-output.*`) — ajouter à `.gitignore`
- **Secrets** : Repomix détecte/masque les patterns courants (API keys, tokens) mais **toujours review avant partage**
- **Taille** : au-delà de 200k tokens, utiliser `--compress` ou découper par dossier

## Ressources

- [Repomix docs](https://repomix.com/)
- [yamadashy/repomix GitHub](https://github.com/yamadashy/repomix)
- Fallback script : `Dev/scripts/pack-repo-fallback.sh`
- Skill `atomic-tasks` pour découpage
