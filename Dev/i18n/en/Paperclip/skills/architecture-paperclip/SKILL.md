---
name: architecture-paperclip
description: Paperclip two-layer architecture (control plane + adapters). Use when designing or reviewing Paperclip module/adapter boundaries.
---

# Paperclip Architecture

Two-layer system: control plane (server + web + DB) holds all governance state; adapters execute work and report. Adapters never decide budgets or approvals.

See ../../rules/02-architecture-paperclip.md for detailed documentation.
