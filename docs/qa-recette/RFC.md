# RFC — QA Recette Standalone v1.0

> **Status** : DRAFT — à publier sur GitHub Discussions `qa-recette` après review `@tech-lead`.
> **Auteur** : Équipe Claude Craft (The Bearded Bear SAS).
> **Date cible publication** : sprint 1 phase 3.
> **Comment period** : 14 jours minimum.

## TL;DR

QA Recette (actuellement intégré à Claude Craft) devient un outil autonome **entièrement open-source MIT** :
- **SDK MIT** (`@claude-craft/qa-recette-sdk`, NPM)
- **Extension Chrome MIT** (Chrome Web Store)
- **Backend self-hostable MIT optionnel** (sync multi-devices, dashboards, CI webhooks)

Claude Craft reste l'orchestrateur principal (command `/qa:recette` inchangé), mais délègue l'exécution au SDK.

## Motivation

1. **Adoption élargie** : équipes QA non-Claude-Code-users peuvent bénéficier de l'outil.
2. **Auditabilité** : tout le code est ouvert et fork-friendly, dans l'esprit MIT de Claude Craft.
3. **Focus produit** : extraire permet d'itérer sans frictions vs repo Claude Craft multi-stack.

## Questions soumises à la communauté

1. **API publique** : est-ce que `createSession / runTests / resume` couvre 90% des cas ? Manque-t-il des primitives (pause/stop, fork session) ?
2. **Format session JSON** : quelle stabilité attendue (semver major break ou jamais) ?
3. **Backend** : self-host Docker suffisant, ou besoin d'un service hébergé communautaire ?
4. **CI integration** : GitHub Actions / GitLab CI / Jenkins — quelle priorité ?

## Alternatives considérées

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| Tout dans Claude Craft | Un seul repo, contributeurs unifiés | Pas d'outil autonome réutilisable hors Claude Craft | ❌ |
| **Tout open-source MIT (SDK + extension + backend)** | Valeurs OSS pures, adoption large, auditable, fork-friendly | Pas de revenue direct (financé par dons/communauté) | ✅ retenu |
| Modèle propriétaire/payant | Protection, revenue | Contraire à l'engagement MIT-only de Claude Craft | ❌ |

## Impact breaking

- Command `/qa:recette` reste compatible (wrapper appelle SDK).
- Structure `~/.qa-recette/` remplace `~/.claude/qa-sessions/` — migration auto au premier run.
- Chrome extension v1.0.36 actuelle → v2.0.0 (nouveau bundle, nouveau ID store possible).

## Timeline

- J+0 : publication RFC
- J+14 : fin comment period
- J+21 : revision finale
- J+28 : début implémentation sprint 1

## Comment contribuer

- Commenter sur GitHub Discussions `qa-recette/general/RFC-v1.0`
- Ouvrir une issue dédiée pour un concern spécifique
- Proposer une PR sur ce document
