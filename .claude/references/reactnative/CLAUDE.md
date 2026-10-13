# React Native 0.87 - Quick Reference

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| React Native | 0.87 (bare) / 0.86 (Expo SDK 57) | New Architecture activée par défaut |
| Expo SDK | 57+ (embarque RN 0.86) | New Architecture on by default |
| Node.js | **22.x LTS** | RN 0.87 requiert Node 22.13+ minimum |
| TypeScript | 5.x+ | Strict mode obligatoire |
| React Navigation | 7.x (7.5 courant ; v8 en alpha, à surveiller) | Via Expo Router ou standalone |
| Reanimated | 4 (`^4.0.0`) | Worklets 2 + JSI backend partagé |
| Gesture Handler | **3.0+** | Breaking changes vs 2.x — API Gesture.* |
| TanStack Query | 5.x | `gcTime` remplace `cacheTime` |
| Zustand | 5.x | `useShallow`, API création modifiée vs 4.x |

## Architecture Feature-Based

```
src/
├── app/              # Expo Router (file-based routing)
│   ├── (auth)/       # Auth group
│   ├── (tabs)/       # Main tabs group
│   └── _layout.tsx   # Root layout
├── components/       # ui/, forms/, shared/
├── features/         # Modules métier (auth, profile, settings...)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       ├── store/
│       └── types/
├── hooks/            # Custom hooks globaux
├── services/         # API, storage
├── stores/           # Zustand stores globaux
├── navigation/       # Config navigation (si non-Expo)
├── theme/            # Colors, spacing, typography
└── types/            # Types globaux
```

## New Architecture (activée par défaut RN 0.85)

| Ancien (Paper / Bridge) | Nouveau (Fabric / TurboModules) |
|------------------------|---------------------------------|
| Bridge JSON asynchrone | JSI : appels synchrones JS ↔ C++ |
| `NativeModules` JSON | TurboModules : interfaces TypeSpec typées |
| UI Manager | Fabric : rendu concurrent C++ |
| Hermes optionnel | Hermes V1 par défaut |

**Activation bare RN 0.85 :**
```bash
# Android
echo 'newArchEnabled=true' >> android/gradle.properties
# iOS
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install
```

> Expo SDK 56+ active la New Architecture par défaut — aucune config requise.

## Gesture Handler 3.0 — Breaking Changes

```bash
npm install react-native-gesture-handler@^3.0.0
```

```typescript
// ✅ RNGH 3.0 — GestureHandlerRootView obligatoire
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... */}
    </GestureHandlerRootView>
  );
}

// ✅ Nouvelle API Gesture (remplace PanGestureHandler/TapGestureHandler composants)
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const tap = Gesture.Tap().onEnd(() => console.log('tapped'));
```

**Source :** [RNGH 3.0 Migration Guide](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/migrating-from-2.x/)

## Navigation — Expo Router vs React Navigation 7

| Scénario | Solution |
|----------|----------|
| Projet Expo (recommandé) | **Expo Router** — file-based, type-safe, deep linking auto |
| Projet bare sans Expo | **React Navigation 7** standalone (`@react-navigation/native`) |
| Migration Expo → Expo Router | Expo Router 57.x (versionné avec le SDK Expo) |

```typescript
// React Navigation 7 — setup bare (non-Expo)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## Reanimated 4 + Bridgeless Mode

Reanimated 4 (`^4.0.0`) utilise **Worklets 2** — animations sur le UI thread via JSI, zéro Bridge, 60 fps garanti.

```typescript
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return { transform: [{ translateX: offset.value }] };
});
```

**Bridgeless Mode (RN 0.85, nouveaux projets) :** supprime le legacy bridge (JSI only).
```bash
# android/gradle.properties
bridgelessEnabled=true
```

## RN 0.86 / 0.87 et Expo SDK 57

> **Expo SDK 57 embarque RN 0.86** (0.86.3) ; **RN bare = 0.87** (0.87.1 `latest`, 0.88 en RC). Ne pas mélanger : un projet Expo suit la version RN de son SDK.

| Sujet | Bonne pratique |
|-------|----------------|
| Expo 57 | `expo@57.0.17+` : régression mémoire Hermes V1 / Reanimated corrigée (dès 57.0.9) et temps de démarrage dev corrigé |
| Reanimated | 4.7.x supporte RN 0.86-0.88 (4.5 embarqué dans SDK 57) |
| Worklets bundle mode | Expérimental, non supporté : **ne pas l'utiliser en production** |
| Builds | **Development builds** plutôt qu'Expo Go dès que l'on vise les stores |
| `expo prebuild` | Nettoie et régénère `android/` et `ios/` par défaut (`--no-clean` pour conserver) |
| iOS 27 | `ios.enableSceneSupport` (`expo-build-properties`, `expo@57.0.23+`, opt-in ; défaut en SDK 58) |
| Navigation | React Navigation 8 est en alpha : à surveiller, rester sur 7.x en production |

**Breaking changes RN 0.87 :** API TypeScript stricte par défaut (imports profonds `react-native/Libraries/*` interdits, opt-out jusqu'à 0.88) ; `InteractionManager` retiré (utiliser `requestIdleCallback`) ; `ImageBackground` déprécié (`View` + `Image` absolu) ; props `Modal.animated` et `StatusBar` `backgroundColor`/`translucent` retirées ; Node 22.13+, Kotlin 2.0+ ; AGP 9 supporté (`android.builtInKotlin=false` et `android.newDsl=false` pour garder l'ancien comportement) ; Swift Package Manager iOS expérimental (opt-in, CocoaPods reste le défaut).

**Sources :** [RN 0.87](https://reactnative.dev/blog/2026/08/11/react-native-0.87), [Expo SDK 57](https://expo.dev/changelog/sdk-57)

## Checklist Rapide

- [ ] RN 0.87 (bare) ou 0.86 (Expo SDK 57+), Node 22.13+
- [ ] New Architecture activée (Fabric + TurboModules)
- [ ] Gesture Handler 3.0+ (`@^3.0.0`, pas 2.x)
- [ ] Reanimated 4 (`^4.0.0`) + Worklets 2
- [ ] TanStack Query v5 (`gcTime` pas `cacheTime`)
- [ ] Zustand v5 (API `useShallow`, `createStore`)
- [ ] TypeScript strict + Codegen spec pour modules natifs
- [ ] Tests >= 80% coverage (Jest + Detox E2E)

## Documentation Complète

- `architecture.md` — Patterns feature-based, Clean Architecture
- `coding-standards.md` — TypeScript, conventions, hooks patterns
- `tooling.md` — Expo CLI, EAS, RNGH 3.0, Reanimated 4
- `new-architecture.md` — JSI, TurboModules, Fabric, Bridgeless
- `navigation.md` — Expo Router, React Navigation 7
- `state-management.md` — TanStack Query v5, Zustand v5
- `performance.md` — Optimisations, profiling, Hermes
- `testing.md` — Jest, Detox, stratégies TDD
- `security.md` — Stockage sécurisé, auth, deeplinks
- `quality-tools.md` — ESLint, TypeScript, audit
- `project-context.md` — Template de contexte projet
