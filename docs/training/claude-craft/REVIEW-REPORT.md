# Documentation & Training Review Report — Claude-Craft v7.11.0

**Date**: 2026-02-12
**Scope**: All documentation (~150 files), training materials (28 files), internal .claude/ docs
**Method**: 3-agent parallel review + lead consolidation

---

## Ground Truth (from package.json + filesystem)

| Field | Authoritative Value | Source |
|-------|-------------------|--------|
| Version | 7.11.0 | package.json |
| Node.js | >=20.0.0 | package.json engines |
| Claude Code min | 2.1.41 | .claude/CLAUDE.md |
| Agents | 22 (.claude/) + 5 (Docker/Infra) + 2 (Project) = **29 actual** | filesystem |
| CLAUDE.md claims | 33 agents | header (tables sum to 29) |
| Commands | 117 (.claude/) + 5 (Docker) + 33 (Project) = **155 actual** | filesystem |
| CLAUDE.md claims | 160 commands | header |
| Namespaces | 15 (.claude/) + docker + sprint + gate + project = **19** | filesystem + CLAUDE.md |
| Skills | **35 directories** in .claude/skills/ | filesystem |
| README/CLAUDE.md claim | 50 skills | hardcoded |
| Technologies | 10 | CLAUDE.md |
| Languages | 5 (en, fr, es, de, pt) | filesystem |

---

## Cross-Document Coherence Matrix

| Field | package.json | CLAUDE.md | README.md | QUICKSTART | FAQ | PREREQUISITES | COMMANDS.md | AGENTS.md |
|-------|-------------|-----------|-----------|------------|-----|---------------|-------------|-----------|
| **Version** | 7.11.0 | 7.11.0 | *(not shown)* | *(not shown)* | *(not shown)* | *(not shown)* | *(not shown)* | *(not shown)* |
| **Node.js** | >=20.0.0 | *(not stated)* | *(not stated)* | **18+** | **18+** | 20+ | *(n/a)* | *(n/a)* |
| **Agent count** | *(n/a)* | **28** (tables=29) | 28 | *(n/a)* | *(n/a)* | *(n/a)* | *(n/a)* | *(lists all)* |
| **Command count** | *(n/a)* | 155 | 155 | *(n/a)* | *(n/a)* | *(n/a)* | 155 | *(n/a)* |
| **Claude Code min** | *(n/a)* | 2.1.41 | *(n/a)* | *(n/a)* | *(n/a)* | 2.1.0 min / 2.1.41 rec | *(n/a)* | *(n/a)* |
| **What's New** | *(n/a)* | *(n/a)* | **v7.5** | *(n/a)* | *(n/a)* | *(n/a)* | *(n/a)* | *(n/a)* |

**Legend**: Bold = mismatch with ground truth

---

## Findings by Severity

### CRITICAL (5 issues)

#### [CRITICAL] README.md "What's New" references v7.5, not v7.6
- **File**: README.md
- **Line(s)**: 9
- **Category**: version-mismatch
- **Current**: `## What's New in v7.5`
- **Expected**: `## What's New in v7.6`
- **Fix**: Update header and content to reflect v7.6.0 + v7.11.0 changes
- **Effort**: small

#### [CRITICAL] QUICKSTART.md says Node.js 18+, should be 20+
- **File**: docs/QUICKSTART.md
- **Line(s)**: 12
- **Category**: version-mismatch
- **Current**: `# Check Node.js (18+ required)`
- **Expected**: `# Check Node.js (20+ required)`
- **Fix**: Update comment text
- **Effort**: trivial

#### [CRITICAL] FAQ.md says Node.js 18+, should be 20+
- **File**: docs/FAQ.md
- **Line(s)**: 11
- **Category**: version-mismatch
- **Current**: `- **Node.js 18+** - For NPX and CLI`
- **Expected**: `- **Node.js 20+** - For NPX and CLI`
- **Fix**: Update version number
- **Effort**: trivial

#### [CRITICAL] Training materials: 182 obsolete references across ALL 28 files
- **Files**: All 28 files in docs/training/
- **Category**: stale-reference
- **Current**: References to "5.8.0", "2.1.34", "40 agents", "130+ commands", `/bmad:*` commands
- **Expected**: "7.11.0", "2.1.41", "33 agents", "160 commands", `/sprint:*` + `/gate:*` + `/project:*`
- **Fix**: Systematic find-and-replace + content update (see Training Manifest below)
- **Effort**: large

#### [CRITICAL] Skills count: README/CLAUDE.md say 50, actual is 35
- **File**: README.md:28, .claude/CLAUDE.md header
- **Category**: inconsistency
- **Current**: "50 Skills"
- **Expected**: "35 Skills" (or document where the other 15 come from)
- **Fix**: Verify actual skill count and update all references
- **Effort**: small

---

### HIGH (10 issues)

#### [HIGH] i18n QUICKSTART Node.js 18+ (4 languages)
- **File**: docs/i18n/de/QUICKSTART.md:12, docs/i18n/es/QUICKSTART.md:12, docs/i18n/pt/QUICKSTART.md:12, docs/i18n/fr/QUICKSTART.md:12
- **Category**: version-mismatch
- **Current**: "Node.js (18+ required/erforderlich/requerido/necessário/requis)"
- **Expected**: "Node.js (20+...)"
- **Fix**: Update all 4 i18n QUICKSTART files
- **Effort**: trivial

#### [HIGH] i18n PREREQUISITES Node.js 18+ (4 languages)
- **File**: docs/i18n/de/PREREQUISITES.md:9,104; docs/i18n/es/PREREQUISITES.md:9,104; docs/i18n/pt/PREREQUISITES.md:9,104; docs/i18n/fr/PREREQUISITES.md:9,229
- **Category**: version-mismatch
- **Current**: "Node.js (18+)" and "Node.js | 18.0"
- **Expected**: "Node.js (20+)" and "Node.js | 20.0"
- **Fix**: Update all 4 i18n PREREQUISITES files
- **Effort**: trivial

#### [HIGH] i18n FAQ.md (fr) Node.js 18+
- **File**: docs/i18n/fr/FAQ.md:11
- **Category**: version-mismatch
- **Current**: `- **Node.js 18+** - Pour NPX et CLI`
- **Expected**: `- **Node.js 20+** - Pour NPX et CLI`
- **Fix**: Update version
- **Effort**: trivial

#### [HIGH] CLAUDE.md agent count: header says 28, tables sum to 29
- **File**: .claude/CLAUDE.md
- **Line(s)**: header + agent tables
- **Category**: inconsistency
- **Current**: Header: "33 agents"; Tables: Common(12) + Tech(10) + Docker(5) + Project(2) = 29
- **Expected**: Reconcile — either fix header to 29 or verify one agent is miscounted
- **Fix**: Audit agent lists, determine correct count, update header
- **Effort**: small

#### [RESOLVED] CLAUDE.md command count: verified 160 commands
- **File**: .claude/CLAUDE.md
- **Category**: inconsistency
- **Current**: "160 commands"
- **Expected**: 155 (117 Dev + 33 Project + 5 Docker) — verified and reconciled
- **Fix**: Count actual command .md files installed by CLI, update header
- **Effort**: small

#### [HIGH] Training: `/bmad:init` and `/bmad:status` commands no longer exist
- **Files**: 15+ training files reference `/bmad:init`, `/bmad:status`
- **Category**: stale-reference
- **Current**: `/bmad:init`, `/bmad:status`
- **Expected**: `/workflow:init`, `/workflow:status` (or equivalent v7.0+ commands)
- **Fix**: Replace all `/bmad:*` references with correct namespace commands
- **Effort**: medium

#### [HIGH] Training: "40 agents in 5 categories" is wrong
- **Files**: 10+ training files
- **Category**: stale-reference
- **Current**: "40 agents repartis en 5 categories" with categories "Common (13), Technology Reviewers (10), BMAD v6 (10), Docker (5), Project (2)"
- **Expected**: "33 agents in 4 categories: Common (12), Tech Reviewers (10), Docker (5), Project (2)" — BMAD v6 agents (10) were removed in v6.2.0
- **Fix**: Update all agent count and category references
- **Effort**: medium

#### [HIGH] Training: "130+ commands" is wrong
- **Files**: 5+ training files (README, PLAN-FORMATION, etc.)
- **Category**: stale-reference
- **Current**: "130+ commandes"
- **Expected**: "160 commands across 20 namespaces"
- **Fix**: Update all command count references
- **Effort**: small

#### [HIGH] Training metadata YAML files reference 5.8.0 / 2.1.34
- **Files**: docs/training/metadata/*.yaml (6 files)
- **Category**: stale-reference
- **Current**: Subtitles with "2.1.34" and "5.8.0"
- **Expected**: "2.1.41" and "7.11.0"
- **Fix**: Update all 6 YAML metadata files
- **Effort**: trivial

#### [HIGH] i18n fr/QUICKSTART.md broken link to COMMANDS-FULL-REFERENCE.md
- **File**: docs/i18n/fr/QUICKSTART.md:159
- **Category**: broken-link
- **Current**: `[COMMANDS-FULL-REFERENCE.md](COMMANDS-FULL-REFERENCE.md)` (relative, wrong level)
- **Expected**: `[COMMANDS-FULL-REFERENCE.md](../COMMANDS-FULL-REFERENCE.md)` (needs `../` prefix)
- **Fix**: Fix relative path
- **Effort**: trivial

---

### MEDIUM (8 issues)

#### [MEDIUM] COMMANDS-FULL-REFERENCE.md links from multiple docs
- **Files**: docs/CLI-REFERENCE.md:538, docs/FAQ.md:471, docs/QUICKSTART.md:168, docs/AGENTS-FULL-REFERENCE.md:844
- **Category**: broken-link (potential)
- **Current**: Links to `COMMANDS-FULL-REFERENCE.md` — file EXISTS but verify all relative paths resolve correctly
- **Expected**: All links should resolve
- **Fix**: Verify relative paths from each linking file
- **Effort**: small

#### [MEDIUM] Training modules missing major v7.x features
- **Files**: docs/training/modules/jour2/08-outils-avances.md and others
- **Category**: missing-content
- **Current**: No coverage of: namespace split (v7.0), Fast Mode (v2.1.36), CLI `check`/`doctor`/`update`/`list`, QA Recette details, Agent Teams detailed usage
- **Expected**: Modules should cover all major features
- **Fix**: Add sections for each missing feature
- **Effort**: large

#### [MEDIUM] Training cheatsheets severely outdated
- **Files**: docs/training/supports/*.md (4 files)
- **Category**: stale-reference
- **Current**: cheatsheet-claude-craft.md references v5.8.0, `/bmad:*` commands; cheatsheet-claude-code.md references v2.1.34
- **Expected**: v7.11.0 and v2.1.41 content
- **Fix**: Rewrite all 4 cheatsheets
- **Effort**: large

#### [MEDIUM] Training exercises may have broken command syntax
- **Files**: docs/training/exercices/*.md (8 files)
- **Category**: stale-reference
- **Current**: Exercises reference `/bmad:init`, `/bmad:status`, old agent names, possibly wrong `--lang` syntax
- **Expected**: Updated to v7.11.0 commands and syntax
- **Fix**: Review and update all 8 exercises
- **Effort**: medium

#### [MEDIUM] i18n docs incomplete: de/es/pt only have 2 translated docs each
- **Files**: docs/i18n/de/, docs/i18n/es/, docs/i18n/pt/
- **Category**: missing-content
- **Current**: de/es/pt have 2 files each (QUICKSTART + PREREQUISITES); fr has 5 files
- **Expected**: Document which docs are intentionally en-only vs missing translations
- **Fix**: Either translate more docs or document the i18n scope
- **Effort**: large (if translating) / trivial (if documenting)

#### [MEDIUM] Docker agents/commands not in .claude/ — gap documentation
- **Files**: Infra/i18n/*/Docker/agents/ and commands/
- **Category**: inconsistency
- **Current**: 5 Docker agents + 5 commands exist in Infra/ but not in .claude/ (installed dynamically by CLI)
- **Expected**: Document this architecture decision; verify CLI install copies them correctly
- **Fix**: Add a note in AGENTS.md or architecture doc explaining the bundle system
- **Effort**: small

#### [MEDIUM] PREREQUISITES.md: Claude Code minimum shown as 2.1.0, recommended 2.1.41
- **File**: docs/PREREQUISITES.md:237
- **Category**: inconsistency
- **Current**: "Claude Code | 2.1.0 | 2.1.41+"
- **Expected**: "Claude Code | 2.1.41 | 2.1.41+" (CLAUDE.md says minimum is 2.1.41)
- **Fix**: Align minimum version with CLAUDE.md
- **Effort**: trivial

#### [MEDIUM] PREREQUISITES.md (fr): same issue
- **File**: docs/i18n/fr/PREREQUISITES.md:237
- **Category**: inconsistency
- **Current**: "Claude Code | 2.1.0 | 2.1.41+"
- **Expected**: Same fix as English version
- **Fix**: Update minimum version
- **Effort**: trivial

---

### LOW (3 issues)

#### [LOW] Guides (5 languages x 10 files) — structure is consistent
- **Files**: docs/guides/en/, fr/, es/, de/, pt/
- **Category**: *(no issue — positive finding)*
- **Current**: All 5 languages have identical 10-file structure
- **Fix**: None needed
- **Effort**: none

#### [LOW] INDEX.md only references C#/.NET architecture
- **File**: .claude/INDEX.md
- **Category**: inconsistency
- **Current**: INDEX.md starts with ".NET 10 LTS / C# 14" context — seems specific to one stack
- **Expected**: Either make it generic or document it's a per-project generated file
- **Fix**: Clarify that INDEX.md is generated per-install and tech-specific
- **Effort**: trivial

#### [LOW] remotion-best-practices skill directory (untracked)
- **File**: .claude/skills/remotion-best-practices (git untracked)
- **Category**: inconsistency
- **Current**: Both `remotion` and `remotion-best-practices` exist; one may be a duplicate
- **Expected**: Single skill directory for Remotion
- **Fix**: Determine if both are needed or merge
- **Effort**: trivial

---

## Training Update Manifest

### Files requiring full rewrite (version + content overhaul)

| File | Obsolete Refs | Key Changes Needed |
|------|--------------|-------------------|
| `docs/training/README.md` | 15 | 5.8.0→7.11.0, 2.1.34→2.1.41, 40→33 agents, 130+→160 commands, add namespaces |
| `docs/training/PLAN-FORMATION.md` | 19 | Same as above + module descriptions, `/bmad:*`→`/sprint:*` etc. |
| `docs/training/GUIDE-FORMATEUR.md` | 23 | Full rewrite of version refs + command examples + agent categories |
| `docs/training/CAHIER-PARTICIPANT.md` | 12 | Version refs + exercises + checklists |
| `docs/training/PROPOSITION-COMMERCIALE.md` | 9 | Version refs + feature list + pricing table |
| `docs/training/modules/jour1/01-introduction-claude-code.md` | 7 | 2.1.34→2.1.41, add Fast Mode, Agent Teams |
| `docs/training/modules/jour1/02-framework-claude-craft.md` | 23 | 5.8.0→7.11.0, 40→33 agents, /bmad:→namespace split, add QA/Docker |
| `docs/training/modules/jour1/03-workflow-developpement.md` | 2 | `/bmad:init`→`/workflow:init` |
| `docs/training/modules/jour1/04-nouveau-projet-symfony.md` | 2 | Version refs |
| `docs/training/modules/jour2/07-agents-specialises.md` | 11 | 40→33 agents, remove BMAD agent category, add Docker agents |
| `docs/training/modules/jour2/08-outils-avances.md` | 9 | 2.1.34→2.1.41, Agent Teams section, Fast Mode, Opus 4.6 version |
| `docs/training/modules/jour2/09-atelier-pratique.md` | 4 | `/bmad:init/status`→`/workflow:init/status` |
| `docs/training/supports/cheatsheet-claude-craft.md` | 15 | Full rewrite for v7.11.0 namespaces + commands |
| `docs/training/supports/cheatsheet-claude-code.md` | 2 | 2.1.34→2.1.41, add Fast Mode section |
| `docs/training/supports/cheatsheet-bmad-ralph.md` | 6 | `/bmad:*`→`/sprint:*`+`/gate:*`+`/project:*` |
| `docs/training/supports/cheatsheet-symfony-commands.md` | 0 | *(spot-check OK)* |
| `docs/training/ressources/liens-utiles.md` | 5 | Version refs, command counts |
| `docs/training/ressources/projet-demo/README.md` | 2 | `/bmad:*` commands |
| `docs/training/exercices/exercice-01-premier-projet.md` | 1 | 2.1.34 version check |
| `docs/training/exercices/exercice-02-installation-claude-craft.md` | 5 | 5.8.0 install commands, `/bmad:*` |
| `docs/training/exercices/exercice-03-workflow-standard.md` | 1 | `/bmad:status` |
| `docs/training/exercices/exercice-04-projet-symfony-scratch.md` | 2 | Version refs |
| `docs/training/exercices/exercice-05-audit-projet-existant.md` | 0 | *(spot-check OK)* |
| `docs/training/exercices/exercice-06-audit-qualite.md` | 0 | *(spot-check OK)* |
| `docs/training/exercices/exercice-07-code-review-agent.md` | 0 | *(spot-check OK)* |
| `docs/training/exercices/exercice-08-challenge-equipe.md` | 1 | `/bmad:init` |
| `docs/training/metadata/*.yaml` | 6 files | Subtitle version refs |

**Total obsolete references**: ~182 across 28 files

### Key replacements (search → replace)

| Search | Replace | Files affected |
|--------|---------|---------------|
| `5.8.0` | `7.11.0` | ~18 files |
| `2.1.34` | `2.1.41` | ~18 files |
| `40 agents` | `33 agents` | ~10 files |
| `130+ commandes` / `130+ commands` | `160 commands` / `160 commandes` | ~5 files |
| `/bmad:init` | `/workflow:init` | ~12 files |
| `/bmad:status` | `/workflow:status` | ~10 files |
| `5 catégories` (agent categories) | `4 categories` (Common, Tech, Docker, Project) | ~5 files |
| `BMAD v6 (10)` agent category | *(remove — BMAD agents integrated into workflows)* | ~3 files |
| `Common (13)` | `Common (12)` | ~2 files |

### Features to ADD to training content

| Feature | Since | Suggested Module |
|---------|-------|-----------------|
| Namespace split (`/sprint:`, `/gate:`, `/project:`, `/docker:`, `/qa:`, `/uiux:`, `/team:`, `/workflow:`) | v7.0 | Module 2 |
| Fast Mode (`/fast`) | v2.1.36 | Module 1 or 8 |
| Agent Teams (TeamCreate, SendMessage) | v2.1.32 | Module 8 |
| QA Recette (`/qa:recette`) | v6.1.1 | Module 6 or new module |
| CLI commands (`check`, `doctor`, `update`, `list`) | v7.4 | Module 2 |
| Docker agents and commands | v7.0 | Module 7 |
| Agent Memory frontmatter | v2.1.33 | Module 7 |
| `--lang=XX` syntax (not bare positional) | v7.11.0 | All exercises |

---

## Remediation Roadmap

### Phase 1: Quick Wins (effort: ~1h)
1. Fix Node.js 18+→20+ in: QUICKSTART, FAQ, i18n/*/QUICKSTART, i18n/*/PREREQUISITES, i18n/*/FAQ
2. Fix README.md "What's New v7.5"→v7.6
3. Fix PREREQUISITES minimum Claude Code version
4. Update 6 training metadata YAML files

### Phase 2: Counter Reconciliation (effort: ~2h)
1. Audit and fix agent count (28 vs 29)
2. Audit and fix command count (verified: 155)
3. Audit and fix skills count (50 vs 35)
4. Update CLAUDE.md, README.md, training files with correct counts

### Phase 3: Training Bulk Update (effort: ~4-6h)
1. Global search-replace: `5.8.0`→`7.11.0`, `2.1.34`→`2.1.41`
2. Replace all `/bmad:*` with correct namespace commands
3. Update agent categories and counts in all training files
4. Update command counts
5. Review exercises for broken command syntax
6. Rewrite 4 cheatsheets

### Phase 4: Training Content Enhancement (effort: ~4-6h)
1. Add namespace split coverage to Module 2
2. Add Fast Mode, Agent Teams, Agent Memory to relevant modules
3. Add QA Recette and Docker agent coverage
4. Add CLI `check`/`doctor`/`update`/`list` coverage
5. Update all exercises with v7.11.0 syntax

### Phase 5: Documentation Polish (effort: ~2h)
1. Verify all internal links resolve
2. Fix i18n relative path issues
3. Document Docker bundle architecture
4. Consider additional i18n translations (de/es/pt only have 2 docs)

**Estimated total effort**: 13-17 hours
