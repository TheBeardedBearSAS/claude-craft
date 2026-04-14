# Pre-Commit-Checklist — Paperclip

## Schnelle Validation vor jedem Commit

### Code-Qualität

- [ ] `pnpm format --check` läuft durch
- [ ] `pnpm lint` läuft durch (0 Fehler, 0 Warnungen)
- [ ] `pnpm typecheck` läuft über Workspaces hinweg durch
- [ ] Kein `any`, kein `as any`, kein `// @ts-ignore`
- [ ] Kein `console.log` / `debugger` in Runtime-Code
- [ ] Keine ungenutzten Exports (lokal `pnpm knip` ausführen)

### Tests

- [ ] `pnpm test --changed` läuft durch
- [ ] Neues Feature → neue(r) Test(s) hinzugefügt
- [ ] Bug-Fix → Regressions-Test hinzugefügt
- [ ] Adapter-Änderung → `contract.test.ts` noch grün

### Governance & Sicherheit

- [ ] Keine Governance-Entscheidung zu irgendeinem Adapter hinzugefügt (`adapters/**`)
- [ ] Jede neue DB-Mutation emittiert ein Activity-Event
- [ ] Keine `companyId` aus Client-Body/Query
- [ ] Kein Secret-Wert hart codiert
- [ ] Logs exponieren keine Secrets, Tokens oder vollständige Bodies

### Build

- [ ] `pnpm build` erfolgreich
- [ ] Keine neuen Deprecation-Warnungen

### Docs

- [ ] OpenAPI-Spec für neue/geänderte Routen aktualisiert
- [ ] Adapter-README aktualisiert, falls unterstützte Aktionen sich geändert haben
- [ ] CHANGELOG-Eintrag unter `## Unreleased`

### Git

- [ ] Commit-Message folgt Conventional Commits (`feat(adapters): …`, `fix(approvals): …`)
- [ ] Branch rebased auf `main`
- [ ] Keine übrig gebliebenen `TODO: remove` oder `console.log`-Debug-Statements
- [ ] `.env` ist nicht staged

## Automatisierte Validation

`package.json`:

```jsonc
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged",
    "commit-msg": "npx --no-install commitlint --edit \"$1\"",
    "pre-push": "pnpm typecheck && pnpm test --changed"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

## Schnellbefehle

```bash
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm test --changed
pnpm format
pnpm audit --audit-level=high
```

## Häufige Probleme

### "Test requires a real DB" in CI
Testcontainers verwenden oder Postgres im Workflow hochfahren — in Integrationstests niemals die DB mocken.

### "Adapter contract test fails"
Die Erwartungen der Suite nicht senken. Den Adapter fixen. Die Suite IST der Vertrag.

### "Activity log entry missing"
`this.activity.emit({ event: '<domain>.<action>', ... })` im Service nach der erfolgreichen Mutation hinzufügen.

## Vor dem Push

- [ ] Alle Commits folgen Conventional Commits
- [ ] Branch rebased auf `main`
- [ ] CI wird grün sein (lint + typecheck + test + build)
- [ ] Adapter-Contract-Tests laufen lokal für jeden berührten Adapter durch

## Hinweise

- Commits klein und fokussiert halten
- Hooks niemals skippen (`--no-verify`) — wenn ein Hook fehlschlägt, die Ursache fixen
- Governance-Bugs sind Produktionsvorfälle, keine Warnungen — sie mit Dringlichkeit behandeln
