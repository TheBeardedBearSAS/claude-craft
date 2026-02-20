---
description: Install and configure RTK (Rust Token Killer) for token optimization
argument-hint: [--install|--check|--uninstall]
---

# Setup RTK (Token Optimizer)

Install and configure RTK to reduce Claude Code token consumption by 60-90%.

## Plan Mode

> **No plan mode required.** This command runs a deterministic installation script.

## Execution

### Phase 1: Prerequisites Check

Verify required tools are available:

```
╔══════════════════════════════════════════════════════════════╗
║              RTK - Token Optimizer Setup                     ║
╚══════════════════════════════════════════════════════════════╝

Prerequisites:
  ✓ jq installed
  ✓ curl installed
```

If prerequisites are missing, display installation instructions and stop.

### Phase 2: RTK Binary Installation

Check if RTK is already installed (`command -v rtk`). If not, install via official installer:

```bash
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh
```

Verify installation with `rtk --version`.

### Phase 3: Hook Configuration

Run `rtk init -g --no-patch` to create:
- `~/.claude/hooks/rtk-rewrite.sh` — The PreToolUse hook script
- `~/.claude/RTK.md` — RTK configuration reference

Then **safely merge** the hook into `~/.claude/settings.json`:
- Backup settings.json before modification
- Append RTK hook to `.hooks.PreToolUse[]` array
- Preserve all existing hooks (security, etc.)
- Skip if already present (idempotent)

### Phase 4: Verification

Verify all components are correctly installed:

```
Verification:
  ✓ RTK binary (rtk 0.22.1)
  ✓ Hook script (~/.claude/hooks/rtk-rewrite.sh)
  ✓ settings.json hook entry
```

Show token savings if available (`rtk gain`).

## Modes

| Mode | Behavior |
|------|----------|
| `--install` (default) | Full installation: binary + hooks + settings merge |
| `--check` | Check current RTK installation status and savings |
| `--uninstall` | Remove RTK hooks from settings.json (keeps binary) |

## Examples

```bash
# Install RTK with default language
/common:setup-rtk

# Install with French messages
/common:setup-rtk --install

# Check installation status
/common:setup-rtk --check

# Remove RTK hooks
/common:setup-rtk --uninstall
```

## Implementation

Run the installation script:

```bash
bash Tools/RTK/install-rtk.sh --lang=$RULES_LANG $ARGUMENTS
```

Where `$RULES_LANG` is detected from the project's installed language.
