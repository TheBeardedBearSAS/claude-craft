# CLI Spec — `claude-craft skill`

> **Status** : DRAFT P3-23. À implémenter dans `cli/src/commands/skill.ts`.

## Commandes

### `claude-craft skill search <query>`

Recherche dans l'index marketplace (téléchargé + caché 1h).

```bash
claude-craft skill search symfony testing
# →
# NAME                          VERSION  STACK     AUTHOR
# symfony:check-testing-advanced 1.2.0    symfony   @alice
# symfony:mutation-testing-pest  1.0.1    symfony   @bob
```

### `claude-craft skill install <name>[@version]`

Télécharge SKILL.md + installe dans `.claude/skills/<name>/SKILL.md` du projet.

```bash
claude-craft skill install symfony:check-testing-advanced
# → télécharge depuis raw.githubusercontent.com
# → valide frontmatter (YAML + champs obligatoires)
# → écrit dans .claude/skills/<name>/SKILL.md
# → ajoute entry dans .claude/skills-manifest.json
```

Flags :
- `--global` : installe dans `~/.claude/skills/` au lieu du projet
- `--force` : écrase si existe
- `--dry-run` : affiche sans écrire

### `claude-craft skill list`

Liste les skills installées (projet + global).

### `claude-craft skill remove <name>`

Désinstalle.

### `claude-craft skill update [<name>]`

MAJ une skill ou toutes.

## Index source

`https://skills.claude-craft.dev/index.json` (CDN Cloudflare, TTL 1h).

Fallback : `https://raw.githubusercontent.com/the-bearded-cto/skills-marketplace/main/index.json`.

## Validation skill installée

Avant écriture :
1. Frontmatter YAML parse OK
2. Champs obligatoires présents : `name`, `version`, `license`, `stack`
3. Size ≤ 100 KB (prévention abuse)
4. Pas de code exécutable côté CLI (juste du Markdown interprété par Claude)

## Erreurs (RFC 9457 Problem Details interne)

| Code | Cas |
|---|---|
| `SKILL_NOT_FOUND` | Nom absent de l'index |
| `VERSION_MISMATCH` | Version demandée inexistante |
| `SCHEMA_INVALID` | Frontmatter ne respecte pas le schéma |
| `INTEGRITY_FAILED` | Checksum SHA256 mismatch (si publié) |

## Sécurité

- Pas d'exécution automatique de scripts tiers
- Review humaine recommandée avant `install` (CLI affiche resumé frontmatter + prompt confirmation sauf `--yes`)
- Rapport vulnérabilités skills via `security@claude-craft.dev`
