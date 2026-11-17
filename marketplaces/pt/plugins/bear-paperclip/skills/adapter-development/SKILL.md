---
name: adapter-development
description: Construir uma extensao Paperclip — um plugin via @paperclipai/plugin-sdk ou um adapter built-in sob packages/adapters. Use ao adicionar runtimes AI ou plugins feature.
---

# Desenvolvimento de Extensoes Paperclip

Duas superficies: **adapters** (runtimes AI, `packages/adapters/<name>/`, exporta `type/label/models/agentConfigurationDoc`) e **plugins** (features, `@paperclipai/plugin-sdk`, `definePlugin({setup(ctx)})`). Adapters e plugins nunca mantem estado governanca — o server forca orcamentos, aprovacoes, e tenancy.

Veja ../../rules/12-adapter-protocol.md para o contrato completo e exemplos.
