---
name: ecosystem-tools
description: Third-party Claude Code token/context/code-review tools. Use when choosing or recommending an external tool to reduce token usage, manage context, or review large codebases (caveman, code-review-graph, token-savior, context-mode...).
triggers:
  keywords: ["token optimization", "reduce tokens", "context management", "code review tool", "caveman", "code-review-graph", "token-savior", "context-mode", "claude-context", "MCP server", "RTK alternative"]
auto_suggest: true
---

# Ecosystem Tools

Curated third-party Claude Code tools that complement Claude Craft's native token/context stack (RTK,
`context: fork` skills, compaction hooks). None are bundled — they are documented with activation
recipes and license caveats.

See `@docs/ECOSYSTEM.md` for the full catalogue, licenses, and `.mcp.json` snippets.

## Quick reference

| Tool | License | Use it for | Rec |
|------|---------|-----------|-----|
| **caveman** | MIT | Compress agent **output** ~65% | ✅ Integrate |
| **code-review-graph** | MIT | AST graph → read only the blast radius on review | ✅ Integrate |
| **token-savior** | MIT | Symbol index + Bash output compaction (−80%), RTK alternative | ✅ Integrate |
| **claude-token-efficient** | MIT | Anti-verbosity CLAUDE.md drop-in | ✅ Integrate |
| **context-mode** | ELv2 | Output sandboxing — license blocks commercial redistribution | 🔶 Reference |
| **claude-context** | MIT | Semantic search; needs a Milvus/Zilliz vector DB | 🔶 Reference |

> Audit the source and pin a version before enabling any third-party MCP server or skill — see
> `@.claude/rules/11-security.md` and `@docs/MCP.md#security`.
