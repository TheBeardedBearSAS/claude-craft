---
name: security-paperclip
description: Seguranca Paperclip — isolamento tenancy, secrets, gates aprovacao, orcamentos rigidos, canal adapter assinado. Use ao auditar ou fortalecer Paperclip.
---

# Seguranca Paperclip

`companyId` de sessao/path apenas (nunca corpo cliente); secrets criptografados em repouso + redactados em logs + resolvidos via `ctx.secrets.resolve(ref)` em plugins; gates aprovacao server-only e append-only; orcamentos sao limites rigidos forcados em dispatch; Better Auth para auth operador com `BETTER_AUTH_SECRET` rotacionado; CSP/HSTS/COOP/CORP enviados na UI; capacidades plugin declaradas minimamente; `pnpm audit --audit-level=high` em CI.

Veja ../../rules/11-security-paperclip.md para documentacao detalhada.
