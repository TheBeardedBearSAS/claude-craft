---
description: RTK und Token-Optimierung für Claude Code konfigurieren
argument-hint: [--check]
---

# Token-Optimierung einrichten

RTK (Rust Token Killer) und umfassende Token-Optimierung für Claude Code-Sitzungen konfigurieren.

## Schritte

### 1. RTK-Installation prüfen

```bash
# Prüfen ob RTK installiert ist
if command -v rtk &>/dev/null; then
  echo "RTK installiert: $(rtk --version)"
  echo ""
  rtk gain 2>/dev/null || echo "Noch keine Einsparungsdaten"
else
  echo "RTK ist NICHT installiert"
  echo ""
  echo "Installationsoptionen (das curl|bash-Muster ist durch Claude Craft Hooks BLOCKIERT):"
  echo "  1. (Empfohlen) make install-rtk    # aus dem claude-craft Root"
  echo "  2. cargo install rtk-cli            # wenn Rust Toolchain vorhanden"
  echo "  3. Release-Binary manuell herunterladen: https://github.com/rtk-ai/rtk/releases"
fi
```

### 2. RTK-Optimierungen konfigurieren

Falls RTK installiert ist, diese Optimierungen anwenden:

#### a) Ultra-Compact-Modus aktivieren

Den Hook unter `~/.claude/hooks/rtk-rewrite.sh` prüfen. Der Rewrite-Befehl sollte `--ultra-compact` verwenden:

```bash
REWRITTEN=$(rtk rewrite --ultra-compact "$CMD" 2>/dev/null)
```

Falls nicht vorhanden, die Hook-Datei aktualisieren.

#### b) RTK-Limits optimieren

`~/.config/rtk/config.toml` prüfen und diese Limits empfehlen:

```toml
[limits]
grep_max_results = 100
grep_max_per_file = 10
status_max_files = 10
status_max_untracked = 5
passthrough_max_chars = 1500
```

#### c) Benutzerdefinierte Filter hinzufügen

`~/.config/rtk/filters.toml` prüfen. Wenn nur Template-Kommentare vorhanden sind, Filter basierend auf dem erkannten Projekt-Stack vorschlagen:

- **Docker-Projekte**: docker exec, compose, logs Filter hinzufügen
- **Node.js-Projekte**: npm/npx install Filter hinzufügen
- **PHP-Projekte**: composer Filter hinzufügen
- **Python-Projekte**: pip install Filter hinzufügen

### 3. Sub-Agent-Modell und Forked Subagents konfigurieren

Prüfen ob beide Umgebungsvariablen gesetzt sind:

```bash
echo "CLAUDE_CODE_SUBAGENT_MODEL=${CLAUDE_CODE_SUBAGENT_MODEL:-NICHT GESETZT}"
echo "CLAUDE_CODE_FORK_SUBAGENT=${CLAUDE_CODE_FORK_SUBAGENT:-NICHT GESETZT}"
```

Falls nicht gesetzt, empfehlen zu `~/.bashrc` (oder `~/.zshrc`) hinzuzufügen:

```bash
# Sonnet 4.6 für Sub-Agents verwenden (Exploration, grep, Dateilesen) statt Opus
# → 40-60% Kostenreduzierung bei Sub-Agent-Aufrufen
export CLAUDE_CODE_SUBAGENT_MODEL="sonnet"

# Sub-Agents in isolierten Kontexten ausführen (Claude Code 2.1.117+, siehe COMPATIBILITY.md)
# → Verhindert Verschmutzung des Hauptkontextfensters durch Sub-Agent-Zwischenzustände
# → Kombiniert mit context: fork in Skills (~8-15K Token gespart pro langer Sitzung)
export CLAUDE_CODE_FORK_SUBAGENT=1

# 1-Stunden Prompt-Cache TTL aktivieren (Claude Code 2.1.108+)
# → -40% Kosten bei wiederholenden Sitzungen (BMAD Sprints, /team:* Schleifen)
# → Gleicher Prompt-Cache-Schlüssel wird bis zu 1h statt 5min Standard wiederverwendet
export ENABLE_PROMPT_CACHING_1H=1

# 5-Minuten Cache-Schreibvorgänge bei jedem Turn erzwingen (Claude Code 2.1.108+)
# → Nützlich für kurze Entwicklungsschleifen, die den Cache wiederholt treffen
# → Kompromiss: kleiner Schreib-Overhead, große Hit-Rate-Gewinne bei iterativer Arbeit
export FORCE_PROMPT_CACHING_5M=1
```

Nach der Aktualisierung Shell neu laden: `source ~/.bashrc`.

### 4. Hooks konfigurieren

Die aktuellen settings.json auf folgende Hooks prüfen:

| Hook | Zweck | Status |
|------|-------|--------|
| **PreToolUse** (Bash) | RTK-Rewrite | Konfiguration prüfen |
| **PostToolUse** (Bash) | Output-Filterung | Konfiguration prüfen |
| **PreCompact** | Kontext-Erhaltung | Konfiguration prüfen |
| **SessionStart** (compact) | Kontext-Wiederherstellung | Konfiguration prüfen |

Für fehlende Hooks die Templates in `.claude/templates/hooks/` referenzieren:
- `output-filter.json` — PostToolUse für große Output-Filterung
- `pre-compact.json` — PreCompact für Kontext-Erhaltung
- `context-reinject.json` — SessionStart für Post-Compaction-Wiederherstellung
- `post-compact.json` — PostCompact für Kontext-Wiederherstellung nach Compaction

#### PostCompact Hook — Kontext-Wiederherstellung

Der **PostCompact**-Hook (Claude Code v2.1.76+) stellt kritischen Kontext nach einem automatischen Compaction-Ereignis wieder her. Ohne ihn kann Claude laufende Aufgaben, Dateipfade und frühere Entscheidungen verlieren.

Template: `.claude/templates/hooks/post-compact.json`

Der Hook liest `context-essentials.md` (eine Datei mit aktuellem Sitzungszustand) und injiziert sie als System-Nachricht nach der Compaction. Mit dem **PreCompact**-Hook (`pre-compact.json`) kombinieren, der die Essentials vor der Compaction speichert.

Geschätzte Einsparung: vermeidet 5-15 Erklärungsrunden pro langer Sitzung (~3-8K Token).

### 5. Zusammenfassung

Zusammenfassungstabelle aller Optimierungen mit Status anzeigen:

| Optimierung | Erwartete Einsparung | Status |
|---|---|---|
| RTK installiert + Hooks | 60-90% bei CLI-Output | ? |
| RTK ultra-compact | +5-10% zusätzlich | ? |
| RTK optimierte Limits | grep 19% -> 40-50% | ? |
| RTK benutzerdefinierte Filter | +30-50% bei docker/npm | ? |
| Sub-Agent-Modell (Sonnet) | 40-60% Kostenreduzierung | ? |
| Isolierte Sub-Agents (`CLAUDE_CODE_FORK_SUBAGENT=1`) | 8-15K Token/lange Sitzung | ? |
| Prompt-Caching 1h (`ENABLE_PROMPT_CACHING_1H=1`) | -40% Kosten bei wiederholenden Sitzungen | ? |
| Cache-Schreibvorgänge 5min erzwingen (`FORCE_PROMPT_CACHING_5M=1`) | Höhere Hit-Rate bei iterativen Schleifen | ? |
| PostToolUse Hook | Reduziert Kontext-Verschmutzung | ? |
| PreCompact Hook | Erhält kritischen Kontext | ? |
| PostCompact Hook | Stellt Kontext nach Compaction wieder her | ? |

**Ziel: 60-75% gesamte Token-Effizienz (mit 1h Cache + ultra-compact + forked subagents)**

## Argumente

- `$ARGUMENTS` — `--check` übergeben, um nur den aktuellen Status anzuzeigen ohne Änderungen vorzunehmen
