---
description: Sprint Start Vorbereitung
argument-hint: [arguments]
---

# Sprint Start Vorbereitung

Sie sind ein erfahrener Scrum Master. Sie müssen den Start eines neuen Sprints vorbereiten und facilitieren, indem Sie überprüfen, dass alle Bedingungen erfüllt sind.

## Argumente
$ARGUMENTS

Argumente:
- Sprint-Nummer (z.B. `5`)
- (Optional) Dauer in Tagen (Standard: 10 Tage = 2 Wochen)

Beispiel: `/workflow:start 5`

## MISSION

### Schritt 1: Voraussetzungen überprüfen

#### 1.1 Vorheriger Sprint abgeschlossen
```bash
# Vorherigen Sprint-Status prüfen
# - Sprint Review abgeschlossen
# - Retrospektive abgeschlossen
# - Alle US abgeschlossen oder übertragen
```

#### 1.2 Priorisiertes Backlog
- Product Owner hat Backlog priorisiert
- Kandidaten-US sind geschätzt
- Akzeptanzkriterien sind definiert

#### 1.3 Team verfügbar
- Verfügbarkeit bestätigt
- Urlaube identifiziert
- Kapazität berechnet

### Schritt 2: Kapazität berechnen

```
══════════════════════════════════════════════════════════════
⚡ KAPAZITÄTSBERECHNUNG - Sprint {N}
══════════════════════════════════════════════════════════════

Sprint-Dauer: {X} Arbeitstage
Startdatum: {YYYY-MM-DD}
Enddatum: {YYYY-MM-DD}

──────────────────────────────────────────────────────────────
👥 TEAM-VERFÜGBARKEIT
──────────────────────────────────────────────────────────────

| Mitglied | Verfügbare Tage | Fokus (%) | Kapazität |
|--------|-------------|-----------|----------|
| Dev 1  | 10/10       | 80%       | 8 Tage  |
| Dev 2  | 8/10        | 80%       | 6.4 Tage|
| Dev 3  | 10/10       | 50%       | 5 Tage  |
| Gesamt | -           | -         | 19.4 Tage|

──────────────────────────────────────────────────────────────
📈 VELOCITY
──────────────────────────────────────────────────────────────

| Sprint | Geplante Punkte | Ausgelieferte Punkte |
|--------|------------------|---------------|
| S-3    | 25               | 23            |
| S-2    | 28               | 26            |
| S-1    | 30               | 28            |
| Durchschnitt| 27.7        | 25.7          |

Durchschnittliche Velocity: 26 Punkte
Angepasste Kapazität: ~24 Punkte (10% Sicherheitsfaktor)
```

### Schritt 3: Sprint Planning vorbereiten

```
══════════════════════════════════════════════════════════════
📋 SPRINT PLANNING - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 SPRINT-ZIEL (mit PO zu definieren)
──────────────────────────────────────────────────────────────

> "{Klares Geschäftsziel in einem Satz}"

Beispiel: "Benutzer können ein Konto erstellen und sich
via OAuth2 (Google, GitHub) anmelden"

──────────────────────────────────────────────────────────────
📦 KANDIDATEN-USER-STORIES
──────────────────────────────────────────────────────────────

| Priorität | US | Titel | Punkte | Status |
|----------|-----|-------|--------|--------|
| 🔴 Must  | US-045 | Benutzerregistrierung | 5 | Bereit |
| 🔴 Must  | US-046 | Google OAuth Login | 8 | Bereit |
| 🔴 Must  | US-047 | GitHub OAuth Login | 5 | Bereit |
| 🟡 Should| US-048 | Passwort zurücksetzen | 3 | Bereit |
| 🟡 Should| US-049 | Benutzerprofilseite | 5 | Bereit |
| 🟢 Could | US-050 | Benutzerdefinierter Avatar | 2 | Bereit |

Kandidaten-Gesamt: 28 Punkte
Kapazität: 24 Punkte

──────────────────────────────────────────────────────────────
✅ DEFINITION OF READY (für jede US überprüfen)
──────────────────────────────────────────────────────────────

Für jede ausgewählte US:
- [ ] Klare und vollständige Beschreibung
- [ ] Definierte Akzeptanzkriterien (Given/When/Then)
- [ ] Punkte-Schätzung
- [ ] Abhängigkeiten identifiziert
- [ ] Mockups/Designs verfügbar (falls UI)
- [ ] Testdaten vorbereitet
- [ ] Kein technischer Blocker

──────────────────────────────────────────────────────────────
📅 GEPLANTE ZEREMONIEN
──────────────────────────────────────────────────────────────

| Zeremonie | Datum | Zeit | Dauer | Ort |
|-----------|------|-------|-------|------|
| Sprint Planning T1 | {datum} | 09:00 | 2h | Raum A |
| Sprint Planning T2 | {datum} | 14:00 | 2h | Raum A |
| Daily Scrum | Täglich | 09:30 | 15min | Stand-up |
| Backlog Refinement | {datum} | 14:00 | 1h | Raum B |
| Sprint Review | {enddatum} | 14:00 | 2h | Raum A |
| Retrospektive | {enddatum} | 16:30 | 1h30 | Raum A |
```

### Schritt 4: Sprint-Struktur erstellen

Sprint-Ordner erstellen:

```
project-management/
   sprints/
       sprint-{N}-{ziel}/
           sprint-goal.md
           sprint-backlog.md
           daily-notes/
              {YYYY-MM-DD}.md
              ...
           sprint-review.md
           sprint-retro.md
```

### Schritt 5: sprint-goal.md Template

```markdown
# Sprint {N}: {Ziel}

## Information

| Attribut | Wert |
|----------|--------|
| Nummer | {N} |
| Start | {YYYY-MM-DD} |
| Ende | {YYYY-MM-DD} |
| Dauer | {X} Tage |
| Kapazität | {Y} Punkte |

## Sprint-Ziel

> "{Klares Geschäftsziel}"

## Definition of Done (Erinnerung)

- [ ] Code Review genehmigt (2 Reviewer)
- [ ] Unit Tests (Coverage ≥ 80%)
- [ ] Integrationstests bestehen
- [ ] Dokumentation aktualisiert
- [ ] Keine technische Schuld hinzugefügt
- [ ] Deploybar in Produktion

## Sprint Backlog

| ID | Titel | Punkte | Zugewiesen | Status |
|----|-------|--------|---------|--------|
| US-045 | Benutzerregistrierung | 5 | @dev1 | 🔵 Zu tun |
| US-046 | Google OAuth Login | 8 | @dev2 | 🔵 Zu tun |
| US-047 | GitHub OAuth Login | 5 | @dev1 | 🔵 Zu tun |
| US-048 | Passwort zurücksetzen | 3 | @dev3 | 🔵 Zu tun |

**Gesamt committed: 21 Punkte**

## Abhängigkeiten

| US | Abhängig von | Status |
|----|-----------|--------|
| US-046 | Google OAuth Console Config | ✅ Erledigt |
| US-047 | GitHub OAuth App Config | ⚠️ In Arbeit |

## Identifizierte Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|--------|-------------|--------|------------|
| Google API ändert sich | Niedrig | Mittel | Offizielle Lib verwenden |
| Dev2 krank | Mittel | Mittel | @dev1 kann übernehmen |

## Burndown-Chart

```
Punkte |
  21   |████
  18   |████████
  15   |████████████
  12   |████████████████
   9   |████████████████████
   6   |████████████████████████
   3   |████████████████████████████
   0   |________________________________
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10
```

## Notizen

{Sprint Planning Notizen, getroffene Entscheidungen...}
```

### Schritt 6: Finale Checkliste

```
══════════════════════════════════════════════════════════════
✅ SPRINT {N} START CHECKLISTE
══════════════════════════════════════════════════════════════

## Vor Sprint Planning

- [ ] Vorheriger Sprint offiziell abgeschlossen
- [ ] Retrospektiven-Aktionen in Arbeit
- [ ] Backlog vom PO priorisiert
- [ ] Kandidaten-US geschätzt und "Bereit"
- [ ] Team-Kapazität berechnet
- [ ] Räume für Zeremonien gebucht

## Während Sprint Planning

### Teil 1 - WAS (mit PO)
- [ ] Sprint-Ziel definiert und akzeptiert
- [ ] US vom Team ausgewählt
- [ ] Commitment zum Umfang
- [ ] Abhängigkeiten identifiziert

### Teil 2 - WIE (Dev Team)
- [ ] Aufgliederung in Tasks
- [ ] Task-Schätzung
- [ ] Initiale Zuweisung
- [ ] Risiken diskutiert

## Nach Sprint Planning

- [ ] Sprint Backlog sichtbar (Board aktualisiert)
- [ ] Daily Scrum geplant
- [ ] Tools konfiguriert (Board, Branches, etc.)
- [ ] Team-Kommunikation (Channel, Benachrichtigungen)

══════════════════════════════════════════════════════════════
🚀 SPRINT {N} BEREIT ZUM START!
══════════════════════════════════════════════════════════════
```

## Scrum-Tipps

### Sprint-Ziel
- Ein Satz
- Geschäftswert-orientiert
- Messbar
- Vom gesamten Team geteilt

### Commitment vs Forecast
- Team committed zum Sprint-Ziel
- Anzahl Punkte ist Forecast
- Vertrauen steigt mit Erfahrung

### Focus Factor
- Anfänger-Team: 50-60%
- Etabliertes Team: 70-80%
- Reifes Team: 80-90%
