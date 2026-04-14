# Quality Tools — Paperclip

Statische Analyse, Type-Checking und CI-Gates, die Paperclip-Contributions gesund halten.

## Erforderliche Tools

| Tool | Zweck | Gate |
|---|---|---|
| `tsc --noEmit` | Type-Korrektheit | Fail CI bei Fehler |
| ESLint flat config | Lint (typisierte Regeln) | Fail CI bei Fehler, Warnungen ≤ 0 erlaubt |
| Prettier | Formatierung | Fail CI bei Diff |
| Vitest + v8 coverage | Tests + Coverage | Fail CI unterhalb Schwellenwerten |
| knip | Toter Code / ungenutzte Exports | Warnung in CI, vor Release fixen |
| `pnpm audit` (high/critical) | Verwundbare Deps | Fail CI bei high / critical |
| commitlint | Conventional Commits | Fail CI bei schlechtem Commit |

Optional, aber empfohlen: **Stryker** Mutation Testing auf Core-Modulen (agents, approvals, costs) — Ziel Mutation Score ≥ 70%.

---

## Kognitive Komplexität

Quelle: SonarJS-Plugin oder `eslint-plugin-sonarjs`.

- Funktionslimit: **< 10** (Warnung bei 8).
- Dateilimit: **< 200** (Warnung bei 150).

Über dem Limit → refactoren, nicht stumm schalten.

---

## TypeScript-Strictness-Ratchet

Die Baseline-`tsconfig.base.json` muss diese Optionen aktiviert lassen:

```
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
```

Per-Package-`tsconfig.json` kann weiter verschärfen, aber niemals lockern.

---

## ESLint — Nicht verhandelbare Regeln

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'no-restricted-syntax': ['error', {
    selector: "TSAsExpression[typeAnnotation.typeName.name='any']",
    message: 'Keine Casts zu any. Modellieren Sie den Typ korrekt.',
  }],
}
```

---

## CI-Pipeline

```yaml
- pnpm install --frozen-lockfile
- pnpm format --check           # Prettier
- pnpm lint                     # ESLint
- pnpm typecheck                # tsc --noEmit
- pnpm test --coverage          # Vitest
- pnpm build                    # Stellt sicher, dass kein Build-Only-Breakage vorliegt
- pnpm knip                     # Toter Code (warn)
- pnpm audit --prod --audit-level=high
```

Jeder fehlschlagende Schritt blockiert den Merge. Keine „Overrides" außer über eine PR mit Label `tech-debt` und verlinktem Issue.

---

## Coverage-Schwellenwerte

Durchgesetzt in `vitest.config.ts`:

- Lines: 80
- Functions: 80
- Branches: 75
- Statements: 80

Per-Modul-Ziel (strenger): agents, approvals, costs, adapters → 90%.

---

## Dependency-Hygiene

- `pnpm up -iL` wöchentlich (nur Patch/Minor ohne PR-Review).
- Major-Bumps = dedizierte PR mit Migrations-Hinweisen.
- Renovate oder Dependabot konfiguriert mit gruppierten PRs.
- Peer-Dep-Drift abgelehnt (`pnpm install` muss sauber sein).

---

## Release-Gate

Vor dem Schneiden eines Release:

- [ ] `pnpm ci` grün auf main für die letzten 10 Commits
- [ ] Keine `TODO: remove before release` im Diff
- [ ] CHANGELOG aktualisiert (Keep a Changelog)
- [ ] Adapter-Vertragstests laufen für alle ausgelieferten Adapter durch
- [ ] `pnpm audit` sauber auf `high`-Level
- [ ] Migrations-Guide geschrieben, falls DB-Migration oder API-Break

---

## Checklist

- [ ] ESLint Flat Config mit strict-type-checked
- [ ] `tsc --noEmit` läuft über Workspaces durch
- [ ] Coverage-Schwellenwerte in CI durchgesetzt
- [ ] knip-Reports vor Release aufgelöst
- [ ] `pnpm audit` grün auf `high`
- [ ] Commitlint aktiviert

---

**Zuletzt aktualisiert:** 2026-04 | **Version:** 1.0.0 | **Autor:** The Bearded CTO
