---
description: Vérification Architecture Python
argument-hint: [arguments]
---

# Vérification Architecture Python

## Arguments

$ARGUMENTS (optionnel : chemin vers le projet à analyser)

## MISSION

Réaliser un audit complet de l'architecture du projet Python en suivant les principes Clean Architecture et Hexagonal Architecture définis dans les règles du projet.

### Étape 1 : Analyse de la structure du projet

Examiner la structure des répertoires et identifier :
- [ ] Présence des couches Domain/Application/Infrastructure/Presentation
- [ ] Séparation claire entre les couches (pas de dépendances inversées)
- [ ] Organisation des modules par domaine métier
- [ ] Structure des packages cohérente avec les règles d'architecture

**Référence** : `rules/02-architecture.md` sections "Clean Architecture" et "Hexagonal Architecture"

### Étape 2 : Vérification des dépendances entre couches

Analyser les imports et dépendances :
- [ ] Domain ne dépend d'aucune autre couche
- [ ] Application ne dépend que de Domain
- [ ] Infrastructure dépend de Domain et Application uniquement
- [ ] Presentation ne contient pas de logique métier
- [ ] Respect de la règle de dépendance (vers l'intérieur uniquement)

**Vérifier** : Aucun import de couches externes dans Domain/Application

### Étape 3 : Interfaces et Ports

Vérifier l'implémentation des ports et adapters :
- [ ] Interfaces (ports) définies dans Domain/Application
- [ ] Implémentations (adapters) dans Infrastructure
- [ ] Utilisation d'injection de dépendances
- [ ] Absence de couplage fort avec frameworks externes

**Référence** : `rules/02-architecture.md` section "Ports and Adapters"

### Étape 4 : Entités et Value Objects

Contrôler la modélisation du domaine :
- [ ] Entités riches avec logique métier encapsulée
- [ ] Value Objects immuables
- [ ] Agrégats correctement délimités
- [ ] Domain Events si applicable
- [ ] Absence de logique d'infrastructure dans les entités

**Référence** : `rules/02-architecture.md` section "Domain Layer"

### Étape 5 : Services et Use Cases

Analyser l'organisation de la logique applicative :
- [ ] Use Cases/Application Services clairement identifiés
- [ ] Un Use Case = Une action métier
- [ ] Services Domain pour logique métier complexe
- [ ] Pas de logique métier dans les contrôleurs/handlers
- [ ] Transactions gérées au niveau Application

**Référence** : `rules/02-architecture.md` section "Application Layer"

### Étape 6 : SOLID Principles

Vérifier l'application des principes SOLID :
- [ ] Single Responsibility : Une classe = Une raison de changer
- [ ] Open/Closed : Extension par héritage/composition, pas modification
- [ ] Liskov Substitution : Sous-types substituables
- [ ] Interface Segregation : Interfaces spécifiques et minimales
- [ ] Dependency Inversion : Dépendance vers abstractions

**Référence** : `rules/04-solid-principles.md`

### Étape 7 : Calcul du score

Attribution des points (sur 25) :
- Structure et séparation des couches : 6 points
- Respect des dépendances : 6 points
- Ports et Adapters : 4 points
- Modélisation du domaine : 4 points
- Use Cases et Services : 3 points
- Principes SOLID : 2 points

## FORMAT DE SORTIE

```
🏗️ AUDIT ARCHITECTURE PYTHON
================================

📊 SCORE GLOBAL : XX/25

✅ POINTS FORTS :
- [Liste des points positifs identifiés]

⚠️ POINTS D'AMÉLIORATION :
- [Liste des améliorations mineures]

❌ PROBLÈMES CRITIQUES :
- [Liste des violations graves d'architecture]

📋 DÉTAILS PAR CATÉGORIE :

1. STRUCTURE ET COUCHES (XX/6)
   ✅/⚠️/❌ [Détails de la structure]

2. DÉPENDANCES (XX/6)
   ✅/⚠️/❌ [Analyse des dépendances]

3. PORTS ET ADAPTERS (XX/4)
   ✅/⚠️/❌ [Implémentation des interfaces]

4. MODÉLISATION DOMAIN (XX/4)
   ✅/⚠️/❌ [Qualité des entités et VO]

5. USE CASES (XX/3)
   ✅/⚠️/❌ [Organisation de la logique applicative]

6. SOLID PRINCIPLES (XX/2)
   ✅/⚠️/❌ [Application des principes SOLID]

🎯 TOP 3 ACTIONS PRIORITAIRES :
1. [Action la plus critique avec impact estimé]
2. [Deuxième action prioritaire]
3. [Troisième action prioritaire]
```

## NOTES

- Utiliser `grep`, `find` et l'analyse de code pour détecter les violations
- Fournir des exemples concrets de fichiers/classes problématiques
- Suggérer des refactorings précis pour chaque problème identifié
- Prioriser les actions selon leur impact sur la maintenabilité
