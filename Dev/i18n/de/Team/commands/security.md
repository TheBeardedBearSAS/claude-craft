---
description: Sicherheits-Review-Team - Paralleles mehrdimensionales Sicherheitsaudit mit Agent Teams
argument-hint: [--scope=full|code|deps|infra] [--max-workers=3]
---

# Sicherheits-Review-Team - Paralleles mehrdimensionales Sicherheitsaudit

Ein umfassendes Sicherheitsaudit mit Claude Code Agent Teams (v2.1.32+) orchestrieren. Startet einen Sicherheits-Lead (opus) plus 3 spezialisierte Haiku-Reviewer, die jeweils eine andere Sicherheitsdimension parallel analysieren: Quellcode-Schwachstellen, Dependency-/Lieferketten-Analyse und Infrastruktur-/Konfigurationsüberprüfung.

## Argumente

$ARGUMENTS

- `--scope=full`: Audit-Umfang (Standard: `full`). Optionen: `full`, `code`, `deps`, `infra`
- `--max-workers=3`: Maximale parallele Reviewer (Standard: 3, max: 3)
- `--severity=medium`: Minimaler Schweregrad für Berichte: `low`, `medium`, `high`, `critical`
- `--output-dir=<path>`: Benutzerdefiniertes Ausgabeverzeichnis für Sicherheitsergebnisse
- `--dry-run`: Team-Zusammensetzung und Scan-Plan anzeigen, ohne auszuführen
- `--sarif`: Ergebnisse im SARIF-Format ausgeben (für CI/CD-Integration)
- `--max-cost=<dollars>`: Maximales Budget in Dollar. Wenn die geschaetzten Parallelkosten diesen Schwellenwert ueberschreiten, wird die Ausfuehrung mit einer OVER BUDGET Meldung blockiert

## Voraussetzungen

- Claude Code v2.1.32+ mit Agent-Teams-Unterstützung
- `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` Umgebungsvariable gesetzt
- Docker verfügbar für Sicherheitsscanner
- `Tools/AgentTeams/lib/compatibility-check.sh` verfügbar
- `Tools/AgentTeams/lib/result-aggregator.sh` verfügbar
- `Tools/AgentTeams/lib/cost-estimator.sh` verfügbar

## Garde-Fou Fast Mode (Blockierende Bestaetigung)

**OBLIGATORISCH**: Vor dem Start des Teams MUSS der Security Lead:

1. Erkennen, ob der Fast Mode aktiv ist (Lightning-Bolt-Indikator im Terminal)
2. Wenn Fast Mode aktiv:
   - Vergleichs-Dashboard Standard vs. Fast via `cost-estimator.sh --fast-mode` anzeigen
   - **Blockierende Warnung** mit verglichenen Kosten anzeigen:
     ```
     ⚠️  FAST MODE ERKANNT — Opus-Kosten 6x hoeher!

     | Modus     | Input ($/M) | Output ($/M) | Geschaetzte Kosten dieser Review |
     |-----------|-------------|--------------|----------------------------------|
     | Standard  | $5.00       | $25.00       | ~$X.XX                           |
     | Fast      | $30.00      | $150.00      | ~$Y.YY                           |

     Moechten Sie im Fast Mode fortfahren? (ja/nein)
     Empfehlung: Tippen Sie /fast, um vor dem Fortfahren zu deaktivieren.
     ```
   - **Warten auf explizite Bestaetigung** des Benutzers vor dem Fortfahren
   - Wenn der Benutzer ablehnt, abbrechen mit Nachricht, die `/fast` zum Deaktivieren vorschlaegt

## Team-Zusammensetzung

| Rolle | Modell | Agent | Verantwortlichkeit |
|-------|--------|-------|--------------------|
| Sicherheits-Lead | opus | Custom (Team-Lead) | Orchestrierung, Bedrohungsmodellierung, Bericht |
| Code-Reviewer | haiku | `{tech}-reviewer` | Quellcode-Schwachstellenanalyse |
| Dependency-Auditor | haiku | `{tech}-reviewer` | Lieferkette, CVEs, Lizenz-Compliance |
| Infra-Reviewer | haiku | `devops-engineer` oder `docker-architect` | Container-Sicherheit, Geheimnisse, Konfiguration |

**Teamgröße**: 4 Agents (1 Lead + 3 Worker). Feste Zusammensetzung für Sicherheits-Reviews.

## Prozess

### Schritt 1: Projekt-Aufklärung

Der Sicherheits-Lead führt eine erste Aufklärung durch:

1. Technologie-Stacks erkennen (gleich wie beim Full-Audit)
2. Einstiegspunkte identifizieren: API-Endpoints, Formulare, Datei-Uploads
3. Angriffsfläche kartieren: öffentliche Routen, Authentifizierungsgrenzen, Datenflüsse
4. Bedrohungsmodell-Entwurf erstellen (STRIDE-Kategorien)

### Schritt 2: Kompatibilitätsprüfung

```bash
# Code-Reviewer-Agent auf erforderliche Tools prüfen
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/<Tech>/agents/<tech>-reviewer.md \
  --require-tools Read,Glob,Grep,Bash

# Infra-Reviewer prüfen
Tools/AgentTeams/lib/compatibility-check.sh \
  --agent Dev/i18n/en/Common/agents/devops-engineer.md \
  --require-tools Read,Glob,Grep,Bash
```

### Schritt 3: Team starten (Fan-Out)

**Kostenschaetzung**: Der Security Lead schaetzt die Kosten via `cost-estimator.sh --task-type security --techs <worker_count>`.

**Budgetgarantie**: Wenn `--max-cost` angegeben ist, pruefen dass geschaetzte Kosten <= max_cost. Bei Ueberschreitung: `OVER BUDGET` anzeigen, abbrechen.

**Lean Context pro Worker**: Jeder Reviewer erhaelt nur den fuer seine Dimension notwendigen Kontext:
- Code Reviewer → `@.claude/references/<tech>/CLAUDE.md` + Liste der Quelldateien
- Dependency-Auditor → Liste der Lockfiles (composer.lock, package-lock.json, etc.)
- Infra-Reviewer → Dockerfiles, docker-compose.yml, CI/CD-Configs

```
Sicherheits-Lead (opus) — orchestriert über TaskCreate/SendMessage
  |
  +-- [Parallele Reviewer] --------------------+
  |   Code-Reviewer (haiku): Quellcodeanalyse   |
  |   Dependency-Auditor (haiku): Lieferkette    |
  |   Infra-Reviewer (haiku): Konfiguration      |
  +----------------------------------------------+
  |
  v (Synchronisationsbarriere)
  |
  Sicherheits-Lead: Korrelieren, priorisieren, berichten
```

Der Lead erstellt 3 Aufgaben via `TaskCreate`:

**Strukturiertes Spawn-Template (TaskCreate)**: Der Lead MUSS in jede Aufgabe einfuegen:
```
Subject: "Security Review <dimension>"
Description:
  Projekt: <projektname>
  Dimension: <code|deps|infra>
  Scope: <zu analysierende Dateien/Verzeichnisse>
  Tools: <zu verwendende Docker-Befehle>
  Ausgabeformat: Findings im Format { severity, category, file, description }
activeForm: "Security Review <dimension>"
```

#### Aufgabe A: Quellcode-Sicherheitsreview

**Umfang**: Analyse von Schwachstellen im Anwendungsquellcode

| Prüfung | Wonach suchen | OWASP-Kategorie |
|---------|--------------|-----------------|
| Injection | SQL, NoSQL, OS-Command, LDAP-Injection-Muster | A03:2021 |
| XSS | Nicht-escaped Ausgaben, innerHTML, dangerouslySetInnerHTML | A03:2021 |
| Authentifizierung | Schwache Passwortrichtlinien, fehlendes MFA, Session-Fixierung | A07:2021 |
| Autorisierung | Fehlende Zugriffskontrollen, IDOR, Privilegieneskalation | A01:2021 |
| Kryptografie | Schwache Algorithmen, fest codierte Schlüssel, unsichere Zufallszahlen | A02:2021 |
| Eingabevalidierung | Fehlende Bereinigung, Typ-Umwandlung, Datei-Upload | A03:2021 |
| Fehlerbehandlung | Stack-Traces in Antworten, ausführliche Fehlermeldungen | A05:2021 |
| Protokollierung | Sensible Daten in Logs, fehlender Audit-Trail | A09:2021 |

**Docker-Befehle pro Stack**:

```bash
# PHP/Symfony
docker compose exec php vendor/bin/phpstan analyse --level=max
docker compose exec php php bin/console security:check

# React/Node
docker compose exec node npm run lint -- --rule 'no-eval: error'
docker compose exec node npx eslint --plugin security .

# Python
docker compose exec app bandit -r src/
docker compose exec app ruff check --select S .

# Allgemein (alle Stacks)
# Grep-Muster für häufige Schwachstellen
# Suche nach: eval(, exec(, system(, shell_exec(, innerHTML, dangerouslySetInnerHTML
# Suche nach: fest codierten Passwörtern, API-Schlüsseln, Tokens im Quellcode
```

#### Aufgabe B: Dependency-/Lieferketten-Audit

**Umfang**: Schwachstellen- und Lizenzanalyse von Drittanbieter-Abhängigkeiten

| Prüfung | Was zu analysieren ist |
|---------|----------------------|
| Bekannte CVEs | Alle direkten und transitiven Abhängigkeiten |
| Schweregrad | Kritische und hohe CVEs, die sofortiges Handeln erfordern |
| Lizenz-Compliance | Copyleft-Lizenzen in proprietären Projekten |
| Veraltete Pakete | Pakete mit verfügbaren Sicherheits-Patches |
| Typosquatting | Verdächtige Paketnamen, die populären Paketen ähneln |
| Ungenutzte Deps | Deklarierte, aber nie importierte Abhängigkeiten |

**Docker-Befehle pro Stack**:

```bash
# PHP
docker compose exec php composer audit --format=json
docker compose exec php composer outdated --direct

# Node/React/Angular/Vue
docker compose exec node npm audit --json
docker compose exec node npm outdated

# Python
docker compose exec app pip-audit --format=json
docker compose exec app pip list --outdated

# Flutter/Dart
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated --json

# C#/.NET
docker compose exec app dotnet list package --vulnerable
docker compose exec app dotnet list package --outdated
```

#### Aufgabe C: Infrastruktur-/Konfigurationssicherheitsreview

**Umfang**: Docker, Deployment-Konfiguration, Geheimnissverwaltung

| Prüfung | Was zu analysieren ist |
|---------|----------------------|
| Dockerfile-Sicherheit | Base-Image-Pinning, Nicht-Root-Benutzer, Multi-Stage-Builds |
| Geheimnisse-Exposition | .env-Dateien, fest codierte Anmeldedaten, unverschlüsselte Geheimnisse |
| Docker Compose | Privilegierte Container, exponierte Ports, Volume-Mounts |
| Netzwerk-Richtlinien | Unnötige Port-Exposition, fehlende Netzwerkisolierung |
| TLS/SSL | Zertifikatsvalidierung, Protokollversionen, Cipher-Suites |
| CI/CD-Sicherheit | Secret-Injection, Pipeline-Berechtigungen, Artefakt-Integrität |
| Dateiberechtigungen | Weltweit lesbare Configs, .git-Exposition, Backup-Dateien |

**Scan-Befehle**:

```bash
# Docker-Sicherheit
docker compose config --quiet  # Compose-Syntax validieren
# Dockerfiles prüfen auf: USER root, latest-Tags, ADD vs COPY

# Geheimnisse-Scan
# Suche nach: .env-Dateien nicht in .gitignore
# Suche nach: AWS_SECRET, PRIVATE_KEY, password=, token= im Quellcode
# Suche nach: base64-codierten Geheimnissen, SSH-Schlüsseln im Repository

# Konfigurationsprüfung
# Prüfen: CORS-Richtlinien, CSP-Header, HSTS
# Prüfen: Debug-Modus in Produktions-Configs deaktiviert
# Prüfen: Rate-Limiting konfiguriert
```

### Schritt 4: Synchronisationsbarriere

Sicherheits-Lead wartet, bis alle 3 Reviewer-Aufgaben abgeschlossen sind.

**Polling-Kadenz (B5)**: `TaskList` alle 30 Sekunden. Nach 3 aufeinanderfolgenden Polls ohne Aenderung, auf 60 Sekunden reduzieren. Verwenden Sie `TeammateIdle`/`TaskCompleted` Hooks (v2.1.33+), falls verfuegbar.

**Nachrichten-Verbositaet (B4)**: Reviewer MUESSEN ihre Completion-Nachrichten auf < 50 Token begrenzen. Format: `DONE: <dimension> <findings_count> findings (<critical>C/<high>H/<medium>M)`. Details in die Ergebnisdatei schreiben.

**Lead-Kontextwiederherstellung (A6)**: Um den Context-Compaction-Bug (#23620) abzumildern, MUSS der Lead `TaskList` nach jeder Reviewer-Completion neu lesen, um sein Bewusstsein fuer den Team-Status aufzufrischen.

Timeout: 8 Minuten pro Reviewer. Wenn ein Reviewer das Timeout überschreitet, fährt der Lead mit den verfügbaren Ergebnissen fort und vermerkt die Lücke.

### Schritt 5: Korrelation und Priorisierung

Der Sicherheits-Lead korreliert Befunde über alle 3 Dimensionen:

1. **Querverweise**: Eine vulnerable Abhängigkeit (Aufgabe B), die in einem injection-anfälligen Codepfad (Aufgabe A) verwendet wird, wird auf Kritisch hochgestuft
2. **Angriffsketten-Analyse**: Befunde kombinieren, um mehrstufige Angriffspfade zu identifizieren
3. **Deduplizierung**: Gleiche Befunde von mehreren Reviewern werden zusammengeführt
4. **Priorisierung**: Jeden Befund nach Schweregrad x Ausnutzbarkeit x Auswirkung bewerten

**Schweregrad-Matrix**:

| Schweregrad | CVSS-Bereich | Reaktion |
|-------------|-------------|----------|
| Kritisch | 9,0 - 10,0 | Sofortige Behebung erforderlich |
| Hoch | 7,0 - 8,9 | Behebung im aktuellen Sprint |
| Mittel | 4,0 - 6,9 | Für nächsten Sprint einplanen |
| Niedrig | 0,1 - 3,9 | Backlog / Risiko akzeptieren |

### Schritt 6: Berichtserstellung

```
================================================================
SECURITY REVIEW TEAM - Report
================================================================

Project: <project-name>
Date: YYYY-MM-DD
Scope: <full|code|deps|infra>
Team: 1 lead + 3 reviewers

================================================================
EXECUTIVE SUMMARY
================================================================

| Severity | Count |
|----------|-------|
| Critical | X |
| High | X |
| Medium | X |
| Low | X |
| Total | X |

Overall Risk Level: <Critical|High|Medium|Low>

================================================================
FINDINGS BY DIMENSION
================================================================

-- SOURCE CODE (Code Reviewer) --

| # | Severity | Category | File | Description |
|---|----------|----------|------|-------------|
| 1 | HIGH | A03:Injection | src/... | SQL injection in... |
| 2 | MEDIUM | A07:Auth | src/... | Weak password... |

-- DEPENDENCIES (Dependency Auditor) --

| # | Severity | Package | Version | CVE | Fix Available |
|---|----------|---------|---------|-----|---------------|
| 1 | CRITICAL | lib-x | 1.2.3 | CVE-2026-XXXX | 1.2.4 |
| 2 | HIGH | lib-y | 4.5.6 | CVE-2026-YYYY | 5.0.0 |

-- INFRASTRUCTURE (Infra Reviewer) --

| # | Severity | Component | Description |
|---|----------|-----------|-------------|
| 1 | HIGH | Dockerfile | Running as root |
| 2 | MEDIUM | .env | Not in .gitignore |

================================================================
ATTACK CHAINS (Correlated Findings)
================================================================

Chain 1: SQL Injection via vulnerable dependency
  Step 1: Outdated ORM library (CVE-2026-XXXX)
  Step 2: User input reaches query builder without sanitization
  Impact: Database compromise
  Severity: CRITICAL

================================================================
REMEDIATION PLAN
================================================================

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Update lib-x to 1.2.4 | Low | Fixes CVE-2026-XXXX |
| 2 | Add input sanitization in src/... | Medium | Blocks injection |
| 3 | Switch to non-root Docker user | Low | Reduces blast radius |

================================================================
EXECUTION METRICS
================================================================

| Metric | Value |
|--------|-------|
| Total time | Xs (vs ~Ys sequential) |
| Speedup | ~X.Xx |
| Total tokens | ~XK |
| Findings discovered | X |
| Reviewers completed | 3/3 |
```

### Schritt 7: Aufräumen

Sicherheits-Lead sendet `shutdown_request` an alle Reviewer und bereinigt isolierte Ausgabeverzeichnisse.

## Leistungserwartungen

| Umfang | Sequenzielle Schätzung | Team-Schätzung | Beschleunigung | Token-Overhead |
|--------|----------------------|----------------|----------------|----------------|
| Nur Code | ~5 Min. | ~5 Min. | 1x (keine Parallelisierung) | 0% |
| Nur Deps | ~3 Min. | ~3 Min. | 1x (keine Parallelisierung) | 0% |
| Vollständig | ~12 Min. | ~6 Min. | ~2x | +30% |

**Hinweis**: Der vollständige Umfang profitiert von 3-Wege-Parallelisierung. Einzelne Umfänge (`--scope=code`) werden als Einzelworker-Aufgaben ohne Team-Overhead ausgeführt.

## Fehlerbehandlung

| Fehler | Wiederherstellung |
|--------|-------------------|
| Reviewer-Timeout (>8 Min.) | Lead fährt mit Teilergebnissen fort, vermerkt Lücke |
| Reviewer-Absturz | Lead protokolliert Fehler, meldet Dimension als "nicht bewertet" |
| Docker nicht verfügbar | Reviewer fällt auf reine Musteranalyse im Quellcode zurück |
| Keine Schwachstellen gefunden | Bericht meldet sauberen Status (kein Fehler) |
| Scanner-Tool nicht installiert | Reviewer überspringt Scanner, verwendet grep-basierte Analyse |

## Einschränkungen

- Festes Team von 4 Agents (1 Lead + 3 Reviewer)
- Kann spezialisierte Sicherheitstools (SAST/DAST/SCA) nicht ersetzen -- ergänzt sie
- Befunde hängen vom Sicherheitswissen des Modells ab (keine Zero-Day-Erkennung)
- Token-Kosten ~30% höher als sequenziell aufgrund von Kontextduplizierung
- Erfordert Agent Teams Research Preview (API kann sich ändern)
- Qualität der Angriffsketten-Korrelation hängt von der Reasoning-Fähigkeit des Lead-Agents ab
