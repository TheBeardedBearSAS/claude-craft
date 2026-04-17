# Exercice 9 : Challenge Final

**Module :** 10 - Atelier Final
**Duree :** 45 minutes
**Niveau :** Avance

---

## Objectifs

Cet exercice met en pratique l'ensemble des competences acquises sur les 2 jours de formation. Il combine :

- Audit de codebase existante
- Planification de refactoring
- Documentation automatisee
- Scaffolding de projet
- TDD complet
- Qualite et securite

---

## Prerequis

- [ ] Tous les modules (1 a 9) completes
- [ ] Claude Code installe et fonctionnel
- [ ] Un projet existant ET un repertoire vide disponibles

---

## Partie 1 : Projet Existant (20 min)

### Contexte

Vous recevez un projet existant avec du code legacy. Votre mission est d'utiliser Claude Code pour l'auditer, proposer un plan de refactoring et documenter l'existant.

### 1.1 Audit du codebase (7 min)

```bash
claude

> Analyse ce projet en profondeur :
> 1. Identifie l'architecture actuelle (couches, patterns, structure)
> 2. Detecte les anti-patterns (God Class, Long Method, Feature Envy, etc.)
> 3. Evalue la couverture de tests existante
> 4. Cherche les vulnerabilites de securite (secrets en dur, injections, etc.)
> 5. Calcule les metriques de complexite
>
> Donne un rapport structure avec des scores par categorie (sur 10).
```

**Conseil :** Utilisez des sub-agents si le projet est volumineux.

### 1.2 Plan de refactoring (7 min)

Activez le Plan Mode (Shift+Tab) :

```bash
> En mode plan, propose un plan de refactoring pour ce projet :
> 1. Priorise les problemes par impact (critique > majeur > mineur)
> 2. Propose un ordre de refactoring (quick wins d'abord)
> 3. Pour chaque refactoring, estime l'effort et le risque
> 4. Identifie les tests a ecrire AVANT de refactorer
>
> Ne modifie aucun fichier, propose uniquement le plan.
```

### 1.3 Documentation (6 min)

```bash
> Genere la documentation suivante pour ce projet :
> 1. Un README.md avec les instructions d'installation et de demarrage
> 2. Un schema d'architecture en Mermaid
> 3. La liste des endpoints API avec leurs parametres
>
> Base-toi uniquement sur le code existant, ne suppose rien.
```

### Grille d'evaluation - Projet Existant

| Critere | Points | Description |
|---------|--------|-------------|
| Completude de l'audit | /5 | Tous les aspects sont couverts |
| Pertinence du plan | /5 | Le plan est realiste et priorise |
| Qualite de la documentation | /5 | La doc est exacte et utile |
| Utilisation des outils | /5 | Sub-agents, plan mode, etc. |
| **Total** | **/20** | |

---

## Partie 2 : Projet Vierge (25 min)

### Contexte

Creez un micro-service de gestion de taches (todo-list API) en utilisant Claude Code pour le scaffolding, l'implementation et les tests.

### 2.1 Scaffolding (8 min)

```bash
mkdir challenge-todo-api && cd challenge-todo-api
git init
claude

> Cree un projet de todo-list API avec :
> - Architecture Clean Architecture (domain, application, infrastructure)
> - Endpoints REST : GET /tasks, POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
> - Modele Task : id, title, description, status (pending/done), createdAt, updatedAt
> - Validation des inputs
> - Gestion d'erreurs structuree
>
> Utilise le langage/framework de ton choix adapte a mon contexte.
```

### 2.2 Implementation TDD (10 min)

```bash
> Implemente la fonctionnalite "filtrer les taches par statut" en TDD :
>
> 1. RED : Ecris d'abord les tests pour :
>    - GET /tasks?status=pending retourne uniquement les taches pending
>    - GET /tasks?status=done retourne uniquement les taches done
>    - GET /tasks?status=invalid retourne une erreur 400
>    - GET /tasks sans filtre retourne toutes les taches
>
> 2. GREEN : Implemente le code minimal pour faire passer les tests
>
> 3. REFACTOR : Ameliore le code en gardant les tests verts
```

### 2.3 Tests et qualite (7 min)

```bash
> Pour le projet cree :
> 1. Verifie que tous les tests passent
> 2. Ajoute les tests manquants pour atteindre 80% de couverture
> 3. Lance un audit de securite rapide (OWASP Top 3 : Access Control, Injection, Crypto)
> 4. Genere un message de commit Conventional Commits pour les changements
```

### Grille d'evaluation - Projet Vierge

| Critere | Points | Description |
|---------|--------|-------------|
| Architecture propre | /5 | Separation des couches respectee |
| Tests TDD | /5 | Cycle Red-Green-Refactor respecte |
| Qualite du code | /5 | SOLID, KISS, DRY appliques |
| Feature fonctionnelle | /5 | Le filtrage fonctionne correctement |
| **Total** | **/20** | |

---

## Score Final

| Partie | Score |
|--------|-------|
| Projet Existant | /20 |
| Projet Vierge | /20 |
| **Total** | **/40** |

| Score | Niveau |
|-------|--------|
| 35-40 | Expert |
| 28-34 | Avance |
| 20-27 | Intermediaire |
| < 20 | A approfondir |

---

## Verification finale

### Projet existant

- [ ] L'audit couvre architecture, tests, securite et complexite
- [ ] Le plan de refactoring est priorise et realiste
- [ ] La documentation est generee et exacte

### Projet vierge

- [ ] Le projet a une architecture Clean Architecture
- [ ] Les tests sont ecrits AVANT le code (TDD)
- [ ] Tous les tests passent
- [ ] Le filtrage par statut fonctionne
- [ ] Le commit suit les Conventional Commits

---

## Restitution

Apres l'exercice, preparez une breve presentation (3-5 min) pour le groupe :

1. **Ce qui a bien fonctionne** : quelle approche a ete la plus efficace ?
2. **Les difficultes rencontrees** : ou Claude Code a-t-il eu du mal ?
3. **Apprentissage principal** : la chose la plus importante apprise pendant la formation.
