# React Native 0.85 — New Architecture (JSI, TurboModules, Fabric)

> **Status :** documentation bootstrapped 2026-05-18 (audit P0 #8). React Native 0.85 enables the **New Architecture by default** for both new projects (`npx create-expo-app`) and existing ones via opt-in. This page covers what changes for everyday development and which gotchas to watch.

## Vue d'ensemble

La New Architecture remplace trois couches historiques :

| Ancien (Paper) | Nouveau (Fabric / TurboModules) |
|---------------|---------------------------------|
| Bridge JSON asynchrone | **JSI** : appels synchrones JS ↔ C++ |
| `NativeModules` JSON | **TurboModules** : interfaces typées générées par Codegen |
| UI Manager (`UIManagerModule`) | **Fabric** : rendu concurrent C++ avec layout shadow tree partagé |
| Hermes en option | **Hermes** : moteur JS par défaut depuis 0.70, gains GC + startup |

**Conséquence pratique** :
- Plus de bridge JSON ↔ Tab — gains latence, mémoire, démarrage.
- Codegen TypeScript/Flow → bindings natifs : finis les `any` côté natif.
- Rendu concurrent compatible React 19 (Suspense, transitions).

## Activation (0.85+)

| Project type | Activation |
|--------------|-----------|
| **New project (Expo SDK 51+)** | New Architecture **on** by default. |
| **Existing project (bare RN 0.85)** | Set `newArchEnabled=true` in `android/gradle.properties` AND `RCT_NEW_ARCH_ENABLED=1` env on iOS pod install. |
| **Disable temporarily** | `newArchEnabled=false` + `RCT_NEW_ARCH_ENABLED=0`. Deprecated path — sunset in 0.86. |

```bash
# Bare React Native 0.85+
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install
# Android: edit android/gradle.properties
echo 'newArchEnabled=true' >> android/gradle.properties
```

## Codegen pour TurboModules

Les TurboModules s'écrivent en **TypeScript spec** ; Codegen génère le C++/Objective-C/Java au build.

```typescript
// src/specs/NativeAnalytics.ts
import type {TurboModule} from 'react-native';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  track(event: string, payload: Object): Promise<void>;
  getInstallationId(): string;            // synchronous via JSI
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeAnalytics');
```

Puis dans `package.json` :

```json
{
  "codegenConfig": {
    "name": "AppSpecs",
    "type": "modules",
    "jsSrcsDir": "src/specs"
  }
}
```

Au build : `pod install` (iOS) ou `./gradlew :app:generateCodegenArtifactsFromSchema` (Android) génèrent les bindings natifs.

## Fabric : composants natifs

Mêmes spec TypeScript, type `components` :

```typescript
// src/specs/NativeMap.ts
import type {ViewProps} from 'react-native';
import type {HostComponent} from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

interface NativeProps extends ViewProps {
  zoom?: number;
  center?: Readonly<{lat: number; lng: number}>;
}

export default codegenNativeComponent<NativeProps>('NativeMap') as HostComponent<NativeProps>;
```

## Compatibilité bibliothèques tierces (état mai 2026)

| Library | New Architecture |
|---------|------------------|
| React Navigation 7 | ✅ |
| Reanimated 4 (Worklets 2) | ✅ |
| Gesture Handler 2.20+ | ✅ |
| Expo SDK 51+ | ✅ (default) |
| react-native-mmkv 4 | ✅ |
| react-native-vision-camera 4 | ✅ |
| react-native-screens 4 | ✅ |
| Bibliothèques anciennes non-maintenues | ⚠️ Vérifier le badge "supports new arch" sur https://reactnative.directory |

> Toujours vérifier la matrice à jour : `npx react-native config` + scanner les warnings au démarrage. Tout module non-migré apparaîtra avec un fallback bridge auto (slow path, deprecation log).

## Gotchas fréquents

### 1. Modules natifs personnalisés legacy

```diff
- // Ancien NativeModules.MyModule
+ // TurboModuleRegistry.getEnforcing<Spec>('MyModule')
```

Si le module n'a pas de spec TS/Flow, il tombe en bridge legacy : perf dégradée + warning console.

### 2. View flattening Fabric

Fabric "aplatit" les Views inutiles (`<View><Text/></View>` → un seul nœud natif). Si vous mesurez `onLayout` sur un wrapper vide, vous obtenez 0.

**Fix** : forcer la matérialisation avec `collapsable={false}`.

### 3. Sync calls via JSI

Tout TurboModule peut exposer des fonctions synchrones — mais ces appels bloquent le JS thread. Réservez-les aux opérations < 1 ms (lecture cache mémoire). Toute IO doit rester `Promise<T>`.

### 4. Hermes + sourcemaps

```bash
# Activer source maps Hermes pour Sentry/Bugsnag
npx react-native bundle --sourcemap-output ./build/index.android.map --bundle-output ./build/index.android.bundle
npx hermesc --emit-binary -out=./build/index.android.hbc ./build/index.android.bundle
npx react-native-hermes-sourcemap-tool --output ./build/index.android.map.hbc.map
```

### 5. Console warnings au boot

Au démarrage, vous verrez :

```
✔ New Architecture (Fabric & TurboModules) is enabled.
✔ Hermes is enabled.
✔ React 19 strict mode is enabled.
```

Si un de ces logs est rouge, votre Pod install / Gradle build n'a pas activé la New Architecture correctement.

## Checklist migration 0.74 → 0.85

- [ ] `newArchEnabled=true` (Android) + `RCT_NEW_ARCH_ENABLED=1` (iOS) confirmés en logs au boot.
- [ ] Toutes les bibliothèques tierces marquées New-Arch-compatible (reactnative.directory).
- [ ] Modules natifs custom : spec TS ajouté dans `src/specs/`, build Codegen vert.
- [ ] Tests E2E (Detox) passent — Fabric change parfois la timing des animations.
- [ ] Reanimated v4 (Worklets 2) installé si Reanimated v3.
- [ ] Sentry / Crashlytics : sourcemaps Hermes uploadées avec Sentry CLI 2.20+.
- [ ] Bundle size mesuré : New Arch gagne souvent 10-20 % sur AAB Android.

## Ressources

- [React Native 0.85 release notes](https://github.com/facebook/react-native/releases)
- [New Architecture overview](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [Codegen](https://reactnative.dev/docs/the-new-architecture/codegen-cli)
- [Migration guide for libraries](https://github.com/reactwg/react-native-new-architecture)
- [reactnative.directory compatibility matrix](https://reactnative.directory/)
