# Exercice 7 : Multi-Agent et Coordination

**Module :** 7 - Multi-Agent et Coordination
**Duree :** 20 minutes
**Niveau :** Avance

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Utiliser des sub-agents paralleles pour analyser un projet
- Comprendre le pattern Writer/Reviewer
- Choisir le bon pattern multi-agent selon le contexte

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Un projet existant accessible
- [ ] Modules 1 a 6 completes
- [ ] Comprendre le Task tool et les sub-agents

---

## Partie 1 : Sub-agent de recherche (10 min)

### Objectif

Demander a Claude Code d'analyser un projet en utilisant des sub-agents paralleles.

### Instructions

```bash
claude

> Utilise des sous-agents pour analyser ce projet en parallele :
> - Sub-agent 1 : Identifie l'architecture et les patterns utilises
> - Sub-agent 2 : Liste les dependances et leurs versions
> - Sub-agent 3 : Trouve les fichiers sans tests correspondants
>
> Synthetise les resultats des 3 sous-agents.
```

### Points a observer

- Comment Claude cree les sub-agents (Task tool)
- Le fait que les 3 agents travaillent en parallele
- La synthese des resultats a la fin
- Le temps d'execution (plus rapide que sequentiel)

### Resultat attendu

Claude devrait :
1. Lancer 3 Task tools en parallele
2. Chaque sub-agent explore le projet de maniere independante
3. Les resultats sont synthetises dans un rapport unifie

---

## Partie 2 : Pattern Writer/Reviewer simule (10 min)

### Objectif

Simuler le pattern Writer/Reviewer en une seule session pour comprendre le workflow.

### Instructions

```bash
> Simule le pattern Writer/Reviewer :
>
> 1. En tant que "Writer", cree une fonction de validation d'email robuste
>    avec les criteres suivants :
>    - Format valide (RFC 5322 simplifie)
>    - Domaine existant (verification basique)
>    - Pas d'email jetable (liste noire)
>    - Retourne un objet avec { valid: boolean, errors: string[] }
>
> 2. En tant que "Reviewer", critique cette implementation :
>    - Securite (injection, XSS)
>    - Performance (regex catastrophique ?)
>    - Edge cases manquants
>    - Conformite SOLID
>
> 3. En tant que "Writer", applique les corrections du reviewer
>
> 4. Montre le resultat final avec un diff avant/apres
```

### Points a observer

- La qualite de la premiere implementation (Writer)
- La pertinence des critiques (Reviewer)
- L'amelioration apres correction
- Le benefice de la relecture croisee

### Resultat attendu

- Le code final est meilleur que la premiere version
- Les critiques sont pertinentes et actionnables
- Le pattern montre la valeur de la review systematique

---

## Verification

- [ ] Les 3 sub-agents ont ete lances en parallele
- [ ] Chaque sub-agent a produit un resultat independant
- [ ] La synthese combine les 3 analyses
- [ ] Le pattern Writer/Reviewer produit un code ameliore
- [ ] Les critiques du reviewer sont pertinentes

---

## Bonus

Si vous avez termine en avance :

1. **Testez les git worktrees** pour du vrai parallelisme :
   ```bash
   # Creer un worktree
   git worktree add ../review-branch main

   # Lancer Claude dans le worktree
   cd ../review-branch && claude

   # Nettoyer
   git worktree remove ../review-branch
   ```

2. **Pattern Fan-out** : demandez a Claude d'appliquer le meme refactoring sur 3 modules differents en parallele.

3. **Arbre de decision** : pour un projet reel, utilisez l'arbre de decision du module pour choisir le pattern multi-agent adapte :
   ```
   Tache simple ?           -> Agent unique
   Besoin de recherche ?    -> Sub-agent
   Taches independantes ?   -> Fan-out / Worktrees
   Ecriture + relecture ?   -> Writer/Reviewer
   Coordination complexe ?  -> Agent Teams
   ```
