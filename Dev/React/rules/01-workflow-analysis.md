# Workflow d'Analyse Avant Développement

## Principe Fondamental

**RÈGLE D'OR** : Avant d'écrire la moindre ligne de code, une phase d'analyse approfondie est OBLIGATOIRE. Cette phase permet de comprendre le contexte, les implications et les meilleures approches pour résoudre le problème.

## Phase 1 : Compréhension du Besoin

### 1.1 Analyse de la Demande

**Questions à se poser** :

1. **Quel est l'objectif réel** ?
   - Quelle est la valeur métier apportée ?
   - Qui sont les utilisateurs finaux ?
   - Quel problème résolvons-nous ?

2. **Quel est le périmètre** ?
   - Quelles sont les fonctionnalités exactes demandées ?
   - Y a-t-il des dépendances avec d'autres fonctionnalités ?
   - Quelles sont les limites du périmètre ?

3. **Quelles sont les contraintes** ?
   - Contraintes techniques (performance, compatibilité)
   - Contraintes métier (règles de gestion)
   - Contraintes de temps (délais)

### 1.2 Documentation de la Compréhension

Créer un document d'analyse contenant :

```markdown
# Analyse de la Demande : [TITRE]

## Contexte
[Description du contexte métier]

## Objectif
[Objectif principal et objectifs secondaires]

## Utilisateurs Concernés
- Persona 1 : [Description]
- Persona 2 : [Description]

## Fonctionnalités Attendues
1. [Fonctionnalité 1]
   - Critère d'acceptation 1
   - Critère d'acceptation 2
2. [Fonctionnalité 2]
   - ...

## Contraintes
- Technique : [Liste]
- Métier : [Liste]
- Temps : [Deadline]

## Hors Périmètre
[Ce qui n'est pas inclus dans cette demande]
```

## Phase 2 : Analyse Technique

### 2.1 Audit du Code Existant

**Étapes obligatoires** :

1. **Recherche de code similaire**
   ```bash
   # Rechercher des composants ou hooks similaires
   grep -r "similar-pattern" src/

   # Identifier les composants réutilisables
   find src/components -name "*.tsx"
   ```

2. **Analyse des dépendances**
   - Quels composants seront affectés ?
   - Quels hooks existants peuvent être réutilisés ?
   - Quelles APIs sont déjà disponibles ?

3. **Identification des patterns**
   - Quel pattern architectural est utilisé ?
   - Comment les fonctionnalités similaires sont-elles implémentées ?
   - Quelles conventions sont en place ?

### 2.2 Analyse de l'Architecture

**Vérifications à effectuer** :

```typescript
// 1. Structure des features
// Vérifier la structure existante
src/features/
  └── existing-feature/
      ├── components/
      ├── hooks/
      ├── services/
      ├── types/
      └── utils/

// 2. State Management
// Identifier la solution utilisée
- React Query pour les données serveur ?
- Zustand pour l'état global ?
- Context API pour l'état partagé ?

// 3. Routing
// Comprendre la structure des routes
- React Router ?
- Next.js App Router ?
- TanStack Router ?

// 4. Styling
// Identifier la solution de styling
- Tailwind CSS ?
- CSS Modules ?
- styled-components ?
```

### 2.3 Analyse des Impacts

**Matrice d'impact** :

| Composant/Module | Impact | Risque | Action Requise |
|------------------|--------|--------|----------------|
| Component A | Modification | Moyen | Tests à mettre à jour |
| Hook B | Aucun | Faible | - |
| Service C | Création | Faible | Nouveaux tests |
| Type D | Extension | Moyen | Vérifier la compatibilité |

## Phase 3 : Conception de la Solution

### 3.1 Choix Architecturaux

**Décisions à prendre** :

1. **Structure des composants**
   ```typescript
   // Option 1 : Composant unique avec logique intégrée
   export const FeatureComponent: FC = () => {
     // Logique + UI
   };

   // Option 2 : Séparation Container/Presenter
   export const FeatureContainer: FC = () => {
     // Logique uniquement
     return <FeaturePresenter {...props} />;
   };

   export const FeaturePresenter: FC<Props> = (props) => {
     // UI uniquement
   };

   // Option 3 : Composition avec hooks
   export const FeatureComponent: FC = () => {
     const logic = useFeatureLogic();
     return <FeatureUI {...logic} />;
   };
   ```

2. **Gestion de l'état**
   ```typescript
   // Option 1 : State local
   const [state, setState] = useState();

   // Option 2 : State global (Zustand)
   const state = useFeatureStore(state => state.value);

   // Option 3 : Server state (React Query)
   const { data, isLoading } = useQuery({
     queryKey: ['feature'],
     queryFn: fetchFeature
   });

   // Option 4 : Context API
   const context = useFeatureContext();
   ```

3. **Communication avec l'API**
   ```typescript
   // Option 1 : React Query
   const mutation = useMutation({
     mutationFn: updateFeature,
     onSuccess: () => queryClient.invalidateQueries(['feature'])
   });

   // Option 2 : Service custom
   const featureService = useFeatureService();
   await featureService.update(data);
   ```

### 3.2 Design des Interfaces

**Types et Interfaces** :

```typescript
// 1. Définir les types métier
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 2. Définir les props des composants
interface FeatureComponentProps {
  userId: string;
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// 3. Définir les retours de hooks
interface UseFeatureReturn {
  data: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  deleteUser: () => Promise<void>;
}

// 4. Définir les services
interface FeatureService {
  getUser: (id: string) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}
```

### 3.3 Plan de Tests

**Stratégie de tests** :

```typescript
// 1. Tests unitaires des composants
describe('FeatureComponent', () => {
  it('should render loading state', () => {});
  it('should render data when loaded', () => {});
  it('should handle errors', () => {});
  it('should call callbacks on success', () => {});
});

// 2. Tests des hooks
describe('useFeature', () => {
  it('should fetch data on mount', () => {});
  it('should handle mutations', () => {});
  it('should update cache on success', () => {});
});

// 3. Tests d'intégration
describe('Feature Integration', () => {
  it('should complete full user flow', () => {});
  it('should handle API errors gracefully', () => {});
});

// 4. Tests E2E
describe('Feature E2E', () => {
  it('should complete full user journey', () => {});
});
```

## Phase 4 : Planification

### 4.1 Découpage en Tâches

**Décomposition fine** :

```markdown
# Epic : [Fonctionnalité Principale]

## Story 1 : [Sous-fonctionnalité 1]
- [ ] Task 1.1 : Créer les types TypeScript
- [ ] Task 1.2 : Créer le service API
- [ ] Task 1.3 : Créer le hook custom
- [ ] Task 1.4 : Écrire les tests du hook
- [ ] Task 1.5 : Créer le composant UI
- [ ] Task 1.6 : Écrire les tests du composant
- [ ] Task 1.7 : Intégrer dans la feature

## Story 2 : [Sous-fonctionnalité 2]
- [ ] Task 2.1 : ...
```

### 4.2 Estimation de l'Effort

**Points de complexité** :

| Tâche | Complexité | Temps Estimé | Dépendances |
|-------|------------|--------------|-------------|
| Créer types | 1 | 30min | - |
| Service API | 2 | 1h | Types |
| Hook custom | 3 | 2h | Service |
| Tests hook | 2 | 1h | Hook |
| Composant UI | 5 | 3h | Hook |
| Tests composant | 3 | 1.5h | Composant |
| Intégration | 2 | 1h | Tous |
| **TOTAL** | **18** | **10h** | - |

### 4.3 Identification des Risques

**Analyse des risques** :

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API non disponible | Faible | Élevé | Utiliser MSW pour mocker |
| Changement de spec | Moyenne | Moyen | Design flexible |
| Performance | Faible | Élevé | Optimisation avec memo/useMemo |
| Régression | Moyenne | Élevé | Tests exhaustifs |

## Phase 5 : Validation Avant Codage

### 5.1 Checklist de Validation

**Vérifications obligatoires** :

- [ ] Le besoin est clairement compris et documenté
- [ ] Les critères d'acceptation sont définis
- [ ] L'architecture existante a été analysée
- [ ] Les patterns du projet sont identifiés
- [ ] La solution technique est conçue
- [ ] Les types TypeScript sont définis
- [ ] Le plan de tests est établi
- [ ] Les tâches sont découpées et estimées
- [ ] Les risques sont identifiés
- [ ] Les dépendances sont gérées
- [ ] Le code existant réutilisable est identifié
- [ ] Les impacts sur le code existant sont analysés

### 5.2 Review de l'Analyse

**Points à valider avec l'équipe** :

1. **Validation technique**
   - L'approche choisie est-elle la bonne ?
   - Y a-t-il des alternatives meilleures ?
   - Les patterns utilisés sont-ils cohérents ?

2. **Validation métier**
   - La solution répond-elle au besoin ?
   - Les cas limites sont-ils couverts ?
   - L'UX est-elle optimale ?

3. **Validation qualité**
   - Les tests sont-ils suffisants ?
   - La performance est-elle prise en compte ?
   - La sécurité est-elle assurée ?

## Phase 6 : Documentation de l'Analyse

### 6.1 Template d'Analyse Technique

```markdown
# Analyse Technique : [FEATURE_NAME]

## 1. Résumé
[Description courte de la fonctionnalité]

## 2. Analyse du Besoin
### 2.1 Contexte
[Contexte métier]

### 2.2 Objectifs
- Objectif principal : [...]
- Objectifs secondaires : [...]

### 2.3 Critères d'Acceptation
1. [Critère 1]
2. [Critère 2]

## 3. Solution Technique
### 3.1 Architecture
[Schéma ou description de l'architecture]

### 3.2 Composants
- **FeatureComponent** : Composant principal
- **useFeature** : Hook de gestion de la logique
- **featureService** : Service API

### 3.3 Types TypeScript
```typescript
// Types principaux
```

### 3.4 Flux de Données
[Description du flux]

## 4. Impacts
### 4.1 Code Existant
- Composants modifiés : [Liste]
- Nouveaux fichiers : [Liste]

### 4.2 Tests
- Tests à créer : [Liste]
- Tests à modifier : [Liste]

## 5. Plan d'Implémentation
### 5.1 Tâches
1. [Tâche 1]
2. [Tâche 2]

### 5.2 Estimation
- Temps total : [X heures]
- Complexité : [Faible/Moyenne/Élevée]

## 6. Risques et Mitigation
| Risque | Mitigation |
|--------|------------|
| [Risque 1] | [Solution] |

## 7. Alternatives Considérées
### Alternative 1
- Avantages : [...]
- Inconvénients : [...]
- Raison du rejet : [...]

## 8. Décisions Prises
1. [Décision 1] : [Justification]
2. [Décision 2] : [Justification]
```

## Outils d'Analyse

### Outils de Recherche

```bash
# Rechercher des patterns similaires
grep -r "useQuery" src/features/
grep -r "useMutation" src/features/

# Analyser les imports
grep -r "import.*from '@/components" src/

# Trouver les composants
find src -name "*.tsx" -type f

# Analyser les types
grep -r "interface.*Props" src/

# Vérifier les tests
find src -name "*.test.tsx" -type f
```

### Outils de Visualisation

```typescript
// Analyser la structure avec ts-morph
import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

// Analyser les dépendances
const sourceFile = project.getSourceFile("Component.tsx");
const imports = sourceFile?.getImportDeclarations();
```

## Anti-Patterns à Éviter

### ❌ Ce qu'il ne faut PAS faire

1. **Commencer à coder sans analyse**
   ```typescript
   // ❌ MAUVAIS
   // Commencer directement sans comprendre l'existant
   export const NewFeature = () => {
     // Code écrit sans analyse préalable
   };
   ```

2. **Ignorer le code existant**
   ```typescript
   // ❌ MAUVAIS
   // Créer un nouveau hook alors qu'un similaire existe
   const useNewFeature = () => {
     // Duplication de useExistingFeature
   };
   ```

3. **Ne pas documenter les décisions**
   ```typescript
   // ❌ MAUVAIS
   // Choisir une approche sans documenter pourquoi
   ```

4. **Sous-estimer la complexité**
   ```markdown
   ❌ MAUVAIS
   Task: Ajouter la feature
   Temps: 1h
   (Sans découpage ni analyse)
   ```

### ✅ Ce qu'il faut faire

1. **Analyser avant de coder**
   ```typescript
   // ✅ BON
   // 1. Analyser l'existant
   // 2. Comprendre les patterns
   // 3. Concevoir la solution
   // 4. Documenter les décisions
   // 5. Coder avec confiance
   ```

2. **Réutiliser et étendre**
   ```typescript
   // ✅ BON
   // Étendre un hook existant
   const useEnhancedFeature = () => {
     const baseFeature = useExistingFeature();
     // Ajouter la logique spécifique
     return { ...baseFeature, newLogic };
   };
   ```

3. **Documenter systématiquement**
   ```typescript
   /**
    * Hook personnalisé pour gérer la feature X
    *
    * @remarks
    * Ce hook a été créé pour centraliser la logique de X car :
    * - Raison 1
    * - Raison 2
    *
    * @example
    * ```tsx
    * const { data, update } = useFeature();
    * ```
    */
   ```

4. **Découper finement**
   ```markdown
   ✅ BON
   Epic: Feature X
   - Story 1: Types et interfaces (30min)
   - Story 2: Service API (1h)
   - Story 3: Hook custom (2h)
   - Story 4: Tests (1.5h)
   - Story 5: UI (3h)
   ```

## Exemples Concrets

### Exemple 1 : Ajout d'un Formulaire de Connexion

```markdown
# Analyse : Formulaire de Connexion

## 1. Audit du Code Existant
- ✅ Formulaire d'inscription existe (src/features/auth/components/RegisterForm.tsx)
- ✅ Hook useAuth existe (src/hooks/useAuth.ts)
- ✅ Service authService existe (src/services/auth.service.ts)
- ✅ Validation avec Zod utilisée dans le projet

## 2. Décisions Architecturales
- Réutiliser le pattern du RegisterForm
- Utiliser Zod pour la validation
- Utiliser React Hook Form pour la gestion du formulaire
- Utiliser le hook useAuth existant

## 3. Plan d'Implémentation
1. Créer le schéma Zod (types/auth.schema.ts)
2. Créer LoginForm component (features/auth/components/LoginForm.tsx)
3. Ajouter les tests (LoginForm.test.tsx)
4. Intégrer dans LoginPage
5. Tester le flux complet

## 4. Code Réutilisé
- useAuth hook
- authService.login()
- FormInput component
- Button component
```

### Exemple 2 : Dashboard Utilisateur

```markdown
# Analyse : Dashboard Utilisateur

## 1. Audit du Code Existant
- ✅ useUser hook existe
- ❌ Pas de composant Dashboard
- ✅ React Query utilisé pour le cache
- ✅ Recharts utilisé pour les graphiques

## 2. Architecture Proposée
```
features/dashboard/
├── components/
│   ├── DashboardLayout.tsx       # Layout principal
│   ├── StatsCard.tsx             # Carte de statistique
│   ├── UserChart.tsx             # Graphique utilisateur
│   └── ActivityFeed.tsx          # Fil d'activité
├── hooks/
│   ├── useDashboardData.ts       # Logique de récupération
│   └── useStatsCalculation.ts    # Calculs statistiques
├── types/
│   └── dashboard.types.ts        # Types TypeScript
└── utils/
    └── statsHelpers.ts           # Utilitaires
```

## 3. Types à Créer
```typescript
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'purchase' | 'update';
  timestamp: Date;
  user: User;
}
```

## 4. Estimation
- Total: 12h
- Complexité: Moyenne-Élevée
```

## Conclusion

L'analyse préalable est **NON NÉGOCIABLE**. Elle permet de :

1. ✅ Gagner du temps sur le long terme
2. ✅ Éviter les réécritures
3. ✅ Maintenir la cohérence du code
4. ✅ Réduire les bugs
5. ✅ Faciliter les reviews
6. ✅ Améliorer la maintenabilité

**Temps d'analyse recommandé** : 20-30% du temps total du projet

**Devise** : "Une heure d'analyse économise dix heures de développement"
