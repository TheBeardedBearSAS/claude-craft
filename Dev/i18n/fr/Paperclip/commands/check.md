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
| `architecture` | `.claude/references/paperclip/checks/architecture.md` |
| `code-quality` | `.claude/references/paperclip/checks/code-quality.md` |
| `security` | `.claude/references/paperclip/checks/security.md` |
| `testing` | `.claude/references/paperclip/checks/testing.md` |
| `all` | `.claude/references/paperclip/checks/all.md` : les 4 axes, puis un rapport consolidé noté sur 100 |

## MISSION

1. Lisez le premier argument. S'il ne correspond à aucun des 5 axes ci-dessus, listez-les avec un exemple (`/paperclip:check security src/`) et arrêtez-vous.
2. Lisez le fichier de checklist de cet axe et suivez-le étape par étape. Dans ce fichier, `$ARGUMENTS` désigne les arguments qui suivent l'axe.
3. Produisez le rapport au format de sortie défini par la checklist.

Exemples : `/paperclip:check architecture`, `/paperclip:check testing ./app`, `/paperclip:check all`.
