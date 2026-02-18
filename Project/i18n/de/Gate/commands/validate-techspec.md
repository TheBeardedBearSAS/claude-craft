---
description: Tech Spec gegen Quality Gate validieren (≥90%)
argument-hint: [techspec-datei]
---

# Tech Spec-Gate validieren

Eine technische Spezifikation gegen das Tech Spec Quality Gate validieren.
Die Tech Spec muss mindestens 90% erreichen, um zu bestehen.

## Argumente

$ARGUMENTS (format: [techspec-datei])
- **techspec-datei** (optional): Pfad zur Tech Spec-Datei. Standard: `docs/tech-spec.md`

## Gate-Kriterien

| Kriterium | Gewicht | Erforderlich | Beschreibung |
|-----------|---------|--------------|--------------|
| Architektur-Ueberblick | 12% | Ja | System-Design-Beschreibung |
| Architektur-Diagramm | 10% | Ja | Visuelle Darstellung |
| Komponenten | 12% | Ja | Modul-/Service-Definitionen |
| Datenmodell | 10% | Ja | Datenbank-/Entitaets-Design |
| API-Vertraege | 10% | Ja | Endpoint-Spezifikationen |
| Sicherheit | 12% | Ja | Auth und Sicherheitsmassnahmen |
| Performance | 8% | Nein | Performance-Anforderungen |
| Fehlerbehandlung | 8% | Nein | Fehlerstrategie |
| Teststrategie | 10% | Ja | Testansatz |
| Deployment | 8% | Nein | CI/CD und Release |

**Schwelle: 90%**

## Prozess

### Schritt 1: Tech Spec-Datei lokalisieren

1. Angegebenen Pfad oder Standard `docs/tech-spec.md` verwenden
2. Pruefen, ob Datei existiert
3. Inhalt zur Analyse laden

### Schritt 2: Jedes Kriterium validieren

Fuer jedes Kriterium:
- Relevante Abschnitte und Schluesselwoerter pruefen
- Existenz von Diagrammen pruefen (mermaid, Bilder)
- Technische Tiefe validieren

### Schritt 3: Punktzahl berechnen

Punktzahl = Summe der Gewichte validierter Kriterien

### Schritt 4: Bericht generieren

Detaillierte Ergebnisse mit Vorschlaegen anzeigen.

## Ausgabeformat

### Tech Spec validiert

```
═══════════════════════════════════════════════════════
          Tech Spec Quality Gate-Validierung
═══════════════════════════════════════════════════════

Datei: docs/tech-spec.md
Schwelle: 90%

Validierungsergebnisse:
──────────────────────────────────────────────────────
✅ Architektur-Ueberblick (12%)
   Gefunden: Clean Architecture mit 4 beschriebenen Schichten

✅ Architektur-Diagramm (10%)
   Gefunden: Mermaid-Diagramm im Abschnitt "System Design"

✅ Komponenten (12%)
   Gefunden: 6 Komponenten mit definierten Verantwortlichkeiten

✅ Datenmodell (10%)
   Gefunden: Entitaets-Definitionen mit Beziehungen

✅ API-Vertraege (10%)
   Gefunden: REST-Endpoints mit Request/Response-Schemas

✅ Sicherheit (12%)
   Gefunden: JWT-Auth, RBAC, Verschluesselung im Ruhezustand

✅ Performance (8%)
   Gefunden: Latenz-Ziele, Caching-Strategie

✅ Fehlerbehandlung (8%)
   Gefunden: Fehlercodes, Retry-Richtlinien

✅ Teststrategie (10%)
   Gefunden: Unit-, Integrations-, E2E-Testplaene

✅ Deployment (8%)
   Gefunden: CI/CD-Pipeline, Blue-Green-Deployment

Punktzahl: 100/100 (100%)
──────────────────────────────────────────────────────

✅ TECH SPEC-GATE VALIDIERT

Bereit fuer die Backlog-Erstellung.
Naechster Schritt: /arch:handoff po
═══════════════════════════════════════════════════════
```

### Tech Spec nicht validiert

```
═══════════════════════════════════════════════════════
          Tech Spec Quality Gate-Validierung
═══════════════════════════════════════════════════════

Datei: docs/tech-spec.md
Schwelle: 90%

Validierungsergebnisse:
──────────────────────────────────────────────────────
✅ Architektur-Ueberblick (12%)
❌ Architektur-Diagramm (10%)
   Fehlend: Kein Diagramm gefunden (mermaid, PNG, SVG)
✅ Komponenten (12%)
✅ Datenmodell (10%)
⚠️ API-Vertraege (10%)
   Teilweise: Endpoints gelistet, aber keine Schemas
❌ Sicherheit (12%)
   Fehlend: Keine Auth/Autorisierung definiert
✅ Performance (8%)
✅ Fehlerbehandlung (8%)
✅ Teststrategie (10%)
⚠️ Deployment (8%)
   Teilweise: CI erwaehnt, aber keine CD-Strategie

Punktzahl: 68/100 (68%)
──────────────────────────────────────────────────────

❌ TECH SPEC-GATE FEHLGESCHLAGEN (90% erforderlich, 68% erreicht)

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
1. Architektur-Diagramm hinzufuegen
   ```mermaid
   graph TB
     Client --> API[API Gateway]
     API --> Service[Business Logic]
     Service --> DB[(Database)]
   ```

2. Sicherheitsstrategie definieren
   - Authentifizierungsmethode (JWT, OAuth2)
   - Autorisierungsmodell (RBAC, ABAC)
   - Datenverschluesselungsansatz

3. API-Vertraege mit Schemas vervollstaendigen
   - JSON Request/Response-Schemas
   - Fehlerantwort-Formate
   - Versionierungsstrategie

4. Deployment-Strategie hinzufuegen
   - CI/CD-Pipeline-Schritte
   - Umgebungspromotion
   - Rollback-Verfahren

Nach Korrekturen erneut ausfuehren: /gate:validate-techspec
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-techspec
/gate:validate-techspec docs/auth-tech-spec.md
```

## Architektur-Review

Erwaegen Sie die Erstellung eines ADR fuer bedeutende Entscheidungen:
```
/arch:adr "JWT vs. sitzungsbasierte Authentifizierung"
```

Gate-Konfiguration: `.bmad/gates/techspec-gate.yaml`

## Nächster Schritt

```
╔══════════════════════════════════════════════════════════╗
║                   NÄCHSTER SCHRITT                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Wenn PASS (≥ Schwellenwert):                            ║
║  → /gate:validate-backlog                                ║
║    Backlog validieren                                    ║
║                                                          ║
║  Wenn FAIL (< Schwellenwert):                            ║
║  → Technische Spezifikation korrigieren                  ║
║  → /gate:validate-techspec (erneut nach Korrekturen)     ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
