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

Ein vollständiges Compliance-Audit der Vercel-Deployment-Konfiguration und des Platform-Oberflächen-Codes durchführen, indem die 4 großen Prüfungen orchestriert werden: vercel.json & Architektur, Functions & Laufzeitwahl, Sicherheit & Umgang mit Umgebungsvariablen sowie ISR/Caching & Tests. Einen konsolidierten Bericht mit einer Gesamtpunktzahl von 100 Punkten erstellen. **Hinweis zum Geltungsbereich**: dieses Audit deckt ausschließlich die framework-agnostische Vercel-Platform-Nutzung ab (`vercel.json`, Serverless Functions auf Node.js/Fluid Compute, ISR-Cache-Primitiven, Cron Jobs, Storage). Next.js-spezifisches Routing, Rendering oder Data-Fetching (`revalidatePath`, `revalidateTag`, App Router usw.) NICHT bewerten — das gehört zur eigenen Compliance-Prüfung des jeweiligen Framework-Stacks (`/react:*`, `/vuejs:*`, `/angular:*`).

### Schritt 1: Audit-Vorbereitung

Audit-Umgebung vorbereiten:
- [ ] Zu auditierenden Projektpfad identifizieren
- [ ] Vorhandensein der Konfigurationsdateien verifizieren (`vercel.json`, `package.json`, `tsconfig.json`)
- [ ] Hauptverzeichnisse auflisten (`api/`, `middleware.ts`, `.vercel/`, Testverzeichnisse usw.)
- [ ] Projektform klassifizieren: nur-statisch, nur-Functions, ISR-aktiviert, Cron-aktiviert oder hybrid
- [ ] Feststellen, ob ein Framework (Next.js, oder ein Vite-/React-/Vue-/Angular-Build) obendrauf sitzt, und bestätigen, dass framework-spezifisches Routing/Rendering außerhalb des Geltungsbereichs dieses Audits liegt

**Hinweis**: Falls $ARGUMENTS angegeben, als Projektpfad verwenden, andernfalls das aktuelle Verzeichnis verwenden.

### Schritt 2: Audit vercel.json & Architektur (30 Punkte)

Vollständige Konfigurations- und Architekturprüfung durchführen:

**Bewertete Kriterien**:
- vercel.json schema-korrekt (`$schema`, `version`, gültige Top-Level-Schlüssel) (8 Pkt.)
- Korrektheit von Rewrites/Redirects/Headers (Redirect vs. Rewrite, keine Header-Duplizierung mit Middleware) (6 Pkt.)
- Regions & Functions-Block (keine mehrdeutige Glob-Überlappung, memory/maxDuration begründet) (8 Pkt.)
- Passung zur Projektform (Konfiguration entspricht der deklarierten statisch/Functions/ISR/Cron-Form) (8 Pkt.)

**Referenz**: `.claude/agents/vercel-reviewer.md` (Abschnitt 1)

### Schritt 3: Audit Functions & Laufzeitwahl (20 Punkte)

Prüfung der Laufzeit- und Handler-Qualität durchführen:

**Bewertete Kriterien**:
- Kein unmarkiertes `runtime: 'edge'` bei neuem/geändertem Code (Node.js-/Fluid-Compute-Vorgabe respektiert) (8 Pkt.)
- Node.js-Version auf 20+ gepinnt für den Bytecode-Caching-Vorteil von Fluid Compute (6 Pkt.)
- Qualität der Handler-Signatur (Input validiert, explizite typisierte Antworten, cold-start-bewusste Imports) (6 Pkt.)

**Referenz**: `.claude/agents/vercel-reviewer.md` (Abschnitt 2)

### Schritt 4: Audit Sicherheit & Umgang mit Umgebungsvariablen (25 Punkte)

Prüfung der Sicherheit und des Umgangs mit Secrets durchführen:

**Bewertete Kriterien**:
- Secrets/Umgebungsvariablen (keine Hartkodierung, kein Leak ins Client-Bundle, korrektes Umgebungs-Scoping) (8 Pkt.)
- Cron-Endpunkte verifizieren ein Invocation-Secret (timing-safe Vergleich) (8 Pkt.)
- Korrektheit von CORS-/CSP-Headers (kein Wildcard + Credentials, Basis-CSP vorhanden) (5 Pkt.)
- Scoping von Marketplace-Credentials (Least-Privilege, keine deprecateten `@vercel/kv`/`@vercel/postgres`) (4 Pkt.)

**Referenz**: `.claude/agents/vercel-reviewer.md` (Abschnitt 3)

### Schritt 5: Audit ISR/Caching & Tests (25 Punkte)

Prüfung von Caching und Tests durchführen:

**Bewertete Kriterien**:
- Korrektheit von Cache-Control (stale-while-revalidate auf cachebaren Routen) (8 Pkt.)
- Kein Konflikt zwischen vercel.json und Framework-Revalidierung (eine Quelle der Wahrheit) (7 Pkt.)
- Handler-Testabdeckung (Happy-/Validierungs-/Auth-Pfade, >= 80%) (6 Pkt.)
- `x-vercel-cache` verifiziert / Integrations-Smoke-Test via `vercel dev` (4 Pkt.)

**Referenz**: `.claude/agents/vercel-reviewer.md` (Abschnitt 4)

### Schritt 6: Konsolidierung und Gesamtbewertung

Gesamtpunktzahl berechnen und konsolidierten Bericht erstellen:
- [ ] Die 4 Punktzahlen summieren (30 + 20 + 25 + 25 = 100 Punkte)
- [ ] Kritische Kategorien identifizieren (<50% ihres Maximums)
- [ ] Alle kritischen, übergreifenden Probleme auflisten (z. B. ungeschützter Cron-Endpunkt, hartkodiertes Secret, deprecatetes Storage-Paket)
- [ ] Maßnahmen nach Impact/Aufwand priorisieren
- [ ] Abschließenden konsolidierten Bericht erstellen

**Bewertungsskala**:
- 90-100: Exzellent - Referenzprojekt
- 75-89: Sehr gut - Einige geringfügige Verbesserungen
- 60-74: Akzeptabel - Verbesserungen erforderlich
- 40-59: Unzureichend - Größeres Refactoring erforderlich
- 0-39: Kritisch - Vollständige Überarbeitung notwendig

### Schritt 7: Empfehlungen und Aktionsplan

Abschließende Empfehlungen erstellen:
- [ ] Die Top-3-Prioritätsmaßnahmen über alle Kategorien hinweg identifizieren
- [ ] Aufwand (Niedrig/Mittel/Hoch) für jede Maßnahme abschätzen
- [ ] Impact (Niedrig/Mittel/Hoch) für jede Maßnahme abschätzen
- [ ] Umsetzungsreihenfolge vorschlagen
- [ ] Quick Wins vorschlagen (hohes Verhältnis von Impact zu Aufwand)

## AUSGABEFORMAT

```
VERCEL COMPLIANCE AUDIT - VOLLSTÄNDIGER BERICHT
=============================================

GESAMTPUNKTZAHL: XX/100

COMPLIANCE-NIVEAU: [Exzellent/Sehr gut/Akzeptabel/Unzureichend/Kritisch]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PUNKTZAHLEN NACH KATEGORIE:

VERCEL.JSON & ARCHITEKTUR    : XX/30  [██████████░░░░░░░░░░] XX%
FUNCTIONS & LAUFZEITWAHL     : XX/20  [██████████░░░░░░░░░░] XX%
SICHERHEIT & UMGEBUNGSVARIABLEN : XX/25  [██████████░░░░░░░░░░] XX%
ISR/CACHING & TESTS          : XX/25  [██████████░░░░░░░░░░] XX%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GESAMTSTÄRKEN:
1. [In mehreren Kategorien identifizierte Stärke]
2. [Weitere wesentliche Stärke]
3. [Dritte Stärke]

GESAMTVERBESSERUNGEN:
1. [Geringfügige übergreifende Verbesserung]
2. [Weitere empfohlene Verbesserung]
3. [Dritte Verbesserung]

KRITISCHE PROBLEME:
1. [Kritisches Problem Nr. 1 - betroffene Kategorie]
2. [Kritisches Problem Nr. 2 - betroffene Kategorie]
3. [Kritisches Problem Nr. 3 - betroffene Kategorie]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DETAILS NACH KATEGORIE:

┌─────────────────────────────────────────────┐
│ VERCEL.JSON & ARCHITEKTUR (XX/30)            │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Schema-Korrektheit der vercel.json  : XX/8
  • Rewrites/Redirects/Headers          : XX/6
  • Regions & Functions-Block           : XX/8
  • Passung zur Projektform             : XX/8

Stärken:
- [Architektur-Stärken]

Probleme:
- [Architektur-Probleme]

┌─────────────────────────────────────────────┐
│ FUNCTIONS & LAUFZEITWAHL (XX/20)             │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Node.js/Fluid Compute vs. Edge      : XX/8
  • Node.js-Version gepinnt             : XX/6
  • Qualität der Handler-Signatur       : XX/6

Stärken:
- [Laufzeit-Stärken]

Probleme:
- [Laufzeit-Probleme]

┌─────────────────────────────────────────────┐
│ SICHERHEIT & UMGEBUNGSVARIABLEN (XX/25)      │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Secrets/Umgebungsvariablen           : XX/8
  • Cron-Auth-Guard                      : XX/8
  • CORS-/CSP-Headers                    : XX/5
  • Scoping von Marketplace-Credentials  : XX/4

Stärken:
- [Sicherheits-Stärken]

Probleme:
- [Sicherheits-Probleme]

┌─────────────────────────────────────────────┐
│ ISR/CACHING & TESTS (XX/25)                  │
└─────────────────────────────────────────────┘

Teilpunktzahlen:
  • Korrektheit von Cache-Control        : XX/8
  • Konfliktfreie Revalidierung          : XX/7
  • Handler-Testabdeckung                : XX/6
  • x-vercel-cache verifiziert           : XX/4

Stärken:
- [Caching-/Test-Stärken]

Probleme:
- [Caching-/Test-Probleme]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP-3-PRIORITÄTSMASSNAHMEN (ALLE KATEGORIEN):

1. KRITISCH - [Maßnahme Nr. 1]
   Kategorie : [Architektur/Laufzeit/Sicherheit/Caching]
   Impact    : [Hoch/Mittel/Niedrig]
   Aufwand   : [Hoch/Mittel/Niedrig]
   Priorität : SOFORT

   Detaillierte Beschreibung:
   [Erläuterung des Problems und vorgeschlagene Lösung]

   Betroffene Dateien:
   - [Datei:Zeile]

   Korrekturbeispiel:
   [Code oder Korrekturbefehl]

2. WICHTIG - [Maßnahme Nr. 2]
   [Gleiches Format...]

3. EMPFOHLEN - [Maßnahme Nr. 3]
   [Gleiches Format...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUICK WINS (Hoher Impact / Geringer Aufwand):

- [Quick Win Nr. 1] - Kategorie: [X] - Impact: [X] - Aufwand: [X]
- [Quick Win Nr. 2] - Kategorie: [X] - Impact: [X] - Aufwand: [X]
- [Quick Win Nr. 3] - Kategorie: [X] - Impact: [X] - Aufwand: [X]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPFOHLENER AKTIONSPLAN:

WOCHE 1 (Sofort):
- [ ] [Kritische Maßnahme Nr. 1]
- [ ] [Prioritärer Quick Win]

WOCHE 2-4 (Kurzfristig):
- [ ] [Wichtige Maßnahme Nr. 2]
- [ ] [Weitere Quick Wins]

MONAT 2-3 (Mittelfristig):
- [ ] [Empfohlene Maßnahme Nr. 3]
- [ ] [Schrittweise Verbesserungen]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EXECUTIVE SUMMARY:

[Zusammenfassender Absatz zum Gesamtzustand des Projekts, wesentlichen Stärken,
wesentlichen Schwächen und empfohlener Trajektorie zur Verbesserung der
Compliance. Angeben, ob das Projekt produktionsreif ist, Korrekturen
erfordert oder ein Refactoring benötigt.]

Gesamtempfehlung: [Produktionsreif / Geringfügige Korrekturen /
Größeres Refactoring / Überarbeitung notwendig]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## WICHTIGE HINWEISE

- Dieser Befehl orchestriert die 4 von `@vercel-reviewer` abgedeckten Kategorien
- Für alle Analysewerkzeuge Docker verwenden
- Konkrete Beispiele mit Datei:Zeile für jedes Problem liefern
- Maßnahmen nach der Impact-/Aufwand-Matrix priorisieren
- Ein ungeschützter Cron-Endpunkt und ein hartkodiertes Secret haben IMMER oberste Priorität, wenn gefunden (sie erlauben jedem, der den Pfad/das Repo entdeckt, Jobs auszulösen oder Credentials zu exfiltrieren)
- Ein Befund von `runtime: 'edge'` bei neuem/geändertem Code wird immer markiert, blockiert aber niemals einen Bericht bei unverändertem Legacy-Code — als Migrationsschuld behandeln, nicht als harten Fehlschlag
- Automatisierbare Korrekturen vorschlagen (Skripte, Pre-Commit-Hooks)
- Der Bericht muss umsetzbar sein, nicht nur beschreibend
- Empfehlungen an die Projektform anpassen (nur-statisch / nur-Functions / ISR-aktiviert / Cron-aktiviert / hybrid)
- Next.js-spezifisches Routing/Rendering/Data-Fetching oder die Dev-Server-Integration irgendeines anderen Frameworks NICHT bewerten — außerhalb des Geltungsbereichs dieses Audits
