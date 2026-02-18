---
description: Eine User Story aktualisieren
argument-hint: [arguments]
---

# Eine User Story aktualisieren

Informationen einer bestehenden User Story ändern.

## Argumente

$ARGUMENTS (Format: US-XXX [Feld] [Wert])
- **US-ID** (erforderlich): User Story-ID (z.B. US-001)
- **Feld** (optional): Zu änderndes Feld
- **Wert** (optional): Neuer Wert

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Änderbare Felder

| Feld | Beschreibung | Beispiel |
|-------|-------------|---------|
| `name` | US-Name | "Neuer Name" |
| `points` | Story Points | 1, 2, 3, 5, 8 |
| `epic` | Übergeordnetes EPIC | EPIC-002 |
| `persona` | Zugehörige Persona | P-001 |
| `story` | US-Text | "Als..." |
| `criteria` | Abnahmekriterien | (interaktiver Modus) |

## Prozess

### Interaktiver Modus (ohne Feld-Argumente)

```
/project:update-story US-001
```

Informationen anzeigen und Änderungen anbieten:

```
📖 US-001: Benutzer-Login

Aktuelle Felder:
1. Name: Benutzer-Login
2. EPIC: EPIC-001
3. Punkte: 5
4. Persona: P-001 (Standard-Benutzer)
5. Story: Als Benutzer möchte ich...
6. Abnahmekriterien: [3 Kriterien]

Welches Feld ändern? (1-6, oder 'q' zum Beenden)
>
```

### Direkter Modus

```
/project:update-story US-001 points 8
```

### Abnahmekriterien ändern

Im interaktiven Modus, Option zu:
- Kriterium hinzufügen
- Bestehendes Kriterium ändern
- Kriterium löschen

```
Aktuelle Abnahmekriterien:
1. AC-1: Login mit E-Mail/Passwort
2. AC-2: Fehlermeldung bei Fehler
3. AC-3: Weiterleitung nach Erfolg

Aktion? (h)inzufügen, (ä)ndern, (l)öschen, (b)eenden
> h

Neues Kriterium (Gherkin-Format):
GIVEN:
WHEN:
THEN:
```

### Schritte

1. Validieren, dass US existiert
2. Aktuelle Datei lesen
3. Angefordertes Feld ändern
4. Änderungsdatum aktualisieren
5. Datei speichern
6. Übergeordnetes EPIC aktualisieren, falls geändert
7. Index aktualisieren

## Ausgabeformat

```
✅ User Story aktualisiert!

📖 US-001: Benutzer-Login

Änderung:
  Punkte: 5 → 8

⚠️ Warnung: 8 Punkte ist das empfohlene Maximum.
   Erwägen Sie, diese US aufzuteilen, falls zu komplex.

Datei: project-management/backlog/user-stories/US-001-user-login.md
```

## EPIC-Änderung

Falls übergeordnetes EPIC geändert:

```
✅ User Story verschoben!

📖 US-001: Benutzer-Login

Änderung:
  EPIC: EPIC-001 → EPIC-002

Aktualisierungen:
  - EPIC-001: US aus Liste entfernt
  - EPIC-002: US zur Liste hinzugefügt
  - Index: Aktualisiert
```

## Beispiele

```
# Interaktiver Modus
/project:update-story US-001

# Punkte ändern
/project:update-story US-001 points 3

# EPIC ändern
/project:update-story US-001 epic EPIC-002

# Name ändern
/project:update-story US-001 name "Benutzer-Login mit SSO"
```

## Validierung

- Punkte: Fibonacci (1, 2, 3, 5, 8)
- Falls Punkte > 8: Warnung zum Aufteilen
- EPIC: Muss existieren
- Persona: Muss in personas.md definiert sein
