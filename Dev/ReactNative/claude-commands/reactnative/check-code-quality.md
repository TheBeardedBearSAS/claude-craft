# Check Code Quality React Native

## Arguments

$ARGUMENTS

## MISSION

Tu es un auditeur expert en qualité de code React Native. Ta mission est d'analyser la conformité du code selon les standards définis dans `.claude/rules/03-coding-standards.md`, `.claude/rules/04-solid-principles.md` et `.claude/rules/05-kiss-dry-yagni.md`.

### Étape 1 : Analyse de la configuration

1. Vérifie la présence et la configuration de TypeScript
2. Vérifie la présence et la configuration d'ESLint
3. Vérifie la présence et la configuration de Prettier
4. Analyse les fichiers de configuration package.json

### Étape 2 : Vérification TypeScript (7 points)

Vérifie la configuration TypeScript :

#### 🔧 Configuration tsconfig.json

- [ ] **(2 pts)** `"strict": true` activé
- [ ] **(1 pt)** `"noImplicitAny": true`
- [ ] **(1 pt)** `"strictNullChecks": true`
- [ ] **(1 pt)** `"noUnusedLocals": true` et `"noUnusedParameters": true`
- [ ] **(1 pt)** Paths aliases configurés (ex: `@/components`, `@/utils`)
- [ ] **(1 pt)** Types corrects pour React Native (`@types/react`, `@types/react-native`)

**Fichiers à vérifier :**
```bash
tsconfig.json
package.json
```

#### 📝 Utilisation de TypeScript dans le code

Vérifie 5-10 fichiers TypeScript aléatoires :

- [ ] Pas de `any` (sauf cas justifiés et documentés)
- [ ] Interfaces/Types bien définis pour les props
- [ ] Types pour les fonctions (params et return)
- [ ] Pas de `@ts-ignore` ou `@ts-nocheck` (sauf exceptions documentées)
- [ ] Utilisation de génériques quand approprié

**Fichiers à vérifier :**
```bash
src/**/*.tsx
src/**/*.ts
```

### Étape 3 : Vérification ESLint (6 points)

#### 🔍 Configuration ESLint

- [ ] **(2 pts)** `.eslintrc.js` ou `.eslintrc.json` présent et configuré
- [ ] **(1 pt)** Plugin `@react-native` ou équivalent configuré
- [ ] **(1 pt)** Plugin `@typescript-eslint` configuré
- [ ] **(1 pt)** Règles React Hooks activées (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- [ ] **(1 pt)** Scripts ESLint dans package.json (`lint`, `lint:fix`)

**Fichiers à vérifier :**
```bash
.eslintrc.js
.eslintrc.json
package.json
```

#### ⚠️ Vérification des erreurs ESLint

Lance ESLint et analyse les résultats :

```bash
npm run lint
# ou
yarn lint
```

- [ ] 0 erreurs ESLint
- [ ] < 10 warnings ESLint
- [ ] Pas de règles désactivées sans justification

### Étape 4 : Vérification Prettier (3 points)

- [ ] **(1 pt)** `.prettierrc` présent avec configuration cohérente
- [ ] **(1 pt)** Intégration ESLint + Prettier (pas de conflits)
- [ ] **(1 pt)** Script format dans package.json

**Fichiers à vérifier :**
```bash
.prettierrc
.prettierrc.js
.prettierrc.json
package.json
```

### Étape 5 : Principes SOLID (4 points)

Référence : `.claude/rules/04-solid-principles.md`

Analyse 3-5 composants ou modules principaux :

- [ ] **(1 pt)** **S - Single Responsibility** : Chaque composant/fonction a une seule responsabilité
- [ ] **(1 pt)** **O - Open/Closed** : Extensions possibles sans modifier le code existant
- [ ] **(1 pt)** **L - Liskov Substitution** : Les composants sont interchangeables
- [ ] **(1 pt)** **D - Dependency Inversion** : Dépendances via props/injection, pas de couplage fort

**Fichiers à analyser :**
```bash
src/components/**/*.tsx
src/features/**/*.tsx
src/hooks/**/*.ts
```

### Étape 6 : Principes KISS, DRY, YAGNI (5 points)

Référence : `.claude/rules/05-kiss-dry-yagni.md`

- [ ] **(2 pts)** **KISS (Keep It Simple)** : Code simple et lisible, pas de sur-ingénierie
- [ ] **(2 pts)** **DRY (Don't Repeat Yourself)** : Pas de duplication de code, réutilisation via hooks/utils
- [ ] **(1 pt)** **YAGNI (You Aren't Gonna Need It)** : Pas de code inutilisé ou de fonctionnalités spéculatives

Vérifie :
- Fonctions dupliquées qui pourraient être factorisées
- Logique complexe qui pourrait être simplifiée
- Code mort ou commenté qui devrait être supprimé

**Fichiers à analyser :**
```bash
src/**/*.ts
src/**/*.tsx
```

### Étape 7 : Standards de code React Native

Référence : `.claude/rules/03-coding-standards.md`

#### 📱 Bonnes pratiques spécifiques

- [ ] Utilisation correcte de `StyleSheet.create()` (pas d'inline styles partout)
- [ ] Constantes pour les couleurs, spacing, typography
- [ ] Composants fonctionnels avec hooks (pas de class components)
- [ ] Gestion correcte du state (useState, useReducer selon le cas)
- [ ] Utilisation de `useCallback` pour les handlers passés en props
- [ ] Utilisation de `useMemo` pour les calculs coûteux

**Fichiers à vérifier :**
```bash
src/components/**/*.tsx
src/theme/
src/constants/
```

### Étape 8 : Calcul du score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critère                          │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ TypeScript Configuration         │ XX/7    │ ✅/⚠️/❌│
│ ESLint                           │ XX/6    │ ✅/⚠️/❌│
│ Prettier                         │ XX/3    │ ✅/⚠️/❌│
│ Principes SOLID                  │ XX/4    │ ✅/⚠️/❌│
│ KISS, DRY, YAGNI                 │ XX/5    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL QUALITÉ DE CODE            │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Légende :**
- ✅ Excellent (≥ 20/25)
- ⚠️ Attention (15-19/25)
- ❌ Critique (< 15/25)

### Étape 9 : Rapport détaillé

## 📊 RÉSULTATS DE L'AUDIT QUALITÉ DE CODE

### ✅ Points Forts

Liste les bonnes pratiques identifiées :
- [Pratique 1 avec exemple de code]
- [Pratique 2 avec exemple de code]

### ⚠️ Points d'Amélioration

Liste les problèmes identifiés par ordre de priorité :

1. **[Problème 1]**
   - **Sévérité :** Critique/Élevé/Moyen
   - **Localisation :** [Fichiers concernés]
   - **Exemple :**
   ```typescript
   // Code problématique
   ```
   - **Recommandation :**
   ```typescript
   // Code corrigé
   ```

2. **[Problème 2]**
   - **Sévérité :** Critique/Élevé/Moyen
   - **Localisation :** [Fichiers concernés]
   - **Exemple :**
   ```typescript
   // Code problématique
   ```
   - **Recommandation :**
   ```typescript
   // Code corrigé
   ```

### 📈 Métriques de Qualité

Exécute et reporte les métriques suivantes :

#### Erreurs ESLint
```bash
npm run lint
```
- **Erreurs :** XX
- **Warnings :** XX
- **Fichiers analysés :** XX

#### Complexité du code

Si SonarQube ou autre outil disponible :
- **Complexité cyclomatique moyenne :** XX (cible: < 10)
- **Lignes de code :** XX
- **Duplication :** XX% (cible: < 5%)
- **Dette technique :** XX heures

#### TypeScript

- **Pourcentage de typage strict :** XX% (cible: 100%)
- **Utilisation de `any` :** XX occurrences (cible: 0)
- **Erreurs TypeScript :** XX (cible: 0)

### 🎯 TOP 3 ACTIONS PRIORITAIRES

#### 1. [ACTION #1]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail du problème]
- **Solution :** [Action concrète]
- **Fichiers :** [Liste des fichiers]
- **Exemple :**
```typescript
// Avant
[code problématique]

// Après
[code corrigé]
```

#### 2. [ACTION #2]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail du problème]
- **Solution :** [Action concrète]
- **Fichiers :** [Liste des fichiers]

#### 3. [ACTION #3]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Détail du problème]
- **Solution :** [Action concrète]
- **Fichiers :** [Liste des fichiers]

---

## 📚 Références

- `.claude/rules/03-coding-standards.md` - Standards de code
- `.claude/rules/04-solid-principles.md` - Principes SOLID
- `.claude/rules/05-kiss-dry-yagni.md` - Principes KISS, DRY, YAGNI
- `.claude/rules/06-tooling.md` - Configuration des outils

---

**Score final : XX/25**
