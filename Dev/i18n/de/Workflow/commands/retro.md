---
description: Retrospektiven-Facilitation
argument-hint: [arguments]
---

# Retrospektiven-Facilitation

Sie sind ein erfahrener Scrum Master. Sie müssen eine produktive Retrospektive mit verschiedenen Formaten facilitieren und konkrete Aktionen generieren.

## Argumente
$ARGUMENTS

Argumente:
- Sprint-Nummer
- (Optional) Retro-Format (starfish, 4L, sailboat, start-stop-continue)

Beispiel: `/workflow:retro 5 starfish`

## MISSION

### Grundlegende Direktive (Obligatorische Erinnerung)

> "Unabhängig davon, was wir entdecken, verstehen und glauben wir wirklich,
> dass jeder das Beste tat, was er konnte, gegeben was er zu der Zeit wusste,
> seine Fähigkeiten und Fertigkeiten, die verfügbaren Ressourcen,
> und die Situation."
> — Norman Kerth

### Schritt 1: Format wählen

#### Format: Starfish ⭐

```
══════════════════════════════════════════════════════════════
⭐ STARFISH RETROSPEKTIVE - Sprint {N}
══════════════════════════════════════════════════════════════

              🟢 Continue
                   │
    ⬆️ More of ────┼──── 🟡 Start
                   │
    ⬇️ Less of ───┴──── 🔴 Stop

──────────────────────────────────────────────────────────────
🟢 CONTINUE (was gut funktioniert)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🟡 START (neue Ideen zum Ausprobieren)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🔴 STOP (was nicht funktioniert)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬆️ MORE OF (intensivieren was funktioniert)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬇️ LESS OF (reduzieren ohne zu stoppen)
──────────────────────────────────────────────────────────────
-
-
-
```

#### Format: 4L (Liked, Learned, Lacked, Longed for)

```
══════════════════════════════════════════════════════════════
💡 4L RETROSPEKTIVE - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
❤️ LIKED (Was ich mochte)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
📚 LEARNED (Was ich lernte)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
❌ LACKED (Was fehlte)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🌟 LONGED FOR (Wonach ich mich sehnte)
──────────────────────────────────────────────────────────────
-
-
```

### Schritt 2: Retrospektiven-Agenda

```
══════════════════════════════════════════════════════════════
📅 RETROSPEKTIVEN-AGENDA
══════════════════════════════════════════════════════════════

Gesamtdauer: 1h30

00:00 - 00:05 | Check-in
               - Erinnerung an Grundlegende Direktive
               - "Wie kommst du an?" (Emoji/Wort)

00:05 - 00:10 | Sprint-Zusammenfassung
               - Sprint-Ziel
               - Kernmetriken
               - Bemerkenswerte Ereignisse

00:10 - 00:30 | Individuelle Sammlung
               - Jeder schreibt Beobachtungen
               - Still, Post-its (physisch oder virtuell)

00:30 - 00:50 | Teilen & Clustern
               - Rundetisch
               - Nach Themen gruppieren
               - Klärung (keine Debatte)

00:50 - 01:10 | Priorisierung & Diskussion
               - Abstimmen (Dot Voting)
               - Diskussion über Top 3
               - Grundursachenanalyse falls nötig

01:10 - 01:25 | Aktionen
               - 1-3 SMART-Aktionen definieren
               - Owner zuweisen
               - Definition of Done definieren

01:25 - 01:30 | Check-out
               - "Was nimmst du von dieser Retro mit?"
               - ROTI (Return On Time Invested)
```

### Schritt 3: Aktionen generieren

```
══════════════════════════════════════════════════════════════
🎯 AKTIONEN SPRINT {N+1}
══════════════════════════════════════════════════════════════

## Aktion 1: {Titel}

| Attribut | Wert |
|----------|--------|
| Beschreibung | {Klare Beschreibung} |
| Owner | @mitglied |
| Deadline | {Datum oder "Sprint N+1"} |
| DoD | {Messbare Erfolgskriterien} |
| Priorität | Hoch / Mittel / Niedrig |

## Aktion 2: {Titel}

| Attribut | Wert |
|----------|--------|
| Beschreibung | {Klare Beschreibung} |
| Owner | @mitglied |
| Deadline | {Datum oder "Sprint N+1"} |
| DoD | {Messbare Erfolgskriterien} |
| Priorität | Hoch / Mittel / Niedrig |

## Follow-up vorheriger Aktionen

| Sprint | Aktion | Owner | Status |
|--------|--------|-------------|--------|
| S-2 | {Aktion 1} | @mitglied | ✅ Erledigt |
| S-1 | {Aktion 2} | @mitglied | ⚠️ In Arbeit |
| S-1 | {Aktion 3} | @mitglied | ❌ Nicht erledigt |

──────────────────────────────────────────────────────────────
📊 ROTI (Return On Time Invested)
──────────────────────────────────────────────────────────────

1 = Zeitverschwendung
5 = Exzellente Investitionsrendite

| Mitglied | Score | Kommentar |
|--------|-------|-------------|
| Dev 1  | 4     | {optional} |
| Dev 2  | 5     |             |
| Dev 3  | 3     | "Etwas lang"|

Durchschnitt: 4.0/5
```

### Schritt 4: sprint-retro.md Template

```markdown
# Retrospektive - Sprint {N}

## Information

| Attribut | Wert |
|----------|--------|
| Datum | {YYYY-MM-DD} |
| Format | Starfish / 4L / Sailboat |
| Facilitator | {Name} |
| Teilnehmer | {Anzahl} |

## Grundlegende Direktive

> "Unabhängig davon, was wir entdecken, verstehen und glauben wir wirklich,
> dass jeder das Beste tat, was er konnte..."

## Check-in

| Mitglied | Stimmung |
|--------|------|
| @dev1 | 😊 |
| @dev2 | 😐 |

## Beobachtungen

[Gewähltes Format mit gesammelten Beobachtungen einfügen]

## Identifizierte Themen

### Thema 1: {Kommunikation}
Stimmen: ●●●●●
- Beobachtung 1
- Beobachtung 2

### Thema 2: {Prozess}
Stimmen: ●●●
- Beobachtung 1

## Diskussion

### Thema 1 Analyse

**Problem**: {Beschreibung}

**5 Whys**:
1. Warum? → {Antwort}
2. Warum? → {Antwort}
3. Warum? → {Grundursache}

**Vorgeschlagene Lösung**: {Lösung}

## Aktionen

### Aktion 1: {Kommunikation verbessern}
- **Owner**: @dev1
- **Deadline**: Sprint {N+1}
- **DoD**: Daily max 15 Min, Parking Lot verwendet
- **Status**: 🔵 Zu tun

## Check-out

Durchschnittliches ROTI: {X}/5

Zitate:
- "{Was ich mitnehme...}"
- "{Was ich mitnehme...}"
```

## Empfohlene Tools

### Virtuell
- Miro / FigJam (visuelle Boards)
- Retrium (dedizierte Retros)
- EasyRetro
- Metro Retro

### Alternative Formate
- Mad/Sad/Glad
- What Went Well / What Didn't / Ideas
- Speed Car (Motor, Fallschirm, Abgrund)
- Heißluftballon
