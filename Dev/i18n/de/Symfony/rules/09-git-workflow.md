# Git Workflow - Atoll Tourisme

## Überblick

Der Git-Workflow basiert auf **GitHub Flow** mit **obligatorischen Conventional Commits**.

**Prinzipien:**
- ✅ Branch `main` immer deploybar
- ✅ Kurze Feature Branches (< 3 Tage)
- ✅ Pull Requests obligatorisch
- ✅ Code Review vor Merge
- ✅ CI muss bestehen (Tests + Qualität)

> **Referenzen:**
> - `08-quality-tools.md` - CI Pipeline
> - `07-testing-tdd-bdd.md` - Obligatorische Tests

---

## Inhaltsverzeichnis

1. [GitHub Flow](#github-flow)
2. [Conventional Commits](#conventional-commits)
3. [Branches](#branches)
4. [Pull Requests](#pull-requests)
5. [Code Review](#code-review)
6. [Checklist PR](#checklist-pr)

---

## GitHub Flow

### Workflow

```
main (production-ready)
  │
  ├─> feature/add-reservation-pricing
  │   │
  │   ├─ commit: feat: add Money value object
  │   ├─ commit: feat: add pricing service
  │   ├─ commit: test: add pricing service tests
  │   │
  │   └─> Pull Request → Code Review → Merge
  │
  └─> main (updated)
```

### Regeln

1. **`main` ist immer deploybar**
2. **Neues Feature = neuer Branch**
3. **Atomare und getestete Commits**
4. **PR + Review obligatorisch**
5. **CI muss vor Merge bestehen**
6. **Squash Merge für saubere History**

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
|------|-------------|---------|
| `feat` | Neues Feature | `feat(reservation): add discount calculation` |
| `fix` | Bugfix | `fix(pricing): correct family discount rate` |
| `docs` | Nur Dokumentation | `docs(readme): update installation steps` |
| `style` | Formatierung (keine Code-Änderung) | `style: apply php-cs-fixer` |
| `refactor` | Refactoring (weder feat noch fix) | `refactor(reservation): extract pricing logic` |
| `perf` | Performance-Verbesserung | `perf(query): add index on reservation_date` |
| `test` | Hinzufügen/Korrektur von Tests | `test(reservation): add edge cases` |
| `build` | Build-System, externe Deps | `build: upgrade to symfony 6.4.2` |
| `ci` | CI/CD-Konfiguration | `ci: add phpstan to github actions` |
| `chore` | Anderes (kein Produktionscode) | `chore: update .gitignore` |

### Empfohlene Scopes

- `reservation` - Bounded Context Reservierung
- `catalog` - Bounded Context Katalog
- `notification` - Bounded Context Benachrichtigung
- `pricing` - Subdomain Preisgestaltung
- `infrastructure` - Infrastructure-Schicht
- `domain` - Domain-Schicht
- `application` - Application-Schicht

### Commit-Beispiele

#### ✅ GUT

```bash
# Feature
git commit -m "feat(reservation): add Money value object

Implement immutable Money value object with:
- Creation from euros (float to cents conversion)
- Addition and multiplication operations
- Currency validation (EUR only for now)

Closes #123"

# Fix
git commit -m "fix(pricing): correct family discount calculation

Family discount was applied before age discount,
causing incorrect total. Now applies age discount first,
then family discount on the subtotal.

Fixes #456"

# Test
git commit -m "test(reservation): add participant age validation tests

Add edge cases:
- Age = 0 (valid)
- Age = -1 (invalid)
- Age = 121 (invalid)"

# Refactor
git commit -m "refactor(pricing): extract discount policies

Extract discount calculation logic into separate
policy classes following Strategy pattern:
- FamilyDiscountPolicy
- EarlyBookingDiscountPolicy
- LoyaltyDiscountPolicy"
```

#### ❌ SCHLECHT

```bash
# ❌ Zu vage
git commit -m "fix bug"

# ❌ Kein Typ
git commit -m "add new feature"

# ❌ Kein Scope
git commit -m "feat: stuff"

# ❌ Zu lang (> 72 Zeichen)
git commit -m "feat(reservation): implement the complete reservation system with pricing, discounts, participants management and email notifications"

# ❌ Mehrere unzusammenhängende Änderungen
git commit -m "feat: add reservation + fix email + update docs"
```

### Validierungstools

#### Commitlint

```bash
# Installation
npm install --save-dev @commitlint/{cli,config-conventional}

# Konfiguration (.commitlintrc.json)
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", [
      "feat", "fix", "docs", "style", "refactor",
      "perf", "test", "build", "ci", "chore"
    ]],
    "scope-enum": [2, "always", [
      "reservation", "catalog", "notification",
      "pricing", "domain", "infrastructure", "application"
    ]],
    "subject-max-length": [2, "always", 72]
  }
}
```

#### Git Hooks (Husky)

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "husky": "^8.0.0"
  }
}
```

```bash
# .husky/commit-msg
#!/bin/sh
npx --no-install commitlint --edit "$1"
```

---

## Branches

### Nomenklatur

```
<type>/<kurze-beschreibung>
```

**Typen:**
- `feature/` - Neues Feature
- `fix/` - Bugfix
- `refactor/` - Refactoring
- `docs/` - Dokumentation
- `chore/` - Wartung

### Beispiele

```bash
# ✅ GUT
feature/add-reservation-pricing
feature/participant-age-validation
fix/discount-calculation-error
refactor/extract-pricing-policies
docs/update-readme-installation
chore/upgrade-symfony-6.4

# ❌ SCHLECHT
dev-branch
my-work
bug-fix
feature123
```

### Branch-Erstellung

```bash
# Immer von aktuellem main starten
git checkout main
git pull origin main

# Feature Branch erstellen
git checkout -b feature/add-reservation-pricing

# An Feature arbeiten
# ... commits ...

# Branch pushen
git push -u origin feature/add-reservation-pricing
```

### Lebensdauer

- ⏱️ **Maximum 3 Tage** Entwicklung
- Falls > 3 Tage → **aufteilen** in mehrere PRs
- Mergen sobald funktional (auch wenn unvollständig)
- **Feature Flags** verwenden falls nötig

---

## Pull Requests

### PR-Template (.github/pull_request_template.md)

```markdown
## Beschreibung

<!-- Beschreiben Sie die Änderungen in diesem PR -->

Schließt #[issue_nummer]

## Änderungstyp

- [ ] 🚀 Neues Feature (feat)
- [ ] 🐛 Bugfix (fix)
- [ ] 📝 Dokumentation (docs)
- [ ] ♻️ Refactoring (refactor)
- [ ] ⚡ Performance (perf)
- [ ] ✅ Tests (test)

## Checklist

### Code

- [ ] Code folgt Projektstandards (PSR-12, Symfony)
- [ ] Ich habe eine Selbstprüfung meines Codes durchgeführt
- [ ] Ich habe komplexe Stellen kommentiert
- [ ] PHPStan Level max besteht (0 Fehler)
- [ ] PHP-CS-Fixer angewendet
- [ ] Rector-Vorschläge angewendet
- [ ] Deptrac-Validierung bestanden

### Tests

- [ ] Unit-Tests hinzugefügt/aktualisiert
- [ ] Integrationstests hinzugefügt falls nötig
- [ ] Funktionstests hinzugefügt falls nötig
- [ ] Behat-Szenarien für Business-Features hinzugefügt
- [ ] Code-Coverage ≥ 80%
- [ ] Mutation Score (Infection) ≥ 80%
- [ ] Alle Tests bestehen

### Dokumentation

- [ ] README aktualisiert falls nötig
- [ ] PHPDoc aktuell
- [ ] CHANGELOG.md aktualisiert
- [ ] ADR erstellt bei architektonischer Entscheidung

### Architektur

- [ ] Clean Architecture respektiert (Domain → Application → Infrastructure)
- [ ] SOLID-Prinzipien angewendet
- [ ] DRY respektiert (keine Duplizierung)
- [ ] YAGNI respektiert (kein unnötiger Code)
- [ ] Value Objects für Business-Werte verwendet
- [ ] Domain Events für Business-Ereignisse

### Sicherheit

- [ ] Keine sensiblen Daten im Klartext
- [ ] Input-Validierung
- [ ] CSRF-Schutz bei Formularen
- [ ] Keine Secrets im Code

### Performance

- [ ] Keine N+1 Queries
- [ ] DB-Indizes erstellt falls nötig
- [ ] Cache verwendet wenn sinnvoll

## Auswirkungen

### Datenbank

- [ ] Migration erstellt
- [ ] Migration getestet (up + down)
- [ ] Rollback-Plan dokumentiert

### API

- [ ] Breaking Changes dokumentiert
- [ ] Backward Compatibility erhalten
- [ ] API-Versionierung respektiert

## Screenshots

<!-- Bei UI-Änderungen Screenshots hinzufügen -->

## Test-Befehle

```bash
# Tests
make test
make test-coverage

# Qualität
make quality

# Migration
make migration-diff
make migration-migrate
```

## Hinweise für Reviewer

<!-- Besonders zu prüfende Punkte angeben -->
```

### PR-Erstellung

```bash
# Via GitHub CLI (empfohlen)
gh pr create \
  --title "feat(reservation): add pricing calculation" \
  --body "Implement Money value object and pricing service" \
  --base main \
  --head feature/add-reservation-pricing

# Via GitHub Interface
# → New Pull Request
```

### Labels

| Label | Verwendung |
|-------|-------------|
| `enhancement` | Neues Feature |
| `bug` | Bugfix |
| `documentation` | Nur Dokumentation |
| `refactoring` | Refactoring |
| `performance` | Performance-Verbesserung |
| `security` | Sicherheit |
| `breaking-change` | Breaking Change |
| `needs-review` | Wartet auf Review |
| `work-in-progress` | WIP |
| `ready-to-merge` | Bereit zum Mergen |

---

## Code Review

### Reviewer-Checklist

#### Architektur

- [ ] Clean Architecture + DDD respektiert
- [ ] Schichten gut getrennt (Domain/Application/Infrastructure)
- [ ] Keine invertierten Abhängigkeiten
- [ ] Value Objects für Business-Werte
- [ ] Aggregates gut definiert

#### Code-Qualität

- [ ] SOLID-Prinzipien respektiert
- [ ] KISS / DRY / YAGNI angewendet
- [ ] Explizite Benennung (Variablen, Methoden, Klassen)
- [ ] Keine Code-Duplizierung
- [ ] Akzeptable zyklomatische Komplexität (< 10)
- [ ] Kurze Methoden (< 20 Zeilen)

#### Tests

- [ ] Unit-Tests für Business-Logik
- [ ] Integrationstests für Repositories
- [ ] Funktionstests für Use Cases
- [ ] Behat für Business-Szenarien
- [ ] Coverage ≥ 80%
- [ ] Alle Tests bestehen
- [ ] Keine auskommentierten Tests

#### Sicherheit

- [ ] Keine Secrets hardcodiert
- [ ] Input-Validierung
- [ ] XSS-Schutz
- [ ] CSRF-Schutz
- [ ] Sensible Daten verschlüsselt (DSGVO)

#### Performance

- [ ] Keine N+1 Queries
- [ ] Eager Loading falls nötig
- [ ] Passende DB-Indizes
- [ ] Cache verwendet wenn sinnvoll
- [ ] Paginierung für große Listen

#### Dokumentation

- [ ] PHPDoc vollständig
- [ ] README aktuell
- [ ] CHANGELOG aktualisiert
- [ ] ADR bei architektonischer Entscheidung

### Review-Prozess

1. **Selbstprüfung** (Autor)
   - Eigenen Code erneut lesen
   - PR-Checklist prüfen
   - Manuell testen

2. **Erste Durchsicht** (Reviewer)
   - Gesamtarchitektur
   - Business-Logik
   - Tests

3. **Zweite Durchsicht** (Reviewer)
   - Implementierungsdetails
   - Benennung
   - Optimierungen

4. **Kommentare**
   - Konstruktiv und wohlwollend
   - Lösungen vorschlagen
   - Das "Warum" erklären

5. **Genehmigung**
   - ✅ Approve → Bereit zum Mergen
   - 💬 Comment → Nicht-blockierende Vorschläge
   - 🔴 Request changes → Korrekturen erforderlich

### Beispiel-Kommentare

#### ✅ GUT (konstruktiv)

```
Vorschlag: Diese Methode macht mehrere Dinge (Berechnung + Validierung).
Was hältst du davon, sie in zwei separate Methoden aufzuteilen, um SRP zu respektieren?

Beispiel:
```php
public function calculate(Reservation $r): Money
{
    $this->validate($r);
    return $this->doCalculate($r);
}

private function validate(Reservation $r): void { /* ... */ }
private function doCalculate(Reservation $r): Money { /* ... */ }
```
```

#### ❌ SCHLECHT (nicht konstruktiv)

```
Dieser Code ist schlecht, alles muss neu gemacht werden.
```

---

## Checklist PR

### Vor PR-Erstellung

```bash
# 1. Tests bestehen
make test

# 2. Coverage OK
make test-coverage
# Prüfen: ≥ 80%

# 3. Qualität OK
make quality
# PHPStan: 0 Fehler
# CS-Fixer: 0 Verstöße
# Rector: 0 Vorschläge
# Deptrac: 0 Verstöße

# 4. Mutation Score OK
make infection
# MSI ≥ 80%

# 5. Selbstprüfung
git diff main...HEAD
```

### Während des Reviews

```bash
# Reviewer-Vorschläge anwenden
git add .
git commit -m "fix: apply code review suggestions"
git push

# Rebase falls nötig
git fetch origin
git rebase origin/main
git push --force-with-lease
```

### Vor dem Merge

```bash
# 1. Branch aktuell
git fetch origin
git rebase origin/main

# 2. Squash falls nötig (Zwischen-Commits)
git rebase -i origin/main

# 3. CI besteht
# → GitHub Actions prüfen

# 4. Review genehmigt
# → Mindestens 1 Approve

# 5. Merge
# → Squash and merge (saubere History)
```

---

## Workflow-Beispiele

### Vollständiges Feature

```bash
# 1. Branch erstellen
git checkout main
git pull
git checkout -b feature/add-reservation-confirmation

# 2. TDD: Test zuerst (RED)
# Fehlschlagenden Test schreiben
git add tests/
git commit -m "test(reservation): add confirmation tests"

# 3. Implementierung (GREEN)
# Minimaler Code zum Bestehen des Tests
git add src/
git commit -m "feat(reservation): add confirmation logic"

# 4. Refactor
# Code verbessern
git add src/
git commit -m "refactor(reservation): extract confirmation rules"

# 5. Dokumentation
git add README.md
git commit -m "docs(reservation): document confirmation process"

# 6. Push + PR
git push -u origin feature/add-reservation-confirmation
gh pr create --fill

# 7. Review + Korrekturen
# ... Feedback anwenden ...
git add .
git commit -m "fix: apply review suggestions"
git push

# 8. Merge
# → Via GitHub UI (Squash and merge)

# 9. Cleanup
git checkout main
git pull
git branch -d feature/add-reservation-confirmation
```

### Dringender Hotfix

```bash
# 1. Branch von main erstellen
git checkout main
git pull
git checkout -b fix/critical-pricing-bug

# 2. Fix + Test
git add src/ tests/
git commit -m "fix(pricing): correct discount calculation

Family discount was doubled due to loop error.
Added test to prevent regression.

Fixes #789"

# 3. Push + Express-PR
git push -u origin fix/critical-pricing-bug
gh pr create --fill --label "bug,urgent"

# 4. Schnelles Review + Merge
# → Priority Review
# → Fast-Track Merge

# 5. Cleanup
git checkout main
git pull
git branch -d fix/critical-pricing-bug
```

---

## Ressourcen

- **GitHub Flow:** [Guide](https://docs.github.com/en/get-started/quickstart/github-flow)
- **Conventional Commits:** [Specification](https://www.conventionalcommits.org/)
- **Commitlint:** [Documentation](https://commitlint.js.org/)
- **Git Best Practices:** [Atlassian Guide](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

**Letzte Aktualisierung:** 2025-01-26
**Version:** 1.0.0
**Autor:** The Bearded CTO
