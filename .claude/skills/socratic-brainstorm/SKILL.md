---
name: socratic-brainstorm
description: Brainstorming socratique AVANT de coder - clarifier le problème par questions ciblées plutôt que sauter à la solution. Use when requirements are ambiguous or before starting a non-trivial feature.
context: fork
disable-model-invocation: true
triggers:
  keywords: ["brainstorm", "ideate", "clarify", "requirements", "unclear", "options", "approach"]
auto_suggest: true
---

# Socratic Brainstorm — Clarifier avant de coder

Skill inspiré de [obra/superpowers](https://github.com/obra/superpowers). **Objectif :** forcer une phase de questions ciblées avant toute implémentation, pour éviter de coder la mauvaise chose très vite.

**Règle d'or :** une question coûte 30 secondes, un faux développement coûte 3 jours.

## Méthode socratique : 5 familles de questions

À poser **avant** de toucher au code. Pas toutes à chaque fois — choisir les plus pertinentes selon le contexte.

### 1. Questions sur le PROBLÈME

- Quel est le **vrai** problème à résoudre ? (pas la solution supposée)
- Pour qui ? Quel persona / rôle utilisateur ?
- Quel est le coût de **ne rien faire** ?
- Comment mesurera-t-on le succès ? (KPI, métrique)
- Y a-t-il une solution plus simple qui résout 80% du besoin ?

### 2. Questions sur les CONTRAINTES

- Contraintes **métier** : règles légales, compliance, SLA ?
- Contraintes **techniques** : stack imposée, dépendances, legacy ?
- Contraintes **temporelles** : deadline, dépendances externes ?
- Contraintes **ressources** : budget infra, RH, maintenance long terme ?
- Que ne faut-il **surtout pas** casser ?

### 3. Questions sur les ALTERNATIVES

- Quelles sont les 3 approches possibles ? (minimum)
- Pourquoi celle-ci plutôt qu'une autre ?
- Qu'a-t-on déjà essayé / envisagé ?
- Existe-t-il une solution off-the-shelf (lib, SaaS) ?
- Peut-on ne rien coder (config, manuel, process) ?

### 4. Questions sur les HYPOTHÈSES

- Qu'est-ce qu'on **suppose** sans avoir vérifié ?
- Quel est le volume / trafic attendu ?
- Quel est le pattern d'usage réel (95% cas / 5% edge cases) ?
- Quels acteurs externes impliqués ? (API tierces, équipes, utilisateurs)
- Que se passe-t-il si cette hypothèse est fausse ?

### 5. Questions sur les CONSÉQUENCES

- Qu'est-ce qui change pour l'utilisateur final ?
- Impact sur les autres features / modules ?
- Coûts d'exploitation (infra, monitoring, support) ?
- Comment rollback si ça tourne mal ?
- Comment évolue cette solution dans 1 an, 3 ans ?

## Output attendu

Après la phase brainstorm, produire **une page** (max) avec :

1. **Problème reformulé** en 1-2 phrases
2. **Contraintes** principales (5 bullets max)
3. **Option retenue** + **2 alternatives** rejetées avec raison
4. **Hypothèses clés** à valider en début d'implémentation
5. **Risques identifiés** + mitigations

## Règles d'or

### NE PAS sauter cette phase si :
- La demande initiale contient le mot "peut-être", "probablement", "je pense"
- Le demandeur n'est pas un utilisateur final
- Multiple solutions semblent possibles à première vue
- La feature touche du code legacy ou un domaine complexe

### SAUTER cette phase si :
- Bug obvious avec un seul fix possible
- Typo / formatage / doc
- Tâche < 10 min avec périmètre trivial

## Anti-patterns

| Anti-pattern | Solution |
|--------------|----------|
| Brainstorm infini sans décision | Timebox 30 min max |
| Questions rhétoriques (réponse évidente) | Questions **ouvertes** et utiles |
| Répondre soi-même sans demander | Vraiment poser les questions au demandeur |
| Skip brainstorm "parce que c'est urgent" | L'urgence coûte 10x le brainstorm évité |
| Noter les réponses dans sa tête | Écrire = visible, revisitable, versionable |

## Intégration Claude Craft

- **`/workflow:analyze`** — phase d'analyse BMAD commence par ce skill
- **`/workflow:plan`** — PRD doit répondre aux 5 familles de questions
- **Agent `@product-owner`** — peut conduire le brainstorm avec le demandeur
- **Skill `atomic-tasks`** — l'output du brainstorm se découpe en tâches atomiques
- **Skill `architect`** — vient APRÈS le brainstorm pour les features architecturales

## Variante rapide : "5 Whys"

Pour bugs ou causes racines, utiliser les **5 Whys** de Toyota :

```
Bug: "Le paiement échoue"
Why 1: Pourquoi ? → L'API retourne 500
Why 2: Pourquoi ? → Timeout DB
Why 3: Pourquoi ? → Requête sans index
Why 4: Pourquoi ? → Colonne ajoutée sans migration d'index
Why 5: Pourquoi ? → Pas de checklist PR pour les migrations
```

**Cause racine :** absence de checklist, pas le 500.

## Ressources

- [obra/superpowers](https://github.com/obra/superpowers)
- [Socratic Method - Wikipedia](https://en.wikipedia.org/wiki/Socratic_method)
- [5 Whys - Toyota](https://en.wikipedia.org/wiki/Five_whys)
- Skill `atomic-tasks`, `architect`

---

**Date de dernière mise à jour :** 2026-04-15
**Version :** 1.0.0
