# Auto Mode Guide

> **Requires:** Claude Code **v2.1.193+** (classifier-based auto mode; `classifyAllShell` needs 2.1.193+, the richer `environment` slots need 2.1.195+). On Bedrock / Vertex AI / Foundry / Claude apps gateway you must also set `CLAUDE_CODE_ENABLE_AUTO_MODE`.

## What is Auto Mode?

Auto Mode lets Claude Code run **without routine permission prompts** by routing every tool call through a **classifier** that blocks anything irreversible, destructive, or aimed **outside your environment**. It is the middle ground between approving everything and `--dangerously-skip-permissions`.

Key mental model — auto mode is a **second gate that runs *after* the permissions system**:

1. `permissions.deny` / `ask` rules are evaluated **first** (they still block or prompt).
2. Everything else then passes through the classifier, which decides allow / block based on your trusted-environment context and its built-in safety rules.

> There is **no `auto_approve` / `confirm` / `block` command-list profile** and **no `claude config auto-mode.profile` command**. Any guide describing those is out of date — the real surface is the `autoMode` block in `settings.json` plus the `claude auto-mode` subcommands documented below.

Enable it interactively with the permission-mode switch (`/permissions` → Auto), via `--permission-mode auto`, or by setting `"permissions": { "defaultMode": "auto" }`. See [Permission modes](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode) for what it blocks by default.

---

## Where the classifier reads configuration

The classifier reads the same **CLAUDE.md** content Claude loads, so a rule like *"never force push"* in your project steers both. For cross-project rules (trusted infra, org-wide deny), use the `autoMode` settings block:

| Scope | File | Use for |
|-------|------|---------|
| One developer | `~/.claude/settings.json` | Personal trusted infrastructure |
| One project, one dev | `.claude/settings.local.json` | Per-project trusted buckets/services |
| Organization-wide | Managed settings | Trusted infra pushed to all developers |
| Per-invocation | `--settings` flag / Agent SDK inline JSON | Automation overrides |

> ⚠️ The classifier **does not** read `autoMode` from shared `.claude/settings.json` — a checked-in repo cannot inject its own allow rules. Put trust rules in `~/.claude/settings.json` or `.claude/settings.local.json`.

---

## The `autoMode` block

Four prose-rule arrays (natural language, **not** globs/regex) plus one toggle:

| Field | Purpose | Precedence |
|-------|---------|------------|
| `autoMode.environment` | Trusted repos, buckets, domains, services (what "external" means) | context |
| `autoMode.hard_deny` | Unconditional security boundaries | 1 (never overridable) |
| `autoMode.soft_deny` | Destructive actions user intent can clear | 2 |
| `autoMode.allow` | Exceptions to `soft_deny` | 3 |
| `autoMode.classifyAllShell` | `true` = route **every** Bash/PowerShell command through the classifier (ignore narrow allow rules) | — |

Explicit user intent overrides remaining soft blocks: *"force-push this branch"* authorizes the push; *"clean up the repo"* does not.

### `$defaults` — always splice, never replace

Include the literal string `"$defaults"` in any array to keep the built-in rules and add yours around them:

```json
{
  "autoMode": {
    "environment": [
      "$defaults",
      "Organization: Acme Corp. Primary use: software development",
      "Source control: github.com/acme-corp and all repos under it",
      "Trusted internal domains: *.internal.acme.com",
      "Key internal services: CI at ci.acme.com, registry at registry.acme.com"
    ],
    "allow": [
      "$defaults",
      "Deploying to the staging namespace is allowed: staging resets nightly"
    ],
    "soft_deny": [
      "$defaults",
      "Never run DB migrations outside the migrations CLI, even on dev"
    ],
    "hard_deny": [
      "$defaults",
      "Never send repository contents to third-party code-review APIs"
    ]
  }
}
```

> 🚨 **Omitting `"$defaults"` replaces the entire list for that section.** A `soft_deny` without `"$defaults"` discards every built-in block (force push, `curl | bash`, prod deploys); a `hard_deny` without it discards the built-in data-exfiltration and auto-mode-bypass guards. Only omit `"$defaults"` when you deliberately take full ownership (copy `claude auto-mode defaults` first).

A ready-to-fill starter lives at [`.claude/templates/auto-mode-profile.json`](../../.claude/templates/auto-mode-profile.json) — copy its `autoMode` block into `~/.claude/settings.json` and fill in your infrastructure.

---

## Inspect & validate

```bash
claude auto-mode defaults   # print built-in environment/allow/soft_deny/hard_deny rules (JSON)
claude auto-mode config     # print the EFFECTIVE config ($defaults expanded, your rules applied)
claude auto-mode critique   # AI review of your custom rules (ambiguous/redundant/false-positive-prone)
```

Run `claude auto-mode config` after editing settings to confirm the effective rules are what you expect.

---

## Review denials

When auto mode blocks a call, it lands in `/permissions` → **Recently denied**. Press **`r`** on an entry to mark it for retry (Claude Code tells the model it may retry when you exit). In v2.1.193+ the classifier's **reason** shows next to each denial — use it to decide whether the fix is an `environment` entry, an `allow` exception, or retrying with explicit intent. Repeated denials for the same destination usually mean the classifier lacks context: add it to `autoMode.environment`, then re-run `claude auto-mode config`. To react programmatically, use the [`PermissionDenied` hook](https://code.claude.com/docs/en/hooks#permissiondenied).

---

## Rollout for a Claude Craft project

1. Start with defaults on (`"$defaults"` only) and observe what gets blocked.
2. Add your **source-control org** and **key internal services** to `environment` — resolves the most common false positive (pushing to your own repos).
3. Add trusted **domains** and **cloud buckets** next; fill the rest as blocks come up.
4. For CI/automation that must never bypass a narrow allow rule, set `"classifyAllShell": true` (trades latency for coverage).
5. Keep hard boundaries in **`permissions.deny`** (managed settings) — those block *before* the classifier and cannot be overridden.

---

## Resources

- [Configure auto mode](https://code.claude.com/docs/en/auto-mode-config) — full configuration reference
- [Permission modes](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode) — enable + default blocks
- [Permissions](https://code.claude.com/docs/en/permissions) — allow/ask/deny evaluated before the classifier

---

**Last Updated:** 2026-07-03
**Version:** 2.0.0
