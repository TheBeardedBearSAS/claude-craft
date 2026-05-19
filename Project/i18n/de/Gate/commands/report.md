---
description: Vollstaendigen Quality Gates-Bericht anzeigen
argument-hint: [--detailed]
---

# Quality Gates-Bericht

Einen vollstaendigen Bericht aller BMAD Quality Gates generieren.

## Argumente

$ARGUMENTS (format: [--detailed])
- **--detailed** (optional): Validierungsdetails fuer jedes Gate einschliessen

## Prozess

### Schritt 1: Anwendbare Gates identifizieren

Bestimmen, welche Gates basierend auf dem Projektstatus gelten:
- Gate PRD: Falls PRD-Datei existiert
- Gate Tech Spec: Falls Tech Spec-Datei existiert
- Gate Backlog: Falls Stories existieren
- Gate Sprint Ready: Falls Sprint-Metadaten existieren
- Gates Story: Fuer jede Story in-progress/review

### Schritt 2: Validierungen ausfuehren

Jeden anwendbaren Gate-Validator ausfuehren.

### Schritt 3: Ergebnisse aggregieren

Ergebnisse in einem zusammenfassenden Bericht kompilieren.

### Schritt 4: Empfehlungen generieren

Basierend auf Fehlern priorisierte Massnahmen vorschlagen.

## Ausgabeformat

```
═══════════════════════════════════════════════════════
            BMAD Quality Gates-Bericht
═══════════════════════════════════════════════════════

Projekt: claude-craft
Sprint: sprint-3 - Benutzerverwaltung
Generiert: 2026-01-29 10:00:00

Gate-Zusammenfassung:
══════════════════════════════════════════════════════
| Gate | Schwelle | Punktzahl | Status |
|------|----------|-----------|--------|
| PRD | 80% | 90% | ✅ BESTANDEN |
| Tech Spec | 90% | 92% | ✅ BESTANDEN |
| Backlog | 6/6 | 5.8/6 Durchschn. | ⚠️ WARNUNG |
| Sprint Ready | 100% | 100% | ✅ BESTANDEN |
| Story DoD | 100% | variabel | 📊 |

DoD-Status pro Story:
──────────────────────────────────────────────────────
| Story | Status | DoD-Punktzahl | Gate |
|-------|--------|---------------|------|
| US-010 | in-progress | 45% | ⏳ |
| US-011 | in-progress | 60% | ⏳ |
| US-012 | review | 85% | ⚠️ |
| US-013 | done | 100% | ✅ |

Gesamtzustand: 🟢 Gut
──────────────────────────────────────────────────────
4/5 Gates bestanden
8/10 Stories auf Kurs
Keine kritischen Blocker

Empfehlungen:
──────────────────────────────────────────────────────
1. ⚠️ US-002 fehlen Story Points (INVEST: E)
   Ausfuehren: /project:update-story US-002 --points 3

2. ⚠️ US-012 benoetigt Code Review zur Fertigstellung
   PR erstellen und Review anfordern

Befehle:
  /gate:validate-prd       PRD-Gate erneut ausfuehren
  /gate:validate-backlog   Backlog-Gate erneut ausfuehren
  /gate:validate-story US-012  Spezifische Story pruefen
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:report
/gate:report --detailed
```

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Das spezifische Gate ausführen, das Aufmerksamkeit      ║
║  erfordert:                                              ║
║                                                          ║
║  • /gate:validate-prd      — PRD-Qualitäts-Gate         ║
║  • /gate:validate-techspec — Technische Spec Gate        ║
║  • /gate:validate-backlog  — Backlog-Gate                ║
║  • /gate:validate-sprint   — Sprint-Bereitschafts-Gate   ║
║  • /gate:validate-story    — Story-DoD-Gate              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Schritt-für-Schritt-Validierungen

### PRD-Validierung

```
Datei: docs/prd.md
Schwelle: 80%
Kriterien:
  ✅ Problemstellung (15%)
  ✅ Zielbenutzer (15%)
  ✅ Ziele (15%)
  ✅ Erfolgsmetriken (15%)
  ✅ Umfang/Grenzen (10%)
  ✅ User-Stories-Überblick (10%)
  ✅ Annahmen (10%)
  ⚠️ Risiken (10%) - Teilweise
```

### Tech-Spec-Validierung

```
Datei: docs/tech-spec.md
Schwelle: 90%
Kriterien:
  ✅ Architekturübersicht (12%)
  ✅ Architekturdiagramm (10%)
  ✅ Komponenten (12%)
  ✅ Datenmodell (10%)
  ✅ API-Verträge (10%)
  ✅ Sicherheit (12%)
  ✅ Performance (8%)
  ⚠️ Fehlerbehandlung (8%) - Basis
  ✅ Teststrategie (10%)
  ✅ Deployment (8%)
```

### Maßnahmen nach Priorität

```
Priorität 1 (Blockierend): Keine
Priorität 2 (Sollte behoben werden):
  1. US-002: Story-Point-Schätzung hinzufügen
  2. US-008: In kleinere Stories aufteilen
Priorität 3 (Wünschenswert):
  1. Risikomitigationen zum PRD hinzufügen
  2. Fehlerbehandlung in Tech Spec verbessern
```

## Gate-Konfiguration

Die Gates werden in `.bmad/gates/` konfiguriert:
- `prd-gate.yaml`
- `techspec-gate.yaml`
- `backlog-gate.yaml`
- `story-gate.yaml`
- `sprint-ready-gate.yaml`

## Integration

Der Bericht kann:
1. Bei Bedarf über diesen Befehl generiert werden
2. In die Sprint-Retrospektive einbezogen werden
3. Zur Überwachung der Projektgesundheit verwendet werden
4. Für Stakeholder-Berichte exportiert werden

## Story-DoD-Gate-Details

```
US-010: Benutzerregistrierung
  Status: in-progress | DoD-Score: 45%
  ❌ Aufgaben: 2/5 | ❌ Tests: rote Phase
  ⚠️ AK: 1/3     | ❌ Review: nicht begonnen

US-011: Benutzeranmeldung
  Status: in-progress | DoD-Score: 60%
  ⚠️ Aufgaben: 3/4 | ✅ Tests: grüne Phase
  ⚠️ AK: 2/3     | ❌ Review: nicht begonnen

US-012: Profilseite
  Status: review | DoD-Score: 85%
  ✅ Aufgaben: 4/4 | ✅ Tests: Refactoring-Phase
  ✅ AK: 3/3     | ⚠️ Review: Genehmigung ausstehend

US-013: Passwort zurücksetzen
  Status: done | DoD-Score: 100%
  ✅ Alle Kriterien erfüllt
```
## Bericht pro Gate — Vollständige Details

### Backlog-Stories mit Problemen

| Story | INVEST | Problem | Maßnahme |
|-------|--------|---------|----------|
| US-002 | 5/6 | Keine Story Points | Schätzung hinzufügen |
| US-008 | 5/6 | > 8 Punkte (zu groß) | Aufteilen |

### Sprint-Ready-Status — Details

| Kriterium | Status | Notizen |
|-----------|--------|---------|
| Sprint-Metadaten | ✅ | sprint-3 konfiguriert |
| Sprint-Ziel | ✅ | Benutzerverwaltung |
| Bereite Stories | ✅ | 5 Stories ready-for-dev |
| Geschätzte Stories | ✅ | Alle geschätzt |
| Kapazität (84%) | ✅ | 42/50 verfügbare Punkte |
| Abhängigkeiten | ✅ | Keine ungelösten |

### Monitoring und Alarme

Das Quality-Gates-System löst Alarme aus, wenn:
- Ein kritisches Gate fehlschlägt (PRD < 80%, Tech Spec < 90%)
- Eine Story die geschätzte Zeit ohne Fortschritt überschreitet
- Zirkuläre Abhängigkeiten zwischen Stories erkannt werden
- Die Sprint-Kapazität 90% überschreitet

**Empfohlene Häufigkeit:**
- PRD/TechSpec-Gates: Einmal zu Beginn des Sprints
- Backlog-Gate: Vor jeder Refinement-Sitzung
- Sprint-Ready-Gate: 48h vor Sprint-Beginn
- Story-DoD-Gates: Täglich für laufende Stories
