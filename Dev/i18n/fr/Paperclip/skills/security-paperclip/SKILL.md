---
name: security-paperclip
description: Sécurité Paperclip — isolation tenant, secrets, portes d'approbation, budgets stricts, capacités plugin minimales. À utiliser pour auditer ou durcir Paperclip.
---

# Sécurité Paperclip

`companyId` tiré uniquement de la session/du path (jamais du body client) ; secrets chiffrés au repos + rédigés dans les logs + résolus via `ctx.secrets.resolve(ref)` dans les plugins ; portes d'approbation serveur-only et append-only ; les budgets sont des limites strictes appliquées au dispatch ; Better Auth pour l'auth opérateur avec un `BETTER_AUTH_SECRET` tourné ; CSP/HSTS/COOP/CORP livrés sur l'UI ; capacités de plugin déclarées au minimum ; `pnpm audit --audit-level=high` dans la CI.

Voir ../../rules/11-security-paperclip.md pour la documentation détaillée.
