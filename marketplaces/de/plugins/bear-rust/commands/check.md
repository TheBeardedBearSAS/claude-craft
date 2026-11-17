---
description: "Rust/Axum-Audit nach Achse: architecture, code-quality, security, testing oder all (bewerteter Gesamtbericht)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Rust Check

## Argumente

$ARGUMENTS

Das erste Argument ist die Achse; der Rest (zum Beispiel ein Projektpfad) wird weitergereicht. Ohne Achse wird `all` ausgeführt.

| Achse | Zu befolgende Checkliste |
|-------|--------------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/rust/checks/all.md`: die 4 Achsen, dann ein konsolidierter Bericht mit Bewertung auf 100 Punkte |

## MISSION

1. Das erste Argument lesen. Ist es keine der 5 oben genannten Achsen, diese mit einem Beispiel auflisten (`/bear-rust:check security crates/api`) und anhalten.
2. Die Checklisten-Datei dieser Achse lesen und Schritt für Schritt befolgen. In dieser Datei steht `$ARGUMENTS` für die Argumente, die auf die Achse folgen.
3. Den Bericht im Ausgabeformat erstellen, das die Checkliste definiert.

Beispiele: `/bear-rust:check architecture`, `/bear-rust:check testing ./crates/api`, `/bear-rust:check all`.
