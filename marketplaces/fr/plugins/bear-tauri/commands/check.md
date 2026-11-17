---
description: "Audit Tauri v2 par axe : architecture, code-quality, security, testing, ou all (agrégat noté)"
argument-hint: "<architecture|code-quality|security|testing|all> [chemin]"
---

# Vérification Tauri

## Arguments

$ARGUMENTS

Le premier argument est l'axe ; le reste (par exemple un chemin de projet) est transmis tel quel. Sans axe, exécutez `all`.

| Axe | Checklist à suivre |
|-----|--------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/tauri/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/tauri/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/tauri/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/tauri/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/tauri/checks/all.md` : les 4 axes, puis un rapport consolidé noté sur 100 |

## MISSION

1. Lisez le premier argument. S'il ne correspond à aucun des 5 axes ci-dessus, listez-les avec un exemple (`/bear-tauri:check security src-tauri`) et arrêtez-vous.
2. Lisez le fichier de checklist de cet axe et suivez-le étape par étape. Dans ce fichier, `$ARGUMENTS` désigne les arguments qui suivent l'axe.
3. Produisez le rapport au format de sortie défini par la checklist.

Exemples : `/bear-tauri:check architecture`, `/bear-tauri:check testing ./src-tauri`, `/bear-tauri:check all`.
