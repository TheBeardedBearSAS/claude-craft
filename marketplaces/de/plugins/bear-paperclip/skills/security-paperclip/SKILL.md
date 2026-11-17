---
name: security-paperclip
description: Paperclip-Sicherheit — Tenancy-Isolation, Secrets, Approval-Gates, harte Budgets, signierter Adapter-Channel. Verwenden Sie dies beim Auditing oder Härten von Paperclip.
---

# Paperclip-Sicherheit

`companyId` nur aus Session/Pfad (niemals Client-Body); Secrets at rest verschlüsselt + in Logs redaktiert + aufgelöst via `ctx.secrets.resolve(ref)` in Plugins; Approval-Gates nur server-seitig und Append-only; Budgets sind harte Grenzen, durchgesetzt bei Dispatch; Better Auth für Operator-Auth mit rotiertem `BETTER_AUTH_SECRET`; CSP/HSTS/COOP/CORP auf UI ausgeliefert; Plugin-Capabilities minimal deklariert; `pnpm audit --audit-level=high` in CI.

Siehe ../../rules/11-security-paperclip.md für ausführliche Dokumentation.
