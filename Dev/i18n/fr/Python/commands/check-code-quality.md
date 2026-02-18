---
description: Vérification Qualité du Code Python
argument-hint: [arguments]
---

# Vérification Qualité du Code Python

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet à analyser)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Réaliser un audit complet de la qualité du code Python en vérifiant le respect des standards PEP8, le typage, la lisibilité et les bonnes pratiques définies dans les règles du projet.

### Étape 1 : Standards de codage PEP8

Vérifier la conformité aux conventions Python :
- [ ] Nommage : snake_case pour fonctions/variables, PascalCase pour classes
- [ ] Indentation : 4 espaces (pas de tabs)
- [ ] Longueur des lignes : maximum 88 caractères (Black)
- [ ] Imports : organisés (stdlib, tiers, locaux) et triés
- [ ] Espaces : autour des opérateurs, après virgules
- [ ] Docstrings : présentes pour modules, classes, fonctions publiques

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 python -m flake8 /app --max-line-length=88`

**Référence** : `rules/03-coding-standards.md` section "PEP 8 Compliance"

### Étape 2 : Type Hints et MyPy

Contrôler l'utilisation du typage statique :
- [ ] Type hints sur tous les paramètres de fonctions
- [ ] Type hints sur les valeurs de retour
- [ ] Annotations pour les attributs de classe
- [ ] Utilisation de `typing` pour types complexes (Optional, Union, List, Dict)
- [ ] Pas d'erreurs MyPy en mode strict

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 python -m mypy /app --strict`

**Référence** : `rules/03-coding-standards.md` section "Type Hints"

### Étape 3 : Linting avec Ruff

Analyser le code avec Ruff (remplace Flake8, isort, pydocstyle) :
- [ ] Pas d'imports inutilisés
- [ ] Pas de variables non utilisées
- [ ] Pas de code mort (unreachable code)
- [ ] Complexité cyclomatique acceptable (<10)
- [ ] Respect des règles de sécurité (S-rules)

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 pip install ruff && ruff check /app`

**Référence** : `rules/06-tooling.md` section "Linting and Formatting"

### Étape 4 : Formatage avec Black

Vérifier la cohérence du formatage :
- [ ] Code formaté avec Black
- [ ] Configuration Black dans pyproject.toml
- [ ] Pas de différences après `black --check`
- [ ] Line length cohérente (88 caractères)

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 pip install black && black --check /app`

**Référence** : `rules/06-tooling.md` section "Code Formatting"

### Étape 5 : Principes KISS, DRY, YAGNI

Analyser la simplicité et la clarté du code :
- [ ] Fonctions courtes (<20 lignes idéalement)
- [ ] Pas de duplication de code (DRY)
- [ ] Pas de sur-ingénierie (YAGNI)
- [ ] Nommage explicite et auto-documenté
- [ ] Un seul niveau d'abstraction par fonction
- [ ] Early returns pour réduire la complexité

**Référence** : `rules/05-kiss-dry-yagni.md`

### Étape 6 : Commentaires et Documentation

Évaluer la qualité de la documentation :
- [ ] Docstrings Google ou NumPy style
- [ ] Commentaires uniquement pour le "pourquoi", pas le "quoi"
- [ ] README.md complet avec setup et usage
- [ ] Pas de code commenté (utiliser git)
- [ ] Documentation des décisions architecturales importantes

**Référence** : `rules/03-coding-standards.md` section "Documentation"

### Étape 7 : Gestion des erreurs

Vérifier la robustesse du code :
- [ ] Exceptions spécifiques (pas d'Exception générique)
- [ ] Pas de `pass` silencieux dans except
- [ ] Messages d'erreur informatifs
- [ ] Validation des entrées utilisateur
- [ ] Gestion appropriée des ressources (context managers)

**Référence** : `rules/03-coding-standards.md` section "Error Handling"

### Étape 8 : Calcul du score

Attribution des points (sur 25) :
- PEP8 et formatage : 5 points
- Type hints et MyPy : 5 points
- Ruff linting : 4 points
- KISS/DRY/YAGNI : 4 points
- Documentation : 4 points
- Gestion des erreurs : 3 points

## FORMAT DE SORTIE

```
📝 AUDIT QUALITÉ DU CODE PYTHON
================================

📊 SCORE GLOBAL : XX/25

✅ POINTS FORTS :
- [Liste des bonnes pratiques observées]

⚠️ POINTS D'AMÉLIORATION :
- [Liste des améliorations mineures]

❌ PROBLÈMES CRITIQUES :
- [Liste des violations graves des standards]

📋 DÉTAILS PAR CATÉGORIE :

1. PEP8 ET FORMATAGE (XX/5)
   ✅/⚠️/❌ [Conformité aux standards Python]
   Erreurs Flake8 : XX
   Différences Black : XX fichiers

2. TYPE HINTS (XX/5)
   ✅/⚠️/❌ [Couverture du typage statique]
   Erreurs MyPy : XX
   Couverture : XX%

3. RUFF LINTING (XX/4)
   ✅/⚠️/❌ [Qualité du code]
   Warnings : XX
   Imports inutilisés : XX
   Complexité max : XX

4. KISS/DRY/YAGNI (XX/4)
   ✅/⚠️/❌ [Simplicité et clarté]
   Fonctions >20 lignes : XX
   Code dupliqué : XX instances

5. DOCUMENTATION (XX/4)
   ✅/⚠️/❌ [Qualité de la documentation]
   Docstrings manquants : XX
   Couverture : XX%

6. GESTION DES ERREURS (XX/3)
   ✅/⚠️/❌ [Robustesse du code]
   Exceptions génériques : XX
   `except pass` : XX

🎯 TOP 3 ACTIONS PRIORITAIRES :
1. [Action la plus critique pour améliorer la qualité]
2. [Deuxième action prioritaire]
3. [Troisième action prioritaire]
```

## NOTES

- Exécuter tous les outils de linting disponibles dans le projet
- Utiliser Docker pour s'abstraire de l'environnement local
- Fournir des exemples de fichiers/lignes problématiques
- Suggérer des corrections automatisables (pre-commit hooks)
- Prioriser les quick wins (formatage auto) vs refactoring profond
