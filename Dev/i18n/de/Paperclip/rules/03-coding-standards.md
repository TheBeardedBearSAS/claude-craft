# Coding-Standards — Paperclip (TypeScript)

## Sprache & Versionen

| Kategorie | Standard |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.7+ |
| Package-Manager | pnpm 9.15+ (Workspace-Monorepo) |
| Modulsystem | Nur ESM (`"type": "module"`) |

---

## TypeScript

Strict-Modus ist **obligatorisch**. `tsconfig.base.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

**Verboten:** `any`, `as unknown as X`-Casts ohne erklärenden Kommentar, `// @ts-ignore`, `// @ts-expect-error` ohne verlinktes Issue.

**Erforderlich:** Explizite Return-Types bei exportierten Funktionen, `readonly` bei Props / Domain-Types, diskriminierte Unions für Variant-Typen.

---

## Namenskonventionen

| Art | Konvention | Beispiel |
|---|---|---|
| Dateien | kebab-case | `agent-registry.ts`, `approval-service.ts` |
| Verzeichnisse | kebab-case | `src/modules/approvals/` |
| Typen / Interfaces | PascalCase | `AgentConfig`, `HeartbeatPayload` |
| React-Komponenten | PascalCase (Datei + Symbol) | `OrgChart.tsx` exportiert `OrgChart` |
| Funktionen / Variablen | camelCase | `reportCost`, `isApproved` |
| Konstanten | UPPER_SNAKE_CASE | `DEFAULT_BUDGET_TOKENS`, `HEARTBEAT_INTERVAL_MS` |
| Umgebungsvariablen | UPPER_SNAKE_CASE, mit Präfix | `PAPERCLIP_DATABASE_URL`, `PAPERCLIP_SECRET_KEY` |
| DB-Tabellen | snake_case Plural | `activity_log`, `agent_registrations` |
| Domain-Events | `Vergangenheitsform` | `AgentHired`, `BudgetExceeded` |

**Keine Präfixe/Suffixe:** Nicht `IAgent` oder `AgentType` schreiben — `Agent` verwenden. `Props`, `State`, `Result` als explizite Suffixe nur verwenden, wenn sie klären (`LoginFormProps`, `AgentsQueryResult`).

---

## Dateien

- Ein öffentlicher Export pro Datei bevorzugt. Ein Modul kann mehrere Symbole exportieren, wenn sie eine kohärente Einheit bilden (z.B. `agent-service.ts` exportiert `AgentService` + seine DTOs).
- Dateilängen-Ziel: **< 300 Zeilen**. Darüber hinaus nach Verantwortlichkeit aufteilen.
- Reihenfolge innerhalb einer Datei:
  1. Imports (extern → intern → relativ)
  2. Typen / Interfaces
  3. Konstanten
  4. Öffentliche Exports
  5. Private Helfer

---

## Imports

- Absolute Imports innerhalb eines Packages mittels TS-Path-Aliase (`@/modules/...`).
- Relative Imports nur für Sibling-Dateien im selben Ordner.
- Keine Barrel-Files (`index.ts`) außer an Package-Grenzen — sie brechen Tree-Shaking und Circular-Dep-Detection.
- Nur Named-Imports; keine Default-Exports außer für React-Komponenten, die von Frameworks erwartet werden.

---

## Fehlerbehandlung

Zwei akzeptierte Stile — einen pro Modul wählen und konsistent bleiben:

1. **Geworfener `DomainError`** — bevorzugt für Server-Services.
   ```ts
   export class BudgetExceededError extends DomainError {
     readonly code = 'BUDGET_EXCEEDED';
     constructor(public readonly agentId: string, public readonly limit: number) {
       super(`Agent ${agentId} exceeded budget (${limit} tokens)`);
     }
   }
   ```

2. **`Result<T, E>`-Typ** — bevorzugt für Adapter-Code und Edge-Pfade, wo Werfen über Prozessgrenzen geht.

**Niemals:**
- Fehler mit leeren `catch {}`-Blöcken verschlucken.
- Strings oder Plain-Objects werfen.
- Einen Fehler neu wrappen und die ursprüngliche `cause` verlieren (immer `{ cause: err }` übergeben).

---

## React (Web-UI)

- Nur funktionale Komponenten. Keine Klassenkomponenten.
- Getypte Props via `readonly`, kein `React.FC`.
- Hooks benannt als `useX`, jeweils eine Verantwortlichkeit.
- Zustand ableiten; nicht spiegeln. Kein useState, das Props oder Server-Daten dupliziert.
- Server-State lebt in React Query (oder Equivalent). Client-State in minimalem Store (Zustand oder React-Context).
- **UI ist dumm**: Keine Governance-Entscheidungen im Browser. Approval-, Budget- und Permission-Checks zum Server roundtrippen.

---

## Async

- Nur `async`/`await`. Keine rohen `.then()`-Ketten.
- Alle async Boundaries, die fehlschlagen können, geben typisierte Errors zurück oder werfen `DomainError`.
- Keine unbehandelten Promises — immer `await`, `.catch` oder `void` (mit Kommentar, falls absichtlich).
- Timeouts sind explizit (`AbortController`); keine unbegrenzten Waits.

---

## Logging

- Strukturierte JSON-Logs (pino oder äquivalent).
- **Events** loggen, keine Strings: `log.info({ agentId, event: 'agent.hired' })`.
- Niemals Secrets, rohe API-Keys oder vollständige Request-Bodies mit PII loggen.
- Jede Mutation loggt ein `activity_log`-Event (Domain-Ebene); OS-Level-Logs sind nur für Diagnostik.

---

## Konfiguration

- Gesamte Config via Umgebungsvariablen, geladen über einen typisierten Parser (zod) beim Boot.
- Keine Config-Reads zur Request-Zeit — die aufgelöste Config injizieren.
- Paperclip injiziert `PAPERCLIP_WORKSPACE_*` und `PAPERCLIP_RUNTIME_*` in gespawnte Agent-Prozesse für Agent-seitiges Tooling; dieses Präfix für agent-facing Vars beibehalten.

### Kanonische Umgebungsvariablen (beobachtet in `.env.example`)

| Name | Zweck |
|---|---|
| `DATABASE_URL` | PostgreSQL-Connection-String. Weglassen → embedded Postgres (nur dev). |
| `PORT` | HTTP-Port für den Server (Standard `3100`). |
| `SERVE_UI` | `true`, damit der Server auch das gebaute UI-Bundle ausliefert. |
| `BETTER_AUTH_SECRET` | Secret für [Better Auth](https://better-auth.com). **Muss pro Umgebung rotiert werden.** |

Plugin-/Adapter-Config lebt **innerhalb** des Plugin- oder Adapter-Packages, nicht in Top-Level-Env. Eigene Umgebungsvariablen aus dem `configSchema` (zod) des Plugins referenzieren, statt `process.env` zur Runtime zu lesen.

---

## Linting & Formatierung

- ESLint Flat Config (`eslint.config.js`) mit `@typescript-eslint/strict-type-checked`.
- Prettier für Formatierung (kein `semi: false` — Semikolons beibehalten).
- Durchgesetzt in CI + Pre-Commit-Hook.

---

## Checklist

- [ ] `strict: true` + `noUncheckedIndexedAccess` aktiv
- [ ] Kein `any`, keine stillen Casts
- [ ] Explizite Return-Types bei exportierten Funktionen
- [ ] Kebab-Case-Dateien, PascalCase-Typen, camelCase-Vars
- [ ] Eine Verantwortlichkeit pro Datei, < 300 Zeilen
- [ ] Strukturierte Logs, keine Secrets in Logs
- [ ] Alle async awaited oder explizit `void`ed
- [ ] ESLint + Prettier laufen durch

---

**Letzte Aktualisierung:** 2026-04 | **Version:** 1.0.0 | **Autor:** The Bearded CTO
