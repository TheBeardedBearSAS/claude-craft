---
description: "Ruby/Rails-Audit nach Achse: architecture, code-quality, security, testing oder all (bewerteter Gesamtbericht)"
argument-hint: "<architecture|code-quality|security|testing|all> [path]"
---

# Ruby Check

## Argumente

$ARGUMENTS

Das erste Argument ist die Achse; der Rest (zum Beispiel ein Projektpfad) wird weitergereicht. Ohne Achse wird `all` ausgeführt.

| Achse | Zu befolgende Checkliste |
|-------|--------------------------|
| `architecture` | `.claude/references/ruby/checks/architecture.md` |
| `code-quality` | `.claude/references/ruby/checks/code-quality.md` |
| `security` | `.claude/references/ruby/checks/security.md` |
| `testing` | `.claude/references/ruby/checks/testing.md` |
| `all` | `.claude/references/ruby/checks/all.md`: die 4 Achsen, dann ein konsolidierter Bericht mit Bewertung auf 100 Punkte |

## MISSION

1. Das erste Argument lesen. Ist es keine der 5 obigen Achsen, diese mit einem Beispiel auflisten (`/ruby:check security app/`) und anhalten.
2. Die Checklistendatei dieser Achse lesen und Schritt für Schritt befolgen. In dieser Datei steht `$ARGUMENTS` für die Argumente, die auf die Achse folgen.
3. Den Bericht im von der Checkliste definierten Ausgabeformat erstellen.

Beispiele: `/ruby:check architecture`, `/ruby:check testing ./app`, `/ruby:check all`.
