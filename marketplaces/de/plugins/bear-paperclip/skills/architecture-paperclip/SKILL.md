---
name: architecture-paperclip
description: Paperclip-Two-Layer-Architektur (Control-Plane + Adapter). Verwenden Sie dies beim Entwerfen oder Reviewen von Paperclip-Modul-/Adapter-Grenzen.
---

# Paperclip-Architektur

Two-Layer-System: Control-Plane (Server + Web + DB) hält den gesamten Governance-Zustand; Adapter führen Arbeit aus und berichten. Adapter entscheiden niemals über Budgets oder Approvals.

Siehe ../../rules/02-architecture-paperclip.md für ausführliche Dokumentation.
