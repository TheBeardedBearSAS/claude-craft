# Ecosystem — Third-Party Token & Context Tools

Claude Craft ships its own token-optimization stack (RTK, `context: fork` skills, sub-agent model
routing, compaction hooks — see [`docs/RTK-ANALYSIS.md`](RTK-ANALYSIS.md) and
[`.claude/rules/12-context-management.md`](../.claude/rules/12-context-management.md)). This page
curates **complementary third-party tools** from the Claude Code ecosystem that extend — not
replace — that stack.

> **Curation, not bundling.** None of these tools are vendored into Claude Craft. Licenses are
> heterogeneous and embedding third-party code would violate YAGNI and, in several cases, the tools'
> own license terms. We document what each does, how it complements Claude Craft, and how to enable
> it yourself. This mirrors how Claude Craft already treats RTK: documented, recommended, not embedded.

**Evaluation date:** 2026-10-13 (previous: 2026-06-24; the 2026-09-24 review was skipped and caught up here) · **Next review:** 2027-01-13 (quarterly cadence) · **Sources:** the 10 repositories below (GitHub API, licenses re-read) + the
[Top Skills/Plugins Claude Code 2026 (camilleroux.com)](https://www.camilleroux.com/top-skills-plugins-claude-code-2026-v3/)
roundup.

> **Maintenance cadence:** This document is reviewed quarterly (March, June, September, December). Star counts, license statuses, and activity signals reflect the last evaluation date above. Low-activity tools (token-savior ~1.2k, claude-token-optimizer ~0.5k) are re-evaluated each quarter and may be demoted to ⚪ Skip if abandoned.

---

## Summary table

| Tool | ★ | License | Type | Recommendation | Note |
|------|----|---------|------|----------------|------|
| [caveman](https://github.com/juliusbrussee/caveman) | ~111k | **Apache-2.0** | Skill (+ optional MCP) | ✅ **Integrate** | Compresses agent **output** ~65% (telegraphic style, 4 levels). Covers the output side RTK doesn't. |
| [code-review-graph](https://github.com/tirth8205/code-review-graph) | ~32.1k | MIT | MCP + CLI | ✅ **Integrate** | Tree-sitter/AST code graph → reads only the blast radius on review. 38×–528× token reduction on large repos. |
| [token-savior](https://github.com/mibayy/token-savior) | ~1.2k | MIT | MCP + hooks | ✅ **Integrate** | Symbol-index + Bash output compaction (−80%). RTK alternative without a Rust binary. |
| [claude-token-efficient](https://github.com/drona23/claude-token-efficient) | ~6.1k | MIT | CLAUDE.md drop-in | ✅ **Integrate** | Prompt rules cutting Claude verbosity ~63% output / 17–41% cost. Zero code. |
| [claude-hud](https://github.com/jarrodwatts/claude-hud) | ~28.5k | MIT | Status line / monitor | ✅ **Integrate** | Real-time context, agent and todo monitor. Graduated from "Also worth watching" (2026-10-13). Complements `rtk gain`. |
| [context-mode](https://github.com/mksglu/context-mode) | ~27.6k | **ELv2** (GitHub: `NOASSERTION`, text re-read 2026-10-13) | MCP + hooks | 🔶 **Reference** | Sandboxes tool outputs (315 KB → 5.4 KB), SQLite session continuity. License blocks commercial redistribution. |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer) (alexgreensh) | ~2.5k | **PolyForm NC** | Plugin | 🔶 **Reference** | Real-time dashboard + quality scoring. Noncommercial license. |
| [claude-context](https://github.com/zilliztech/claude-context) (zilliztech) | ~12.6k | MIT | MCP + VSCode ext | 🔶 **Reference** | Hybrid semantic search (BM25 + vectors) over the whole codebase. Requires a Milvus/Zilliz vector DB. |
| [claude-token-optimizer](https://github.com/nadimtuhin/claude-token-optimizer) (nadimtuhin) | ~0.5k | MIT | CLI | ⚪ **Skip** | Essential/supplemental doc split — already native to Claude Craft (`.claude/rules/`, on-demand skills). |
| [token-optimizer-mcp](https://github.com/ooples/token-optimizer-mcp) (ooples) | ~0.5k | MIT | MCP | ⚪ **Skip** | 95%+ claims unverified; active again (push 2026-10-13) — re-evaluate at next review. |

Legend: ✅ Integrate (documented + activation recipe) · 🔶 Reference (documented, license/infra caveat) ·
⚪ Skip (superseded or unverified).

---

## ✅ Recommended — Integrate

These five use permissive OSI licenses (MIT, or Apache-2.0 for caveman — compatible with Claude Craft's MIT-only policy since they are recommended, not bundled), are mature or trivially safe, and cover gaps in Claude Craft's stack.

### caveman — output compression

Compresses the agent's **responses** by ~65% using a fragmented/telegraphic dialect, with four levels
(`lite`/`full`/`ultra`/`wenyan`) and ships `/caveman-commit`, `/caveman-review`, plus a memory-file
compressor. Where RTK targets **input/tool** tokens, caveman targets **output** tokens — the two are
orthogonal and stack cleanly.

```bash
# Install as a Claude Code skill (see the repo README for the current path)
git clone https://github.com/juliusbrussee/caveman
```

Pairs with the verbosity rules already in [`.claude/rules/12-context-management.md`](../.claude/rules/12-context-management.md).

> **License note (2026-10-13):** caveman's LICENSE is now **Apache-2.0** (previously listed here as MIT). Apache-2.0 is permissive; keep its NOTICE/attribution if you redistribute it.

### code-review-graph — blast-radius-aware review

Builds a structural graph of the codebase (Tree-sitter + AST in SQLite) so the model reads only the
code impacted by a change. Reported reductions of 38×–528× on large repos. Complements Claude Craft's
review surface (`/qa:*`, `@security-auditor`, the `@{tech}-reviewer` agents).

```jsonc
// .mcp.json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "npx",
      "args": ["-y", "code-review-graph"]
    }
  }
}
```

### token-savior — symbol index + Bash compaction

Indexes the codebase by symbols (functions, classes, imports, call graph) and compacts Bash output up
to −80% via `PreToolUse`/`PostToolUse` hooks. A good **RTK alternative** for teams that prefer an MCP
server over installing a Rust binary. See [`docs/RTK-ANALYSIS.md`](RTK-ANALYSIS.md) for the RTK comparison.

```jsonc
// .mcp.json
{
  "mcpServers": {
    "token-savior": {
      "command": "npx",
      "args": ["-y", "token-savior"]
    }
  }
}
```

### claude-token-efficient — CLAUDE.md drop-in

A single `CLAUDE.md` of prompt rules that reduce Claude's verbosity (~63% output / 17–41% cost). Most
of its guidance overlaps Claude Craft's existing rules (12-context-management, 23-karpathy-principles);
worth auditing to harvest any prompt rule not already covered.

---

### claude-hud — real-time session monitor

MIT, ~28.5k ★ ([repo](https://github.com/jarrodwatts/claude-hud)). Shows context usage, running agents
and todos live while Claude Code works. Where `rtk gain` reports savings after the fact, claude-hud makes
context pressure visible *during* the session — a natural trigger for `/compact`, `/clear` or delegation
(rule 12 thresholds). Install and configure it as a status line by following the repository README; pin
a release tag.

---

## 🔶 Reference only — license or infrastructure caveat

> **License compliance.** The tools below are **not** embedded in Claude Craft and **must not** be.
> ELv2 and PolyForm Noncommercial restrict commercial redistribution; we link to them so you can adopt
> them under your own terms.

- **context-mode** ([repo](https://github.com/mksglu/context-mode)) — **Elastic License v2 (ELv2)**.
  Excellent technically (output sandboxing, post-compaction continuity via native hooks) and closely
  aligned with rule 12, but ELv2 forbids offering it as a managed service / redistributing commercially.
  Evaluate for internal use under the ELv2 terms.
- **token-optimizer** (alexgreensh) ([repo](https://github.com/alexgreensh/token-optimizer)) —
  **PolyForm Noncommercial 1.0.0** (GitHub reports `NOASSERTION`; LICENSE text re-read 2026-10-13, plus a `LICENSE-SMALL-BUSINESS.md` grant). Real-time dashboard, checkpoint-based session continuity, quality
  scoring. Free for teams under the noncommercial threshold; commercial use is paid.
- **claude-context** (zilliztech) ([repo](https://github.com/zilliztech/claude-context)) — MIT, but
  requires an external **Milvus / Zilliz Cloud** vector database. High setup friction; reserve it for
  very large / enterprise codebases where hybrid semantic search pays for the infra.

---

## ⚪ Not recommended

- **claude-token-optimizer** (nadimtuhin) — splits docs into essential vs. supplemental. Already native
  to Claude Craft via modular `.claude/rules/` and on-demand skills; little marginal value.
- **token-optimizer-mcp** (ooples) — aggressive "95%+ reduction" claims without recent validation.
  Activity resumed (push on 2026-10-13); claims still unverified — re-evaluate at the 2027-01 review.

---

## Multi-model routing pattern (oh-my-claudecode style)

Claude Craft runs exclusively on Claude (Opus 5.5 / Sonnet 5.5 / Haiku 5.5) via the Dynamic Workflows tiering built into Claude Code (2.1.154+, `ultracode` trigger). This covers intra-provider cost optimisation.

A complementary **cross-provider routing** pattern has emerged with tools like **oh-my-claudecode** (MIT, ~40k ★, [repo](https://github.com/Yeachan-Heo/oh-my-claudecode)): route sub-agents to Gemini CLI (free tier), OpenAI Codex, or other providers based on task type and cost. The pattern is:

```
Complex planning   → Claude Opus 5.5  (highest reasoning)
Standard coding    → Claude Sonnet 5.5 (best value on Claude)
Simple ops, search → Gemini CLI / free tier  (zero cost)
```

This is not built into Claude Craft today (see `DIFF-03` in `docs/ROADMAP.md`). If you want to experiment with this pattern now:

1. Install `oh-my-claudecode` per its README.
2. Keep Claude Craft's rules and agents as the knowledge layer.
3. Let oh-my-claudecode handle provider selection at runtime.

The two tools are **complementary**, not competing: oh-my-claudecode provides the routing runtime, Claude Craft provides the framework knowledge (BMAD, agents, rules, QA Recette).

> **Security note :** Any multi-provider setup introduces additional API key exposure surface. Apply `rules/11-security.md` and pin every provider CLI version before adopting this pattern.

---

## Mémoire persistante inter-sessions

La mémoire inter-sessions — conserver les décisions d'architecture, les ADR, l'état du sprint et les
conventions entre deux conversations Claude Code — est couverte à trois niveaux : natif, hooks, et
tiers. Aucun des trois n'est mutuellement exclusif.

### Natif : `/memory` + hooks PreCompact / PostCompact

Claude Code v2.1.59+ expose la commande **`/memory`** : les apprentissages saisis sont persistés dans
un fichier `MEMORY.md` rattaché au profil de projet et rechargés à chaque session. C'est le point
d'entrée recommandé pour les décisions non urgentes (style, conventions, contexte métier).

Pour les décisions critiques qui ne doivent pas disparaître lors d'une compaction automatique, Claude
Craft distribue deux hooks complémentaires (dossier [`.claude/templates/hooks/`](../.claude/templates/hooks/)) :

| Hook | Fichier template | Rôle |
|------|-----------------|------|
| **PreCompact** | `pre-compact.json` | Injecte `.claude/context-essentials.md` comme `systemMessage` juste _avant_ la compaction (peut bloquer via exit code 2 depuis v2.1.105). |
| **PostCompact** | `post-compact.json` | Ré-injecte le même fichier immédiatement _après_ la compaction (v2.1.76+). |
| **SessionStart** (matcher `compact`) | `context-reinject.json` | Repli pour les éditeurs qui ne déclenchent pas PostCompact : ré-injecte à chaque démarrage post-compaction. |

**Pattern recommandé pour BMAD / ADR :**

1. Créer `.claude/context-essentials.md` à la racine du projet (gitignored ou commité selon l'équipe).
2. Y consigner les sections : Architecture, Conventions, Sprint actif, Contraintes critiques, ADR.
3. Copier `post-compact.json` dans `.claude/settings.json` (hooks projet) ou `~/.claude/settings.json`
   (hooks globaux).
4. Optionnel : ajouter également `pre-compact.json` pour couvrir la fenêtre _pendant_ la compaction.

Le fichier `context-essentials.md` devient le canal canonique de persistance : il est lu par les hooks,
re-injecté automatiquement, et peut être édité manuellement ou par `/memory` (les deux coexistent).

> **Compatibilité :** `/memory` ≥ v2.1.59 · PostCompact ≥ v2.1.76 · PreCompact exit-code-2 ≥ v2.1.105.
> Vérifier avec `claude --version` avant d'activer PostCompact.

### Tiers : claude-mem

**[claude-mem](https://github.com/thedotmack/claude-mem)** (Apache-2.0, ~104k ★, vérifié le 2026-10-28) est un
serveur MCP open-source qui expose une interface mémoire inter-sessions via un stockage local structuré.
Il propose des opérations `memory_add` / `memory_search` / `memory_list` utilisables depuis les
instructions d'un agent ou d'une commande.

| Aspect | Détail |
|--------|--------|
| Licence | MIT (auditer la version avant de pinner — règle 11) |
| Stockage | Fichier JSON local (pas de vectorDB) |
| Intégration | Serveur MCP `.mcp.json` |
| Complémentarité | Couvre les requêtes de mémoire _explicites_ depuis les agents ; les hooks natifs couvrent la persistance _automatique_ autour des compactions. |

```jsonc
// .mcp.json — à auditer et pinner avant activation
{
  "mcpServers": {
    "claude-mem": {
      "command": "npx",
      "args": ["-y", "claude-mem@<version-exacte>"]
    }
  }
}
```

> **Sécurité avant activation :** auditer le code source, pinner une version exacte (jamais `latest`),
> accorder uniquement les permissions nécessaires — voir [`.claude/rules/11-security.md`](../.claude/rules/11-security.md).

### Ruflo (~59k ★, mémoire vectorielle)

**Ruflo** ([repo](https://github.com/ruvnet/ruflo), MIT) opte pour une **indexation
vectorielle** : chaque session est indexée, et les sessions suivantes récupèrent par similarité
sémantique les contextes pertinents. C'est la seule approche qui scale sur des historiques longs (des
centaines de sessions).

Claude Craft ne l'intègre pas nativement car elle introduit une dépendance externe (base vectorielle),
mais elle est documentée ici comme option complémentaire pour les équipes à fort volume de sessions.
Voir aussi `DIFF-04` dans [`docs/ROADMAP.md`](ROADMAP.md).

### Tableau de décision

| Besoin | Approche recommandée |
|--------|---------------------|
| Conserver conventions / ADR entre sessions | `/memory` natif + `context-essentials.md` |
| Survivre aux compactions automatiques | Hooks `PreCompact` + `PostCompact` (templates intégrés) |
| Mémoire _explicite_ depuis un agent | claude-mem (MCP, Apache-2.0, à pinner) |
| Historique long > 100 sessions, recherche sémantique | Ruflo (vectorDB, évaluer licence) |

---

## Also worth watching (from the 2026 roundup)

Evaluated at 2026-10-13 — not yet integrated but flagged for the next assessment (claude-hud graduated to the main table):

| Tool | Status | Integration candidate |
|------|--------|-----------------------|
| **claude-health** | Maturing — config health audit | `/team:audit` supplementary check |
| **claude-context-optimizer**, **capy**, **cxpak**, **llm-router**, **Codeburn**, **context-tax** | New in the awesome-claude-code catalogue (2026-10) — licenses not yet verified | To triage at the 2027-01 review |
| **claude-subconscious** | Experimental — cross-session memory via MCP | Alternative to `claude-mem` above |
| **tech-debt-skill** | Stable — tech-debt audit skill | Candidate for `/qa:*` namespace |
| **[claude-code-security-review](https://github.com/anthropics/claude-code-security-review)** (Anthropic) | Official GitHub Action, MIT, ~6.6k ★ (checked 2026-10-28; last push 2026-02-11) — Claude reviews pull-request diffs for vulnerabilities | CI counterpart of native `/security-review` (diff only); `/team:security` keeps the full-repository audit |
| **[claude-code-tools](https://github.com/pchalasani/claude-code-tools)** (pchalasani) | MIT, ~2k ★, active (push 2026-10-28) — session continuity: avoid compaction, recover context, Claude Code ↔ Codex CLI handoff | Overlaps Ralph continuation and the PreCompact/PostCompact hooks — compare before adopting |
| **[localpr](https://github.com/gilles-g/localpr)** (gilles-g) | MIT, 6 ★, new (2026-10) — GitHub-style local review page for uncommitted changes, batched line comments sent back to Claude | Below the >1k ★ graduation bar; review-loop idea worth tracking |

> **Graduation path:** any of these may be promoted to the main ✅ Integrate table when: (1) the tool uses a permissive OSI license (MIT or Apache-2.0), (2) has >1k stars or >6 months of active maintenance, and (3) covers a gap not already addressed in Claude Craft. The 2027-01-13 review is the next evaluation checkpoint.

---

## Security before you install

Every third-party MCP server or skill runs with your permissions. Before enabling any tool on this page,
apply [`.claude/rules/11-security.md`](../.claude/rules/11-security.md):

- **Audit the source** and pin an exact version (no floating `latest`).
- **Minimal permissions** — grant only the tools/paths the server needs.
- Prefer Claude Code **v2.1.260+** when combining MCP servers, plugins and hooks.
- See [`docs/MCP.md#security`](MCP.md#security) for the full MCP hardening checklist.

> **Non-affiliation.** Claude Craft is not affiliated with any of the projects listed here. Stars,
> licenses, and activity reflect the 2026-06-02 evaluation and may have changed since.
