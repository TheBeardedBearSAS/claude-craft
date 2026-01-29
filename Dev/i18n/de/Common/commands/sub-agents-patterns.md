# Sub-Agents Patterns

Leitfaden zur effektiven Nutzung von Sub-Agents in Claude Code fuer parallele und komplexe Aufgaben.

## Agent-Typen

### 1. Explore Agent (Schnelle Recherche)
Verwenden Sie diesen Typ fuer schnelle Codebase-Exploration und Informationssammlung.

```
Task Tool mit subagent_type: "Explore"
- Schnelle Dateimustersuche
- Schluesselwortsuche im Code
- Verstaendnis der Codebase-Struktur
```

**Wann zu verwenden:**
- Suche nach Dateien anhand von Mustern
- Suche nach spezifischen Code-Patterns
- Beantwortung von Fragen zur Codebase-Organisation

### 2. General-Purpose Agent (Komplexe Aufgaben)
Verwenden Sie diesen Typ fuer mehrstufige Aufgaben, die Autonomie erfordern.

```
Task Tool mit subagent_type: "general-purpose"
- Komplexes Refactoring
- Multi-File-Aktualisierungen
- Recherche und Implementierung
```

**Wann zu verwenden:**
- Aufgaben, die mehrere Dateien umfassen
- Unabhaengige Teilaufgaben, die parallel ausgefuehrt werden koennen
- Aufgaben, die Urteilsvermoegen und Iteration erfordern

### 3. Plan Agent (Architektur)
Verwenden Sie diesen Typ zur Gestaltung von Implementierungsstrategien.

```
Task Tool mit subagent_type: "Plan"
- Implementierungsplanung
- Architekturentscheidungen
- Trade-off-Analyse
```

**Wann zu verwenden:**
- Vor der Implementierung komplexer Features
- Wenn mehrere Ansaetze moeglich sind
- Fuer Architekturentscheidungen

## Parallel Task Patterns

### Pattern 1: Parallele Recherche
Starten Sie mehrere Explore Agents fuer verschiedene Aspekte:

```
# Parallel starten (einzelne Nachricht mit mehreren Tool-Aufrufen):
- Agent 1: Suche nach Authentifizierungs-Patterns
- Agent 2: Suche nach API-Endpoints
- Agent 3: Suche nach Datenbankmodellen
```

### Pattern 2: Parallele Aktualisierungen
Fuer unabhaengige Dateiaktualisierungen ueber Sprachen/Module hinweg:

```
# Parallel starten:
- Agent 1: Franzoesische Templates aktualisieren
- Agent 2: Spanische Templates aktualisieren
- Agent 3: Deutsche Templates aktualisieren
- Agent 4: Portugiesische Templates aktualisieren
```

### Pattern 3: Parallele Qualitaetspruefungen
Fuehren Sie verschiedene Qualitaetspruefungen gleichzeitig aus:

```
# Parallel starten:
- Agent 1: Linter ausfuehren
- Agent 2: Tests ausfuehren
- Agent 3: Typen pruefen
- Agent 4: Sicherheitsaudit
```

## Background Agents

Verwenden Sie `run_in_background: true` fuer lang laufende Aufgaben:

```
Task Tool mit:
  run_in_background: true

Vorteile:
- Weiterarbeiten waehrend der Agent laeuft
- Fortschritt ueber Ausgabedatei pruefen
- Benachrichtigung bei Abschluss
```

**Am besten geeignet fuer:**
- Testsuiten
- Build-Prozesse
- Grosse Migrationen
- Qualitaets-Pipelines

## Best Practices

### Empfohlen
- Starten Sie unabhaengige Aufgaben parallel (einzelne Nachricht, mehrere Tools)
- Verwenden Sie Explore Agent fuer schnelle Suchen
- Verwenden Sie den Hintergrundmodus fuer lange Aufgaben
- Geben Sie klare, detaillierte Prompts an

### Vermeiden
- Abhaengige Aufgaben parallel starten
- Agents fuer einfaches Lesen einzelner Dateien verwenden
- Vergessen, Background Agent-Ergebnisse zu pruefen
- Vage Prompts verwenden, die Klaerung erfordern

## Beispiel: Multi-Language Update

```markdown
# Aufgabe: Alle i18n-Templates auf neues Format aktualisieren

## Parallele Ausfuehrung:
1. 4 Agents starten (FR, ES, DE, PT) mit run_in_background: true
2. Mit anderen Phasen fortfahren
3. Ergebnisse pruefen, wenn benachrichtigt

## Jeder Agent erhaelt:
- Liste der zu aktualisierenden Dateien
- Zu befolgendes Template-Format
- Anweisungen zum Lesen vor dem Schreiben
```

## Coordination Patterns

### Sequentiell mit Checkpoints
Fuer Aufgaben mit Abhaengigkeiten:

```
1. Agent A schliesst Aufgabe A ab
2. Ergebnis pruefen
3. Agent B verwendet Ergebnis fuer Aufgabe B
4. Ergebnis pruefen
5. Fortfahren...
```

### Fan-Out/Fan-In
Fuer parallele Arbeit mit kombinierten Ergebnissen:

```
1. Fan-out: N parallele Agents starten
2. Warten: Alle Agents abgeschlossen
3. Fan-in: Ergebnisse kombinieren/verifizieren
4. Mit zusammengefuehrtem Zustand fortfahren
```

## Referenzen

- Claude Code Task Tool-Dokumentation
- `.claude/rules/01-workflow-analysis.md` fuer Analyse-Patterns
- `.claude/settings.json` fuer Berechtigungskonfiguration
