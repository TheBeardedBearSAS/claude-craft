---
name: adapter-development
description: Erstellen Sie eine Paperclip-Extension — ein Plugin via @paperclipai/plugin-sdk oder einen Built-in-Adapter unter packages/adapters. Verwenden Sie dies beim Hinzufügen von AI-Runtimes oder Feature-Plugins.
---

# Paperclip-Extension-Development

Zwei Oberflächen: **Adapter** (AI-Runtimes, `packages/adapters/<name>/`, exportieren `type/label/models/agentConfigurationDoc`) und **Plugins** (Features, `@paperclipai/plugin-sdk`, `definePlugin({setup(ctx)})`). Adapter und Plugins halten niemals Governance-Zustand — der Server setzt Budgets, Approvals und Tenancy durch.

Siehe ../../rules/12-adapter-protocol.md für den vollständigen Vertrag und Beispiele.
