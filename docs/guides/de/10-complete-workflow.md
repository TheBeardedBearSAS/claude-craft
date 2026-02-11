# Vollständiger Workflow-Leitfaden: Von der Idee zur Produktion

Umfassende Schritt-für-Schritt-Anleitung zum Aufbau einer kompletten Anwendung mit Claude Craft, von der ersten Idee bis zum Produktions-Deployment.

---

## Überblick

Dieser Leitfaden führt Sie durch den kompletten Entwicklungszyklus:

1. **Ideation** - Definieren Sie Ihre Produktvision
2. **Anforderungen** - Dokumentieren Sie, was Sie bauen
3. **Architektur** - Entwerfen Sie die technische Lösung
4. **Planung** - Erstellen Sie umsetzbare Sprints
5. **Entwicklung** - Implementieren Sie mit TDD
6. **Qualität** - Validieren und testen
7. **Deployment** - In Produktion liefern

---

## Phase 1: Ideation (5-10 Minuten)

### Mit BMAD starten

```bash
/bmad:init
```

### Vision definieren

```
@pm Ich möchte eine E-Commerce-Plattform für handwerkliche Produkte aufbauen.
Hauptfunktionen:
- Produktkatalog mit Kategorien
- Warenkorb und Checkout
- Benutzerauthentifizierung
- Bestellverwaltung
```

---

## Phase 2: Anforderungen (15-30 Minuten)

### PRD erstellen

```
@pm Erstelle ein Product Requirements Document
/gate:validate-prd docs/prd.md
```

---

## Phase 3: Architektur (20-45 Minuten)

### Architektur entwerfen

```
@architect Entwerfe die Systemarchitektur für die E-Commerce-Plattform
```

### Technische Spezifikation validieren

```
/gate:validate-techspec docs/tech-spec.md
```

---

## Phase 4: Planung (15-30 Minuten)

### Backlog erstellen

```
@po Erstelle User Stories aus der technischen Spezifikation
@sm Plane Sprint 1
/gate:validate-sprint
```

---

## Phase 5: Entwicklung

### TDD-Zyklus

```bash
# Nächste Story holen
/sprint:next-story --claim

# Mit TDD implementieren
@dev Implementiere US-001 mit TDD

# 🔴 Rot - Fehlschlagenden Test schreiben
# 🟢 Grün - Implementieren
# 🔵 Refactoring

# Validieren
/gate:validate-story US-001
/sprint:transition US-001 done
```

---

## Phase 6: Qualität

```bash
/symfony:check-architecture
/common:team-audit --sequential
/common:pre-commit-check
```

---

## Phase 7: Deployment

```bash
/docker:compose-setup symfony postgresql redis
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Ralph für Automatisierung nutzen

```bash
/common:ralph-run "Implementiere Benutzerauthentifizierung mit TDD"
```

---

## Vollständige Befehlssequenz

```bash
/bmad:init
@pm Erstelle das PRD
/gate:validate-prd docs/prd.md
@architect Erstelle die technische Spezifikation
/gate:validate-techspec docs/tech-spec.md
@po Erstelle die User Stories
@sm Plane Sprint 1
/sprint:next-story --claim
@dev Implementiere mit TDD
/gate:validate-story US-001
/common:team-audit --sequential
/common:release-checklist
```

---

## Tipps für den Erfolg

1. **Quality Gates nicht überspringen**
2. **Agenten kollaborativ nutzen**
3. **TDD ist nicht verhandelbar**: 🔴 → 🟢 → 🔵
4. **Entscheidungen dokumentieren** mit ADRs
5. **Regelmäßige Reviews**

---

## Siehe auch

- [BMAD Praktischer Leitfaden](../BMAD-PRACTICAL-GUIDE.md)
- [Ralph Wiggum Leitfaden](../RALPH-GUIDE.md)
- [Befehlsreferenz](../COMMANDS.md)
