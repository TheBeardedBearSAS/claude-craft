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
| `architecture` | `.claude/references/rust/checks/architecture.md` |
| `code-quality` | `.claude/references/rust/checks/code-quality.md` |
| `security` | `.claude/references/rust/checks/security.md` |
| `testing` | `.claude/references/rust/checks/testing.md` |
| `all` | `.claude/references/rust/checks/all.md`: die 4 Achsen, dann ein konsolidierter Bericht mit Bewertung auf 100 Punkte |

## MISSION

1. Das erste Argument lesen. Ist es keine der 5 oben genannten Achsen, diese mit einem Beispiel auflisten (`/rust:check security crates/api`) und anhalten.
2. Die Checklisten-Datei dieser Achse lesen und Schritt für Schritt befolgen. In dieser Datei steht `$ARGUMENTS` für die Argumente, die auf die Achse folgen.
3. Den Bericht im Ausgabeformat erstellen, das die Checkliste definiert.

Beispiele: `/rust:check architecture`, `/rust:check testing ./crates/api`, `/rust:check all`.
