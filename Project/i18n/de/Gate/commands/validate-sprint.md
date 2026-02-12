---
description: Sprint-Bereitschaft vor dem Start validieren
argument-hint: [--verbose]
---

# Sprint-Gate validieren

Validiert, dass der Sprint korrekt geplant und startbereit ist.
Alle erforderlichen Kriterien muessen erfuellt sein.

## Argumente

$ARGUMENTS (format: [--verbose])
- **--verbose** (optional): Details pro Story anzeigen

## Sprint Ready-Kriterien

| Kriterium | Gewicht | Erforderlich | Beschreibung |
|-----------|---------|--------------|--------------|
| Sprint-Metadaten | 20% | Ja | ID, Name, Daten definiert |
| Sprint-Ziel | 15% | Ja | Klares Ziel definiert |
| Stories bereit | 25% | Ja | Stories im Status ready-for-dev |
| Stories geschaetzt | 20% | Ja | Alle haben Punkte |
| Kapazitaetspruefung | 10% | Nein | Punkte innerhalb der Kapazitaet |
| Abhaengigkeiten geloest | 10% | Nein | Keine blockierten Stories im Ready-Status |

**Schwelle: Alle erforderlichen Kriterien**

## Prozess

### Schritt 1: Sprint-Status laden

1. `.bmad/sprint-status.yaml` lesen
2. Metadaten extrahieren
3. Stories pro Status zaehlen

### Schritt 2: Metadaten validieren

Erforderliche Felder pruefen:
- `metadata.sprint_id` - Sprint-Identifikator
- `metadata.name` - Sprint-Name
- `metadata.start_date` - Startdatum
- `metadata.end_date` - Enddatum
- `metadata.goal` - Sprint-Ziel (min. 10 Zeichen)

### Schritt 3: Stories validieren

Story-Bereitschaft pruefen:
- Mindestens 1 Story im Status `ready-for-dev`
- Alle Stories haben Story Points
- Keine blockierten Stories im Ready-Status

### Schritt 4: Optionale Kapazitaetspruefung

Falls `metadata.capacity_points` definiert:
- Summe der Ready-Story-Punkte ≤ Kapazitaet + 20%

### Schritt 5: Bericht generieren

Sprint-Bereitschaftsstatus anzeigen.

## Ausgabeformat

### Sprint bereit

```
═══════════════════════════════════════════════════════
           Sprint Ready-Gate-Validierung
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Benutzerverwaltung
Zeitraum: 2026-01-29 → 2026-02-12 (14 Tage)

Validierungsergebnisse:
──────────────────────────────────────────────────────
✅ Sprint-Metadaten (20%)
   ID: sprint-3
   Name: Benutzerverwaltung
   Start: 2026-01-29
   Ende: 2026-02-12

✅ Sprint-Ziel (15%)
   "Benutzerverwaltungsfunktionen implementieren
    einschliesslich Registrierung, Anmeldung und Profilverwaltung"

✅ Stories bereit (25%)
   5 Stories im Status ready-for-dev
   Gesamtpunkte: 21

✅ Stories geschaetzt (20%)
   Alle 8 Stories haben Story Points

✅ Kapazitaetspruefung (10%)
   Geplant: 21 Punkte
   Kapazitaet: 25 Punkte
   Auslastung: 84%

✅ Abhaengigkeiten geloest (10%)
   Keine blockierten Stories im Ready-Status

Punktzahl: 100/100
──────────────────────────────────────────────────────

✅ SPRINT READY-GATE VALIDIERT

Der Sprint kann gestartet werden.

Bereite Stories:
  📖 US-010: Benutzerregistrierung (5 Pkt.)
  📖 US-011: Benutzeranmeldung (5 Pkt.)
  📖 US-012: Profilseite (5 Pkt.)
  📖 US-013: Passwort zuruecksetzen (3 Pkt.)
  📖 US-014: E-Mail-Verifizierung (3 Pkt.)

Befehle:
  /sprint:start           Sprint starten
  /sprint:next-story     Erste Story uebernehmen
═══════════════════════════════════════════════════════
```

### Sprint nicht bereit

```
═══════════════════════════════════════════════════════
           Sprint Ready-Gate-Validierung
═══════════════════════════════════════════════════════

Sprint: (nicht konfiguriert)

Validierungsergebnisse:
──────────────────────────────────────────────────────
❌ Sprint-Metadaten (20%)
   Fehlend: sprint_id
   Fehlend: start_date
   Fehlend: end_date

❌ Sprint-Ziel (15%)
   Fehlend: Kein Ziel definiert

⚠️ Stories bereit (25%)
   Nur 1 Story im Status ready-for-dev
   Empfohlen: mindestens 3 Stories

❌ Stories geschaetzt (20%)
   3 Stories ohne Story Points:
   - US-010: Benutzerregistrierung
   - US-012: Profilseite
   - US-015: Einstellungsseite

⏳ Kapazitaetspruefung (10%)
   Uebersprungen: Keine Kapazitaet definiert

⚠️ Abhaengigkeiten geloest (10%)
   1 Ready-Story ist blockiert:
   - US-011: Blockiert durch externe API

Punktzahl: 35/100
──────────────────────────────────────────────────────

❌ SPRINT READY-GATE FEHLGESCHLAGEN

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
1. Sprint-Metadaten konfigurieren
   .bmad/sprint-status.yaml bearbeiten:
   ```yaml
   metadata:
     sprint_id: "sprint-3"
     name: "Benutzerverwaltung"
     start_date: "2026-01-29"
     end_date: "2026-02-12"
     goal: "Benutzerverwaltungsfunktionen implementieren"
   ```

2. Sprint-Ziel definieren
   Klares und messbares Ziel hinzufuegen

3. Fehlende Stories schaetzen
   /project:update-story US-010 --points 5
   /project:update-story US-012 --points 5
   /project:update-story US-015 --points 3

4. Blockierte Stories loesen
   US-011 blockiert durch: externe API-Abhaengigkeit
   Optionen:
   - Aus Sprint entfernen
   - Abhaengigkeit loesen
   - Stories neu ordnen

Erneut ausfuehren: /gate:validate-sprint
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-sprint
/gate:validate-sprint --verbose
```

## Sprint-Konfiguration

Sprint in `.bmad/sprint-status.yaml` konfigurieren:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "Benutzerverwaltung"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Benutzerverwaltungsfunktionen implementieren"
  capacity_points: 25  # Optional: Team-Kapazitaet
```

Gate-Konfiguration: `.bmad/gates/sprint-ready-gate.yaml`
