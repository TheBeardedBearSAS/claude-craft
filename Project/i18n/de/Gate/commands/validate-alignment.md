---
description: Spec-Code-Alignment validieren, um sicherzustellen, dass die Implementierung den Spezifikationen entspricht
argument-hint: [story-id]
---

# Spec-Code-Alignment validieren

Validieren, dass die Code-Implementierung mit den Spezifikationen übereinstimmt (PRD, User Stories, technische Spezifikation). Dieses Gate stellt sicher, dass während der Implementierung keine Spezifikationsabweichung aufgetreten ist.

## Argumente

$ARGUMENTS (Format: [story-id])
- **story-id** (optional): Story-ID zur Überprüfung. Standard: alle Stories im aktuellen Sprint

## Gate-Kriterien

| Kriterium | Gewicht | Erforderlich | Beschreibung |
|-----------|---------|-------------|--------------|
| Requirement-Abdeckung | 20% | Ja | Alle FR-xxx aus dem PRD durch Stories abgedeckt |
| Story-Code-Mapping | 20% | Ja | Alle Stories haben entsprechende Code-Referenzen |
| AC-Test-Mapping | 20% | Ja | Alle Abnahmekriterien haben entsprechende Tests |
| Einhaltung der technischen Spezifikation | 15% | Ja | Implementierung folgt dem Design der technischen Spezifikation |
| Konstitutions-Konformität | 15% | Ja | Code respektiert die Projektkonstitution |
| Abweichungserkennung | 10% | Nein | Keine nicht referenzierten Code-Änderungen |

**Schwellenwert: 85%**

## Prozess

### Schritt 1: Spezifikationen laden

1. PRD mit FR-xxx Requirement-IDs laden
2. User Stories mit `Implements:`-Referenzen laden
3. Technische Spezifikation mit Requirement-Mapping laden
4. Projektkonstitution laden (falls vorhanden)

### Schritt 2: Vorwärts-Tracing (Spec → Code)

Für jedes Requirement FR-xxx im PRD:
1. Stories finden, die es implementieren (`Implements: FR-xxx`)
2. Für jede Story Code-Dateien mit `// Story: US-xxx` finden
3. Für jedes AC den entsprechenden Test finden
4. Abdeckungsstatus aufzeichnen

### Schritt 3: Rückwärts-Tracing (Code → Spec)

Für jede Code-Datei mit Story-Referenzen:
1. Überprüfen, dass die Story-Referenz im Backlog existiert
2. Überprüfen, dass die Story dem richtigen Sprint zugeordnet ist
3. Nach Code-Änderungen ohne Story-Referenzen suchen (Abweichung)

### Schritt 4: Konstitution validieren

Falls `project-management/constitution.md` existiert:
1. Einhaltung technischer Einschränkungen prüfen
2. Einhaltung der Design-Prinzipien überprüfen
3. NFR-Ziele überprüfen

### Schritt 5: Bewerten und berichten

Gewichtete Bewertung über alle Kriterien berechnen. Detaillierten Bericht generieren.

## Ausgabeformat

### Gate bestanden

```
╔══════════════════════════════════════════════════════════╗
║          SPEC-CODE-ALIGNMENT-GATE ✅                     ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Bewertung: 92%                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Requirement-Abdeckung      3/3 FR-xxx abgedeckt       ║
║ ✅ Story-Code-Mapping         4 Dateien ref. US-012      ║
║ ✅ AC-Test-Mapping            3/3 ACs haben Tests        ║
║ ✅ Tech-Spec-Einhaltung       Design entspricht Spec     ║
║ ✅ Konstitutions-Konformität  Alle Einschränkungen OK    ║
║ ⚠️  Abweichungserkennung      1 nicht ref. Datei         ║
║                                                          ║
║ → Alignment verifiziert, bereit für Merge                ║
╚══════════════════════════════════════════════════════════╝
```

### Gate nicht bestanden

```
╔══════════════════════════════════════════════════════════╗
║          SPEC-CODE-ALIGNMENT-GATE ❌                     ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Bewertung: 65%                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Requirement-Abdeckung      3/3 FR-xxx abgedeckt       ║
║ ❌ Story-Code-Mapping         2 Dateien ohne Referenzen  ║
║ ❌ AC-Test-Mapping            AC-2 hat keinen Test       ║
║ ✅ Tech-Spec-Einhaltung       Design entspricht Spec     ║
║ ❌ Konstitutions-Konformität  Perf-NFR nicht erreicht    ║
║ ⚠️  Abweichungserkennung      3 nicht ref. Dateien       ║
║                                                          ║
║ Erforderliche Aktionen:                                  ║
║ 1. // Story: US-012 zu ProfileService.ts hinzufügen     ║
║ 2. // Story: US-012 zu ProfileValidator.ts hinzufügen   ║
║ 3. Test für AC-2 schreiben: Benutzer kann E-Mail ändern ║
║ 4. Profil-API optimieren für <200ms-Ziel                ║
║                                                          ║
║ → Probleme vor dem Merge beheben                         ║
╚══════════════════════════════════════════════════════════╝
```

## Beispiel

```
/gate:validate-alignment US-012
/gate:validate-alignment          # Alle Stories im aktuellen Sprint
```

## Verwandte Befehle

- `/project:trace` — Rückverfolgbarkeitsmatrix anzeigen
- `/project:coverage-map` — Requirement-Abdeckung prüfen
- `/project:checkpoint` — Phasen-Checkpoints ausführen
- `/gate:validate-story` — Story-Vollständigkeit validieren
