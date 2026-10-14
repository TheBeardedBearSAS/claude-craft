# Claude Code Checklisten - Atoll Tourisme

> Checklisten zur Sicherstellung von Code-Qualität und Sicherheit

## Überblick

Dieser Ordner enthält 4 wesentliche Checklisten für den Entwicklungsworkflow.

**Gesamt:** 4 Checklisten | ~3700 Zeilen detaillierte Verfahren

---

## 📋 Checklisten-Liste

### 1. `pre-commit.md` - Vor jedem Commit
**Geschätzte Zeit:** 2-5 Minuten

**Verwendung:** VOR jedem `git commit`

**Automatische Prüfungen:**
- ✅ Tests bestehen (Unit + Integration + Behat)
- ✅ PHPStan Level 8 (0 Fehler)
- ✅ CS-Fixer (PER-CS 3.0 formatierter Code)
- ✅ Hadolint (gültiges Dockerfile)
- ✅ Coverage ≥ 80%
- ✅ Konformes Commit-Message (Conventional Commits)

**Schnellbefehl:**
```bash
make pre-commit && git commit
```

**Abschnitte:**
1. Automatisierte Tests
2. Statische Analyse (PHPStan)
3. Coding Standards (PHP CS Fixer)
4. Docker (Hadolint)
5. Test-Coverage
6. Commit-Message (Conventional Commits)
7. Dokumentation (falls zutreffend)
8. Sicherheit & DSGVO (bei personenbezogenen Daten)

**Wann verwenden:**
- ✅ Vor JEDEM Commit
- ✅ Kontinuierliche Validierung
- ✅ Regressionen vermeiden

**Commit-Message-Beispiele:**
```bash
✅ feat(reservation): add single supplement for 1 participant
✅ fix(value-object): fix rounding in Money::multiply
✅ refactor(reservation): extract PrixCalculatorService
✅ test(reservation): add total price calculation tests

❌ "update code"  (zu vage)
❌ "fix bug"      (welcher Bug?)
❌ "WIP"          (kein WIP committen)
```

---

### 2. `new-feature.md` - Neues Feature
**Geschätzte Zeit:** 2h30 (klein) bis 10h (groß)

**Verwendung:** Vollständiger Workflow zur Implementierung eines neuen Features

**TDD-Phasen:**
```
1. ANALYSE (30 Min)    → Template: .claude/templates/analysis.md
2. TDD RED (1h)        → Templates: test-*.md
3. TDD GREEN (2h)      → Templates: service.md, value-object.md, etc.
4. TDD REFACTOR (1h)   → SOLID-Prinzipien
5. VALIDIERUNG (30 Min) → Pre-Commit-Checkliste
6. PULL REQUEST        → PR-Template
```

**Abschnitte:**
1. **Phase 1:** Pre-Implementierungs-Analyse
2. **Phase 2:** TDD RED (fehlschlagende Tests)
3. **Phase 3:** TDD GREEN (minimale Implementierung)
4. **Phase 4:** TDD REFACTOR (SOLID-Verbesserung)
5. **Phase 5:** Finale Validierung (Qualität + Tests)
6. **Phase 6:** Pull Request

**Wann verwenden:**
- ✅ Neues Business-Feature
- ✅ Neuer API-Endpoint
- ✅ Neuer Use Case

**Vollständiges Beispiel:** "Paid Options" Feature
- Analyse: 30 Min
- TDD RED: 1h (12 Tests geschrieben)
- TDD GREEN: 2h (Implementierung + DB-Migration)
- TDD REFACTOR: 1h (Value Objects + Services)
- Validierung: 30 Min (PHPStan + Coverage)
- **Gesamt:** 5h

**Zeit nach Größe:**
| Größe | Dateien | Gesamtzeit |
|-------|---------|------------|
| Klein | 1 Datei | 2h30 |
| Mittel | 3-5 Dateien | 5h |
| Groß | 10+ Dateien | 10h |

---

### 3. `refactoring.md` - Sicheres Refactoring
**Geschätzte Zeit:** 30 Min bis 4h

**Verwendung:** Code verbessern ohne Verhalten zu brechen

**Prinzip:** Sicherheitsnetz = Grüne Tests

**Phasen:**
1. **Vorbereitung:** Stabiler Zustand (grüne Tests)
2. **Analyse:** Code-Smells identifizieren
3. **Refactoring:** Baby Steps
4. **Patterns:** Refactoring-Patterns anwenden
5. **Validierung:** Tests immer grün + Performance OK
6. **Commit:** Refactoring-Dokumentation

**Erkannte Code-Smells:**
- ❌ Methode zu lang (> 20 Zeilen)
- ❌ Duplizierung (DRY-Verletzung)
- ❌ Hohe zyklomatische Komplexität (> 5)
- ❌ Primitive Obsession
- ❌ God Class (> 300 Zeilen)

**Refactoring-Patterns:**
1. Extract Method
2. Extract Class
3. Replace Conditional with Polymorphism
4. Introduce Parameter Object
5. Replace Magic Number with Constant

**Wann verwenden:**
- ✅ Komplexer Code zum Vereinfachen
- ✅ Erkannte Duplizierung
- ✅ SOLID-Verletzung
- ✅ Technische Schulden reduzieren

**Goldene Regel:** Eine Änderung auf einmal + grüne Tests

**Workflow:**
```bash
# 1. Stabiler Zustand
git commit -m "chore: stable state before refactoring"

# 2. Kleine Änderung
vim src/Service/ReservationService.php
# Variable umbenennen

# 3. Tests
make test  # ✅ Grün

# 4. Commit
git commit -m "refactor: rename data variable"

# 5. Wiederholen (Baby Steps)
```

---

### 4. `security-rgpd.md` - Sicherheit & DSGVO
**Geschätzte Zeit:** 1-2h (vollständiges Audit)

**Verwendung:** Vor jedem Release + alle 3 Monate

**Abschnitte:**

#### Sicherheit (11 Punkte)
1. Schutz personenbezogener Daten (DB-Verschlüsselung)
2. Benutzer-Input-Validierung
3. CSRF-Schutz
4. XSS-Schutz
5. SQL-Injection-Schutz
6. Security Headers (CSP, HSTS, etc.)
7. Authentifizierung & Autorisierung
8. Sicherheitstests

#### DSGVO (4 Punkte)
8. Einwilligung & Rechte
9. Recht auf Vergessenwerden (Anonymisierung)
10. Datenportabilität (JSON-Export)
11. Aufbewahrungsfrist (automatisches Cleanup)
12. Audit & Nachverfolgbarkeit (Logs)

**Finale Checkliste:**

**Sicherheit:**
- [ ] Sensible Daten verschlüsselt (`doctrine-encrypt-bundle`)
- [ ] Strikte Input-Validierung (Symfony Forms + Constraints)
- [ ] CSRF aktiviert
- [ ] XSS-Schutz (Twig Autoescape)
- [ ] SQL-Injection unmöglich (Doctrine ORM)
- [ ] Security Headers (CSP, HSTS, X-Frame-Options)
- [ ] HTTPS erzwungen
- [ ] Gehashte Passwörter (Bcrypt/Argon2)
- [ ] Rate Limiting beim Login
- [ ] Keine committeten Secrets

**DSGVO:**
- [ ] Datenschutzerklärung veröffentlicht
- [ ] Explizite Einwilligung (Checkbox)
- [ ] Einwilligungs-Nachverfolgbarkeit (Datum, IP)
- [ ] Recht auf Vergessenwerden implementiert (CLI-Befehl)
- [ ] Datenportabilität (JSON-Export)
- [ ] Definierte Aufbewahrungsfrist (max 3 Jahre)
- [ ] Automatisches Cleanup (Cron)
- [ ] Logs sensibler Aktionen
- [ ] Verschlüsselung personenbezogener Daten
- [ ] Dokumentiertes Breach-Verfahren

**Wann verwenden:**
- ✅ Vor Major-Release
- ✅ Vierteljährliches Audit (alle 3 Monate)
- ✅ Nach Sicherheitsvorfall
- ✅ Neue Datenerfassung

**Audit-Befehle:**
```bash
# Composer-Schwachstellen
composer audit

# Symfony Security Checker
symfony security:check

# DB-Verschlüsselung prüfen
docker compose exec db mysql -u root -p atoll
SELECT nom FROM participant LIMIT 1;
# Erwartet: "enc:def502000..." (verschlüsselt)

# Security Headers testen
curl -I https://atoll-tourisme.com
# Erwartet: CSP, HSTS, X-Frame-Options, etc.
```

---

## 🎯 Empfohlener Workflow

### Tägliche Entwicklung

```bash
# 1. Neues Feature
# Verwenden: new-feature.md

# 2. Vor jedem Commit
# Verwenden: pre-commit.md
make pre-commit && git commit

# 3. Refactoring falls nötig
# Verwenden: refactoring.md

# 4. Sicherheits-/DSGVO-Audit (vierteljährlich)
# Verwenden: security-rgpd.md
```

### Vollständiger Feature-Workflow

```bash
# Schritt 1: Analyse (new-feature.md Phase 1)
vim docs/analysis/2025-01-15-feature.md

# Schritt 2: TDD RED (new-feature.md Phase 2)
vim tests/Unit/Service/MyServiceTest.php
make test  # ❌ Fehlgeschlagen (erwartet)

# Schritt 3: TDD GREEN (new-feature.md Phase 3)
vim src/Service/MyService.php
make test  # ✅ Bestanden

# Schritt 4: TDD REFACTOR (new-feature.md Phase 4 + refactoring.md)
# Code verbessern (SOLID, DRY)
make test  # ✅ Immer noch bestanden

# Schritt 5: Pre-Commit (pre-commit.md)
make pre-commit  # ✅ Alles OK
git commit -m "feat(service): add MyService"

# Schritt 6: PR
git push origin feature/my-feature
# PR erstellen
```

---

## 📚 Querverweise

### Zugehörige Templates
`.claude/templates/`:
- `analysis.md` → Verwendet in `new-feature.md` Phase 1
- `test-*.md` → Verwendet in `new-feature.md` Phasen 2-3
- `service.md`, `value-object.md`, etc. → Verwendet in `new-feature.md` Phase 3

### Zugehörige Regeln
`.claude/rules/`:
- `01-architecture-ddd.md` → DDD-Architektur
- `03-coding-standards.md` → Code-Standards
- `04-testing-tdd.md` → TDD-Strategie
- `07-security-rgpd.md` → Sicherheit und DSGVO

---

## 💡 Verwendungstipps

### 1. Pre-Commit: Automatisierung

Git-Hook erstellen:
```bash
# .git/hooks/pre-commit
#!/bin/bash
make pre-commit || exit 1
```

Oder Husky verwenden (npm):
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "make pre-commit"
    }
  }
}
```

### 2. New-Feature: TDD-Konformität

**NICHT** coden vor Tests:
```bash
# ❌ SCHLECHT
vim src/Service/MyService.php  # Zuerst Code
vim tests/Unit/Service/MyServiceTest.php  # Danach Tests

# ✅ GUT
vim tests/Unit/Service/MyServiceTest.php  # Zuerst Tests (RED)
make test  # ❌ Fehlgeschlagen
vim src/Service/MyService.php  # Danach Code (GREEN)
make test  # ✅ Bestanden
```

### 3. Refactoring: Baby Steps

**NICHT** alles auf einmal refaktorieren:
```bash
# ❌ SCHLECHT (Big Bang)
# 3 Tage Refactoring
git commit -m "refactor: improve everything"  # 50 Dateien

# ✅ GUT (Baby Steps)
git commit -m "refactor: rename variable"  # 1 Datei
git commit -m "refactor: extract method"   # 1 Datei
git commit -m "refactor: move class"       # 2 Dateien
```

### 4. Security-DSGVO: Automatisierung

Cron für DSGVO-Cleanup erstellen:
```bash
# crontab -e
# DSGVO-Cleanup jeden Tag um 2 Uhr
0 2 * * * cd /path/to/project && docker compose exec php bin/console app:gdpr:cleanup
```

---

## 📊 Statistiken

| Checkliste | Zeilen | Geschätzte Zeit | Häufigkeit |
|------------|--------|----------------|------------|
| pre-commit.md | 527 | 2-5 Min | Jeder Commit |
| new-feature.md | 765 | 2h30-10h | Jedes Feature |
| refactoring.md | 975 | 30Min-4h | Nach Bedarf |
| security-rgpd.md | 920 | 1-2h | Vierteljährlich |

**Gesamt:** ~3700 Zeilen detaillierte Verfahren

---

## ⚠️ Aufmerksamkeitspunkte

### NIEMALS
- ❌ Committen ohne validiertes `pre-commit.md`
- ❌ Feature ohne Analyse (`new-feature.md` Phase 1)
- ❌ Refactoring ohne grüne Tests
- ❌ Release ohne Sicherheits-/DSGVO-Audit

### IMMER
- ✅ Tests vor Commit ausführen
- ✅ PHPStan Level 8 ohne Fehler
- ✅ Coverage ≥ 80%
- ✅ Konforme Commit-Message (Conventional Commits)

---

## 🚀 Makefile-Shortcuts

Zu `Makefile` hinzufügen:

```makefile
.PHONY: pre-commit
pre-commit: ## Pre-Commit-Checkliste
	@echo "🔍 Pre-Commit-Validierung..."
	@$(MAKE) phpstan
	@$(MAKE) cs-fix
	@$(MAKE) test
	@$(MAKE) test-coverage
	@echo "✅ Bereit zum Committen!"

.PHONY: security-audit
security-audit: ## Sicherheits-/DSGVO-Audit
	@echo "🔒 Sicherheitsaudit..."
	composer audit
	symfony security:check
	@echo "📋 Siehe Checkliste: .claude/checklists/security-rgpd.md"
```

Verwendung:
```bash
make pre-commit       # Vor jedem Commit
make security-audit   # Vierteljährliches Sicherheitsaudit
```

---

**Letzte Aktualisierung:** 2025-11-26
**Verantwortlich:** Lead Dev
**Review-Häufigkeit:** Monatlich
