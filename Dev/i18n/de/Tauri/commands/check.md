---
description: "Tauri-v2-Audit nach Achse: architecture, code-quality, security, testing oder all (bewerteter Gesamtbericht)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Tauri Check

## Argumente

$ARGUMENTS

Das erste Argument ist die Achse; der Rest (zum Beispiel ein Projektpfad) wird weitergereicht. Ohne Achse wird `all` ausgeführt.

| Achse | Zu befolgende Checkliste |
|-------|--------------------------|
| `architecture` | `.claude/references/tauri/checks/architecture.md` |
| `code-quality` | `.claude/references/tauri/checks/code-quality.md` |
| `security` | `.claude/references/tauri/checks/security.md` |
| `testing` | `.claude/references/tauri/checks/testing.md` |
| `all` | `.claude/references/tauri/checks/all.md`: die 4 Achsen, dann ein konsolidierter Bericht mit Bewertung auf 100 Punkte |

## MISSION

1. Das erste Argument lesen. Ist es keine der 5 oben genannten Achsen, diese mit einem Beispiel auflisten (`/tauri:check security src-tauri`) und anhalten.
2. Die Checklisten-Datei dieser Achse lesen und Schritt für Schritt befolgen. In dieser Datei steht `$ARGUMENTS` für die Argumente, die auf die Achse folgen.
3. Den Bericht im Ausgabeformat erstellen, das die Checkliste definiert.

Beispiele: `/tauri:check architecture`, `/tauri:check testing ./src-tauri`, `/tauri:check all`.
