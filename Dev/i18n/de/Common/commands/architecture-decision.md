# Architecture Decision Record (ADR)

Sie sind ein erfahrener Software-Architekt. Sie müssen ein Architecture Decision Record (ADR) erstellen, um eine wichtige technische Entscheidung zu dokumentieren.

## Argumente
$ARGUMENTS

Argumente:
- Entscheidungstitel
- (Optional) ADR-Nummer

Beispiel: `/common:architecture-decision "Wahl von PostgreSQL als Hauptdatenbank"`

## MISSION

### Schritt 1: Informationen sammeln

Stellen Sie wichtige Fragen:
1. Welches Problem versuchen wir zu lösen?
2. Was sind die Einschränkungen?
3. Welche Optionen haben wir in Betracht gezogen?
4. Warum diese Option anstelle einer anderen?

### Schritt 2: ADR-Datei erstellen

Speicherort: `docs/architecture/decisions/` oder `docs/adr/`

Benennung: `NNNN-titel-in-kebab-case.md`

### Schritt 3: ADR schreiben

ADR-Vorlage (Michael Nygard Format):

```markdown
# ADR-{NNNN}: {Titel}

**Datum**: {YYYY-MM-DD}
**Status**: {Vorgeschlagen | Akzeptiert | Veraltet | Ersetzt durch ADR-XXXX}
**Entscheider**: {Namen der beteiligten Personen}

## Kontext

{Beschreiben Sie die wirksamen Kräfte, einschließlich technologischer, politischer,
sozialer und projektbezogener Kräfte. Diese Kräfte stehen wahrscheinlich in Spannung
und sollten als solche benannt werden. Die Sprache in diesem Abschnitt ist
wertneutral - wir beschreiben einfach Fakten.}

### Aktuelle Situation

{Beschreibung des aktuellen Zustands des Systems/Projekts}

### Problem

{Klare Beschreibung des zu lösenden Problems}

### Einschränkungen

- {Einschränkung 1}
- {Einschränkung 2}
- {Einschränkung 3}

## Betrachtete Optionen

### Option 1: {Name}

{Beschreibung der Option}

**Vorteile**:
- {Vorteil 1}
- {Vorteil 2}

**Nachteile**:
- {Nachteil 1}
- {Nachteil 2}

**Geschätzter Aufwand**: {Niedrig | Mittel | Hoch}

### Option 2: {Name}

{Beschreibung der Option}

**Vorteile**:
- {Vorteil 1}
- {Vorteil 2}

**Nachteile**:
- {Nachteil 1}
- {Nachteil 2}

**Geschätzter Aufwand**: {Niedrig | Mittel | Hoch}

### Option 3: {Name}

{Beschreibung der Option}

**Vorteile**:
- {Vorteil 1}
- {Vorteil 2}

**Nachteile**:
- {Nachteil 1}
- {Nachteil 2}

**Geschätzter Aufwand**: {Niedrig | Mittel | Hoch}

## Entscheidung

{Wir haben uns entschieden, **Option X** zu verwenden, weil...}

### Begründung

{Detaillierte Erklärung, warum diese Option gegenüber
anderen gewählt wurde. Einschließlich akzeptierter Kompromisse.}

## Konsequenzen

### Positiv

- {Positive Konsequenz 1}
- {Positive Konsequenz 2}

### Negativ

- {Negative Konsequenz 1}
- {Negative Konsequenz 2}

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Minderung |
|--------|-------------------|------------|-----------|
| {Risiko 1} | Niedrig/Mittel/Hoch | Niedrig/Mittel/Hoch | {Aktion} |
| {Risiko 2} | Niedrig/Mittel/Hoch | Niedrig/Mittel/Hoch | {Aktion} |

## Umsetzungsplan

### Phase 1: {Titel}
- [ ] {Aufgabe 1}
- [ ] {Aufgabe 2}

### Phase 2: {Titel}
- [ ] {Aufgabe 3}
- [ ] {Aufgabe 4}

## Erfolgsmetriken

- {Metrik 1}: {Zielwert}
- {Metrik 2}: {Zielwert}

## Referenzen

- {Link zur Dokumentation}
- {Link zur Vergleichsstudie}
- {Verwandte ADRs}

---

## Historie

| Datum | Aktion | Von |
|-------|--------|-----|
| {YYYY-MM-DD} | Erstellt | {Name} |
| {YYYY-MM-DD} | Akzeptiert | {Team} |
```

### Schritt 4: Vollständiges ADR-Beispiel

```markdown
# ADR-0012: Wahl von PostgreSQL als Hauptdatenbank

**Datum**: 2024-01-15
**Status**: Akzeptiert
**Entscheider**: John Doe (Tech Lead), Mary Smith (DBA), Peter Johnson (CTO)

## Kontext

### Aktuelle Situation

Unsere Anwendung verwendet derzeit MySQL 5.7, gehostet auf einem dedizierten Server.
Die Datenbank enthält 50 Tabellen, 10 Millionen Zeilen in der Haupttabelle
und verarbeitet 1000 Abfragen/Sekunde zur Spitzenzeit.

### Problem

1. MySQL 5.7 erreicht End-of-Life (EOL)
2. Wachsender Bedarf an komplexen JSON-Abfragen
3. Eingeschränkte Volltextsuchfunktionen
4. Keine native Unterstützung für Geospatial-Typen

### Einschränkungen

- Begrenztes Infrastrukturbudget
- Migration muss für Benutzer transparent sein
- Team mit MySQL vertraut, nicht mit PostgreSQL
- Migrationszeit: maximal 3 Monate

## Betrachtete Optionen

### Option 1: Upgrade auf MySQL 8.0

Bleiben Sie bei MySQL durch Upgrade auf Version 8.0.

**Vorteile**:
- Keine Schema-Migration
- Team bereits geschult
- Minimales Risiko

**Nachteile**:
- JSON-Abfragen immer noch weniger performant
- Keine native französische Volltextsuche
- Weniger ausgereifte Geospatial-Erweiterung

**Geschätzter Aufwand**: Niedrig

### Option 2: Migration zu PostgreSQL 16

Migration zu PostgreSQL mit allen modernen Funktionen.

**Vorteile**:
- Sehr performantes JSONB
- Volltextsuche mit französischen Wörterbüchern
- PostGIS für Geospatial
- Sehr aktive Community
- Umfangreiche Erweiterungen (pg_trgm, uuid-ossp, etc.)

**Nachteile**:
- Migration erforderlich
- Team-Schulung erforderlich
- Geringfügige SQL-Syntaxänderungen

**Geschätzter Aufwand**: Mittel

### Option 3: NoSQL-Datenbank (MongoDB)

Migration zu einer Dokumentendatenbank für mehr Flexibilität.

**Vorteile**:
- Flexibles Schema
- Gut für natives JSON
- Horizontale Skalierbarkeit

**Nachteile**:
- Verlust relationaler Einschränkungen
- Massive Code-Migration
- Komplexe Transaktionen
- Ungeschultes Team

**Geschätzter Aufwand**: Hoch

## Entscheidung

Wir haben uns entschieden, **PostgreSQL 16** zu verwenden, weil:

### Begründung

1. **JSON-Performance**: PostgreSQLs JSONB übertrifft MySQL für unsere
   Anwendungsfälle beim Speichern von Benutzer-Metadaten.

2. **Volltextsuche**: Native französisches Wörterbuch vermeidet die Installation
   von Elasticsearch für die Suche.

3. **PostGIS**: Unsere neuen Geolokalisierungsfunktionen werden
   einfacher zu implementieren sein.

4. **Reife**: PostgreSQL ist das fortschrittlichste Open-Source-RDBMS
   mit einer sehr aktiven Community.

5. **Doctrine-Kompatibilität**: Unser ORM unterstützt PostgreSQL perfekt.

## Konsequenzen

### Positiv

- JSON-Abfragen 3x schneller (interner Benchmark)
- Volltextsuche ohne zusätzliche Infrastruktur
- Native Geospatial-Funktionen
- Bessere Unterstützung für Datentypen (UUID, Arrays, etc.)

### Negativ

- 2 Wochen Team-Schulung
- Datenmigration geschätzt auf 4h Ausfallzeit
- Einige Abfragen anzupassen (LIMIT/OFFSET-Syntax)

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Minderung |
|--------|-------------------|------------|-----------|
| Performance-Regression | Niedrig | Mittel | Lasttests vor Migration |
| Datenverlust | Sehr niedrig | Kritisch | Backup + Dry-Run |
| Post-Migrations-Bugs | Mittel | Niedrig | 2-wöchige Stabilisierungsphase |

## Umsetzungsplan

### Phase 1: Vorbereitung (Woche 1-2)
- [x] PostgreSQL Team-Schulung
- [x] PostgreSQL Dev-Umgebung einrichten
- [x] Unit-Tests anpassen

### Phase 2: Code-Migration (Woche 3-4)
- [ ] Native SQL-Abfragen anpassen
- [ ] Doctrine für PostgreSQL konfigurieren
- [ ] Integrationstests vervollständigen

### Phase 3: Datenmigration (Woche 5)
- [ ] pgloader-Migrationsskript
- [ ] Dry-Run auf Produktionskopie
- [ ] Produktionsmigration (Wochenende)

### Phase 4: Stabilisierung (Woche 6-8)
- [ ] Performance-Überwachung
- [ ] Bug-Fixes falls vorhanden
- [ ] Dokumentation aktualisiert

## Erfolgsmetriken

- API-Antwortzeit: ≤ aktuell (100ms P95)
- JSON-Abfragen: -50% Ausführungszeit
- Post-Migrations-Verfügbarkeit: 99,9%

## Referenzen

- [PostgreSQL vs MySQL JSON Benchmark](internal-wiki/benchmarks)
- [Doctrine-Migrationsleitfaden](internal-wiki/migration-guide)
- ADR-0008: Wahl von Doctrine ORM
```

### Schritt 5: ADR-Index erstellen

```markdown
# Architecture Decision Records

Dieser Ordner enthält die ADRs des Projekts.

## Index

| # | Titel | Status | Datum |
|---|-------|--------|------|
| [ADR-0001](0001-use-clean-architecture.md) | Einführung von Clean Architecture | Akzeptiert | 2023-06-15 |
| [ADR-0012](0012-postgresql-database.md) | PostgreSQL-Wahl | Akzeptiert | 2024-01-15 |
| [ADR-0013](0013-api-versioning.md) | API-Versionierungsstrategie | Vorgeschlagen | 2024-01-20 |

## Status

- **Vorgeschlagen**: In Diskussion
- **Akzeptiert**: Entscheidung validiert
- **Veraltet**: Nicht mehr relevant
- **Ersetzt**: Durch ein anderes ADR ersetzt
```

## Empfohlene Struktur

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # ADR-Index
        ├── 0001-*.md
        ├── 0002-*.md
        └── templates/
            └── adr-template.md
```
