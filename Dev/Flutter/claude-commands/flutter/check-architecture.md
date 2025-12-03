# Vérification Architecture Flutter

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert Flutter chargé d'auditer l'architecture du projet selon les principes de Clean Architecture.

### Étape 1 : Analyse de la structure du projet

- [ ] Identifier la structure des dossiers du projet
- [ ] Localiser les fichiers `pubspec.yaml` et `analysis_options.yaml`
- [ ] Référencer les règles depuis `/rules/02-architecture.md`
- [ ] Référencer les principes SOLID depuis `/rules/04-solid-principles.md`

### Étape 2 : Vérifications Architecture (25 points)

#### 2.1 Organisation en couches Clean Architecture (10 points)
- [ ] **Domain Layer** : Entités et cas d'usage isolés (0-4 pts)
  - Vérifier `lib/domain/entities/` et `lib/domain/usecases/`
  - Aucune dépendance vers data ou presentation
  - Entités pures avec logique métier uniquement
- [ ] **Data Layer** : Repositories, DataSources, Models (0-3 pts)
  - Vérifier `lib/data/repositories/`, `lib/data/datasources/`, `lib/data/models/`
  - Implémentation des interfaces du domain
  - Séparation remote/local datasources
- [ ] **Presentation Layer** : UI, States, BLoCs/Providers (0-3 pts)
  - Vérifier `lib/presentation/pages/`, `lib/presentation/widgets/`, `lib/presentation/blocs/`
  - Séparation logique UI/Business logic
  - Widgets réutilisables dans `/widgets/common/`

#### 2.2 Injection de dépendances (5 points)
- [ ] **Container DI** configuré (get_it, injectable, riverpod) (0-3 pts)
- [ ] **Pas de new()** direct dans les widgets (0-2 pts)
- [ ] Toutes les dépendances injectées via constructeur

#### 2.3 Séparation des responsabilités (5 points)
- [ ] **Single Responsibility** : Une classe = une responsabilité (0-2 pts)
- [ ] **Interface Segregation** : Interfaces petites et spécialisées (0-2 pts)
- [ ] **Dependency Inversion** : Dépend d'abstractions, pas d'implémentations (0-1 pt)

#### 2.4 Structure modulaire (5 points)
- [ ] **Features isolées** : Code organisé par fonctionnalité (0-2 pts)
- [ ] **Core/Shared** : Utilitaires communs séparés (0-2 pts)
- [ ] **Pas de couplage** entre features (0-1 pt)

### Étape 3 : Calcul du score

```
SCORE ARCHITECTURE = Total des points / 25

Interprétation :
✅ 20-25 pts : Architecture excellente
⚠️ 15-19 pts : Architecture correcte, améliorations recommandées
⚠️ 10-14 pts : Architecture à améliorer
❌ 0-9 pts : Architecture problématique
```

### Étape 4 : Rapport détaillé

Génère un rapport avec :

#### 📊 SCORE ARCHITECTURE : XX/25

#### ✅ Points forts
- Liste des bonnes pratiques détectées
- Exemples de code bien structuré

#### ⚠️ Points d'attention
- Violations détectées avec fichiers et lignes
- Impact sur la maintenabilité

#### ❌ Violations critiques
- Problèmes architecturaux majeurs
- Couplage fort, dépendances circulaires

#### 🎯 TOP 3 ACTIONS PRIORITAIRES

1. **[PRIORITÉ HAUTE]** Action la plus importante avec impact et effort estimé
2. **[PRIORITÉ MOYENNE]** Deuxième action avec justification
3. **[PRIORITÉ BASSE]** Troisième action pour amélioration continue

---

**Note** : Ce rapport se concentre uniquement sur l'architecture. Pour un audit complet, utilisez `/check-compliance`.
