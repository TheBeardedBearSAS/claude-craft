---
name: setup-project-context
description: Codebase analysieren und Projektkontext interaktiv konfigurieren
arguments:
  - name: mode
    description: Erkennungsmodus (--auto minimale Fragen, --full umfassender Fragebogen)
    required: false
---

# Projektkontext Einrichten

Konfiguriert `.claude/rules/00-project-context.md` durch Analyse der Codebase und gezielte Fragen.

## Ausfuehrung

### Phase 1: Automatische Erkennung

Folgende Dateien und Verzeichnisse analysieren:

**Konfigurationsdateien:**
- `package.json` → Node.js Projektname, Abhangigkeiten, Skripte
- `composer.json` → PHP Projektname, Abhangigkeiten, Framework
- `pubspec.yaml` → Flutter/Dart Projektname, Abhangigkeiten
- `requirements.txt` / `pyproject.toml` → Python Abhangigkeiten
- `Cargo.toml` → Rust Projekt
- `go.mod` → Go Modul

**Umgebung & Konfiguration:**
- `.env`, `.env.example` → Datenbank, Dienste
- `config/` → Framework-Konfiguration
- `docker-compose.yml` → Dienste (DB, Redis, etc.)

**Struktur:**
- `src/`, `lib/`, `app/` → Quellcode-Speicherort
- `tests/`, `spec/` → Testing-Framework
- `docs/`, `specifications/` → Dokumentation
- `.github/`, `.gitlab-ci.yml` → CI/CD

**Domane (falls zutreffend):**
- `src/Entity/`, `src/Domain/` → Geschaftsentitaten (PHP/Symfony)
- `lib/models/`, `lib/domain/` → Modelle (Flutter/Dart)
- `models/`, `schemas/` → Datenmodelle
- `migrations/` → Datenbankschema

Analyseergebnisse anzeigen:

```
╔══════════════════════════════════════════════════════════════╗
║             PROJEKTANALYSE-ERGEBNISSE                         ║
╚══════════════════════════════════════════════════════════════╝

✅ Erkannte Informationen:
┌─────────────────┬────────────────────────────────┐
│ Element         │ Wert                           │
├─────────────────┼────────────────────────────────┤
│ Projektname     │ {erkannter_name}               │
│ Sprache         │ {erkannte_sprache}             │
│ Framework       │ {erkanntes_framework}          │
│ Datenbank       │ {erkannte_datenbank}           │
│ Testing         │ {erkanntes_testing}            │
│ CI/CD           │ {erkanntes_cicd}               │
└─────────────────┴────────────────────────────────┘

📁 Projektstruktur:
{erkannte_struktur}

📄 Gefundene Dokumentation:
{gefundene_docs}

❌ Nicht Erkannt (wird abgefragt):
- {fehlende_elemente}
```

### Phase 2: Interaktive Fragen

Nur nach Informationen fragen, die in Phase 1 NICHT erkannt wurden.
Fragen uberspringen, wenn `--auto` Modus verwendet wird und ein vernunftiger Standardwert existiert.

**Wesentliche Fragen:**

1. **Anwendungstyp** (falls nicht erkannt):
   ```
   Welcher Anwendungstyp ist das?
   [ ] REST API      [ ] Webanwendung      [ ] Mobile App
   [ ] CLI-Tool      [ ] Bibliothek/Paket  [ ] Monorepo
   ```

2. **Geschaftsdomane**:
   ```
   Was ist die Geschaftsdomane?
   [ ] E-Commerce    [ ] SaaS-Plattform    [ ] FinTech
   [ ] HealthTech    [ ] EdTech            [ ] Social/Community
   [ ] Medien/Inhalt [ ] IoT               [ ] Andere: _____
   ```

3. **Zielbenutzer** (2-3 Personas):
   ```
   Beschreiben Sie Ihre Hauptbenutzer:

   Primarer Benutzer:
   > Rolle: _____
   > Hauptziel: _____

   Sekundarer Benutzer (optional):
   > Rolle: _____
   > Hauptziel: _____
   ```

4. **Compliance-Anforderungen**:
   ```
   Welche Compliance-Anforderungen gelten?
   [ ] DSGVO (EU-Datenschutz)
   [ ] HIPAA (US-Gesundheitswesen)
   [ ] PCI-DSS (Zahlungskarten)
   [ ] SOC2 (Sicherheit)
   [ ] Keine / Nicht zutreffend
   ```

**Erweiterte Fragen** (nur mit `--full` Modus):

5. **Geschaftsziele**:
   ```
   Kurzfristige Ziele (3-6 Monate):
   > _____

   Mittelfristige Ziele (6-12 Monate):
   > _____
   ```

6. **Bekannte Probleme/Technische Schulden**:
   ```
   Gibt es bekannte Probleme oder technische Schulden zu dokumentieren?
   > _____
   ```

7. **Glossarbegriffe**:
   ```
   Wichtige Geschaftsbegriffe zum Definieren (kommagetrennt):
   > _____
   ```

### Phase 3: Kontextdatei Generieren

`.claude/rules/00-project-context.md` erstellen:

```markdown
# Projektkontext - {PROJEKTNAME}

> Automatisch generiert von `/common:setup-project-context` am {DATUM}
> Nach Bedarf uberprufen und anpassen.

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## Ubersicht

**{PROJEKTNAME}** ist eine {TYP}-Anwendung fur die {DOMANE}-Domane.

{BESCHREIBUNG_AUS_README_ODER_BENUTZER}

## Technischer Stack

| Komponente   | Technologie          |
|--------------|----------------------|
| Sprache      | {SPRACHE}            |
| Framework    | {FRAMEWORK}          |
| Datenbank    | {DATABASE}           |
| Cache        | {CACHE_FALLS_ERKANNT}|
| Testing      | {TEST_FRAMEWORKS}    |
| CI/CD        | {CICD_PLATTFORM}     |

## Projektstruktur

```
{ERKANNTE_STRUKTUR}
```

## Geschaftsdomane

### Kernkonzepte

{ENTITATEN_FALLS_ERKANNT}

### Bounded Contexts

<!-- Hinzufugen bei DDD-Verwendung -->
- Kontext 1: ...
- Kontext 2: ...

## Benutzer & Personas

### {PRIMARER_BENUTZER_ROLLE}
- **Ziel:** {PRIMARER_BENUTZER_ZIEL}
- **Schmerzpunkte:** Zu dokumentieren
- **Wichtige Workflows:** Zu dokumentieren

### {SEKUNDARER_BENUTZER_ROLLE}
- **Ziel:** {SEKUNDARER_BENUTZER_ZIEL}
- **Schmerzpunkte:** Zu dokumentieren
- **Wichtige Workflows:** Zu dokumentieren

## Einschrankungen

### Compliance
{COMPLIANCE_ANFORDERUNGEN}

### Leistungsziele
- Seitenladezeit: < 3s
- API-Antwortzeit: < 200ms
- Verfugbarkeit: 99.9%

### Sicherheitsanforderungen
- OWASP Top 10 Konformitat
- Eingabevalidierung an allen Endpunkten
- Authentifizierung fur geschutzte Ressourcen erforderlich

## Ziele

### Kurzfristig
{KURZFRISTIGE_ZIELE_ODER_PLATZHALTER}

### Mittelfristig
{MITTELFRISTIGE_ZIELE_ODER_PLATZHALTER}

## Bekannte Probleme / Technische Schulden

{PROBLEME_ODER_PLATZHALTER}

## Glossar

| Begriff | Definition |
|---------|------------|
{GLOSSARBEGRIFFE_ODER_BEISPIELE}
```

### Phase 4: Validierung & Nachste Schritte

Zusammenfassung und Empfehlungen anzeigen:

```
╔══════════════════════════════════════════════════════════════╗
║              PROJEKTKONTEXT GENERIERT                         ║
╚══════════════════════════════════════════════════════════════╝

✅ Datei erstellt: .claude/rules/00-project-context.md

Zusammenfassung:
┌─────────────────┬────────────────────────────────┐
│ Projekt         │ {PROJEKTNAME}                  │
│ Typ             │ {TYP}                          │
│ Stack           │ {FRAMEWORK} + {DATABASE}       │
│ Domane          │ {DOMANE}                       │
│ Compliance      │ {COMPLIANCE}                   │
│ Personas        │ {ANZAHL} definiert             │
└─────────────────┴────────────────────────────────┘

📋 Empfohlene Nachste Schritte:

1. Generierte Datei uberprufen und Platzhalterabschnitte ausfullen
2. Detaillierte Bounded Contexts hinzufugen falls DDD verwendet wird
3. Wichtige Geschaftsworkflows dokumentieren
4. Spezialisierte Agenten ausfuhren erwagen:
   - @database-architect → Datenbankschema dokumentieren
   - @api-designer → API-Endpunkte dokumentieren
   - @security-reviewer → Sicherheitseinschrankungen uberprufen

Mochten Sie, dass ich die Datei zur Uberprufung offne?
```

## Modi

| Modus | Verhalten |
|-------|-----------|
| (Standard) | Erkennung + wesentliche Fragen (Typ, Domane, Benutzer, Compliance) |
| `--auto` | Maximale Auto-Erkennung, Fragen mit vernunftigen Standardwerten uberspringen |
| `--full` | Alle Fragen einschliesslich Ziele, Probleme und Glossar |

## Beispiele

```bash
# Standardmodus - ausgewogene Erkennung und Fragen
/common:setup-project-context

# Auto-Modus - minimale Interaktion
/common:setup-project-context --auto

# Vollstandiger Modus - umfassender Fragebogen
/common:setup-project-context --full
```
