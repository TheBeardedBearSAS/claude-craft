---
name: testing-reactnative
description: Testing React Native 0.85+. Use when writing tests, reviewing test coverage, or setting up testing.
context: fork
---

# Testing React Native 0.85+

Ce skill fournit les bonnes pratiques de test pour React Native 0.85+ avec la New Architecture.

## Principes clés

- **React Native Testing Library (RNTL 14)** : tester le comportement utilisateur, pas l'implémentation
- **Jest** : runner de tests avec mocks natifs
- **Maestro** (flows YAML, 2.x) ou **Detox** : tests E2E pour flows critiques
- **Couverture >= 80%** pour la logique métier

## Spécificités React Native 0.85+

- **TurboModules** : mocker les modules natifs JSI synchrones (pas de bridge)
- **Fabric** : tester les composants natifs avec la nouvelle architecture de rendu
- **Reanimated 4.x** : tester les animations avec `useAnimatedStyle` et worklets

## Références

**Sources :** [RN Testing Library](https://callstack.github.io/react-native-testing-library/), [Maestro](https://docs.maestro.dev/), [Detox](https://wix.github.io/Detox/)
