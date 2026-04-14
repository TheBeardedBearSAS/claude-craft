---
description: Paperclip-Codequalität auditieren
argument-hint: [project-path]
---

# Paperclip-Codequalität auditieren

## MISSION

TypeScript-Strenge, Lint-Compliance, Namenskonventionen, Komplexität und Logging-Hygiene in einem Paperclip-Projekt messen.

## Vorgehen

### 1. TypeScript-Baseline

- [ ] `tsconfig.base.json` hat `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [ ] `pnpm typecheck` erfolgreich (keine `tsc`-Fehler über Workspaces hinweg)
- [ ] Kein per-package tsconfig lockert die Baseline

### 2. Verbotene Patterns

Greppen und reporten:
- `: any`-Annotationen
- `as any` / `as unknown as`-Casts
- `// @ts-ignore`, `// @ts-expect-error` ohne verlinktes GitHub-Issue im selben Zeilen-Kommentar
- `!.` Non-Null-Assertions auf DB-zurückgegebenen Werten

### 3. Lint & Format

- [ ] `pnpm lint` Exit-Code 0, null Warnungen
- [ ] `pnpm format --check` meldet kein Diff
- [ ] ESLint-Config verwendet `strict-type-checked`
- [ ] Die nicht verhandelbaren ESLint-Regeln aus `rules/08-quality-tools.md` sind aktiviert

### 4. Namenskonventionen

20 Dateien samplen. Prüfen:
- Dateien sind kebab-case (`agent-service.ts`, nicht `AgentService.ts` oder `agent_service.ts`)
- Typen sind PascalCase
- Funktionen / Vars sind camelCase
- Konstanten sind UPPER_SNAKE
- Umgebungsvariablen via geparsten Config-Modul gelesen, mit Präfix `PAPERCLIP_`

### 5. Kognitive Komplexität

`eslint-plugin-sonarjs` (oder äquivalent) ausführen. Jede Funktion mit kognitiver Komplexität ≥ 10 flaggen. Jede Datei > 300 Zeilen flaggen.

### 6. Logging-Hygiene

- [ ] Logs verwenden strukturierten Logger (pino oder äquivalent), niemals `console.log` in Runtime-Code
- [ ] Kein Feld, dessen Name auf `/key|token|secret|password|authorization/i` matcht, wird als Wert geloggt
- [ ] Kein vollständiges Request-Body-Logging

### 7. Async-Korrektheit

- [ ] `@typescript-eslint/no-floating-promises` = error, läuft durch
- [ ] Keine `.then()`-Ketten (grep `.then(`)
- [ ] Alle Timeouts verwenden `AbortController`

### 8. Error-Modellierung

- [ ] Server-Services werfen `DomainError`-Subklassen, nicht plain `Error`
- [ ] Jeder Domain-Error hat ein stabiles `code`-Feld
- [ ] Kein `throw` von Strings oder Literalen

## Ausgabe

Markdown-Report mit per-Section Pass/Fail, betroffenen Dateien/Symbolen, Schweregrad und einem Score /20 für `/paperclip:check-compliance`.
