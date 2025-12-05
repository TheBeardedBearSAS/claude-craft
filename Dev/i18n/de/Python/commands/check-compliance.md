# Vollständige Python-Konformität prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## MISSION

Führen Sie ein vollständiges Konformitäts-Audit des Python-Projekts durch, indem Sie die 4 Hauptprüfungen orchestrieren: Architektur, Codequalität, Tests und Sicherheit. Erstellen Sie einen konsolidierten Bericht mit einer Gesamtbewertung von 100 Punkten.

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu prüfenden Projektpfad identifizieren
- [ ] Vorhandensein von Konfigurationsdateien überprüfen (pyproject.toml, requirements.txt)
- [ ] Hauptverzeichnisse auflisten (src/, tests/, etc.)
- [ ] Projektstruktur identifizieren

**Hinweis**: Wenn $ARGUMENTS angegeben, als Projektpfad verwenden, andernfalls aktuelles Verzeichnis.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung ausführen:

**Befehl**: Slash-Befehl `/check-architecture` verwenden oder Schritte in `check-architecture.md` manuell folgen

**Bewertete Kriterien**:
- Struktur und Layer-Trennung (6 Pkt)
- Dependency-Einhaltung (6 Pkt)
- Ports und Adapter (4 Pkt)
- Domain-Modellierung (4 Pkt)
- Use Cases und Services (3 Pkt)
- SOLID-Prinzipien (2 Pkt)

**Referenz**: `claude-commands/python/check-architecture.md`

### Schritt 3-6: [Weitere Audits...]

### Schritt 7: Empfehlungen und Aktionsplan

Endgültige Empfehlungen erstellen:
- [ ] Top 3 Prioritätsaktionen über alle Kategorien identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Aktion schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Aktion schätzen
- [ ] Implementierungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
PYTHON-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTBEWERTUNG: XX/100

KONFORMITÄTSSTUFE: [Exzellent/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEWERTUNGEN NACH KATEGORIE:

ARCHITEKTUR       : XX/25  [██████████░░░░░░░░░░] XX%
CODEQUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS             : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT        : XX/25  [██████████░░░░░░░░░░] XX%

[...]
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analyse-Tools verwenden
- Konkrete Beispiele mit Datei:Zeile für jedes Problem bereitstellen
- Aktionen nach Impact/Effort-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an Geschäftskontext des Projekts anpassen
