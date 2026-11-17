---
description: "Audit Rust/Axum par axe : architecture, code-quality, security, testing, ou all (agrégat noté)"
argument-hint: "<architecture|code-quality|security|testing|all> [chemin]"
---

# Vérification Rust

## Arguments

$ARGUMENTS

Le premier argument est l'axe ; le reste (par exemple un chemin de projet) est transmis tel quel. Sans axe, exécutez `all`.

| Axe | Checklist à suivre |
|-----|--------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/all.md` : les 4 axes, puis un rapport consolidé noté sur 100 |

## MISSION

1. Lisez le premier argument. S'il ne correspond à aucun des 5 axes ci-dessus, listez-les avec un exemple (`/bear-rust:check security crates/api`) et arrêtez-vous.
2. Lisez le fichier de checklist de cet axe et suivez-le étape par étape. Dans ce fichier, `$ARGUMENTS` désigne les arguments qui suivent l'axe.
3. Produisez le rapport au format de sortie défini par la checklist.

Exemples : `/bear-rust:check architecture`, `/bear-rust:check testing ./crates/api`, `/bear-rust:check all`.
