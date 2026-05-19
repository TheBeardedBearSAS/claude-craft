# Adding a New Locale to Claude Craft

This guide walks you through adding a new language to Claude Craft's i18n system. Claude Craft currently supports 5 languages (`en`, `fr`, `es`, `de`, `pt`) and is designed to make adding new ones straightforward.

---

## Prerequisites

- Node.js 20+ with access to the Claude Craft repository
- Familiarity with the project structure (see `docs/guides/en/01-getting-started.md`)
- A translation approach: human translators, an agent (`@research-assistant`), or a combination

---

## Step 1 — Register the locale code

Edit `cli/lib/constants.js` and add your language code to the `LANGUAGES` object:

```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  // Add your new locale here, e.g.:
  // it: 'Italiano',
  // ja: '日本語',
};
```

Also update `scripts/verify-i18n-parity.sh` — find the `LANGS` array and add your code:

```bash
LANGS=("en" "fr" "es" "de" "pt" "it")   # example: adding Italian
```

---

## Step 2 — Create the directory structure

Claude Craft's i18n content lives in three trees. Create matching directories for your new locale:

```bash
# Dev rules and references
mkdir -p Dev/i18n/<lang>/

# Infrastructure guides
mkdir -p Infra/i18n/<lang>/

# Project management templates
mkdir -p Project/i18n/<lang>/

# User-facing documentation guides
mkdir -p docs/guides/<lang>/
```

Each tree must mirror the English (`en`) reference exactly — same file names, same relative paths.

---

## Step 3 — Translate the files

The reference locale (`en`) contains approximately **325 files** across all trees. You can delegate translation to a Claude agent to accelerate the process:

```
@research-assistant Translate all files from docs/guides/en/ to Italian (it).
Keep the structure identical. Output each file to docs/guides/it/ with the same filename.
Preserve all code blocks, command examples, and relative links unchanged.
```

**Translation guidelines:**

| Rule | Detail |
|------|--------|
| Code blocks | Never translate — keep as-is |
| CLI commands | Never translate |
| File paths | Never translate |
| Section headers | Translate, keep Markdown formatting |
| Links | Update display text, keep relative paths identical |
| Technical terms | Use the established community convention for the target language |

Start with `docs/guides/<lang>/` (highest user-facing value), then `Dev/i18n/<lang>/`, then `Infra/` and `Project/`.

---

## Step 4 — Verify parity

Run the parity check script to confirm your locale is complete and meets the size threshold:

```bash
# Check file count parity (blocking — must be 100%)
bash scripts/verify-i18n-parity.sh

# Check size parity in strict mode (ratio >= 0.80 per file)
STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh

# Run in permissive mode during an in-progress PR
I18N_PARITY_STRICT=0 bash scripts/verify-i18n-parity.sh
```

The script generates a gap report at `audit/phases/i18n-gap.csv` listing any files below the 0.80 size ratio threshold. Use it to prioritize remaining translation work.

**Expected output when complete:**

```
✓ en: 325 files
✓ it: 325 files
✓ All languages at parity
```

---

## Step 5 — Update CI and documentation

### GitHub Actions workflow

Edit `.github/workflows/i18n-parity.yml`. In the `paths` filter of the `pull_request` trigger, the workflow already covers `Dev/i18n/**`, `docs/guides/**`, `Infra/i18n/**`, and `Project/i18n/**` — no additional changes are needed for standard locales.

If you added a locale-specific filter elsewhere in the workflow, add your new code to any allowlist or matrix there.

### README

Update the multilingual guide table in `README.md` (section "User Guides (Multilingual)") to include links to your new locale for each guide.

### CLI locale auto-detection

If the new locale corresponds to a common OS locale prefix (e.g., `it` for `it_IT.UTF-8`), add the mapping in `cli/lib/installer.js` inside the `detectLocale()` function:

```js
if (raw.startsWith('it')) return 'it';
```

Add a corresponding test case in `tests/cli/detect-locale.test.mjs`.

---

## Checklist

- [ ] Code added to `LANGUAGES` in `cli/lib/constants.js`
- [ ] Code added to `LANGS` array in `scripts/verify-i18n-parity.sh`
- [ ] Directories created: `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`, `docs/guides/<lang>/`
- [ ] All files translated (325 files)
- [ ] `bash scripts/verify-i18n-parity.sh` exits 0
- [ ] `STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh` exits 0 (or gap is documented)
- [ ] `audit/phases/i18n-gap.csv` reviewed and gaps addressed
- [ ] README multilingual table updated
- [ ] `detectLocale()` updated + test added (if OS locale auto-detection is relevant)
- [ ] PR opened with `i18n/<lang>` label

---

> Related: `.claude/rules/16-i18n.md` | `scripts/verify-i18n-parity.sh` | `.github/workflows/i18n-parity.yml`
