---
description: "Flutter-Audit nach Achse: architecture, code-quality, security, testing oder all (bewertete Gesamtauswertung)"
argument-hint: "<architecture|code-quality|security|testing|all> [Pfad]"
---

# Flutter-Prüfung

## Argumente

$ARGUMENTS

Das erste Argument ist die Achse; der Rest (zum Beispiel ein Projektpfad) wird unverändert weitergegeben. Ohne Achse führen Sie `all` aus.

| Achse | Zu befolgende Checkliste |
|-------|--------------------------|
| `architecture` | `.claude/references/flutter/checks/architecture.md` |
| `code-quality` | `.claude/references/flutter/checks/code-quality.md` |
| `security` | `.claude/references/flutter/checks/security.md` |
| `testing` | `.claude/references/flutter/checks/testing.md` |
| `all` | `.claude/references/flutter/checks/all.md`: die 4 Achsen, danach ein konsolidierter Bericht mit Bewertung von 100 Punkten |

## MISSION

1. Lesen Sie das erste Argument. Entspricht es keiner der 5 Achsen oben, listen Sie diese mit einem Beispiel auf (`/flutter:check security src/`) und brechen Sie ab.
2. Lesen Sie die Checklisten-Datei dieser Achse und folgen Sie ihr Schritt für Schritt. In dieser Datei steht `$ARGUMENTS` für die Argumente nach der Achse.
3. Erstellen Sie den Bericht im Ausgabeformat, das die Checkliste festlegt.

Beispiele: `/flutter:check architecture`, `/flutter:check testing ./app`, `/flutter:check all`.
