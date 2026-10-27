# Quel chemin choisir ? Votre workflow en 30 secondes

> **Pour qui ?** Toute personne sur le point de démarrer avec Claude Craft et qui se demande « quelles commandes lancer, et dans quel ordre ? ». Répondez à deux questions, suivez un seul chemin.
>
> **Règle d'or :** une situation = un chemin = une courte séquence de commandes. Vous n'avez jamais besoin des 100+ autres commandes pour démarrer.

---

## 1. L'arbre de décision

```
                    Que faites-vous aujourd'hui ?
                               │
        ┌──────────────┬───────┴────────┬──────────────────┐
        ▼              ▼                ▼                  ▼
  Un nouveau       Du code existant, Un bug à corriger  Un sprint planifié
  produit          pas encore de                        à terminer sans
  from scratch     backlog                              surveillance
        │              │                │                  │
        ▼              ▼                ▼                  ▼
   GREENFIELD      BROWNFIELD        BUGFIX         SPRINT AUTONOME
  /workflow:init  /project:scan     /qa:tdd         /workflow:auto-sprint N
        │              │          (+ Quick Flow)          │
        ▼              ▼                ▼                  ▼
     Section 2      Section 3       Section 4          Section 5

  Perdu à tout moment ?  →  /workflow:status   (Section 6)
```

Pas sûr ? Posez-vous ces questions :

1. **Y a-t-il déjà du code ?** Non → Greenfield. Oui → question 2.
2. **Y a-t-il déjà un backlog (epics et stories) ?** Non → Brownfield. Oui → question 3.
3. **S'agit-il d'un seul bug ?** Oui → Bugfix. Non → poursuivez le sprint avec `/workflow:start N`, ou confiez-le au Sprint autonome.

---

## 2. Greenfield : un nouveau produit

Vous avez une idée et un dépôt vide. Suivez le chemin principal, une phase à la fois :

```
/workflow:init  →  /workflow:plan  →  /workflow:design  →  /workflow:start 1
                →  /workflow:implement  →  /workflow:review  →  /workflow:retro
```

| Étape | Commande | Ce que vous obtenez |
|-------|----------|---------------------|
| 1 | `/workflow:init` | Analyse du projet, track recommandé (Quick, Standard ou Enterprise) et `.bmad/sprint-status.yaml` |
| 2 | `/workflow:plan` | PRD, personas et backlog généré |
| 3 | `/workflow:design` | Spécification technique et architecture |
| 4 | `/workflow:start 1` | Sprint 1 préparé : stories sélectionnées et prêtes pour le développement |
| 5 | `/workflow:implement` | Stories réalisées en TDD (Red → Green → Refactor) |
| 6 | `/workflow:review` | Préparation de la revue de sprint |
| 7 | `/workflow:retro` | Rétrospective, puis retour à `/workflow:start 2` |

Pour une version narrée pas à pas, lisez le [tutoriel du workflow complet](10-complete-workflow.md).

---

## 3. Brownfield : du code existant, pas de backlog

Vous héritez (ou avez déjà écrit) d'une base de code, mais personne n'a documenté ce qu'elle fait. Faites d'abord de la rétro-ingénierie du produit, puis rejoignez le chemin principal :

```
/project:scan  →  /project:reverse-prd  →  /project:reverse-stories
               →  /project:gap-analysis  →  /workflow:start
```

| Étape | Commande | Ce que vous obtenez |
|-------|----------|---------------------|
| 1 | `/project:scan` | Inventaire de la base de code : stack, structure, modules |
| 2 | `/project:reverse-prd` | Un PRD reconstruit à partir de ce que le code fait réellement |
| 3 | `/project:reverse-stories` | Des user stories déduites des fonctionnalités existantes |
| 4 | `/project:gap-analysis` | Fonctionnalités manquantes, tests manquants, dette technique |
| 5 | `/workflow:start` | Premier sprint planifié à partir des écarts ; poursuivez avec `/workflow:implement` |

Voir aussi le [guide d'intégration à un projet existant](09-setup-existing-project.md).

---

## 4. Bugfix : reproduire d'abord, corriger ensuite

Un bug n'a pas besoin de PRD. Utilisez le track le plus léger et laissez le test guider la correction :

```
/qa:tdd        ← écrire D'ABORD le test qui reproduit le bug (il doit échouer)
/workflow:init --quick    ← track Quick Flow : implémentation seule
```

1. Lancez `/qa:tdd` et décrivez le bug. Le test qui le reproduit est écrit **avant** toute correction, et doit échouer.
2. Lancez `/workflow:init --quick` pour forcer le track Quick Flow (pas de phases de planification ni de conception).
3. Corrigez le code jusqu'à ce que le test passe, puis refactorez. Le test reste dans la suite comme garde-fou de non-régression : un bug corrigé ne doit jamais revenir.

Voir le [guide de correction de bugs](04-bug-fixing.md) pour le détail.

---

## 5. Sprint autonome : une commande, du démarrage au merge

Quand le travail est déjà planifié, laissez Claude Craft piloter tout le sprint :

```
/workflow:auto-sprint N
```

**Prérequis**

- Un backlog existe (issu du chemin Greenfield ou Brownfield).
- Le sprint `N` est planifié.

**Ce que la commande fait :** elle enchaîne le démarrage, la décomposition en tâches, la validation, l'implémentation, la pull request, la CI, la revue, la rétrospective et enfin le merge. L'exécution se termine par la **PR, une CI verte et le merge**. Vous relisez le résultat au lieu de taper chaque commande.

Vous préférez le contrôle à la vitesse ? Restez sur le chemin principal manuel de la Section 2.

---

## 6. Où en suis-je ?

À tout moment, quel que soit le chemin :

```
/workflow:status
```

La commande affiche la phase en cours, l'avancement du sprint et la prochaine action recommandée.

> **Source de vérité unique :** `.bmad/sprint-status.yaml` contient le statut de chaque story (`backlog → ready-for-dev → in-progress → review → done`, ou `blocked`). Il est créé par `/workflow:init`, et chaque commande le lit et le met à jour. Si deux vues divergent, ce fichier fait foi.

---

## Aide-mémoire

| Situation | Commencer par | Ensuite |
|-----------|---------------|---------|
| Nouveau produit | `/workflow:init` | `/workflow:plan` → `/workflow:design` → `/workflow:start 1` |
| Code existant, pas de backlog | `/project:scan` | `/project:reverse-prd` → `/project:reverse-stories` → `/project:gap-analysis` → `/workflow:start` |
| Bug | `/qa:tdd` | `/workflow:init --quick` |
| Sprint planifié, sans intervention | `/workflow:auto-sprint N` | Relire la PR |
| Perdu | `/workflow:status` | Suivre l'action recommandée |
