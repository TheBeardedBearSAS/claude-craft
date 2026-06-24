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

**Evaluation date:** 2026-06-24 · **Next review:** 2026-09-24 (quarterly cadence) · **Sources:** the 9 repositories below + the
[Top Skills/Plugins Claude Code 2026 (camilleroux.com)](https://www.camilleroux.com/top-skills-plugins-claude-code-2026-v3/)
roundup.

> **Maintenance cadence:** This document is reviewed quarterly (March, June, September, December). Star counts, license statuses, and activity signals reflect the last evaluation date above. Low-activity tools (token-savior ~0.9k, claude-token-optimizer ~0.5k) are re-evaluated each quarter and may be demoted to ⚪ Skip if abandoned.

---

## Summary table

| Tool | ★ | License | Type | Recommendation | Note |
|------|----|---------|------|----------------|------|
| [caveman](https://github.com/juliusbrussee/caveman) | ~67.8k | MIT | Skill (+ optional MCP) | ✅ **Integrate** | Compresses agent **output** ~65% (telegraphic style, 4 levels). Covers the output side RTK doesn't. |
| [code-review-graph](https://github.com/tirth8205/code-review-graph) | ~17.9k | MIT | MCP + CLI | ✅ **Integrate** | Tree-sitter/AST code graph → reads only the blast radius on review. 38×–528× token reduction on large repos. |
| [token-savior](https://github.com/mibayy/token-savior) | ~0.9k | MIT | MCP + hooks | ✅ **Integrate** | Symbol-index + Bash output compaction (−80%). RTK alternative without a Rust binary. |
| [claude-token-efficient](https://github.com/drona23/claude-token-efficient) | ~5.5k | MIT | CLAUDE.md drop-in | ✅ **Integrate** | Prompt rules cutting Claude verbosity ~63% output / 17–41% cost. Zero code. |
| [context-mode](https://github.com/mksglu/context-mode) | ~16.3k | **ELv2** | MCP + hooks | 🔶 **Reference** | Sandboxes tool outputs (315 KB → 5.4 KB), SQLite session continuity. License blocks commercial redistribution. |
| [token-optimizer](https://github.com/alexgreensh/token-optimizer) (alexgreensh) | ~1.2k | **PolyForm NC** | Plugin | 🔶 **Reference** | Real-time dashboard + quality scoring. Noncommercial license. |
| [claude-context](https://github.com/zilliztech/claude-context) (zilliztech) | ~11.7k | MIT | MCP + VSCode ext | 🔶 **Reference** | Hybrid semantic search (BM25 + vectors) over the whole codebase. Requires a Milvus/Zilliz vector DB. |
| [claude-token-optimizer](https://github.com/nadimtuhin/claude-token-optimizer) (nadimtuhin) | ~0.5k | MIT | CLI | ⚪ **Skip** | Essential/supplemental doc split — already native to Claude Craft (`.claude/rules/`, on-demand skills). |
| [token-optimizer-mcp](https://github.com/ooples/token-optimizer-mcp) (ooples) | ~0.4k | MIT | MCP | ⚪ **Skip** | 95%+ claims unverified; inactive since Nov 2025. |

Legend: ✅ Integrate (documented + activation recipe) · 🔶 Reference (documented, license/infra caveat) ·
⚪ Skip (superseded or unverified).

---

## ✅ Recommended — Integrate

These four are MIT-licensed, mature or trivially safe, and cover gaps in Claude Craft's stack.

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

## 🔶 Reference only — license or infrastructure caveat

> **License compliance.** The tools below are **not** embedded in Claude Craft and **must not** be.
> ELv2 and PolyForm Noncommercial restrict commercial redistribution; we link to them so you can adopt
> them under your own terms.

- **context-mode** ([repo](https://github.com/mksglu/context-mode)) — **Elastic License v2 (ELv2)**.
  Excellent technically (output sandboxing, post-compaction continuity via native hooks) and closely
  aligned with rule 12, but ELv2 forbids offering it as a managed service / redistributing commercially.
  Evaluate for internal use under the ELv2 terms.
- **token-optimizer** (alexgreensh) ([repo](https://github.com/alexgreensh/token-optimizer)) —
  **PolyForm Noncommercial 1.0.0**. Real-time dashboard, checkpoint-based session continuity, quality
  scoring. Free for teams under the noncommercial threshold; commercial use is paid.
- **claude-context** (zilliztech) ([repo](https://github.com/zilliztech/claude-context)) — MIT, but
  requires an external **Milvus / Zilliz Cloud** vector database. High setup friction; reserve it for
  very large / enterprise codebases where hybrid semantic search pays for the infra.

---

## ⚪ Not recommended

- **claude-token-optimizer** (nadimtuhin) — splits docs into essential vs. supplemental. Already native
  to Claude Craft via modular `.claude/rules/` and on-demand skills; little marginal value.
- **token-optimizer-mcp** (ooples) — aggressive "95%+ reduction" claims without recent validation;
  no release since November 2025.

---

## Multi-model routing pattern (oh-my-claudecode style)

Claude Craft runs exclusively on Claude (Opus 4.8 / Sonnet 4-6 / Haiku 4-5) via the Dynamic Workflows tiering built into Claude Code (2.1.154+, `ultracode` trigger). This covers intra-provider cost optimisation.

A complementary **cross-provider routing** pattern has emerged with tools like **oh-my-claudecode** (~36k ★, [repo](https://github.com/oh-my-claudecode/oh-my-claudecode)): route sub-agents to Gemini CLI (free tier), OpenAI Codex, or other providers based on task type and cost. The pattern is:

```
Complex planning   → Claude Opus 4.8  (highest reasoning)
Standard coding    → Claude Sonnet 4-6 (best value on Claude)
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

**[claude-mem](https://github.com/punkpeye/claude-mem)** (~MIT, statut à vérifier avant usage) est un
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

**Ruflo** ([repo](https://github.com/ruflo/ruflo), licence à vérifier) opte pour une **indexation
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
| Mémoire _explicite_ depuis un agent | claude-mem (MCP, MIT, à pinner) |
| Historique long > 100 sessions, recherche sémantique | Ruflo (vectorDB, évaluer licence) |

---

## Also worth watching (from the 2026 roundup)

Evaluated at 2026-06-24 — not yet integrated but flagged for Q3 assessment:

| Tool | Status | Integration candidate |
|------|--------|-----------------------|
| **claude-health** | Maturing — config health audit | `/team:audit` supplementary check |
| **claude-hud** | Active — real-time context/agent/todo monitor | Complements `rtk gain`; surface in `/common:setup-rtk` |
| **claude-subconscious** | Experimental — cross-session memory via MCP | Alternative to `claude-mem` above |
| **tech-debt-skill** | Stable — tech-debt audit skill | Candidate for `/qa:*` namespace |

> **Graduation path:** any of these may be promoted to the main ✅ Integrate table when: (1) the tool is MIT-licensed, (2) has >1k stars or >6 months of active maintenance, and (3) covers a gap not already addressed in Claude Craft. The Q3 2026 review (2026-09-24) is the next evaluation checkpoint.

---

## Security before you install

Every third-party MCP server or skill runs with your permissions. Before enabling any tool on this page,
apply [`.claude/rules/11-security.md`](../.claude/rules/11-security.md):

- **Audit the source** and pin an exact version (no floating `latest`).
- **Minimal permissions** — grant only the tools/paths the server needs.
- Prefer Claude Code **v2.1.97+** when combining MCP servers with hooks.
- See [`docs/MCP.md#security`](MCP.md#security) for the full MCP hardening checklist.

> **Non-affiliation.** Claude Craft is not affiliated with any of the projects listed here. Stars,
> licenses, and activity reflect the 2026-06-02 evaluation and may have changed since.
