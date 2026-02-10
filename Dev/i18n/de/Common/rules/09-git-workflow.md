# Git Workflow

## Überblick

Der Git-Workflow basiert auf **GitHub Flow** mit **obligatorischen Conventional Commits**.

**Prinzipien:**
- Branch `main` immer deploybar
- Kurze Feature Branches (< 3 Tage)
- Obligatorische Pull Requests
- Code Review vor dem Merge
- CI muss bestehen (Tests + Qualität)

---

## Inhaltsverzeichnis

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [PR-Checkliste](#pr-checkliste)

---

## GitHub Flow

### Workflow

```
main (production-ready)
  │
  ├─> feature/add-user-authentication
  │   │
  │   ├─ commit: feat: add login form
  │   ├─ commit: feat: add auth service
  │   ├─ commit: test: add auth tests
  │   │
  │   └─> Pull Request → Code Review → Merge
  │
  └─> main (aktualisiert)
```

### Regeln

1. **`main` ist immer deploybar**
2. **Neue Funktionalität = neuer Branch**
3. **Atomare und getestete Commits**
4. **PR + Review obligatorisch**
5. **CI muss vor dem Merge bestehen**
6. **Squash Merge für saubere Historie**

---

## Conventional Commits

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Obligatorische Typen

| Typ | Beschreibung | Beispiel |
|-----|-------------|---------|
| `feat` | Neue Funktionalität | `feat(auth): add login endpoint` |
| `fix` | Bugfix | `fix(cart): correct total calculation` |
| `docs` | Nur Dokumentation | `docs(readme): update installation steps` |
| `style` | Formatierung (keine Codeänderung) | `style: apply formatter` |
| `refactor` | Refactoring (weder feat noch fix) | `refactor(user): extract validation logic` |
| `perf` | Leistungsverbesserung | `perf(query): add index on created_at` |
| `test` | Hinzufügen/Korrektur von Tests | `test(auth): add edge cases` |
| `build` | Build-System, externe Deps | `build: upgrade framework to v2.0` |
| `ci` | CI/CD-Konfiguration | `ci: add lint step to pipeline` |
| `chore` | Sonstiges (kein Produktivcode) | `chore: update .gitignore` |

### Empfohlene Scopes

Verwenden Sie die Bounded Contexts oder Module Ihres Projekts:
- `auth` - Authentifizierung
- `user` - Benutzerverwaltung
- `order` - Bestellungen
- `payment` - Zahlungen
- `notification` - Benachrichtigungen
- `infra` - Infrastruktur

### Commit-Beispiele

#### GUT

```bash
# Feature
git commit -m "feat(auth): add JWT token generation

Implement JWT token generation with:
- Access token (15min expiry)
- Refresh token (7 days expiry)
- Token validation middleware

Closes #123"

# Fix
git commit -m "fix(cart): correct discount calculation

Discount was applied before tax calculation,
causing incorrect total. Now applies tax first,
then discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(user): add email validation tests

Add edge cases:
- Empty email
- Invalid format
- Already existing email"

# Refactor
git commit -m "refactor(payment): extract gateway interface

Extract payment logic into separate gateway classes
following Strategy pattern:
- StripeGateway
- PayPalGateway
- BankTransferGateway"
```

#### SCHLECHT

```bash
# Zu vage
git commit -m "fix bug"

# Kein Typ
git commit -m "add new feature"

# Kein Scope
git commit -m "feat: stuff"

# Zu lang (> 72 Zeichen)
git commit -m "feat(user): implement the complete user management system with registration, login, password reset and email notifications"

# Mehrere nicht zusammenhängende Änderungen
git commit -m "feat: add login + fix email + update docs"
```

### Validierungs-Tools

#### Commitlint

```json
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git Hooks

```bash
# .husky/commit-msg
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

---

## Branches

### Namenskonvention

```
<type>/<kurze-beschreibung>
```

**Typen:**
- `feature/` - Neue Funktionalität
- `fix/` - Bugfix
- `refactor/` - Refactoring
- `docs/` - Dokumentation
- `chore/` - Wartung

### Beispiele

```bash
# GUT
feature/add-user-registration
feature/payment-integration
fix/login-validation-error
refactor/extract-auth-service
docs/update-api-documentation
chore/upgrade-dependencies

# SCHLECHT
dev-branch
my-work
bug-fix
feature123
```

### Branch erstellen

```bash
# Immer von aktuellem main starten
git checkout main
git pull origin main

# Feature Branch erstellen
git checkout -b feature/add-user-registration

# Am Feature arbeiten
# ... Commits ...

# Branch pushen
git push -u origin feature/add-user-registration
```

### Lebensdauer

- **Maximal 3 Tage** Entwicklung
- Wenn > 3 Tage → in mehrere PRs **aufteilen**
- Mergen, sobald funktional (auch wenn unvollständig)
- **Feature Flags** verwenden, wenn nötig

---

## Pull Requests

### PR-Vorlage

```markdown
## Beschreibung

<!-- Beschreiben Sie die Änderungen dieser PR -->

Closes #[issue_nummer]

## Art der Änderung

- [ ] Neue Funktionalität (feat)
- [ ] Bugfix (fix)
- [ ] Dokumentation (docs)
- [ ] Refactoring (refactor)
- [ ] Leistung (perf)
- [ ] Tests (test)

## Checkliste

### Code

- [ ] Der Code folgt den Projektstandards
- [ ] Ich habe eine Selbstüberprüfung meines Codes durchgeführt
- [ ] Ich habe komplexe Teile kommentiert
- [ ] Linter besteht ohne Fehler
- [ ] Formatter angewendet

### Tests

- [ ] Unit-Tests hinzugefügt/aktualisiert
- [ ] Integrationstests falls nötig
- [ ] Codeabdeckung >= 80%
- [ ] Alle Tests bestehen

### Dokumentation

- [ ] README aktualisiert falls nötig
- [ ] API-Dokumentation aktuell
- [ ] CHANGELOG.md aktualisiert

### Architektur

- [ ] SOLID-Prinzipien angewendet
- [ ] DRY eingehalten (keine Duplikation)
- [ ] YAGNI eingehalten (kein unnötiger Code)

### Sicherheit

- [ ] Keine sensiblen Daten im Klartext
- [ ] Input-Validierung
- [ ] Keine Secrets im Code

## Screenshots

<!-- Bei UI-Änderungen Screenshots hinzufügen -->

## Hinweise für Reviewer

<!-- Punkte angeben, die besonders geprüft werden sollten -->
```

### Labels

| Label | Verwendung |
|-------|------------|
| `enhancement` | Neue Funktionalität |
| `bug` | Bugfix |
| `documentation` | Nur Dokumentation |
| `refactoring` | Refactoring |
| `performance` | Leistungsverbesserung |
| `security` | Sicherheit |
| `breaking-change` | Breaking Change |
| `needs-review` | Wartet auf Review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Bereit zum Merge |

---

## Code Review

### Reviewer-Checkliste

#### Architektur
- [ ] SOLID-Prinzipien eingehalten
- [ ] Schichten gut getrennt
- [ ] Keine invertierten Abhängigkeiten

#### Codequalität
- [ ] KISS / DRY / YAGNI angewendet
- [ ] Aussagekräftige Benennung
- [ ] Keine Code-Duplikation
- [ ] Akzeptable Komplexität (< 10)
- [ ] Kurze Methoden (< 20 Zeilen)

#### Tests
- [ ] Tests für Geschäftslogik
- [ ] Abdeckung >= 80%
- [ ] Alle Tests bestehen
- [ ] Keine auskommentierten Tests

#### Sicherheit
- [ ] Keine fest codierten Secrets
- [ ] Input-Validierung
- [ ] XSS/CSRF-Schutz

#### Leistung
- [ ] Keine N+1-Queries
- [ ] Angemessene Indizes
- [ ] Paginierung falls nötig

### Review-Prozess

1. **Selbstüberprüfung** (Autor)
   - Eigenen Code durchlesen
   - PR-Checkliste prüfen
   - Manuell testen

2. **Erster Durchgang** (Reviewer)
   - Gesamtarchitektur
   - Geschäftslogik
   - Tests

3. **Zweiter Durchgang** (Reviewer)
   - Implementierungsdetails
   - Benennung
   - Optimierungen

4. **Kommentare**
   - Konstruktiv und wohlwollend
   - Lösungen vorschlagen
   - Das "Warum" erklären

5. **Genehmigung**
   - Approve → Bereit zum Merge
   - Comment → Nicht blockierende Vorschläge
   - Request Changes → Korrekturen erforderlich

### Kommentarbeispiele

#### GUT (konstruktiv)

```
Vorschlag: Diese Methode tut mehrere Dinge (Berechnung + Validierung).
Was halten Sie davon, sie in zwei separate Methoden aufzuteilen, um SRP einzuhalten?

Beispiel:
- validate(data)
- calculate(data)
```

#### SCHLECHT (nicht konstruktiv)

```
Dieser Code ist schlecht, alles muss neu gemacht werden.
```

---

## PR-Checkliste

### Vor dem Erstellen der PR

```bash
# 1. Tests bestehen
make test

# 2. Abdeckung OK
make test-coverage
# Prüfen: >= 80%

# 3. Qualität OK
make quality
# Linter: 0 Fehler
# Formatter: angewendet

# 4. Selbstüberprüfung
git diff main...HEAD
```

### Während der Review

```bash
# Reviewer-Vorschläge anwenden
git add .
git commit -m "fix: apply code review suggestions"
git push

# Falls nötig rebasen
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Vor dem Merge

```bash
# 1. Branch aktuell
git fetch origin
git rebase origin/main

# 2. CI besteht
# → CI/CD-Pipeline prüfen

# 3. Review genehmigt
# → Mindestens 1 Approval

# 4. Merge
# → Squash and Merge (saubere Historie)
```

---

## Vollständiger Workflow

### Feature

```bash
# 1. Branch erstellen
git checkout main
git pull
git checkout -b feature/add-payment-integration

# 2. TDD: Zuerst Tests (RED)
git add tests/
git commit -m "test(payment): add integration tests"

# 3. Implementierung (GREEN)
git add src/
git commit -m "feat(payment): add Stripe gateway"

# 4. Refactor
git add src/
git commit -m "refactor(payment): extract gateway interface"

# 5. Dokumentation
git add docs/
git commit -m "docs(payment): document payment flow"

# 6. Push + PR
git push -u origin feature/add-payment-integration
gh pr create --fill

# 7. Review + Korrekturen
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge über UI (Squash and Merge)

# 9. Aufräumen
git checkout main
git pull
git branch -d feature/add-payment-integration
```

### Hotfix

```bash
# 1. Branch von main erstellen
git checkout main
git pull
git checkout -b fix/critical-auth-bug

# 2. Fix + Test
git add src/ tests/
git commit -m "fix(auth): correct token validation

Token expiry check was using wrong timezone.
Added test to prevent regression.

Fixes #789"

# 3. Push + Express-PR
git push -u origin fix/critical-auth-bug
gh pr create --fill --label "bug,urgent"

# 4. Schnelle Review + Merge

# 5. Aufräumen
git checkout main
git pull
git branch -d fix/critical-auth-bug
```

---

## Ressourcen

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Datum der letzten Aktualisierung:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
