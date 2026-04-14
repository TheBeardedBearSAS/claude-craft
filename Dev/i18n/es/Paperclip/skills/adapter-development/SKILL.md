---
name: adapter-development
description: Construir una extensión Paperclip — un plugin vía @paperclipai/plugin-sdk o un adaptador built-in bajo packages/adapters. Usar al agregar runtimes de IA o plugins de funcionalidad.
---

# Desarrollo de Extensiones Paperclip

Dos superficies: **adaptadores** (runtimes de IA, `packages/adapters/<name>/`, exportan `type/label/models/agentConfigurationDoc`) y **plugins** (funcionalidades, `@paperclipai/plugin-sdk`, `definePlugin({setup(ctx)})`). Los adaptadores y plugins nunca mantienen estado de gobernanza — el servidor aplica presupuestos, aprobaciones y tenencia.

Ver ../../rules/12-adapter-protocol.md para el contrato completo y ejemplos.
