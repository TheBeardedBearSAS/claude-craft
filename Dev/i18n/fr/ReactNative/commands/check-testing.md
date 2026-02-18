---
description: Check Testing React Native
argument-hint: [arguments]
---

# Check Testing React Native

## Arguments

$ARGUMENTS

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Tu es un auditeur expert en testing React Native. Ta mission est d'analyser la stratégie de test et la couverture selon les standards définis dans `.claude/rules/07-testing.md` et `.claude/rules/08-quality-tools.md`.

### Étape 1 : Analyse de la configuration des tests

1. Vérifie la présence et configuration de Jest
2. Vérifie la présence et configuration de React Native Testing Library (RNTL)
3. Vérifie la présence et configuration de Detox (E2E tests)
4. Analyse les scripts de test dans package.json

### Étape 2 : Configuration Jest (5 points)

#### 🧪 Fichiers de configuration

- [ ] **(1 pt)** `jest.config.js` ou configuration dans package.json présente
- [ ] **(1 pt)** Preset React Native configuré (`@react-native/jest-preset` ou équivalent)
- [ ] **(1 pt)** Setup files configurés (`setupFilesAfterEnv`)
- [ ] **(1 pt)** Couverture de code activée (coverage)
- [ ] **(1 pt)** Transformations configurées pour TypeScript et React Native

**Fichiers à vérifier :**
```bash
jest.config.js
jest.setup.js
package.json
```

#### 📊 Configuration de la couverture

Vérifie dans `jest.config.js` :
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

- [ ] Seuils de couverture définis (≥ 80% recommandé)
- [ ] Collecte depuis les bons dossiers (src/, app/)
- [ ] Exclusions appropriées (node_modules, __tests__, etc.)

### Étape 3 : Tests Unitaires avec RNTL (8 points)

Référence : `.claude/rules/07-testing.md`

#### 📁 Organisation des tests

- [ ] **(1 pt)** Tests colocalisés avec les composants ou dans `__tests__/`
- [ ] **(1 pt)** Naming convention : `*.test.tsx` ou `*.spec.tsx`
- [ ] **(1 pt)** Structure AAA (Arrange, Act, Assert) respectée

**Fichiers à vérifier :**
```bash
src/**/__tests__/
src/**/*.test.tsx
src/**/*.spec.tsx
```

#### 🧩 Qualité des tests unitaires

Analyse 5-10 fichiers de tests :

- [ ] **(1 pt)** Utilisation de `@testing-library/react-native` (render, fireEvent, waitFor)
- [ ] **(1 pt)** Tests des composants isolés avec des props mockées
- [ ] **(1 pt)** Tests des hooks personnalisés avec `@testing-library/react-hooks`
- [ ] **(1 pt)** Mocks appropriés pour les modules natifs (AsyncStorage, etc.)
- [ ] **(1 pt)** Tests des cas limites et erreurs (edge cases)

**Exemple de bon test :**
```typescript
describe('LoginButton', () => {
  it('devrait appeler onPress quand pressé', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);

    fireEvent.press(getByText('Se connecter'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Étape 4 : Tests d'intégration (4 points)

- [ ] **(1 pt)** Tests de flux utilisateur complets
- [ ] **(1 pt)** Tests de navigation entre écrans
- [ ] **(1 pt)** Tests d'appels API mockés
- [ ] **(1 pt)** Tests de gestion d'état (Context, Redux, Zustand)

**Fichiers à vérifier :**
```bash
src/**/*.integration.test.tsx
__tests__/integration/
```

### Étape 5 : Tests E2E avec Detox (4 points)

#### 🤖 Configuration Detox

- [ ] **(1 pt)** `.detoxrc.js` ou configuration Detox présente
- [ ] **(1 pt)** Configuration pour iOS et Android
- [ ] **(1 pt)** Scripts de test E2E dans package.json (`test:e2e`)

**Fichiers à vérifier :**
```bash
.detoxrc.js
.detoxrc.json
e2e/
package.json
```

#### 🎬 Tests E2E

- [ ] **(1 pt)** Au moins 3 scénarios E2E critiques testés (login, navigation principale, action clé)

**Fichiers à vérifier :**
```bash
e2e/**/*.e2e.ts
e2e/**/*.e2e.js
```

### Étape 6 : Couverture de tests (4 points)

Exécute la commande de couverture :

```bash
npm run test -- --coverage
# ou
yarn test --coverage
```

Analyse le rapport de couverture :

- [ ] **(1 pt)** Couverture globale ≥ 80%
- [ ] **(1 pt)** Couverture des branches ≥ 75%
- [ ] **(1 pt)** Composants critiques couverts à 100%
- [ ] **(1 pt)** Rapport de couverture généré (coverage/lcov-report/)

**Fichiers à vérifier :**
```bash
coverage/lcov-report/index.html
coverage/coverage-summary.json
```

### Étape 7 : Calcul du score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critère                          │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Configuration Jest               │ XX/5    │ ✅/⚠️/❌│
│ Tests Unitaires (RNTL)           │ XX/8    │ ✅/⚠️/❌│
│ Tests d'intégration              │ XX/4    │ ✅/⚠️/❌│
│ Tests E2E (Detox)                │ XX/4    │ ✅/⚠️/❌│
│ Couverture de code               │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL TESTING                    │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Légende :**
- ✅ Excellent (≥ 20/25)
- ⚠️ Attention (15-19/25)
- ❌ Critique (< 15/25)

### Étape 8 : Rapport détaillé

## 📊 RÉSULTATS DE L'AUDIT TESTING

### ✅ Points Forts

Liste les bonnes pratiques identifiées :
- [Pratique 1 avec exemple de test]
- [Pratique 2 avec exemple de test]

### ⚠️ Points d'Amélioration

Liste les problèmes identifiés par ordre de priorité :

1. **[Problème 1]**
   - **Sévérité :** Critique/Élevé/Moyen
   - **Localisation :** [Fichiers/composants non testés]
   - **Impact :** [Risque de régression]
   - **Recommandation :** [Actions à mener]

2. **[Problème 2]**
   - **Sévérité :** Critique/Élevé/Moyen
   - **Localisation :** [Fichiers/composants non testés]
   - **Impact :** [Risque de régression]
   - **Recommandation :** [Actions à mener]

### 📈 Métriques de Testing

#### Couverture de code

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Type            │ Lignes   │ Branches │ Fonctions│ Statements│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Global          │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Components      │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Hooks           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Utils           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Services        │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

#### Statistiques des tests

- **Nombre total de tests :** XX
  - Tests unitaires : XX
  - Tests d'intégration : XX
  - Tests E2E : XX
- **Tests réussis :** XX
- **Tests échoués :** XX
- **Temps d'exécution total :** XX secondes
- **Ratio tests/code :** XX tests pour YY lignes de code

#### Composants sans tests

Liste les composants critiques non testés :
1. `[Chemin/Composant]` - [Raison de criticité]
2. `[Chemin/Composant]` - [Raison de criticité]
3. `[Chemin/Composant]` - [Raison de criticité]

#### Fonctionnalités critiques testées

- [ ] Authentification (login, logout, refresh token)
- [ ] Navigation principale
- [ ] Formulaires critiques
- [ ] Appels API principaux
- [ ] Gestion d'erreurs
- [ ] États de chargement
- [ ] Gestion offline

### 🎯 TOP 3 ACTIONS PRIORITAIRES

#### 1. [ACTION #1]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Composants/features à tester en priorité]
- **Couverture actuelle :** XX%
- **Couverture cible :** YY%
- **Fichiers concernés :**
  - `[fichier1]` (couverture: XX%)
  - `[fichier2]` (couverture: XX%)
- **Exemple de tests à ajouter :**
```typescript
describe('[Composant]', () => {
  it('devrait [comportement]', () => {
    // Test à implémenter
  });
});
```

#### 2. [ACTION #2]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Configuration ou amélioration des tests]
- **Fichiers concernés :** [Liste]

#### 3. [ACTION #3]
- **Effort :** Faible/Moyen/Élevé
- **Impact :** Critique/Élevé/Moyen
- **Description :** [Tests E2E ou intégration à ajouter]
- **Scénarios à couvrir :**
  - [Scénario 1]
  - [Scénario 2]

---

## 🚀 Recommandations

### Quick Wins (Effort faible, impact élevé)
- [Amélioration rapide 1]
- [Amélioration rapide 2]

### Investissements (Effort moyen/élevé, impact élevé)
- [Amélioration structurelle 1]
- [Amélioration structurelle 2]

### Bonnes pratiques à adopter
- Écrire les tests en même temps que le code (TDD)
- Viser 80% de couverture minimum
- Tester les cas limites et erreurs
- Maintenir les tests à jour avec le code
- Utiliser des snapshots avec parcimonie

---

## 📚 Références

- `.claude/rules/07-testing.md` - Standards de testing
- `.claude/rules/08-quality-tools.md` - Outils de qualité
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

---

**Score final : XX/25**
