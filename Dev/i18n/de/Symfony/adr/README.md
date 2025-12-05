# Architecture Decision Records (ADR)

> Dokumentation wichtiger architektonischer Entscheidungen des Projekts

## Was ist ein ADR?

Ein **Architecture Decision Record** (ADR) ist ein Dokument, das eine wichtige architektonische Entscheidung erfasst, einschließlich:
- Der **Kontext** und das zu lösende Problem
- Die betrachteten **Alternativen** mit ihren Vor-/Nachteilen
- Die getroffene **Entscheidung** und ihre Begründung
- Die **Konsequenzen** positiv UND negativ
- Die **Implementierungsdetails**

**Verwendetes Format**: MADR v2.2 (Markdown Any Decision Records)

---

## ADR-Index

### Kritisch (P0)

| ADR | Titel | Status | Datum | Tags |
|-----|-------|--------|-------|------|
| [0001](0001-halite-encryption.md) | Halite-Verschlüsselung für DSGVO-sensible Daten | ✅ Accepted | 2025-11-26 | security, dsgvo, halite |
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
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin für das Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js für Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan und Qualitätswerkzeuge | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Statuslegende

- 📝 **Proposed**: In Diskussion, noch nicht akzeptiert
- ✅ **Accepted**: Entscheidung validiert und in Produktion
- 🔄 **Refactoring**: Implementierung läuft (schrittweise Migration)
- ⚠️ **Deprecated**: Veraltet, nicht mehr verwenden
- 🔄 **Superseded**: Durch ein neues ADR ersetzt (siehe Link)

---

## Wann ein ADR erstellen?

### ✅ ADR ERSTELLEN wenn:

- **Strukturelle architektonische Entscheidung** mit Auswirkung auf > 1 Bounded Context
- **Signifikante Trade-offs** zwischen mehreren praktikablen Optionen
- **Einschränkung** regulatorisch/sicherheit/performance die eine Wahl erzwingt
- **Wiederkehrende Frage** im Code Review die eine offizielle Antwort braucht
- **Paradigmenwechsel** (z.B.: sync → async, Monolith → Microservices)
- **Wichtige Technologiewahl** (Framework, Bibliothek, Infrastruktur)
- **Neues Architekturmuster** für das Team

### ❌ KEIN ADR ERSTELLEN wenn:

- **Lokale taktische Entscheidung** die < 3 Dateien betrifft
- **Einfacher Bug Fix** ohne architektonische Auswirkung
- **Standard CRUD** nach bestehenden Mustern
- **Kleinere Dependency-Aktualisierung** (Patch/Minor Version)
- **Offensichtliche Wahl** ohne praktikable Alternative
- **Umgebungskonfiguration** (außer bei Sicherheits-/Compliance-Auswirkung)

**Goldene Regel**: Im Zweifelsfall mit dem Lead Dev besprechen, bevor das ADR erstellt wird.

---

## ADR-Erstellungsprozess

### 1️⃣ Vorschlag (Status: Proposed)

```bash
# 1. Dedizierte Branch erstellen
git checkout -b adr/0011-entscheidungs-titel

# 2. Template kopieren
cp .claude/adr/template.md .claude/adr/0011-entscheidungs-titel.md

# 3. Alle obligatorischen Abschnitte ausfüllen
# - Mindestens 2 Optionen mit Vor-/Nachteilen
# - Klare Begründung der Entscheidung
# - Positive UND negative Konsequenzen

# 4. Commit
git add .claude/adr/0011-entscheidungs-titel.md
git commit -m "docs: add ADR-0011 for [titel] (Proposed)"
```

### 2️⃣ Diskussion (Pull Request)

```bash
# 5. Push und PR erstellen
git push origin adr/0011-entscheidungs-titel

# 6. PR öffnen mit Titel: [ADR] ADR-0011: Entscheidungstitel
#    - Tag: [ADR]
#    - Reviewers: Lead Dev + mindestens 1 Senior
#    - Beschreibung: Link zum ADR im PR-Body
```

**In PR zu diskutieren**:
- Wurden alle Optionen berücksichtigt?
- Ist die Begründung überzeugend?
- Sind die negativen Konsequenzen akzeptabel?
- Gibt es undokumentierte Risiken?
- Ist die Implementierung klar?

### 3️⃣ Akzeptanz (Status: Accepted)

**Akzeptanzkriterien**:
- ✅ Mindestens 2 Reviewer haben genehmigt (Lead Dev + 1 Senior)
- ✅ Alle obligatorischen Abschnitte ausgefüllt
- ✅ Mindestens 2 Optionen mit Pros/Cons dokumentiert
- ✅ Positive UND negative Konsequenzen aufgelistet
- ✅ Referenzen zu bestehenden Regeln/Code vorhanden
- ✅ Konkrete Codebeispiele (nicht generisch)

### 4️⃣ Implementierung

```bash
# Bei der Implementierung der Entscheidung:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

### 5️⃣ Superseded (Bei Notwendigkeit zur Weiterentwicklung)

Wenn eine Entscheidung wesentlich geändert werden muss:

```bash
# 1. NIEMALS das alte ADR löschen
# 2. Altes ADR als Superseded markieren
#    Status: Superseded by ADR-0015
# 3. Neues ADR (ADR-0015) erstellen mit Erklärung:
#    - Warum die ursprüngliche Entscheidung nicht mehr gilt
#    - Was sich geändert hat (Kontext, Einschränkungen)
#    - Die neue Entscheidung
# 4. Beide ADRs gegenseitig verlinken
```

---

## Validierungs-Checkliste

Vor dem Einreichen eines ADR im PR überprüfen:

- [ ] **Titel** klar und beschreibend (≤10 Wörter)
- [ ] **Status** korrekt (Proposed für neues ADR)
- [ ] **Datum** im Format YYYY-MM-DD
- [ ] **Entscheider** mit vollständigen Namen aufgelistet
- [ ] **Tags** relevant (3-5 Tags)
- [ ] **Kontext** erklärt das Problem klar (2-3 Absätze)
- [ ] **Mindestens 2 Optionen** dokumentiert
- [ ] Jede Option hat **Vorteile** UND **Nachteile**
- [ ] **Entscheidung** detailliert begründet (warum diese Option?)
- [ ] **Positive Konsequenzen** aufgelistet (3-5)
- [ ] **Negative Konsequenzen** ehrlich aufgelistet (2-4)
- [ ] **Risiken** mit Mitigation identifiziert
- [ ] **Implementierung**: betroffene Dateien aufgelistet
- [ ] **Codebeispiel** konkret aus dem Projekt (NICHT generisch)
- [ ] **Referenzen** zu `.claude/`-Regeln, Docs, verwandten ADRs
- [ ] **Tests** erforderlich beschrieben
- [ ] Rechtschreib-/Grammatikprüfung

---

## Ressourcen und Referenzen

### Interne Dokumentation

- **Projektkonfiguration**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Architekturregeln**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **DSGVO-Sicherheitsregeln**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Entwicklungsvorlagen**: [`.claude/templates/`](../templates/)
- **Qualitäts-Checklisten**: [`.claude/checklists/`](../checklists/)

### MADR-Ressourcen

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Offizielles Format
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI zur ADR-Verwaltung
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Grundlegender Artikel

---

## Best Practices

### ✅ TUN

- **Seien Sie prägnant**: Maximal 2 Seiten pro ADR (außer in Ausnahmefällen)
- **Seien Sie ehrlich**: Dokumentieren Sie Nachteile und Risiken
- **Seien Sie konkret**: Codebeispiele aus dem Projekt, nicht generisch
- **Referenzieren Sie**: Verlinken Sie ADRs, Regeln, bestehenden Code
- **Aktualisieren Sie**: Fügen Sie Feedback nach der Implementierung hinzu
- **Versionieren Sie**: Sequentielle Nummerierung (0001, 0002, ...)
- **Datieren Sie**: Klares Erstellungs-/Akzeptanzdatum

### ❌ NICHT TUN

- **Niemals löschen** Sie ein ADR (verwenden Sie Superseded)
- **Kopieren Sie nicht** Code aus den Regeln (referenzieren Sie)
- **Verallgemeinern Sie nicht** zu sehr (behalten Sie den Projektkontext)
- **Vergessen Sie nicht** die negativen Konsequenzen (das ist entscheidend)
- **Verzögern Sie nicht**: Erstellen Sie das ADR VOR der Implementierung wenn möglich
- **Vernachlässigen Sie nicht** Reviews (2+ Reviewer obligatorisch)

---

**Letzte Aktualisierung**: 2025-11-26

- **Gesamt ADRs**: 10
- **Akzeptiert**: 9
- **Vorgeschlagen**: 1
- **Refactoring**: 1
- **Deprecated**: 0
- **Superseded**: 0

---

*Dieses README wird vom Architekturteam gepflegt. Jede Änderung muss vom Lead Dev validiert werden.*
