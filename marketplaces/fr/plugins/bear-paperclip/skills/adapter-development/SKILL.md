---
name: adapter-development
description: Construire une extension Paperclip — un plugin via @paperclipai/plugin-sdk, ou un adaptateur interne sous packages/adapters. À utiliser pour ajouter un runtime IA ou un plugin de fonctionnalité.
---

# Développement d'extensions Paperclip

Deux surfaces : **adaptateurs** (runtimes IA, `packages/adapters/<name>/`, exports `type/label/models/agentConfigurationDoc`) et **plugins** (fonctionnalités, `@paperclipai/plugin-sdk`, `definePlugin({setup(ctx)})`). Ni les adaptateurs ni les plugins ne détiennent d'état de gouvernance — le serveur applique les budgets, les approbations et la tenance.

Voir ../../rules/12-adapter-protocol.md pour le contrat complet et les exemples.
