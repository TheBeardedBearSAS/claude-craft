# Gestion du Contexte

## Vue d'ensemble

La fenetre de contexte est **LA ressource critique** dans Claude Code. Chaque token compte. Une gestion efficace du contexte est la difference entre un assistant productif et un assistant qui perd le fil.

> **Source:** Recommandation #1 Anthropic — "The context window is the single most important resource to manage."

**Principes:**
- Le contexte est une ressource finie et precieuse
- CLAUDE.md et les regles competent pour l'attention du modele
- Utiliser des sous-agents pour les investigations
- Nettoyer le contexte entre les taches

---

## Table des matieres

1. [Regles de taille CLAUDE.md](#regles-de-taille-claudemd)
2. [Nettoyage du contexte](#nettoyage-du-contexte)
3. [Sous-agents pour les investigations](#sous-agents-pour-les-investigations)
4. [Context compaction](#context-compaction)
5. [Boucles de verification](#boucles-de-verification)
6. [Plan Mode](#plan-mode)
7. [Suivi des tokens](#suivi-des-tokens)
8. [Checklist](#checklist)

---

## Regles de taille CLAUDE.md

### Limite recommandee

> **CLAUDE.md principal: 150-200 lignes maximum.**
> Chaque instruction supplementaire dilue l'attention sur les instructions existantes.

### Strategie de modularite

```
.claude/
  CLAUDE.md              <- Resume (150-200 lignes max)
  rules/                 <- Regles detaillees (chargees a la demande)
    01-workflow-analysis.md
    04-solid-principles.md
    05-kiss-dry-yagni.md
    ...
  references/            <- Documentation technique
  skills/                <- Competences a la demande
```

### Bonnes pratiques

| Pratique | Description |
|----------|-------------|
| **CLAUDE.md court** | Vue d'ensemble, liens vers les regles |
| **Rules modulaires** | Un fichier par sujet dans `.claude/rules/` |
| **References separees** | Documentation technique dans `.claude/references/` |
| **Skills a la demande** | Competences chargees uniquement quand necessaires |

### Ce qui va dans CLAUDE.md vs Rules

| Contenu | Emplacement |
|---------|-------------|
| Technologies supportees | CLAUDE.md |
| Commandes disponibles | CLAUDE.md |
| Agents disponibles | CLAUDE.md |
| Compatibilite Claude Code | CLAUDE.md |
| Principes SOLID detailles | `.claude/rules/04-solid-principles.md` |
| Regles de securite | `.claude/rules/11-security.md` |
| Workflow d'analyse | `.claude/rules/01-workflow-analysis.md` |

---

## Nettoyage du contexte

### Quand utiliser `/clear`

```
Utiliser /clear:
- Entre deux taches NON liees
- Apres une longue investigation
- Quand le contexte depasse 50% de la fenetre
- Avant de commencer une nouvelle feature

NE PAS utiliser /clear:
- Au milieu d'une tache en cours
- Si le contexte precedent est necessaire
- Juste apres avoir charge des fichiers pertinents
```

### Signes de pollution du contexte

- Claude repete des informations deja donnees
- Les reponses deviennent moins precises
- Claude confond des elements de taches differentes
- Les erreurs augmentent malgre des instructions claires

### Pattern: Investigation puis implementation

```
Session 1: Investigation
  -> Lire le code, comprendre l'architecture
  -> Documenter les findings
  -> /clear

Session 2: Implementation
  -> Charger uniquement les fichiers necessaires
  -> Implementer avec un contexte propre
```

---

## Sous-agents pour les investigations

### Principe

> **Deleguer les recherches aux sous-agents pour garder le contexte principal propre.**

Les sous-agents (Task tool) ont leur propre fenetre de contexte. Utiliser un sous-agent pour explorer le codebase evite de polluer le contexte principal avec des centaines de lignes de code non pertinentes.

### Quand utiliser un sous-agent

| Situation | Action |
|-----------|--------|
| Chercher un fichier/pattern specifique | Glob/Grep directement |
| Explorer une architecture inconnue | Sous-agent Explore |
| Investigation multi-fichiers (> 3) | Sous-agent Explore |
| Planifier une implementation | Sous-agent Plan |
| Tache independante en parallele | Sous-agent general-purpose |

---

## Context compaction

### Fonctionnement

Claude Code compacte automatiquement le contexte quand il approche les limites de la fenetre. Les messages anciens sont resumes pour liberer de l'espace.

### Hooks de re-injection

Utiliser le hook `SessionStart` avec le matcher `compact` pour re-injecter le contexte critique apres une compaction:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
      }
    ]
  }
}
```

### Preparer le contexte essentiel

Creer un fichier `.claude/context-essentials.md` avec:
- Les decisions architecturales cles
- Les conventions du projet
- Les taches en cours
- Les contraintes critiques

---

## Boucles de verification

### Principe

> **Toujours fournir des moyens de verification: tests, screenshots, outputs attendus.**
> Source: "2-3x improvement in final result quality" (Anthropic)

### Pattern: Specification-Implementation-Verification

```
1. SPECIFICATION
   -> Definir le comportement attendu
   -> Fournir des exemples d'input/output
   -> Ecrire les tests d'abord (TDD)

2. IMPLEMENTATION
   -> Coder la solution

3. VERIFICATION
   -> Executer les tests
   -> Comparer avec les outputs attendus
   -> Corriger si necessaire
   -> Repeter jusqu'a satisfaction
```

---

## Plan Mode

### Quand investir dans la planification

| Situation | Action |
|-----------|--------|
| Bug simple, 1 fichier | Corriger directement |
| Feature simple, < 3 fichiers | Implementer directement |
| Feature complexe, > 3 fichiers | Plan Mode |
| Refactoring architectural | Plan Mode |
| Choix technologique | Plan Mode |
| Impact incertain | Plan Mode |

---

## Suivi des tokens

### Status Line

La status line Claude Code affiche le pourcentage de contexte utilise. Surveiller cet indicateur pour anticiper les compactions.

### Seuils d'action

| Contexte utilise | Action |
|------------------|--------|
| < 30% | Normal, continuer |
| 30-60% | Surveiller, eviter les lectures inutiles |
| 60-80% | Deleguer aux sous-agents, envisager /clear |
| > 80% | Compaction imminente, sauvegarder le contexte critique |

---

## Worktrees paralleles

### Principe

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Utiliser `git worktree` pour travailler sur plusieurs branches simultanement avec des sessions Claude independantes.

### Setup

```bash
# Creer un worktree pour une feature
git worktree add ../feature-auth feature/auth

# Lancer une session Claude dans le worktree
cd ../feature-auth && claude

# Creer un worktree pour la review
git worktree add ../review-auth feature/auth
cd ../review-auth && claude
```

### Pattern Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementer l'authentification JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revoir le code d'authentification"
  # Contexte frais, pas de biais d'auteur
```

### Recommandations

- 3-5 worktrees maximum
- Un worktree = une tache
- Supprimer les worktrees termines
- Ne pas partager de sessions entre worktrees

---

## Checklist

### Avant chaque session

- [ ] CLAUDE.md < 200 lignes
- [ ] Regles modulaires dans `.claude/rules/`
- [ ] Contexte propre (pas de residus de taches precedentes)

### Pendant la session

- [ ] Surveiller le % de contexte
- [ ] Deleguer les investigations aux sous-agents
- [ ] `/clear` entre taches non liees
- [ ] Fournir des tests/outputs attendus

### Pour les taches complexes

- [ ] Utiliser Plan Mode
- [ ] Decomposer en sous-taches
- [ ] Worktrees pour le parallelisme
- [ ] Boucles de verification

---

## Ressources

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Parallel worktrees + verification loops
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agents

---

**Date de derniere mise a jour:** 2026-02
**Version:** 1.0.0
**Auteur:** The Bearded CTO
