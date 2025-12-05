# Check Architecture React Native

## Arguments

$ARGUMENTS

## MISSION

Tu es un auditeur expert en architecture React Native. Ta mission est d'analyser la conformité architecturale du projet selon les standards définis dans `.claude/rules/02-architecture.md`.

### Étape 1 : Exploration de la structure

1. Analyse la structure racine du projet
2. Identifie le type d'architecture (Expo, React Native CLI, Expo Router)
3. Localise les dossiers principaux : `src/`, `app/`, `components/`, etc.

### Étape 2 : Vérification de la conformité architecturale

Effectue les vérifications suivantes et note chaque résultat :

#### 📁 Structure Feature-Based (8 points)

Vérifie si le projet utilise une organisation feature-based :

- [ ] **(2 pts)** Structure par features/domaines (ex: `src/features/auth/`, `src/features/profile/`)
- [ ] **(2 pts)** Chaque feature contient ses propres composants, hooks, et logique
- [ ] **(2 pts)** Séparation claire entre `features/` (business) et `shared/` (commun)
- [ ] **(2 pts)** Organisation cohérente entre toutes les features

**Fichiers à vérifier :**
```bash
src/features/*/
src/shared/
app/(tabs)/
```

#### 🗂️ Organisation des dossiers (5 points)

- [ ] **(1 pt)** `components/` pour les composants réutilisables
- [ ] **(1 pt)** `hooks/` pour les custom hooks
- [ ] **(1 pt)** `services/` ou `api/` pour les appels réseau
- [ ] **(1 pt)** `utils/` ou `helpers/` pour les fonctions utilitaires
- [ ] **(1 pt)** `types/` ou `models/` pour les définitions TypeScript

**Fichiers à vérifier :**
```bash
src/components/
src/hooks/
src/services/
src/utils/
src/types/
```

#### 🚦 Expo Router / Navigation (4 points)

Si le projet utilise Expo Router :

- [ ] **(1 pt)** Dossier `app/` à la racine avec structure file-based routing
- [ ] **(1 pt)** Layouts définis (`_layout.tsx`) pour la navigation
- [ ] **(1 pt)** Organisation des routes par groupes `(tabs)`, `(stack)`, etc.
- [ ] **(1 pt)** Typage des paramètres de navigation

Si React Navigation :

- [ ] **(1 pt)** Configuration centralisée des navigateurs
- [ ] **(1 pt)** Types pour les routes et paramètres
- [ ] **(1 pt)** Deep linking configuré
- [ ] **(1 pt)** Navigation guards si nécessaire

**Fichiers à vérifier :**
```bash
app/_layout.tsx
app/(tabs)/_layout.tsx
src/navigation/
```

#### 🔌 Architecture en couches (4 points)

- [ ] **(1 pt)** Séparation présentation / logique (UI components vs containers)
- [ ] **(1 pt)** Couche de services pour l'accès aux données
- [ ] **(1 pt)** Hooks personnalisés pour la logique réutilisable
- [ ] **(1 pt)** Gestion d'état centralisée (Context, Zustand, Redux, etc.)

**Fichiers à vérifier :**
```bash
src/hooks/
src/services/
src/store/ ou src/contexts/
```

#### 🎨 Organisation des assets (4 points)

- [ ] **(1 pt)** Dossier `assets/` structuré (images, fonts, icons)
- [ ] **(1 pt)** Utilisation de constantes pour les chemins d'assets
- [ ] **(1 pt)** Optimisation des images (WebP, dimensions appropriées)
- [ ] **(1 pt)** SVG via `react-native-svg` ou équivalent

**Fichiers à vérifier :**
```bash
assets/
src/constants/assets.ts
```

### Étape 3 : Règles spécifiques React Native

Référence : `.claude/rules/02-architecture.md`

Vérifie les points suivants :

#### ⚡ Performance et optimisation

- [ ] Utilisation de `React.memo()` pour les composants coûteux
- [ ] Utilisation de `useMemo()` et `useCallback()` appropriée
- [ ] Pas de logique lourde dans le render
- [ ] FlatList/SectionList pour les listes longues (pas de ScrollView)

#### 🔄 State Management

- [ ] Solution de state management clairement définie
- [ ] État local vs global bien séparé
- [ ] Pas de props drilling excessif

#### 📱 Spécificités Mobile

- [ ] Gestion du SafeAreaView
- [ ] Support des Platform-specific code quand nécessaire
- [ ] Gestion du keyboard (KeyboardAvoidingView)
- [ ] Gestion des permissions mobile

### Étape 4 : Calcul du score

Additionne les points obtenus pour chaque section :

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critère                          │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Structure Feature-Based          │ XX/8    │ ✅/⚠️/❌│
│ Organisation des dossiers        │ XX/5    │ ✅/⚠️/❌│
│ Expo Router / Navigation         │ XX/4    │ ✅/⚠️/❌│
│ Architecture en couches          │ XX/4    │ ✅/⚠️/❌│
│ Organisation des assets          │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL ARCHITECTURE               │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Légende :**
- ✅ Excellent (≥ 20/25)
- ⚠️ Attention (15-19/25)
- ❌ Critique (< 15/25)

### Étape 5 : Rapport détaillé

## 📊 RÉSULTATS DE L'AUDIT ARCHITECTURE

### ✅ Points Forts

Liste les bonnes pratiques identifiées :
- [Pratique 1 avec exemple de fichier]
- [Pratique 2 avec exemple de fichier]

### ⚠️ Points d'Amélioration

Liste les problèmes identifiés par ordre de priorité :

1. **[Problème 1]**
   - **Impact :** Critique/Élevé/Moyen
   - **Localisation :** [Chemins des fichiers]
   - **Recommandation :** [Action concrète]

2. **[Problème 2]**
   - **Impact :** Critique/Élevé/Moyen
   - **Localisation :** [Chemins des fichiers]
   - **Recommandation :** [Action concrète]

### 📈 Métriques Architecture

- **Nombre de features :** XX
- **Profondeur maximale des dossiers :** XX niveaux
- **Composants partagés :** XX
- **Custom hooks :** XX
- **Services API :** XX

### 🎯 TOP 3 ACTIONS PRIORITAIRES

#### 1. [ACTION #1]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail]
- **Fichiers :** [Liste]

#### 2. [ACTION #2]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail]
- **Fichiers :** [Liste]

#### 3. [ACTION #3]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail]
- **Fichiers :** [Liste]

---

## 📚 Références

- `.claude/rules/02-architecture.md` - Standards d'architecture
- `.claude/rules/14-navigation.md` - Standards de navigation
- `.claude/rules/13-state-management.md` - Standards de gestion d'état

---

**Score final : XX/25**
