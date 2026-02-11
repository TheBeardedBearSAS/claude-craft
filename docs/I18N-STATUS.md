# Internationalization (i18n) Status

This document describes the i18n strategy and current parity status for Claude Craft.

---

## Strategy

Claude Craft supports **5 languages**: English (en), French (fr), Spanish (es), German (de), Portuguese (pt).

### Fully Maintained: `Dev/i18n/`

The `Dev/i18n/{lang}/` directory contains all installable content (agents, commands, rules, skills, templates, hooks, MCP templates). These translations are **fully maintained** and kept at parity across all 5 languages as part of the release process.

| Language | Directory | Status |
|----------|-----------|--------|
| English | `Dev/i18n/en/` | Primary (source of truth) |
| French | `Dev/i18n/fr/` | Full parity |
| Spanish | `Dev/i18n/es/` | Full parity |
| German | `Dev/i18n/de/` | Full parity |
| Portuguese | `Dev/i18n/pt/` | Full parity |

### Opt-in / Community-Contributed: `docs/`

The `docs/` directory documentation is written in **English only** as the maintained version. Translated docs (in `docs/i18n/` or language-suffixed files) are:

- **Opt-in**: Not required for using Claude Craft
- **Community-contributed**: Contributions welcome via pull requests
- **Not guaranteed up-to-date**: May lag behind the English version

| Document | en | fr | es | de | pt |
|----------|----|----|----|----|-----|
| QUICKSTART | Y | Y | Y | Y | Y |
| PREREQUISITES | Y | Y | Y | Y | Y |
| CLI-REFERENCE | Y | Y | Y | Y | Y |
| FAQ | Y | Y | Y | Y | Y |
| TROUBLESHOOTING | Y | Y | Y | Y | Y |
| ARCHITECTURE | Y | - | - | - | - |
| BMAD-PRACTICAL-GUIDE | Y | - | - | - | - |
| RALPH-GUIDE | Y | - | - | - | - |
| AUTONOMOUS-SPRINT | Y | - | - | - | - |
| AGENT-TEAMS-GUIDE | Y | - | - | - | - |

---

## Contributing Translations

To contribute a documentation translation:

1. Copy the English source file
2. Translate the content (keep code blocks and command names unchanged)
3. Submit a pull request with the translated file
4. Add an entry to this status table

For `Dev/i18n/` translations, please ensure full parity with the English version and test installation with the target language (`--lang=XX`).

---

## Verification

Check i18n file counts per language:

```bash
# Count files per language in Dev/i18n/
for lang in en fr es de pt; do
  echo "$lang: $(find Dev/i18n/$lang -type f | wc -l) files"
done
```
