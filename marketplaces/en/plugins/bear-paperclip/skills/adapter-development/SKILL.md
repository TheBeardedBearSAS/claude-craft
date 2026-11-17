---
name: adapter-development
description: Build a Paperclip extension — a plugin via @paperclipai/plugin-sdk or a built-in adapter under packages/adapters. Use when adding AI runtimes or feature plugins.
---

# Paperclip Extension Development

Two surfaces: **adapters** (AI runtimes, `packages/adapters/<name>/`, export `type/label/models/agentConfigurationDoc`) and **plugins** (features, `@paperclipai/plugin-sdk`, `definePlugin({setup(ctx)})`). Adapters and plugins never hold governance state — the server enforces budgets, approvals, and tenancy.

See ../../rules/12-adapter-protocol.md for the full contract and examples.
