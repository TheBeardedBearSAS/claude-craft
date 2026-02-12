---
description: Sprint Review Vorbereitung
argument-hint: [arguments]
---

# Sprint Review Vorbereitung

Sie sind ein erfahrener Scrum Master. Sie müssen die Sprint Review vorbereiten und facilitieren, indem Sie Informationen über abgeschlossene Arbeit sammeln.

## Argumente
$ARGUMENTS

Argumente:
- Sprint-Nummer

Beispiel: `/workflow:review 5`

## MISSION

### Schritt 1: Sprint-Daten sammeln

```bash
# Sprint-Commits abrufen
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline

# Gemergte PRs
gh pr list --state merged --search "merged:YYYY-MM-DD..YYYY-MM-DD"

# Geschlossene Issues
gh issue list --state closed --search "closed:YYYY-MM-DD..YYYY-MM-DD"
```

### Schritt 2: Sprint Backlog analysieren

```
══════════════════════════════════════════════════════════════
📊 SPRINT REVIEW - Sprint {N}
══════════════════════════════════════════════════════════════

Datum: {YYYY-MM-DD}
Sprint-Ziel: "{Ziel}"

──────────────────────────────────────────────────────────────
🎯 SPRINT-ZIEL-ERREICHUNG
──────────────────────────────────────────────────────────────

Sprint-Ziel erreicht: ✅ JA / ❌ NEIN / ⚠️ TEILWEISE

Begründung: {Erklärung}

──────────────────────────────────────────────────────────────
📦 AUSGELIEFERTE USER STORIES
──────────────────────────────────────────────────────────────

| ID | Titel | Punkte | Demo | Status |
|----|-------|--------|------|--------|
| US-045 | Benutzerregistrierung | 5 | ✅ | ✅ Ausgeliefert |
| US-046 | Google OAuth Login | 8 | ✅ | ✅ Ausgeliefert |
| US-047 | GitHub OAuth Login | 5 | ✅ | ✅ Ausgeliefert |
| US-048 | Passwort zurücksetzen | 3 | ⚠️ | ⚠️ 80% |

**Ausgeliefert: 18/21 Punkte (86%)**

──────────────────────────────────────────────────────────────
❌ NICHT ABGESCHLOSSENE USER STORIES
──────────────────────────────────────────────────────────────

| ID | Titel | Punkte | Fortschritt | Grund |
|----|-------|--------|------------|--------|
| US-048 | Passwort zurücksetzen | 3 | 80% | E-Mail-API nicht verfügbar |

Aktion: Übertrag zu Sprint {N+1}

──────────────────────────────────────────────────────────────
📊 METRIKEN
──────────────────────────────────────────────────────────────

| Metrik | Wert | Trend |
|----------|--------|----------|
| Geplante Punkte | 21 | - |
| Ausgelieferte Punkte | 18 | - |
| Velocity | 18 | ⬆️ (+2 vs S-1) |
| Abschlussrate | 86% | ⬆️ |
| Entdeckte Bugs | 2 | ⬇️ |
| Behobene Bugs | 3 | ⬆️ |

──────────────────────────────────────────────────────────────
🎬 DEMONSTRATION
──────────────────────────────────────────────────────────────

## Vorgeschlagene Demo-Reihenfolge

1. **US-045: Benutzerregistrierung** (~5 Min)
   - Registrierungsformular zeigen
   - Bestätigungs-E-Mail
   - Kontoaktivierung
   - Demo von: @dev1

2. **US-046: Google OAuth Login** (~5 Min)
   - "Mit Google anmelden" Button
   - OAuth-Flow
   - Automatische Kontoerstellung
   - Demo von: @dev2

3. **US-047: GitHub OAuth Login** (~3 Min)
   - Gleicher Flow mit GitHub
   - Demo von: @dev1

## Demo-Szenario

```gherkin
# Vollständiges Szenario für Demo
Gegeben sei ich bin auf der Startseite
Wenn ich auf "Registrieren" klicke
Und ich das Formular ausfülle
Dann erhalte ich eine Bestätigungs-E-Mail
Und ich kann mein Konto aktivieren

Gegeben sei ich bin auf der Login-Seite
Wenn ich auf "Google" klicke
Dann werde ich zu Google weitergeleitet
Und nach Authentifizierung bin ich eingeloggt
```

──────────────────────────────────────────────────────────────
📝 ZU SAMMELNDES FEEDBACK
──────────────────────────────────────────────────────────────

Fragen für Stakeholder:

1. "Ist der Registrierungsflow klar?"
2. "Fehlen OAuth-Provider?" (Apple, Microsoft, etc.)
3. "Entspricht das Design den Erwartungen?"
4. "Priorität für nächsten Sprint?"

──────────────────────────────────────────────────────────────
📝 SESSION-NOTIZEN
──────────────────────────────────────────────────────────────

Erhaltenes Feedback:
- {Feedback 1}
- {Feedback 2}

Neue Anfragen:
- {Anfrage 1} → US-XXX erstellen
- {Anfrage 2} → Zum Backlog hinzufügen

Getroffene Entscheidungen:
- {Entscheidung 1}
- {Entscheidung 2}
```

### Schritt 3: Materialien vorbereiten

#### 3.1 Burndown-Chart

```
Punkte |
  21   |████████████████████████████████
  18   |████████████████████████████████
  15   |████████████████████████████████
  12   |████████████████████████████████
   9   |████████████████████████████████
   6   |████████████████████████████████
   3   |████████████████████████████████ (ideal)
   3   |████████████████████████████████ (actual)
       D1  D2  D3  D4  D5  D6  D7  D8  D9  D10

Legende: ██ Tatsächlich  ▓▓ Ideal
```

### Schritt 4: Sprint Review Agenda

```
══════════════════════════════════════════════════════════════
📅 SPRINT REVIEW AGENDA
══════════════════════════════════════════════════════════════

Gesamtdauer: 2h

00:00 - 00:10 | Einleitung & Kontext
               - Sprint-Ziel-Erinnerung
               - Anwesende Teilnehmer
               - Agenda

00:10 - 01:00 | Demonstration ausgelieferter US
               - US für US
               - Fragen/Feedback nach jeder Demo

01:00 - 01:20 | Metriken & Ergebnisse
               - Burndown-Chart
               - Velocity
               - Nicht ausgelieferte Punkte

01:20 - 01:40 | Diskussion & Feedback
               - Stakeholder-Reaktionen
               - Neue Ideen
               - Priorisierung

01:40 - 02:00 | Nächste Schritte
               - Auswirkung auf Product Backlog
               - Next Sprint Vision
               - Fragen

══════════════════════════════════════════════════════════════
```

### Schritt 5: sprint-review.md Template

```markdown
# Sprint Review - Sprint {N}

## Information

| Attribut | Wert |
|----------|--------|
| Datum | {YYYY-MM-DD} |
| Dauer | 2h |
| Facilitator | {Name} |

## Teilnehmer

- [ ] Product Owner
- [ ] Scrum Master
- [ ] Dev Team
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Sprint-Ziel

> "{Ziel}"

**Erreicht: ✅ / ❌ / ⚠️**

## Demonstration

### US-XXX: Titel
- **Demo von**: @mitglied
- **Feedback**: {Notizen}

### US-XXX: Titel
- **Demo von**: @mitglied
- **Feedback**: {Notizen}

## Metriken

| Metrik | Wert |
|----------|--------|
| Geplant | X Pkte |
| Ausgeliefert | Y Pkte |
| Velocity | Y Pkte |
| Rate | Z% |

## Stakeholder-Feedback

### Positiv
- {Positives Feedback 1}
- {Positives Feedback 2}

### Zu verbessern
- {Verbesserungspunkt 1}
- {Verbesserungspunkt 2}

### Neue Ideen
- {Idee 1} → US-XXX erstellt
- {Idee 2} → Zu verfeinern

## Auswirkung auf Backlog

| Aktion | US | Beschreibung |
|--------|-----|-------------|
| Hinzugefügt | US-XXX | {Titel} |
| Neu priorisiert | US-XXX | {Grund} |
| Entfernt | US-XXX | {Grund} |

## Nächste Schritte

1. {Aktion 1}
2. {Aktion 2}
3. {Aktion 3}
```

## Sprint Review Tipps

### Was es ist
- Eine Inspektion des Increments
- Ein Feedback-Moment
- Eine Zusammenarbeit mit Stakeholdern

### Was es NICHT ist
- Ein Status-Meeting
- Eine technische Demo
- Ein Bericht für Management

### Best Practices
- Demo in echter Umgebung (staging/prod)
- Team demonstriert, nicht nur SM
- Aktiv Feedback sammeln
- Backlog in Echtzeit anpassen
