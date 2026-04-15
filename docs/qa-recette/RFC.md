# RFC — QA Recette Standalone v1.0

> **Status** : DRAFT — à publier sur GitHub Discussions `qa-recette` après review `@tech-lead`.
> **Auteur** : Équipe Claude Craft (The Bearded Bear SAS).
> **Date cible publication** : sprint 1 phase 3.
> **Comment period** : 14 jours minimum.

## TL;DR

QA Recette (actuellement intégré à Claude Craft) devient un produit autonome :
- **SDK open-source MIT** (`@claude-craft/qa-recette-sdk`, NPM)
- **Extension Chrome payante** ($9/mois Starter, $29/mois Team)
- **Backend cloud optionnel** (sync multi-devices, dashboards, CI webhooks)

Claude Craft reste l'orchestrateur principal (command `/qa:recette` inchangé), mais délègue l'exécution au SDK.

## Motivation

1. **Moat défendable** : Anthropic peut commoditiser l'AI agent généraliste, pas un outil QA spécialisé avec Chrome extension.
2. **Revenue stream** : cible €5-10K MRR à 12 mois.
3. **Adoption élargie** : équipes QA non-Claude-Code-users peuvent bénéficier de l'outil.
4. **Focus produit** : extraire permet d'itérer sans frictions vs repo Claude Craft multi-stack.

## Questions soumises à la communauté

1. **API publique** : est-ce que `createSession / runTests / resume` couvre 90% des cas ? Manque-t-il des primitives (pause/stop, fork session) ?
2. **Format session JSON** : quelle stabilité attendue (semver major break ou jamais) ?
3. **Modèle freemium** : 5 sessions/mois free tier, acceptable ou trop restrictif ?
4. **Chrome propriétaire** : cannibalise-t-elle l'esprit OSS de Claude Craft ? Alternative : extension MIT + cloud payant uniquement ?
5. **CI integration** : GitHub Actions / GitLab CI / Jenkins — quelle priorité ?

## Alternatives considérées

| Alternative | Pros | Cons | Verdict |
|---|---|---|---|
| Tout dans Claude Craft | Un seul repo, contributeurs unifiés | Pas de produit autonome, pas de revenue | ❌ |
| Tout open-source MIT | Valeurs OSS pures | Aucun moat, pas de revenue direct | ❌ (se positionner sur services) |
| Tout propriétaire | Protection maximale | Adoption lente, perte crédibilité | ❌ |
| **Dual : SDK OSS + Ext propriétaire** | Adoption + revenue | Complexité licensing | ✅ retenu |

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
