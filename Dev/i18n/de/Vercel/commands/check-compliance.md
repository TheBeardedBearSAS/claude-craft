---
description: Vollständige Vercel-Compliance prüfen
argument-hint: [arguments]
---

# Vollständige Vercel-Compliance prüfen

## Argumente

$ARGUMENTS (optional: Pfad zum zu analysierenden Projekt)

## Plan Mode

> Plan Mode wird automatisch aktiviert, wenn der Geltungsbereich mehrere Module umfasst oder eine übergreifende Untersuchung erfordert.

## AUFTRAG

Ein vollständiges Compliance-Audit der Vercel-Deployment-Konfiguration und des Platform-Oberflächen-Codes durchführen, indem die 4 großen Prüfungen orchestriert werden: Architektur, Code-Qualität, Tests und Sicherheit. Einen konsolidierten Bericht mit einer Gesamtpunktzahl von 100 Punkten erstellen. **Hinweis zum Geltungsbereich**: dieses Audit deckt ausschließlich die framework-agnostische Vercel-Platform-Nutzung ab (`vercel.json`, Serverless Functions auf Node.js/Fluid Compute, ISR-Cache-Primitiven, Cron Jobs, Storage). Next.js-spezifisches Routing, Rendering oder Data-Fetching (`revalidatePath`, `revalidateTag`, App Router usw.) NICHT bewerten — das gehört zur eigenen Compliance-Prüfung des jeweiligen Framework-Stacks (`/react:*`, `/vuejs:*`, `/angular:*`).

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu auditierenden Projektpfad identifizieren
- [ ] Vorhandensein der Konfigurationsdateien verifizieren (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Hauptverzeichnisse auflisten (`api/`, `middleware.ts`, `.vercel/`, Testverzeichnisse usw.)
- [ ] Projektform klassifizieren: nur-statisch, nur-Functions, ISR-aktiviert, Cron-aktiviert oder hybrid
- [ ] Feststellen, ob ein Framework (Next.js, oder ein Vite-/React-/Vue-/Angular-Build) obendrauf sitzt, und bestätigen, dass framework-spezifisches Routing/Rendering außerhalb des Geltungsbereichs dieses Audits liegt

**Hinweis**: Falls $ARGUMENTS angegeben, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Architektur-Audit (25 Punkte)

Vollständige Architekturprüfung durchführen:

**Befehl**: Slash-Befehl `/vercel:check-architecture` verwenden oder die Schritte in `check-architecture.md` manuell befolgen

**Bewertete Kriterien**:
- Gültigkeit des vercel.json-Schemas (`$schema`, `version`, gültige Schlüssel der obersten Ebene) (6 Pkt.)
- Korrektheit von rewrites / redirects / headers (6 Pkt.)
- Block regions und functions (keine mehrdeutige Glob-Überlappung, memory/maxDuration begründet) (5 Pkt.)
- Konfiguration der Cron Jobs (gültige Pfade und Zeitpläne in `crons[]`) (4 Pkt.)
- Passung zur Projektform und Konflikte mit dem Framework-Adapter (4 Pkt.)

**Referenz**: `check-architecture.md`

### Schritt 3: Code-Qualitäts-Audit (25 Punkte)

Code-Qualitätsprüfung durchführen:

**Befehl**: Slash-Befehl `/vercel:check-code-quality` verwenden oder die Schritte in `check-code-quality.md` manuell befolgen

**Bewertete Kriterien**:
- ESLint-Analyse der Functions und der Middleware (6 Pkt.)
- TypeScript-Strict-Modus und Typsicherheit (6 Pkt.)
- Konventionen für Handler-Signaturen (typisierte Request/Response, validierte Eingabe, Node.js/Fluid-Compute-Runtime als Standard) (6 Pkt.)
- Bewusstsein für die Bundle-Größe (Cold-Start-gerechte Imports) (4 Pkt.)
- Qualität der Middleware (3 Pkt.)

**Referenz**: `check-code-quality.md`

### Schritt 4: Test-Audit (25 Punkte)

Test-Prüfung durchführen:

**Befehl**: Slash-Befehl `/vercel:check-testing` verwenden oder die Schritte in `check-testing.md` manuell befolgen

**Bewertete Kriterien**:
- Abdeckung der Function-Handler und der Middleware (>= 80 %) (7 Pkt.)
- Tests der Function-Handler (Normalfall, Validierung und Fehlerfälle) (6 Pkt.)
- Tests der Cron-Secret-Guards (alle Guard-Zweige) (5 Pkt.)
- Middleware-Tests (3 Pkt.)
- Testorganisation und -isolation (2 Pkt.)
- Smoke-Tests mit `vercel dev` und Prüfung von `x-vercel-cache` (2 Pkt.)

**Referenz**: `check-testing.md`

### Schritt 5: Sicherheits-Audit (25 Punkte)

Sicherheitsprüfung durchführen:

**Befehl**: Slash-Befehl `/vercel:check-security` verwenden oder die Schritte in `check-security.md` manuell befolgen

**Bewertete Kriterien**:
- Umgang mit Umgebungsvariablen (keine Hardcodierung, kein Leak ins Client-Bundle, korrekter Umgebungs-Scope) (7 Pkt.)
- Authentifizierung der Cron-Endpunkte (Invocation-Secret, zeitkonstanter Vergleich) (7 Pkt.)
- CORS-/CSP-Header in vercel.json (4 Pkt.)
- Scope der Marketplace-Zugangsdaten (Least Privilege) (3 Pkt.)
- Veraltete Storage-Pakete (`@vercel/kv`, `@vercel/postgres`) und Hinweise zur Migration der Legacy-Edge-Runtime (2 Pkt.)
- Schwachstellen in Abhängigkeiten (2 Pkt.)

**Referenz**: `check-security.md`

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtergebnis berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Bewertungen addieren (max. 100 Punkte)
- [ ] Kritische Kategorien identifizieren (< 50 %)
- [ ] Alle kritischen kategorienübergreifenden Probleme auflisten
- [ ] Maßnahmen nach Auswirkung/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90–100: Ausgezeichnet – Referenzprojekt
- 75–89: Sehr gut – Einige kleinere Verbesserungen
- 60–74: Akzeptabel – Verbesserungen erforderlich
- 40–59: Unzureichend – Umfangreiches Refactoring erforderlich
- 0–39: Kritisch – Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Auswirkung (Niedrig/Mittel/Hoch) für jede Maßnahme schätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Auswirkungs-/Aufwandsverhältnis)

## AUSGABEFORMAT

```
VERCEL-KONFORMITÄTS-AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTERGEBNIS: XX/100

KONFORMITÄTSNIVEAU: [Ausgezeichnet/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ERGEBNISSE NACH KATEGORIE:

ARCHITEKTUR        : XX/25  [██████████░░░░░░░░░░] XX%
CODE-QUALITÄT      : XX/25  [██████████░░░░░░░░░░] XX%
TESTS              : XX/25  [██████████░░░░░░░░░░] XX%
SICHERHEIT         : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Kleinere kategorienübergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 – betroffene Kategorie]
2. [Kritisches Problem Nr. 2 – betroffene Kategorie]
3. [Kritisches Problem Nr. 3 – betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ ARCHITEKTUR (XX/25)                         │
└─────────────────────────────────────────────┘

Teilbewertungen:
  • vercel.json-Schema            : XX/6
  • rewrites/redirects/headers    : XX/6
  • regions & functions           : XX/5
  • Konfiguration crons[]         : XX/4
  • Projektform                   : XX/4

Stärken:
- [Architekturstärken]

Probleme:
- [Architekturprobleme]

[Ähnliche Abschnitte für Code-Qualität, Tests und Sicherheit...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP 3 PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie  : [Architektur/Qualität/Tests/Sicherheit]
   Auswirkung : [Hoch/Mittel/Niedrig]
   Aufwand    : [Hoch/Mittel/Niedrig]
   Priorität  : SOFORT

   Detaillierte Beschreibung:
   [Erklärung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [datei:zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiche Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiche Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hohe Auswirkung / Niedriger Aufwand):

- [Quick Win Nr. 1] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 2] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]
- [Quick Win Nr. 3] - Kategorie: [X] - Auswirkung: [X] - Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme Nr. 1]
- [ ] [Prioritäts-Quick-Win]

WOCHE 2–4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2–3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MANAGEMENT-ZUSAMMENFASSUNG:

[Zusammenfassender Absatz zum allgemeinen Projektzustand, wesentlichen Stärken,
wesentlichen Schwächen und empfohlenem Weg zur Verbesserung der
Konformität. Angabe, ob das Projekt produktionsbereit ist,
Korrekturen erfordert oder refaktoriert werden muss.]

Allgemeine Empfehlung: [Produktionsbereit / Kleinere Korrekturen /
Umfangreiches Refactoring / Vollständige Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 spezialisierten Audits
- Docker für alle Analysetools verwenden
- Konkrete Beispiele mit datei:zeile für jedes Problem angeben
- Maßnahmen nach der Auswirkung-/Aufwand-Matrix priorisieren
- Sicherheitsprobleme haben IMMER höchste Priorität
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss handlungsorientiert sein, nicht nur beschreibend
- Empfehlungen an den fachlichen Kontext des Projekts anpassen
- Ein ungeschützter Cron-Endpunkt und ein hartcodiertes Secret haben IMMER höchste Priorität, sobald sie gefunden werden
- Ein `runtime: 'edge'` in neuem oder geändertem Code wird immer markiert, ist bei unverändertem Legacy-Code aber Migrationsschuld (kein harter Fehler)
- Next.js-spezifisches Routing/Rendering/Data-Fetching NICHT bewerten — außerhalb des Geltungsbereichs (siehe `/react:*`, `/vuejs:*`, `/angular:*`)
