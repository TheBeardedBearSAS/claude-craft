---
description: Ein EPIC aktualisieren
argument-hint: [arguments]
---

# Ein EPIC aktualisieren

Informationen eines bestehenden EPICs ändern.

## Argumente

$ARGUMENTS (Format: EPIC-XXX [Feld] [Wert])
- **EPIC-ID** (erforderlich): EPIC-ID (z.B. EPIC-001)
- **Feld** (optional): Zu änderndes Feld
- **Wert** (optional): Neuer Wert

## Änderbare Felder

| Feld | Beschreibung | Beispiel |
|-------|-------------|---------|
| `name` | EPIC-Name | "Neuer Name" |
| `priority` | Priorität | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "MMF-Beschreibung" |
| `description` | Beschreibung | "Neue Beschreibung" |

## Prozess

### Interaktiver Modus (ohne Feld-Argumente)

Falls nur ID angegeben:

```
/project:update-epic EPIC-001
```

Aktuelle Informationen anzeigen und Änderungen anbieten:

```
📋 EPIC-001: Authentifizierungssystem

Aktuelle Felder:
1. Name: Authentifizierungssystem
2. Priorität: High
3. MMF: Benutzern ermöglichen, sich anzumelden
4. Beschreibung: [...]

Welches Feld ändern? (1-4, oder 'q' zum Beenden)
>
```

### Direkter Modus (mit Argumenten)

```
/project:update-epic EPIC-001 priority Medium
```

Das angegebene Feld direkt ändern.

### Schritte

1. Validieren, dass EPIC existiert
2. Aktuelle Datei lesen
3. Angefordertes Feld ändern
4. Änderungsdatum aktualisieren
5. Datei speichern
6. Index aktualisieren, falls erforderlich

## Ausgabeformat

```
✅ EPIC aktualisiert!

📋 EPIC-001: Authentifizierungssystem

Änderung:
  Priorität: High → Medium

Datei: project-management/backlog/epics/EPIC-001-authentication-system.md
```

## Beispiele

```
# Interaktiver Modus
/project:update-epic EPIC-001

# Name ändern
/project:update-epic EPIC-001 name "Authentifizierung und Autorisierung"

# Priorität ändern
/project:update-epic EPIC-001 priority Low

# MMF ändern
/project:update-epic EPIC-001 mmf "SSO und 2FA ermöglichen"
```

## Validierung

- Feld muss änderbar sein
- Priorität muss High, Medium oder Low sein
- Name darf nicht leer sein
