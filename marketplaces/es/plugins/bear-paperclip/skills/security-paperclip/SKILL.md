---
name: security-paperclip
description: Seguridad de Paperclip — aislamiento de tenencia, secretos, compuertas de aprobación, presupuestos duros, canal de adaptador firmado. Usar al auditar o endurecer Paperclip.
---

# Seguridad de Paperclip

`companyId` solo desde sesión/path (nunca body del cliente); secretos cifrados en reposo + redactados en logs + resueltos vía `ctx.secrets.resolve(ref)` en plugins; compuertas de aprobación solo-servidor y solo-agregar; presupuestos son límites duros aplicados al dispatch; Better Auth para auth de operador con `BETTER_AUTH_SECRET` rotado; CSP/HSTS/COOP/CORP enviados en UI; capacidades de plugin declaradas mínimamente; `pnpm audit --audit-level=high` en CI.

Ver ../../rules/11-security-paperclip.md para documentación detallada.
