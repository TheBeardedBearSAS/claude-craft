# Vérification Tests Python

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet à analyser)

## MISSION

Réaliser un audit complet de la stratégie de test du projet Python en vérifiant la couverture, la qualité des tests, et le respect des bonnes pratiques définies dans les règles du projet.

### Étape 1 : Structure et organisation des tests

Examiner l'organisation des tests :
- [ ] Dossier `tests/` à la racine du projet
- [ ] Structure miroir du code source (tests/domain, tests/application, etc.)
- [ ] Fichiers de test nommés `test_*.py` ou `*_test.py`
- [ ] Fixtures pytest dans `conftest.py`
- [ ] Séparation tests unitaires / intégration / e2e

**Référence** : `rules/07-testing.md` section "Test Organization"

### Étape 2 : Couverture de code (Coverage)

Mesurer la couverture des tests :
- [ ] Couverture globale ≥ 80%
- [ ] Couverture Domain Layer ≥ 90%
- [ ] Couverture Application Layer ≥ 85%
- [ ] Fichiers critiques à 100%
- [ ] Configuration coverage dans pyproject.toml

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest pytest-cov && pytest /app --cov=/app --cov-report=term-missing"`

**Référence** : `rules/07-testing.md` section "Code Coverage"

### Étape 3 : Tests unitaires

Analyser la qualité des tests unitaires :
- [ ] Tests isolés (pas de dépendances externes)
- [ ] Utilisation de mocks/stubs pour dépendances
- [ ] Tests rapides (<100ms par test)
- [ ] Un test = Un comportement
- [ ] Nommage descriptif : `test_should_X_when_Y`
- [ ] Pattern AAA (Arrange, Act, Assert)

**Référence** : `rules/07-testing.md` section "Unit Tests"

### Étape 4 : Tests d'intégration

Vérifier les tests d'intégration :
- [ ] Tests des interactions entre composants
- [ ] Tests de la couche Infrastructure (DB, API, etc.)
- [ ] Utilisation de bases de données de test (fixtures)
- [ ] Nettoyage après chaque test (teardown)
- [ ] Tests isolés et indépendants

**Référence** : `rules/07-testing.md` section "Integration Tests"

### Étape 5 : Assertions et qualité des tests

Contrôler la qualité des assertions :
- [ ] Assertions explicites et spécifiques
- [ ] Pas d'assertions multiples non liées
- [ ] Messages d'erreur clairs
- [ ] Tests des cas limites (edge cases)
- [ ] Tests des erreurs et exceptions
- [ ] Pas de tests désactivés sans raison (skip/xfail)

**Référence** : `rules/07-testing.md` section "Assertions and Test Quality"

### Étape 6 : Fixtures et paramétrage

Évaluer l'utilisation des fixtures pytest :
- [ ] Fixtures pour setup/teardown communs
- [ ] Scope approprié (function, class, module, session)
- [ ] Paramétrage avec `@pytest.mark.parametrize`
- [ ] Factories pour objets de test complexes
- [ ] Pas de duplication dans les fixtures

**Référence** : `rules/07-testing.md` section "Pytest Fixtures"

### Étape 7 : Performance et exécution

Analyser la performance des tests :
- [ ] Temps d'exécution total <30 secondes (unitaires)
- [ ] Tests parallélisables (pytest-xdist)
- [ ] Pas de sleep() dans les tests
- [ ] Configuration pytest dans pyproject.toml
- [ ] CI/CD avec exécution automatique des tests

**Commande** : Exécuter `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pytest && pytest /app -v --duration=10"`

**Référence** : `rules/07-testing.md` section "Test Performance"

### Étape 8 : Test-Driven Development (TDD)

Vérifier l'adoption du TDD :
- [ ] Tests écrits avant le code (si applicable)
- [ ] Red-Green-Refactor cycle
- [ ] Tests guidant le design
- [ ] Pas de code non testé en production

**Référence** : `rules/01-workflow-analysis.md` section "TDD Workflow"

### Étape 9 : Calcul du score

Attribution des points (sur 25) :
- Couverture de code : 7 points
- Tests unitaires : 6 points
- Tests d'intégration : 4 points
- Qualité des assertions : 3 points
- Fixtures et organisation : 3 points
- Performance : 2 points

## FORMAT DE SORTIE

```
🧪 AUDIT TESTS PYTHON
================================

📊 SCORE GLOBAL : XX/25

✅ POINTS FORTS :
- [Liste des bonnes pratiques de test observées]

⚠️ POINTS D'AMÉLIORATION :
- [Liste des améliorations mineures]

❌ PROBLÈMES CRITIQUES :
- [Liste des manques critiques en tests]

📋 DÉTAILS PAR CATÉGORIE :

1. COUVERTURE (XX/7)
   ✅/⚠️/❌ [Analyse de la couverture]
   Couverture globale : XX%
   Domain : XX%
   Application : XX%
   Infrastructure : XX%

2. TESTS UNITAIRES (XX/6)
   ✅/⚠️/❌ [Qualité des tests unitaires]
   Nombre de tests : XX
   Tests isolés : XX%
   Temps moyen : XXms

3. TESTS D'INTÉGRATION (XX/4)
   ✅/⚠️/❌ [Tests d'intégration]
   Nombre de tests : XX
   Couverture Infrastructure : XX%

4. ASSERTIONS (XX/3)
   ✅/⚠️/❌ [Qualité des assertions]
   Assertions spécifiques : XX%
   Tests edge cases : XX

5. FIXTURES (XX/3)
   ✅/⚠️/❌ [Organisation et fixtures]
   Fixtures réutilisables : XX
   Tests paramétrés : XX

6. PERFORMANCE (XX/2)
   ✅/⚠️/❌ [Performance des tests]
   Temps total : XXs
   Tests >1s : XX

🎯 TOP 3 ACTIONS PRIORITAIRES :
1. [Action la plus critique pour améliorer les tests]
2. [Deuxième action prioritaire]
3. [Troisième action prioritaire]
```

## NOTES

- Exécuter pytest avec coverage pour obtenir les métriques
- Utiliser Docker pour s'abstraire de l'environnement local
- Identifier les fichiers critiques sans tests
- Proposer des tests manquants pour les fonctionnalités clés
- Suggérer des améliorations concrètes des tests existants
- Prioriser les tests selon le risque métier
