# Workflow d'Analyse - Analyse Obligatoire Avant Codage

## Introduction

**RÈGLE ABSOLUE**: Avant toute modification de code, une phase d'analyse OBLIGATOIRE doit être effectuée. Cette règle est non-négociable et garantit la qualité du code produit.

---

## Principe Fondamental

> "Think First, Code Later"

Chaque intervention sur le code doit être précédée d'une analyse méthodique pour:
- Comprendre le contexte
- Identifier les impacts
- Anticiper les problèmes
- Choisir la meilleure solution

---

## Phase 1: Compréhension du Besoin

### 1.1 Clarification de la Demande

**Questions à se poser**:
- Quel est le besoin exact de l'utilisateur?
- Quel problème cherche-t-on à résoudre?
- Quels sont les critères d'acceptation?
- Y a-t-il des contraintes techniques ou métier?

**Actions**:
```typescript
// AVANT de coder, documenter:
/**
 * BESOIN: [Description claire du besoin]
 * PROBLÈME: [Problème à résoudre]
 * CRITÈRES: [Critères d'acceptation]
 * CONTRAINTES: [Contraintes identifiées]
 */
```

### 1.2 Analyse du Contexte Métier

**Comprendre**:
- Le flow utilisateur impacté
- Les règles métier applicables
- L'impact sur l'expérience utilisateur
- Les cas d'usage (use cases)

**Exemple**:
```typescript
// Feature: Ajout d'un système de favoris
//
// CONTEXTE MÉTIER:
// - L'utilisateur doit pouvoir marquer des articles comme favoris
// - Les favoris doivent être accessibles offline
// - Les favoris sont synchronisés entre appareils
// - Maximum 100 favoris par utilisateur
//
// IMPACT UX:
// - Icône coeur sur chaque article
// - Écran dédié aux favoris
// - Feedback visuel immédiat (optimistic update)
```

---

## Phase 2: Analyse Technique

### 2.1 Exploration du Code Existant

**Utiliser les outils de recherche**:

```bash
# Rechercher les patterns similaires
npx expo-search "similar-pattern"

# Chercher l'implémentation existante
grep -r "relatedFeature" src/

# Identifier les dépendances
grep -r "import.*TargetComponent" src/
```

**Checklist d'exploration**:
- [ ] Composants existants réutilisables
- [ ] Hooks personnalisés disponibles
- [ ] Services API déjà implémentés
- [ ] State management en place
- [ ] Patterns de navigation utilisés
- [ ] Styles et thème cohérents

### 2.2 Analyse de l'Architecture

**Questions architecture**:
- Où se situe cette feature dans l'architecture?
- Quels layers sont impactés? (UI, Logic, Data, Navigation)
- Y a-t-il un pattern établi à suivre?
- Dois-je créer un nouveau module ou étendre l'existant?

**Exemple d'analyse**:
```typescript
// Feature: Système de favoris
//
// LAYERS IMPACTÉS:
//
// 1. DATA LAYER
//    - Nouveau store: stores/favorites.store.ts
//    - API service: services/api/favorites.service.ts
//    - Storage: services/storage/favorites.storage.ts
//    - Types: types/Favorite.types.ts
//
// 2. LOGIC LAYER
//    - Hook: hooks/useFavorites.ts
//    - Hook: hooks/useFavoriteToggle.ts
//    - Utilities: utils/favorites.utils.ts
//
// 3. UI LAYER
//    - Component: components/FavoriteButton.tsx
//    - Screen: screens/FavoritesScreen.tsx
//    - Icon: components/ui/FavoriteIcon.tsx
//
// 4. NAVIGATION
//    - Route: app/(tabs)/favorites.tsx
//    - Deep link: favorites/:id
```

### 2.3 Analyse des Dépendances

**Identifier**:
- Librairies externes nécessaires
- Dépendances internes (modules, composants)
- Dépendances circulaires potentielles
- Versions compatibles

**Template d'analyse**:
```typescript
// DÉPENDANCES REQUISES:
//
// Nouvelles librairies:
// - @react-native-async-storage/async-storage (storage)
// - react-query (API sync)
//
// Modules internes:
// - stores/user.store (pour userId)
// - services/api/client (pour API calls)
// - hooks/useAuth (pour authentication)
//
// Vérifications:
// - Pas de dépendance circulaire avec features/articles
// - Compatible avec architecture existante
```

---

## Phase 3: Identification des Impacts

### 3.1 Impact sur le Code Existant

**Analyser**:
- Quels fichiers seront modifiés?
- Quels composants seront impactés?
- Y a-t-il des breaking changes?
- Les tests existants seront-ils affectés?

**Checklist impact**:
```typescript
// IMPACT SUR CODE EXISTANT:
//
// MODIFICATIONS:
// - screens/ArticleDetailScreen.tsx (ajout FavoriteButton)
// - components/ArticleCard.tsx (ajout icône favorite)
// - navigation/TabNavigator.tsx (ajout tab Favorites)
//
// NOUVEAUX FICHIERS:
// - stores/favorites.store.ts
// - screens/FavoritesScreen.tsx
// - hooks/useFavorites.ts
//
// BREAKING CHANGES: Aucun
//
// TESTS À MODIFIER:
// - ArticleCard.test.tsx (nouveaux props)
// - ArticleDetailScreen.test.tsx (nouveau bouton)
```

### 3.2 Impact Performance

**Considérer**:
- Bundle size impact
- Performance runtime (FPS, memory)
- Taille des assets
- Network requests additionnels
- Storage utilisé

**Exemple**:
```typescript
// ANALYSE PERFORMANCE:
//
// BUNDLE SIZE:
// - Ajout react-query: +50kb (gzipped)
// - Nouveau screen: ~15kb
// - TOTAL: +65kb (acceptable < 100kb)
//
// RUNTIME:
// - Render favoris list: FlatList avec windowSize optimisé
// - Storage: MMKV (ultra rapide)
// - Network: Optimistic updates (pas de latence perçue)
//
// STORAGE:
// - Max 100 favoris × 1kb = 100kb (négligeable)
```

### 3.3 Impact UX/UI

**Évaluer**:
- Cohérence avec le design system
- Accessibilité
- Responsive (tablet, phone)
- Animations et transitions
- Feedback utilisateur

**Checklist UX**:
```typescript
// ANALYSE UX/UI:
//
// DESIGN SYSTEM:
// - Utiliser theme.colors.primary pour icône active
// - Utiliser Button component existant
// - Animation: scale + haptic feedback
//
// ACCESSIBILITÉ:
// - Label: "Ajouter aux favoris" / "Retirer des favoris"
// - Screen reader compatible
// - Hit slop: 44x44 minimum
//
// RESPONSIVE:
// - Icône adaptée tablet (+ grande)
// - Grid favoris: 2 colonnes mobile, 3 tablet
//
// FEEDBACK:
// - Haptic feedback au toggle
// - Toast notification au succès
// - Animation coeur
```

---

## Phase 4: Conception de la Solution

### 4.1 Choix de l'Approche

**Comparer les options**:

```typescript
// APPROCHE 1: Local First avec sync
// PROS:
// - Fonctionne offline
// - Performance optimale
// - UX fluide
// CONS:
// - Complexité sync
// - Conflits potentiels
//
// APPROCHE 2: API Only
// PROS:
// - Simple
// - Pas de sync
// - Source de vérité unique
// CONS:
// - Requiert connexion
// - Latence
//
// DÉCISION: Approche 1 (Local First)
// RAISON: Meilleure UX, feature critique offline
```

### 4.2 Design Pattern à Utiliser

**Identifier le pattern approprié**:

```typescript
// PATTERNS APPLICABLES:
//
// 1. STATE MANAGEMENT: Zustand
//    - Store global pour favoris
//    - Persist avec MMKV
//
// 2. DATA FETCHING: React Query
//    - Query favoris avec cache
//    - Mutation pour toggle
//    - Optimistic updates
//
// 3. COMPONENT PATTERN: Compound Component
//    - FavoriteButton.Toggle
//    - FavoriteButton.Icon
//    - FavoriteButton.Count
//
// 4. HOOK PATTERN: Custom Hook
//    - useFavorites() pour data
//    - useFavoriteToggle() pour action
```

### 4.3 Structure des Données

**Définir les types**:

```typescript
// TYPES DÉFINIS:

// Favorite entity
interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  syncedAt?: Date;
  localOnly?: boolean; // Pour favoris pas encore sync
}

// API Response
interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Store State
interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  sync: () => Promise<void>;
}
```

---

## Phase 5: Plan d'Implémentation

### 5.1 Découpage en Tâches

**Créer un plan détaillé**:

```typescript
// PLAN D'IMPLÉMENTATION:
//
// ÉTAPE 1: Types & Interfaces
// - Créer types/Favorite.types.ts
// - Définir interfaces
// Durée: 30min
//
// ÉTAPE 2: Storage Layer
// - Implémenter favorites.storage.ts
// - Tests storage
// Durée: 1h
//
// ÉTAPE 3: API Service
// - Implémenter favorites.service.ts
// - Mock API responses
// Durée: 1h
//
// ÉTAPE 4: Store
// - Créer favorites.store.ts
// - Implémenter actions
// - Tests store
// Durée: 2h
//
// ÉTAPE 5: Hooks
// - Créer useFavorites
// - Créer useFavoriteToggle
// - Tests hooks
// Durée: 1h30
//
// ÉTAPE 6: UI Components
// - FavoriteButton
// - FavoriteIcon
// - Tests components
// Durée: 2h
//
// ÉTAPE 7: Screen
// - FavoritesScreen
// - Navigation setup
// - Tests screen
// Durée: 2h
//
// ÉTAPE 8: Integration
// - Intégrer dans ArticleCard
// - Intégrer dans ArticleDetail
// - Tests E2E
// Durée: 2h
//
// TOTAL: ~12h
```

### 5.2 Ordre d'Implémentation

**Règle**: Toujours du bas vers le haut (Bottom-Up)

```typescript
// ORDRE IMPLÉMENTATION:
//
// 1. Fondations (Data Layer)
//    ↓
// 2. Services & Storage
//    ↓
// 3. State Management
//    ↓
// 4. Business Logic (Hooks)
//    ↓
// 5. UI Components (dumb)
//    ↓
// 6. UI Components (smart)
//    ↓
// 7. Screens
//    ↓
// 8. Navigation & Integration
//    ↓
// 9. Tests E2E
```

### 5.3 Identification des Risques

**Anticiper les problèmes**:

```typescript
// RISQUES IDENTIFIÉS:
//
// RISQUE 1: Conflits de synchronisation
// - Impact: Élevé
// - Probabilité: Moyenne
// - Mitigation: Timestamp-based resolution, last-write-wins
//
// RISQUE 2: Limite 100 favoris
// - Impact: Moyen
// - Probabilité: Faible
// - Mitigation: Warning UI à 90 favoris, suppression oldest
//
// RISQUE 3: Performance liste favoris
// - Impact: Moyen
// - Probabilité: Faible
// - Mitigation: FlatList virtualisé, pagination
//
// RISQUE 4: Storage space
// - Impact: Faible
// - Probabilité: Très faible
// - Mitigation: Cleanup old synced favorites
```

---

## Phase 6: Validation Pré-Implémentation

### 6.1 Checklist de Validation

**Avant de coder, vérifier**:

```typescript
// CHECKLIST VALIDATION:
//
// ANALYSE:
// ✓ Besoin clairement compris
// ✓ Contexte métier analysé
// ✓ Architecture étudiée
// ✓ Dépendances identifiées
// ✓ Impacts évalués
//
// CONCEPTION:
// ✓ Solution choisie et justifiée
// ✓ Patterns identifiés
// ✓ Types définis
// ✓ Plan d'implémentation créé
//
// RISQUES:
// ✓ Risques identifiés
// ✓ Mitigations planifiées
//
// QUALITÉ:
// ✓ Tests planifiés
// ✓ Performance considérée
// ✓ Accessibilité prévue
// ✓ Documentation préparée
//
// PRÊT À CODER: OUI ✓
```

### 6.2 Revue de Conception

**Points de revue**:

```typescript
// QUESTIONS DE REVUE:
//
// 1. La solution est-elle KISS (Keep It Simple)?
//    → Oui, pattern standard React Query + Zustand
//
// 2. Respecte-t-elle DRY?
//    → Oui, hooks réutilisables
//
// 3. Suit-elle SOLID?
//    → Oui, responsabilités séparées
//
// 4. Est-elle testable?
//    → Oui, chaque layer indépendant
//
// 5. Est-elle performante?
//    → Oui, optimistic updates, FlatList
//
// 6. Est-elle maintenable?
//    → Oui, code clair, bien typé, documenté
//
// 7. Respecte-t-elle l'architecture?
//    → Oui, suit les patterns établis
//
// VALIDATION: APPROUVÉE ✓
```

---

## Phase 7: Documentation de l'Analyse

### 7.1 Template de Documentation

**Créer un ADR (Architecture Decision Record)**:

```markdown
# ADR-XXX: Système de Favoris

## Statut
Proposé

## Contexte
Les utilisateurs ont besoin de marquer des articles comme favoris
pour y accéder rapidement, même hors ligne.

## Décision
Implémentation d'un système de favoris avec:
- Local-first approach (MMKV storage)
- Synchronisation background (React Query)
- Optimistic updates (UX fluide)
- Limite: 100 favoris par utilisateur

## Conséquences

### Positives
- Fonctionne offline
- Performance optimale
- UX fluide
- Sync automatique

### Négatives
- Complexité sync
- Gestion conflits
- Storage local requis

## Alternatives Considérées
1. API-only: Rejetée (requiert connexion)
2. AsyncStorage: Rejetée (performance)

## Notes d'Implémentation
- Store: Zustand avec MMKV persistence
- API: React Query avec optimistic updates
- Limite: Warning UI à 90 favoris
```

### 7.2 Inline Documentation

**Dans le code, documenter les décisions**:

```typescript
/**
 * Favorites Store
 *
 * DÉCISIONS:
 * - Zustand pour state management (simple, performant)
 * - MMKV pour persistence (ultra rapide)
 * - Optimistic updates (meilleure UX)
 *
 * LIMITES:
 * - Max 100 favoris par user
 * - Sync toutes les 5min en background
 *
 * @see ADR-XXX pour détails architecture
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Implementation
    }),
    {
      name: 'favorites',
      storage: createMMKVStorage(),
    }
  )
);
```

---

## Exemples Complets

### Exemple 1: Ajout d'une Feature Complexe

```typescript
// ========================================
// ANALYSE: Feature "Notifications Push"
// ========================================

// PHASE 1: COMPRÉHENSION
// -----------------------
// BESOIN: Recevoir des notifications push pour nouveaux articles
// CRITÈRES:
// - Notifications sur iOS et Android
// - Opt-in (permission utilisateur)
// - Silent notifications pour sync data
// - Deep links vers articles

// PHASE 2: ANALYSE TECHNIQUE
// ---------------------------
// EXPLORATION:
// - Expo Notifications déjà installé
// - Push service: FCM (Firebase Cloud Messaging)
// - Deep linking: Expo Router compatible
//
// ARCHITECTURE:
// - Service: services/notifications/push.service.ts
// - Store: stores/notifications.store.ts
// - Hook: hooks/useNotifications.ts
// - Provider: providers/NotificationsProvider.tsx

// PHASE 3: IMPACTS
// ----------------
// CODE:
// - Nouveau module notifications/
// - Modification App.tsx (provider)
// - Update app.json (config)
//
// PERFORMANCE:
// - Bundle: +80kb (expo-notifications)
// - Background task: Minimal impact
//
// UX:
// - Permission prompt (iOS/Android)
// - Settings screen update
// - Toast pour notifications reçues

// PHASE 4: CONCEPTION
// -------------------
// APPROCHE: Native Expo Notifications
// PATTERN: Provider + Hook
// TYPES:
interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'article' | 'system';
    articleId?: string;
  };
}

// PHASE 5: PLAN
// -------------
// 1. Setup Firebase (2h)
// 2. Config app.json (30min)
// 3. Service notifications (2h)
// 4. Store + Hook (1h30)
// 5. Provider (1h)
// 6. Settings UI (2h)
// 7. Deep links (1h)
// 8. Tests (2h)
// TOTAL: 12h

// PHASE 6: VALIDATION
// -------------------
// ✓ Analyse complète
// ✓ Solution validée
// ✓ Plan détaillé
// ✓ Risques identifiés
// → PRÊT À CODER
```

### Exemple 2: Bug Fix

```typescript
// ========================================
// ANALYSE: Bug "Images pas en cache"
// ========================================

// PHASE 1: COMPRÉHENSION
// -----------------------
// PROBLÈME: Images rechargées à chaque visite
// SYMPTÔMES:
// - Flicker au scroll
// - Consommation data élevée
// - Performance dégradée
//
// REPRODUCTION:
// 1. Scroll liste articles
// 2. Naviguer ailleurs
// 3. Revenir liste
// 4. Images rechargent

// PHASE 2: INVESTIGATION
// ----------------------
// CODE ACTUEL:
<Image source={{ uri: article.imageUrl }} />

// PROBLÈME IDENTIFIÉ:
// - Pas de cache configuré
// - react-native Image cache par défaut faible
//
// SOLUTIONS POSSIBLES:
// 1. expo-image (nouveau, performant)
// 2. react-native-fast-image (éprouvé)
// 3. Cache manuel avec FileSystem

// PHASE 3: IMPACTS
// ----------------
// CHANGEMENT:
// - Remplacer Image par expo-image
// - Migration ~50 fichiers
//
// PERFORMANCE:
// - Bundle: +40kb
// - Cache disk: ~100MB max
// - Amélioration FPS: +15-20%

// PHASE 4: DÉCISION
// -----------------
// CHOIX: expo-image
// RAISON:
// - Intégration native Expo
// - Cache automatique
// - Blurhash support
// - Meilleure performance

// PHASE 5: PLAN
// -------------
// 1. Installer expo-image (15min)
// 2. Créer CachedImage component (30min)
// 3. Migration Image → CachedImage (2h)
// 4. Tests (1h)
// 5. Validation performance (30min)
// TOTAL: 4h15

// PHASE 6: VALIDATION
// -------------------
// ✓ Root cause identifiée
// ✓ Solution testée
// ✓ Migration plan clair
// → PRÊT À FIXER
```

---

## Anti-Patterns à Éviter

### ❌ Coder Sans Analyser

```typescript
// MAUVAIS: Coder directement
const handleFavorite = () => {
  // Je code sans réfléchir...
  fetch('/api/favorites', { ... });
};

// BON: Analyser puis coder
// 1. Analyser: Besoin de sync offline?
// 2. Concevoir: React Query + optimistic update
// 3. Coder:
const { mutate } = useMutation({
  mutationFn: addFavorite,
  onMutate: optimisticUpdate,
});
```

### ❌ Ignorer l'Existant

```typescript
// MAUVAIS: Recréer ce qui existe
const MyCustomButton = () => { ... };

// BON: Réutiliser
import { Button } from '@/components/ui/Button';
```

### ❌ Sur-Engineering

```typescript
// MAUVAIS: Complexité inutile
class FavoriteManager extends AbstractManager
  implements IFavoriteService, IObservable { ... }

// BON: Simple et efficace
export function useFavorites() { ... }
```

---

## Checklist Finale

**Avant chaque intervention code**:

```typescript
// ANALYSE PRÉ-CODE CHECKLIST
//
// □ Besoin clairement défini
// □ Contexte métier compris
// □ Code existant exploré
// □ Architecture analysée
// □ Dépendances identifiées
// □ Impacts évalués
// □ Solution conçue
// □ Pattern choisi
// □ Types définis
// □ Plan détaillé créé
// □ Risques identifiés
// □ Tests planifiés
// □ Documentation préparée
//
// SI TOUS COCHÉS → CODER
// SINON → CONTINUER L'ANALYSE
```

---

## Conclusion

L'analyse pré-code n'est PAS une perte de temps, c'est un INVESTISSEMENT qui:

- **Évite les erreurs coûteuses**
- **Garantit la qualité du code**
- **Accélère le développement** (moins de refactoring)
- **Facilite la maintenance**
- **Améliore la collaboration**

> "Des heures d'analyse sauvent des jours de debugging"

---

**Règle d'or**: Passer autant de temps à analyser qu'à coder (ratio 1:1 minimum).
