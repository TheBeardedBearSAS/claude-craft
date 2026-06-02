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

**Evaluation date:** 2026-06-02 · **Sources:** the 9 repositories below + the
[Top Skills/Plugins Claude Code 2026 (camilleroux.com)](https://www.camilleroux.com/top-skills-plugins-claude-code-2026-v3/)
roundup.

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

## Also worth watching (from the 2026 roundup)

Not evaluated in depth here, but flagged for future integration assessment:
**claude-health** (config health audit — could feed `/team:audit`), **claude-hud** (real-time
context/agent/todo monitor — complements `rtk gain`), **claude-subconscious** (cross-session memory),
**tech-debt-skill** (tech-debt audit — candidate for `/qa:*`).

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
