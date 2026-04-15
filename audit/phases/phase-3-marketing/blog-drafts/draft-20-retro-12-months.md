---
title: "12 months of Claude Craft : what we learned"
publishedAt: ""
canonical: ""
tags: ["retrospective", "ai", "claude-code", "build-in-public"]
status: DRAFT (fin phase 3)
author: Flavien Métivier
wordCount: ~2500
---

# 12 months of Claude Craft : what we learned

**TL;DR** : De 0 stars à marketplace. Des bugs. Des wins. Des pivots. Les chiffres, les erreurs, ce qu'on referait.

## L'histoire courte

- **Mois 0** : côté The Bearded CTO, on utilise Claude Code en mode artisanal. On accumule des règles `.claude/rules/*.md` projet par projet.
- **Mois 1** : on extrait en framework MIT `claude-craft`. Premier README, premier `make install`.
- **Mois 3** : BMAD v6 intégration. 4 stacks supportées (Symfony, React, Flutter, Python).
- **Mois 6** : audit interne → 12 rapports, 40+ constats. Roadmap "survie / stabilisation / différenciation / domination".
- **Mois 9** : extraction QA Recette en produit standalone. Dual licensing.
- **Mois 12** : on écrit ce post.

## Les chiffres (anonymisés)

(à remplir au moment de la publication, fin phase 3 — valeurs attendues d'après DoD P3)

- GitHub stars : X → Y
- Contributeurs externes : X → Y
- NPM downloads cumulés : X
- Discord membres : X
- MRR Chrome extension : €X
- Contrats SLA : X
- Skills marketplace : X
- Talks conf : X

## Ce qui a bien marché

### 1. L'approche audit avant feature

Au mois 6, on a arrêté d'ajouter des fonctionnalités et on a fait un **audit interne complet** (12 rapports, 11 247 lignes). Dur à l'ego (beaucoup de constats négatifs), payant long terme : on a identifié et réparé la dette avant qu'elle ne devienne fatale.

### 2. Les phases séquentielles

Survie → Stabilisation → Différenciation → Domination. Chaque phase a des DoD stricts. Pas de passage tant que < 80%. Force la discipline.

### 3. Dual licensing tardif

Tentation initiale : freemium dès le jour 0. On a résisté. MIT pur pendant 9 mois → adoption + confiance. Commercial tier introduit seulement quand il y avait des demandes explicites enterprise.

### 4. BMAD v6

Pas inventé ici. Adopté et packagé. La valeur de Claude Craft = **orchestration de bonnes idées existantes**, pas réinvention.

## Ce qui a raté

### 1. Trop de stacks trop vite

On a voulu supporter 11 stacks. Certaines (Paperclip, Vue.js) sont sous-investies. Leçon : 3-4 stacks profondes > 11 stacks shallow.

### 2. La communauté Discord lente

Discord lancé phase 1. 6 mois pour atteindre 100 membres actifs. Les canaux "sliceable par stack" ont créé trop de fragmentation. Pivot : canaux thématiques (#help, #showcase) > stack channels.

### 3. Le marketplace Skills sous-estimé

P3-23 prévu à 60h. Réel : ~140h. Modération communautaire = sous-évaluée. Solution : lead contributors trusted avec droits review.

### 4. Les conférences

P3-27 : 1 talk accepté (sur 3 soumis). CFP très sélectifs. Leçon : 10 soumissions pour espérer 2-3 acceptations. Commencer 12 mois avant la conf cible.

## Ce qu'on referait

- ✅ Audit interne tôt (mois 3, pas mois 6)
- ✅ Focus 3 stacks max en phase 1
- ✅ Discord dès le day 0
- ✅ Partenariat Anthropic : initier contact mois 3, pas mois 9

## Ce qu'on ne referait pas

- ❌ Supporter 11 stacks dès le début
- ❌ Ignorer la monétisation 9 mois (on avait les moyens de mieux tester le marché plus tôt)
- ❌ Embaucher avant d'avoir validé product-market-fit
- ❌ Rédiger 20 blog posts en parallèle (5 posts de qualité > 20 moyens)

## Les décisions critiques qu'on renouvelle

### MIT par défaut

Debate interne récurrent : "passer en commercial core". Toujours refusé. MIT = oxygène de l'adoption.

### Pas de VC funding

On aurait pu. Mais le modèle "sponsor-funded + services" (agence The Bearded CTO finance) nous laisse la liberté de **ne pas scaler à tout prix**.

### Build-in-public

Audit publié, phases publiques, rétros publiques. Vulnérable mais **énorme** pour la confiance communautaire.

## Le prochain chapitre

Phase 4 (domination) : 6-12 mois. Objectifs :

- €5K+ MRR stable
- Top 3 AI coding framework en Europe
- 10 contracts enterprise
- Événement Claude Craft Summit (Paris, 200 pers)

Si vous lisez cet article et voulez contribuer, le rendez-vous est sur [Discord](https://discord.gg/claude-craft) ou en sponsoring GitHub.

Merci à tous ceux qui ont ouvert une issue, soumis une PR, posté sur Discord, partagé un tweet. Cette année a compté.

— Flavien, [@thebeardedcto](https://twitter.com/thebeardedcto)
