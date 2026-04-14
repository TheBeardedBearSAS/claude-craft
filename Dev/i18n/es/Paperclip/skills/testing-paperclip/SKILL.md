---
name: testing-paperclip
description: Estrategia de testing de Paperclip — Vitest, test harness de plugin desde @paperclipai/plugin-sdk/testing, tests de integración con Postgres real, aislamiento cross-tenant. Usar al escribir o revisar tests de Paperclip.
---

# Testing de Paperclip

Vitest (unit + integración + cobertura); tests de plugin usan `createTestHarness` de `@paperclipai/plugin-sdk/testing`; tests de integración golpean un Postgres real (nunca mockeado); tests de aislamiento cross-tenant requeridos por módulo de servidor; cobertura ≥ 80% globalmente y más estricta en paths críticos de gobernanza (agents, approvals, costs).

Ver ../../rules/07-testing-paperclip.md para documentación detallada.
