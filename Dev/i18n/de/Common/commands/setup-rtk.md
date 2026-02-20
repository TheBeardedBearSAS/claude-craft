---
description: RTK (Rust Token Killer) installieren und konfigurieren fuer Token-Optimierung
argument-hint: [--install|--check|--uninstall]
---

# Setup RTK (Token-Optimierer)

RTK installieren und konfigurieren, um den Token-Verbrauch von Claude Code um 60-90% zu reduzieren.

## Plan Mode

> **Kein Plan Mode erforderlich.** Dieser Befehl fuehrt ein deterministisches Installationsskript aus.

## Ausfuehrung

### Phase 1: Voraussetzungen pruefen

Verfuegbarkeit der erforderlichen Tools ueberpruefen:

```
╔══════════════════════════════════════════════════════════════╗
║              RTK - Token-Optimierer Einrichtung              ║
╚══════════════════════════════════════════════════════════════╝

Voraussetzungen:
  ✓ jq installiert
  ✓ curl installiert
```

Bei fehlenden Voraussetzungen Installationsanweisungen anzeigen und stoppen.

### Phase 2: RTK-Binary Installation

Pruefen, ob RTK bereits installiert ist (`command -v rtk`). Falls nicht, ueber den offiziellen Installer installieren:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

Installation mit `rtk --version` ueberpruefen.

### Phase 3: Hook-Konfiguration

`rtk init -g --no-patch` ausfuehren um zu erstellen:
- `~/.claude/hooks/rtk-rewrite.sh` — Das PreToolUse Hook-Skript
- `~/.claude/RTK.md` — RTK-Konfigurationsreferenz

Dann den Hook **sicher** in `~/.claude/settings.json` einbinden:
- Sicherung von settings.json vor Aenderung
- RTK-Hook zum `.hooks.PreToolUse[]` Array hinzufuegen
- Alle bestehenden Hooks beibehalten (Sicherheit, etc.)
- Ueberspringen wenn bereits vorhanden (idempotent)

### Phase 4: Verifizierung

Ueberpruefen, dass alle Komponenten korrekt installiert sind.

## Modi

| Modus | Verhalten |
|-------|-----------|
| `--install` (Standard) | Vollstaendige Installation: Binary + Hooks + Settings-Zusammenfuehrung |
| `--check` | RTK-Installationsstatus und Einsparungen pruefen |
| `--uninstall` | RTK-Hooks aus settings.json entfernen (Binary beibehalten) |

## Beispiele

```bash
/common:setup-rtk
/common:setup-rtk --check
/common:setup-rtk --uninstall
```

## Implementierung

```bash
bash Tools/RTK/install-rtk.sh --lang=$RULES_LANG $ARGUMENTS
```
