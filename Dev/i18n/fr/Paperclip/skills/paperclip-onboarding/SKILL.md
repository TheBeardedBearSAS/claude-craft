---
name: paperclip-onboarding
description: Onboarder une instance Paperclip — installation, bootstrap du compte opérateur CEO, création d'une company via le dashboard, recrutement du premier agent, installation d'un plugin. À utiliser pour bootstrapper ou brancher Claude Code dans Paperclip.
---

# Onboarding Paperclip

1. `npx paperclipai onboard --yes` (ou clone + `pnpm install && pnpm dev`).
2. `paperclipai doctor` — corriger les échecs durs.
3. `paperclipai auth-bootstrap-ceo` — créer le compte opérateur initial.
4. Se connecter au dashboard (par défaut `http://localhost:3100`) et créer la company, ou en importer une avec `paperclipai company import`.
5. Confirmer que les adaptateurs disponibles (`claude_local`, `codex_local`, `cursor_local`, `gemini_local`, `opencode_local`, `openclaw_gateway`, `pi_local`) sont enregistrés.
6. Recruter le premier agent via le dashboard (**Agents → Hire**) ou `POST /companies/:companyId/agents`.
7. Optionnel : installer un plugin avec `paperclipai plugin install <package>` puis `paperclipai plugin enable <key>`.
8. Committer un répertoire `.paperclip/` local au dépôt avec runbook et notes d'onboarding (pas de secrets, pas de `BETTER_AUTH_SECRET`).

Voir ../../commands/setup-company.md pour la procédure complète.
