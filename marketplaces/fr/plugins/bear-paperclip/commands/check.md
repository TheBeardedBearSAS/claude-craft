---
description: "Audit Paperclip par axe : architecture, code-quality, security, testing, ou all (agrégat noté)"
argument-hint: "<architecture|code-quality|security|testing|all> [chemin]"
---

# Vérification Paperclip

## Arguments

$ARGUMENTS

Le premier argument est l'axe ; le reste (par exemple un chemin de projet) est transmis tel quel. Sans axe, exécutez `all`.

| Axe | Checklist à suivre |
|-----|--------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/paperclip/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/paperclip/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/paperclip/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/paperclip/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/paperclip/checks/all.md` : les 4 axes, puis un rapport consolidé noté sur 100 |

## MISSION

1. Lisez le premier argument. S'il ne correspond à aucun des 5 axes ci-dessus, listez-les avec un exemple (`/bear-paperclip:check security src/`) et arrêtez-vous.
2. Lisez le fichier de checklist de cet axe et suivez-le étape par étape. Dans ce fichier, `$ARGUMENTS` désigne les arguments qui suivent l'axe.
3. Produisez le rapport au format de sortie défini par la checklist.

Exemples : `/bear-paperclip:check architecture`, `/bear-paperclip:check testing ./app`, `/bear-paperclip:check all`.
