---
name: testing-paperclip
description: Paperclip testing strategy — Vitest, plugin test harness from @paperclipai/plugin-sdk/testing, real Postgres integration tests, cross-tenant isolation. Use when writing or reviewing Paperclip tests.
---

# Paperclip Testing

Vitest (unit + integration + coverage); plugin tests use `createTestHarness` from `@paperclipai/plugin-sdk/testing`; integration tests hit a real Postgres (never mocked); cross-tenant isolation tests required per server module; coverage ≥ 80% globally and stricter on governance-critical paths (agents, approvals, costs).

See ../../rules/07-testing-paperclip.md for detailed documentation.
