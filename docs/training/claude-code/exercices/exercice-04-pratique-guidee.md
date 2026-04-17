# Exercice 4 : Pratique Guidee

**Module :** 4 - Pratique Guidee (Projet Existant et Projet Vierge)
**Duree :** 2h00
**Niveau :** Intermediaire

---

## Objectifs

A la fin de cet exercice, vous serez capable de :

- Explorer et comprendre une codebase inconnue avec Claude Code
- Effectuer un refactoring guide avec le Plan Mode
- Debugger un probleme avec le bon contexte
- Scaffolder un projet complet a partir de zero
- Generer du code en suivant le cycle TDD
- Mettre en place une pipeline CI/CD basique

---

## Prerequis

- [ ] Claude Code installe et fonctionnel
- [ ] Exercices 1, 2 et 3 completes
- [ ] Un projet existant accessible (le votre ou un clone)

---

## Partie A : Projet Existant (1h00)

### A.1 Exploration de codebase (15 min)

Ouvrez un projet existant et demandez a Claude de l'explorer :

```bash
# Vue d'ensemble
> Donne-moi une vue d'ensemble de ce projet :
> - Quel est son objectif ?
> - Quelle architecture utilise-t-il ?
> - Quelles sont ses dependances principales ?
> - Quelle est la structure des repertoires ?

# Architecture detaillee
> Dessine l'architecture de ce projet en identifiant :
> - Les couches (presentation, metier, donnees)
> - Les flux de donnees entre les composants
> - Les points d'entree (API, CLI, etc.)

# Identifier les conventions
> Quelles conventions de code sont utilisees dans ce projet ?
> (nommage, structure, patterns, tests)
```

### A.2 Refactoring guide (20 min)

Utilisez le Plan Mode pour refactorer un fichier complexe :

```bash
# Activez le Plan Mode (Shift+Tab)
> Identifie le fichier le plus complexe du projet
> (le plus long, avec le plus de responsabilites).
> Propose un plan de refactoring en appliquant SRP.

# Lisez le plan, puis validez
> Implemente le refactoring. Assure-toi que les tests passent apres chaque etape.
```

### A.3 Debugging assiste (15 min)

Simulez un debug en fournissant du contexte a Claude :

```bash
> Je rencontre un probleme dans ce projet.
> Voici ce que j'observe :
> - [Decrivez un comportement inattendu ou une erreur]
> - [Collez un message d'erreur ou un log]
>
> Analyse le probleme, identifie la cause racine
> et propose une correction.
```

**Conseil :** Plus vous fournissez de contexte (stack trace, logs, etapes de reproduction), plus Claude est efficace.

### A.4 Code review (10 min)

```bash
> Effectue une code review du fichier [nom_du_fichier].
> Criteres :
> - Principes SOLID
> - Tests existants
> - Securite (OWASP Top 10)
> - Performance
> - Lisibilite
>
> Pour chaque probleme, donne la severite et une suggestion concrete.
```

---

## Partie B : Projet Vierge (1h00)

### B.1 Scaffolding (15 min)

Creez un nouveau projet a partir de zero :

```bash
mkdir exercice-todo-api && cd exercice-todo-api
git init
claude

> Cree un projet de todo-list API avec :
> - Architecture Clean Architecture (domain, application, infrastructure)
> - Endpoints REST : GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
> - Modele Task : id, title, description, status (pending/done), createdAt
> - Validation des inputs
> - Gestion d'erreurs structuree
>
> Utilise Node.js + TypeScript + Express.
> Configure ESLint et Vitest.
```

### B.2 Implementation TDD (20 min)

Suivez le cycle Red-Green-Refactor :

```bash
# RED : Ecrire les tests d'abord
> Ecris les tests unitaires pour le TaskService :
> - Creer une tache avec titre et description
> - Lister toutes les taches
> - Marquer une tache comme "done"
> - Rejeter une tache sans titre (erreur de validation)

# Verifiez que les tests echouent
> Lance les tests. Ils doivent echouer (RED).

# GREEN : Implementer le code minimal
> Implemente le TaskService pour faire passer les tests.
> Code minimal uniquement, pas d'optimisation.

# Verifiez que les tests passent
> Lance les tests. Ils doivent passer (GREEN).

# REFACTOR : Ameliorer
> Refactorise le code en respectant SOLID.
> Les tests doivent continuer a passer.
```

### B.3 CI/CD (15 min)

```bash
> Cree une pipeline CI/CD avec GitHub Actions qui :
> 1. Se declenche sur push et pull request vers main
> 2. Installe les dependances
> 3. Lance le linting
> 4. Execute les tests unitaires avec couverture (seuil 80%)
> 5. Build l'application
>
> Genere le fichier .github/workflows/ci.yml
```

### B.4 Documentation (10 min)

```bash
> Genere un README.md complet pour ce projet avec :
> - Description (1-2 phrases)
> - Prerequis et installation
> - Commandes disponibles (dev, test, lint, build)
> - Structure du projet (arborescence commentee)
> - Documentation API (liste des endpoints)
> - Variables d'environnement
```

---

## Verification

### Projet existant

- [ ] J'ai explore la codebase et compris l'architecture
- [ ] J'ai utilise le Plan Mode pour un refactoring
- [ ] J'ai fourni du contexte pour un debug efficace
- [ ] J'ai obtenu une code review structuree

### Projet vierge

- [ ] Le projet est scaffolde avec une architecture propre
- [ ] Les tests sont ecrits AVANT le code (TDD)
- [ ] Tous les tests passent
- [ ] Le fichier CI/CD est genere
- [ ] Le README est complet et exact

---

## Bonus

1. **Generez la documentation API au format OpenAPI** (Swagger).
2. **Ajoutez un endpoint de filtrage** : `GET /tasks?status=pending`.
3. **Creez un hook PostToolUse:Write** qui lance le linter automatiquement apres chaque fichier ecrit.
