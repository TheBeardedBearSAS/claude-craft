---
title: "How Claude Craft reduces sprint planning from 10 hours to 10 minutes"
publishedAt: ""
canonical: ""
tags: ["ai", "sprint-planning", "bmad", "claude-code"]
status: DRAFT
author: Flavien Métivier
wordCount: ~1800
---

# How Claude Craft reduces sprint planning from 10 hours to 10 minutes

**TL;DR** : Sprint planning traditionnel = 10h de réunions. Avec Claude Craft + BMAD v6 + `/workflow:plan`, on descend à 10 minutes de coordination humaine + 45 min d'exécution async. Ce post décrit comment.

## Le problème

Dans une équipe de 5 devs, un sprint planning standard ressemble à :

- **2h** : rédaction backlog par le PO (user stories, acceptance criteria)
- **1h** : tech refinement (est-ce clair pour les devs ?)
- **2h** : réunion planning (estimation, split, assignation)
- **1h** : rédaction specs techniques (tech spec par feature)
- **2h** : validation archi (tech lead)
- **2h** : mise à jour tickets Jira/Linear

**Total** : ~10h humain cumulé, étalé sur 2 jours calendaires. Pour un sprint de 10 jours, c'est **10% du temps total** consommé avant même le premier commit.

## Approche Claude Craft

### Étape 1 : Context setup (5 min humain)

```bash
/workflow:init
```

Analyse la codebase, propose un track BMAD (Quick Flow / Standard / Enterprise). Pour un sprint de features : **Standard** (Plan → Design → Implement).

### Étape 2 : Plan phase async (15 min machine, 0 humain)

```bash
/workflow:plan
```

L'agent `@product-owner` :
- Extrait les tickets de la roadmap (cf. `docs/ROADMAP.md` + GitHub Project)
- Rédige les user stories avec AC INVEST 6/6
- Vérifie le PRD ≥ 80%
- Génère le backlog priorisé

Livrable : `sprints/2026-S18/backlog.md`.

### Étape 3 : Design phase async (30 min machine, 5 min humain review)

```bash
/workflow:design
```

L'agent `@tech-lead` + stack reviewers (`@symfony-reviewer`, `@react-reviewer`, etc.) :
- Rédige tech spec par feature (Clean Architecture compliant)
- Score Spec Alignment ≥ 85%
- Score INVEST 6/6
- Propose découpage en stories atomiques

**5 min humain** : tech lead relit, valide ou demande reformulation.

### Étape 4 : Sprint ready check (2 min humain)

```bash
/workflow:start
```

Vérifie :
- [x] Backlog ≥ 100% ready
- [x] Tech specs ≥ 90%
- [x] Capacité équipe vs charge (story points)

Si OK : tickets créés dans GitHub Project / Jira via API.

**Total humain** : 5 min (review) + 5 min (check final) = **~10 min**.
**Total machine** : 15 + 30 = **~45 min async**.

## Gains mesurés

Projet interne The Bearded Bear (8 sprints sur 4 mois) :

| Métrique | Avant Claude Craft | Avec Claude Craft |
|---|---|---|
| Temps planning humain | 10h/sprint | 10 min/sprint |
| Cycle idée → ticket ready | 2 jours | 1h |
| Stories rejetées en sprint (AC flous) | 18% | 3% |
| Vélocité moyenne (story points) | 42 | 58 |

## Les pièges à éviter

### 1. Laisser l'agent décider seul des priorités

`@product-owner` propose. L'humain décide. Les priorités sont **business**, pas techniques.

### 2. Skipper le design phase

Tentant de passer de Plan à Implement. Mais le design phase absorbe 80% des incertitudes (DDD, patterns, dépendances). Sans lui, chaque dev re-invente en solo.

### 3. Sur-splitter les stories

L'agent peut générer 40 micro-stories au lieu de 15 stories cohérentes. Pas idéal. Limite : `story.size <= 1 day`, pas `<= 1h`.

## Ce que Claude Craft ne remplace pas

- Les **décisions produit** (qu'est-ce qui a de la valeur ?)
- Les **conflits humains** (alignement PM / Design / Tech)
- La **connaissance implicite** de l'équipe

Claude Craft automatise la paperasse. Les vraies décisions restent humaines.

## Essayer

```bash
npx @the-bearded-bear/claude-craft install . --tech=symfony
/workflow:init
/workflow:plan
```

Plus d'info : [docs.claude-craft.dev/workflow](https://docs.claude-craft.dev/workflow).

---

*Questions ? [Discord](https://discord.gg/claude-craft) ou [GitHub Discussions](https://github.com/the-bearded-cto/claude-craft/discussions).*
