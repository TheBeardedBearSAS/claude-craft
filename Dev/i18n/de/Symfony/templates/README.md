# Architecture Decision Records (ADR)

> Dokumentation wichtiger Architekturentscheidungen für das Projekt Atoll Tourisme

## 📖 Was ist eine ADR?

Ein **Architecture Decision Record** (ADR) ist ein Dokument, das eine wichtige Architekturentscheidung festhält, einschließlich:
- Des **Kontexts** und des zu lösenden Problems
- Der **betrachteten Alternativen** mit ihren Vor- und Nachteilen
- Der **getroffenen Entscheidung** und ihrer Begründung
- Der **positiven UND negativen Konsequenzen**
- Der **Implementierungsdetails**

**Verwendetes Format:** MADR 4.0.0 (Markdown Any Decision Records) auf Deutsch

---

## 📚 ADR-Index

### Kritisch (P0)

| ADR | Titel | Status | Datum | Tags |
|-----|-------|--------|-------|------|
| [0001](0001-chiffrement-halite.md) | Halite-Verschlüsselung für sensible DSGVO-Daten | ✅ Accepted | 2025-11-26 | security, dsgvo, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Gedmo Doctrine Extensions für Audit Trail | ✅ Accepted | 2025-11-26 | audit, gedmo, dsgvo |
| [0003](0003-clean-architecture-ddd.md) | Clean Architecture + DDD + Hexagonal | 🔄 Refactoring | 2025-11-26 | architecture, ddd |

### Wichtig (P1)

| ADR | Titel | Status | Datum | Tags |
|-----|-------|--------|-------|------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage für Dev und Prod | ✅ Accepted | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger für asynchrone E-Mails | 📝 Proposed | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 als Datenbank | ✅ Accepted | 2025-11-26 | database |

### Standard (P2)

| ADR | Titel | Status | Datum | Tags |
|-----|-------|--------|-------|------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin für Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js für Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan und Qualitätswerkzeuge | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Status-Legende

- 📝 **Proposed**: In Diskussion, noch nicht akzeptiert
- ✅ **Accepted**: Validierte Entscheidung in Produktion
- 🔄 **Refactoring**: Implementierung läuft (schrittweise Migration)
- ⚠️ **Deprecated**: Veraltet, nicht mehr verwenden
- 🔄 **Superseded**: Ersetzt durch neue ADR (siehe Link)

---

## ✍️ Wann eine ADR erstellen?

### ✅ ADR ERSTELLEN wenn:

- **Strukturelle Architekturentscheidung** die > 1 Bounded Context betrifft
- **Signifikante Trade-offs** zwischen mehreren tragfähigen Optionen
- **Regulatorische/Sicherheits-/Performance-Einschränkung** erzwingt eine Wahl
- **Wiederkehrende Frage** im Code-Review erfordert offizielle Antwort
- **Paradigmenwechsel** (z.B.: sync → async, Monolith → Microservices)
- **Wichtige Technologiewahl** (Framework, Bibliothek, Infrastruktur)
- **Neues Architekturmuster** für das Team

### ❌ KEINE ADR ERSTELLEN wenn:

- **Lokale taktische Entscheidung** betrifft < 3 Dateien
- **Einfacher Bugfix** ohne architektonische Auswirkung
- **Standard-CRUD** folgt existierenden Mustern
- **Kleineres Dependency-Update** (Patch/Minor-Version)
- **Offensichtliche Wahl** ohne tragfähige Alternative
- **Umgebungskonfiguration** (außer bei Sicherheits-/Compliance-Auswirkung)

**Goldene Regel**: Bei Zweifel mit dem Lead Dev sprechen, bevor die ADR erstellt wird.

---

## 🔄 ADR-Erstellungsprozess

### 1️⃣ Vorschlag (Status: Proposed)

```bash
# 1. Dedizierten Branch erstellen
git checkout -b adr/0011-titel-entscheidung

# 2. Template kopieren
cp .claude/adr/template.md .claude/adr/0011-titel-entscheidung.md

# 3. Alle Pflichtabschnitte ausfüllen
# - Mindestens 2 Optionen mit Vor-/Nachteilen
# - Klare Begründung der Entscheidung
# - Positive UND negative Konsequenzen

# 4. Commit
git add .claude/adr/0011-titel-entscheidung.md
git commit -m "docs: add ADR-0011 for [titel] (Proposed)"
```

### 2️⃣ Diskussion (Pull Request)

```bash
# 5. Push und PR erstellen
git push origin adr/0011-titel-entscheidung

# 6. PR öffnen mit Titel: [ADR] ADR-0011 : Titel Entscheidung
#    - Tag: [ADR]
#    - Reviewers: Lead Dev + mindestens 1 Senior
#    - Beschreibung: Link zur ADR im PR-Body
```

**In PR zu diskutierende Elemente**:
- Wurden alle Optionen berücksichtigt?
- Ist die Begründung überzeugend?
- Sind die negativen Konsequenzen akzeptabel?
- Gibt es undokumentierte Risiken?
- Ist die Implementierung klar?

### 3️⃣ Akzeptanz (Status: Accepted)

**Akzeptanzkriterien**:
- ✅ Mindestens 2 Reviewer haben zugestimmt (Lead Dev + 1 Senior)
- ✅ Alle Pflichtabschnitte ausgefüllt
- ✅ Mindestens 2 Optionen mit Pros/Cons dokumentiert
- ✅ Positive UND negative Konsequenzen aufgelistet
- ✅ Referenzen zu Regeln/existierendem Code vorhanden
- ✅ Konkrete Code-Beispiele (nicht generisch)

**Merge**:
```bash
# 7. PR in main mergen
git checkout main
git merge adr/0011-titel-entscheidung

# 8. Status in README.md aktualisieren (diese Datei)
# 9. Push
git push origin main
```

Die ADR wird dann zur **offiziellen Referenz** für diese Entscheidung.

### 4️⃣ Implementierung

```bash
# Bei der Implementierung der Entscheidung:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

**Implementierungsregeln**:
- Dokumentierte Entscheidung in ADR strikt befolgen
- ADR in relevanten Commits referenzieren
- Tests erstellen, die die Entscheidung validieren
- Jede signifikante Abweichung von der ADR dokumentieren (und ggf. ändern)

### 5️⃣ Ersetzt (Bei notwendiger Weiterentwicklung)

Falls eine Entscheidung signifikant geändert werden muss:

```bash
# 1. Alte ADR NIEMALS löschen
# 2. Alte ADR als Superseded markieren
#    Status: Superseded by ADR-0015
# 3. Neue ADR erstellen (ADR-0015) die erklärt:
#    - Warum die ursprüngliche Entscheidung nicht mehr gilt
#    - Was sich geändert hat (Kontext, Einschränkungen)
#    - Die neue Entscheidung
# 4. Beide ADRs gegenseitig verlinken
```

**Gültige Gründe für Superseded**:
- Änderung geschäftlicher/regulatorischer Anforderungen
- Neue, besser geeignete Technologie verfügbar
- Entdecktes Performance-/Sicherheitsproblem
- Weiterentwicklung der Geschäftsanforderungen

---

## 📋 Validierungs-Checkliste

Vor Einreichung einer ADR im PR prüfen:

- [ ] **Titel** klar und beschreibend (≤10 Wörter)
- [ ] **Status** korrekt (Proposed für neue ADR)
- [ ] **Datum** im Format JJJJ-MM-TT
- [ ] **Entscheider** mit vollständigen Namen aufgelistet
- [ ] **Tags** relevant (3-5 Tags)
- [ ] **Kontext** erklärt das Problem klar (2-3 Absätze)
- [ ] **Mindestens 2 Optionen** dokumentiert
- [ ] Jede Option hat **Vorteile** UND **Nachteile**
- [ ] **Entscheidung** detailliert begründet (warum diese Option?)
- [ ] **Positive Konsequenzen** aufgelistet (3-5)
- [ ] **Negative Konsequenzen** ehrlich aufgelistet (2-4)
- [ ] **Risiken** identifiziert mit Mitigation
- [ ] **Implementierung**: Betroffene Dateien aufgelistet
- [ ] **Konkretes Code-Beispiel** aus dem Projekt (NICHT generisch)
- [ ] **Referenzen** zu `.claude/`-Regeln, Docs, verknüpften ADRs
- [ ] **Erforderliche Tests** beschrieben
- [ ] Rechtschreibung/Grammatik geprüft

---

## 🔗 Ressourcen und Referenzen

### Interne Dokumentation

- **Projektkonfiguration**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Architekturregeln**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **DSGVO-Sicherheitsregeln**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Entwicklungstemplates**: [`.claude/templates/`](../templates/)
- **Qualitätschecklisten**: [`.claude/checklists/`](../checklists/)

### MADR-Ressourcen

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Offizielles Format
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI zur ADR-Verwaltung
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Gründungsartikel

### Open-Source-Projektbeispiele

- [Symfony ADRs](https://github.com/symfony/symfony-docs/tree/master/adr)
- [adr/adr-examples](https://github.com/adr/adr-examples)

---

## 🎯 Best Practices

### ✅ DO

- **Prägnant sein**: Maximum 2 Seiten pro ADR (außer in Ausnahmefällen)
- **Ehrlich sein**: Nachteile und Risiken dokumentieren
- **Konkret sein**: Code-Beispiele aus dem Projekt, nicht generisch
- **Referenzieren**: ADRs, Regeln, existierenden Code verlinken
- **Aktualisieren**: Feedback nach Implementierung hinzufügen
- **Versionieren**: Sequenzielle Nummerierung (0001, 0002, ...)
- **Datieren**: Klares Erstellungs-/Akzeptanzdatum

### ❌ DON'T

- **Niemals löschen** eine ADR (Superseded verwenden)
- **Nicht kopieren** Code aus Regeln (referenzieren)
- **Nicht übermäßig verallgemeinern** (Projektkontext beibehalten)
- **Nicht vergessen** negative Konsequenzen (ist entscheidend)
- **Nicht verzögern**: ADR VOR Implementierung erstellen wenn möglich
- **Nicht vernachlässigen** Reviews (2+ Reviewer obligatorisch)

---

## 📞 Kontakt und Support

**Fragen zu ADRs?**
- Lead Dev: [Name Lead Dev]
- Architecture Team: [Team]
- Slack: #architecture-decisions

**Änderung dieser README vorschlagen**:
```bash
git checkout -b docs/update-adr-readme
# .claude/adr/README.md ändern
git commit -m "docs: update ADR README with [description]"
# PR öffnen mit Tag [Documentation]
```

---

## 📊 Statistiken

**Letzte Aktualisierung**: 2025-11-26

- **ADRs gesamt**: 10
- **Akzeptiert**: 9
- **Vorgeschlagen**: 1
- **Refactoring**: 1
- **Veraltet**: 0
- **Ersetzt**: 0

---

*Diese README wird vom Architecture-Team gepflegt. Jede Änderung muss vom Lead Dev validiert werden.*
