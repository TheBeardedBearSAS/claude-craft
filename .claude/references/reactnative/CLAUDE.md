# React Native 0.88 - Quick Reference

## Versions Requises (2026)

| Composant | Version | Notes |
|-----------|---------|-------|
| React Native | 0.88 (bare et Expo SDK 58) | New Architecture activée par défaut |
| Expo SDK | 58+ (embarque RN 0.88) | New Architecture on by default |
| Node.js | **22.x LTS** | RN 0.88 requiert Node 22.13+ (ou 24.3+, 26+) minimum |
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

> Expo SDK 52+ active la New Architecture par défaut — aucune config requise.

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
| Migration Expo → Expo Router | Expo Router 58.x (versionné avec le SDK Expo) |

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

## RN 0.88 et Expo SDK 58

> **Expo SDK 58 embarque RN 0.88** (0.88.1 `latest`, stable). Ne pas mélanger : un projet Expo suit la version RN de son SDK.

| Sujet | Bonne pratique |
|-------|----------------|
| Expo Router | le cœur de navigation a été refondu (état de navigation déterministe, l'essentiel de l'API React Navigation forkée supprimé). Si vous avez un navigateur custom ou des imports depuis `expo-router/react-navigation`, certaines API ont été déplacées ou retirées : suivre le guide de migration SDK 57 vers 58. `withLayoutContext` est déprécié au profit de `integrateWithRouter` |
| Expo Router web | `web.output` vaut `"server"` par défaut s'il n'est pas défini (définir `"static"` et activer l'option `apiRoutes` du config plugin pour conserver le comportement du SDK 57) ; les routes asynchrones sont activées par défaut sur le web (`asyncRoutes: { web: false }` pour les désactiver) ; les safe areas web utilisent désormais le CSS `env(safe-area-inset-*)` à la place de `react-native-safe-area-context` |
| iOS (prebuild) | `npx expo prebuild` génère désormais `SceneDelegate.swift` et une entrée `UIApplicationSceneManifest` dans `Info.plist` ; la `UIWindow` est créée par le scene delegate et non plus dans `didFinishLaunchingWithOptions`. Un `AppDelegate.swift` personnalisé qui crée la fenêtre doit être migré (guide : https://expo.fyi/ios-scene-lifecycle) |
| Android (R8) | R8 est activé par défaut en build release (`android.enableMinifyInReleaseBuilds=true`) ; les bibliothèques qui s'appuient sur la réflexion peuvent nécessiter des règles keep ProGuard ; désactivation via `android.enableMinifyInReleaseBuilds=false` avec `expo-build-properties` |
| Node.js | 22.13+ (branche 22), 24.3+ (branche 24) ou 26+ ; les versions impaires (23, 25) ne sont pas supportées |
| Nouveautés RN 0.88 | dispatch d'événements web par défaut ; `fontVariationSettings` (polices variables) sur `Text` et `TextInput` ; support du cycle de vie SceneDelegate sur iOS ; support d'`ArrayBuffer` dans les TurboModules Java ; support expérimental de Swift Package Manager ; React 19.3.0 et Metro 0.87. Aucun breaking change côté utilisateur |
| TypeScript strict | l'opt-out via `tsconfig.json` sera retiré après RN 0.89 |
| Reanimated | Reanimated 4.7.x supporte RN 0.86-0.88 (avec `react-native-worklets` 0.13.x ; matrice : docs.swmansion.com/react-native-reanimated/docs/guides/compatibility). Expo SDK 58 embarque Reanimated 4.7.1 et `expo-router` ~58.0.30 (`bundledNativeModules.json` d'`expo@58.0.23`) |
| Worklets bundle mode | Le bundle mode de Worklets est expérimental et non supporté : **ne pas l'utiliser en production** |
| Builds | Préférer les **development builds** à Expo Go dès que l'on vise les stores |
| `expo prebuild` | `expo prebuild` nettoie et régénère `android/` et `ios/` par défaut (`--no-clean` pour les conserver) |
| Navigation | React Navigation 8 est en alpha : à surveiller, rester sur 7.x en production |

**Breaking changes RN 0.87 (toujours applicables) :** API TypeScript stricte par défaut (imports profonds `react-native/Libraries/*` interdits, opt-out retiré après 0.89) ; `InteractionManager` retiré (utiliser `requestIdleCallback`) ; `ImageBackground` déprécié (`View` + `Image` absolu) ; props `Modal.animated` et `StatusBar` `backgroundColor`/`translucent` retirées ; Node 22.13+, Kotlin 2.0+ ; AGP 9 supporté (`android.builtInKotlin=false` et `android.newDsl=false` pour garder l'ancien comportement) ; Swift Package Manager iOS expérimental (opt-in, CocoaPods reste le défaut).

**Sources :** [RN 0.88](https://reactnative.dev/blog/2026/10/19/react-native-0.88), [Expo SDK 58](https://expo.dev/changelog/sdk-58), [RN 0.87](https://reactnative.dev/blog/2026/08/11/react-native-0.87)