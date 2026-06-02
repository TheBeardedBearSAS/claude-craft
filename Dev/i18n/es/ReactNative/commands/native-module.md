---
description: Guía de Creación de Módulo Nativo en React Native
argument-hint: [argumentos]
---

# Guía de Creación de Módulo Nativo en React Native

Eres un desarrollador senior de React Native. Debes guiar la creación de un módulo nativo (bridge) para iOS y Android.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre del módulo (p. ej., `DeviceInfo`, `Biometrics`, `FileManager`)
- (Opcional) Funcionalidades: sync, async, events

Ejemplo: `/reactnative:native-module Biometrics async,events`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Estructura del Módulo

```
src/
└── native/
    └── {ModuleName}/
        ├── index.ts          # API JavaScript
        ├── types.ts          # Tipos TypeScript
        └── NativeModule.ts   # Bridge con TurboModule

android/
└── app/src/main/java/com/{package}/
    └── {modulename}/
        ├── {ModuleName}Module.kt      # Módulo principal
        └── {ModuleName}Package.kt     # Registro del paquete

ios/
└── {AppName}/
    ├── {ModuleName}.swift             # Módulo Swift
    └── {ModuleName}-Bridging-Header.h # Header para el bridge Obj-C
```

### Paso 2: API JavaScript/TypeScript

```typescript
// src/native/{ModuleName}/types.ts
export interface {ModuleName}Result {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface {ModuleName}Options {
  timeout?: number;
  // ...otras opciones
}

export type {ModuleName}EventType = 'onProgress' | 'onComplete' | 'onError';

export interface {ModuleName}Event {
  type: {ModuleName}EventType;
  payload: unknown;
}
```

```typescript
// src/native/{ModuleName}/NativeModule.ts
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const LINKING_ERROR =
  `El paquete '{ModuleName}' no parece estar enlazado. Asegúrate de: \n\n` +
  Platform.select({ ios: "- Haber ejecutado 'pod install'\n", default: '' }) +
  '- Haber reconstruido la app después de instalar el paquete\n' +
  '- No estar usando Expo Go\n';

// Tipo del módulo nativo
interface {ModuleName}NativeModule {
  // Métodos síncronos
  getConstant(): string;

  // Métodos asíncronos
  authenticate(options: {ModuleName}Options): Promise<{ModuleName}Result>;
  isSupported(): Promise<boolean>;

  // Para eventos
  addListener(eventType: string): void;
  removeListeners(count: number): void;
}

const Native{ModuleName} = NativeModules.{ModuleName}
  ? (NativeModules.{ModuleName} as {ModuleName}NativeModule)
  : new Proxy(
      {} as {ModuleName}NativeModule,
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export { Native{ModuleName} };
export const {ModuleName}EventEmitter = new NativeEventEmitter(
  NativeModules.{ModuleName}
);
```

```typescript
// src/native/{ModuleName}/index.ts
import { useEffect, useCallback } from 'react';
import { Native{ModuleName}, {ModuleName}EventEmitter } from './NativeModule';
import type {
  {ModuleName}Result,
  {ModuleName}Options,
  {ModuleName}Event,
} from './types';

/**
 * Comprueba si la funcionalidad está disponible en el dispositivo.
 */
export async function isSupported(): Promise<boolean> {
  try {
    return await Native{ModuleName}.isSupported();
  } catch {
    return false;
  }
}

/**
 * Lanza la autenticación biométrica.
 */
export async function authenticate(
  options: {ModuleName}Options = {}
): Promise<{ModuleName}Result> {
  return Native{ModuleName}.authenticate(options);
}

/**
 * Hook para escuchar eventos del módulo.
 */
export function use{ModuleName}Events(
  onEvent: (event: {ModuleName}Event) => void
) {
  useEffect(() => {
    const subscription = {ModuleName}EventEmitter.addListener(
      '{moduleName}Event',
      onEvent
    );

    return () => {
      subscription.remove();
    };
  }, [onEvent]);
}

/**
 * Hook completo para usar el módulo.
 */
export function use{ModuleName}() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isSupported().then(setIsAvailable);
  }, []);

  const authenticate = useCallback(async (options?: {ModuleName}Options) => {
    if (!isAvailable) {
      setError('{ModuleName} no disponible');
      return { success: false, error: '{ModuleName} no disponible' };
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await Native{ModuleName}.authenticate(options || {});
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAvailable]);

  return {
    isAvailable,
    isAuthenticating,
    error,
    authenticate,
  };
}

// Exportar todo
export * from './types';
```

### Paso 3: Módulo Android (Kotlin)

```kotlin
// android/app/src/main/java/com/{package}/{modulename}/{ModuleName}Module.kt
package com.{package}.{modulename}

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*

class {ModuleName}Module(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    CoroutineScope by MainScope() {

    companion object {
        const val NAME = "{ModuleName}"
        private const val EVENT_NAME = "{moduleName}Event"
    }

    override fun getName(): String = NAME

    // Constantes expuestas a JS
    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "SUPPORTED" to isBiometricSupported()
        )
    }

    // Método síncrono
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getConstant(): String {
        return "some_value"
    }

    // Método asíncrono con Promise
    @ReactMethod
    fun isSupported(promise: Promise) {
        launch {
            try {
                val supported = isBiometricSupported()
                promise.resolve(supported)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun authenticate(options: ReadableMap, promise: Promise) {
        val timeout = if (options.hasKey("timeout")) options.getInt("timeout") else 30000

        launch {
            try {
                // Implementar la lógica nativa aquí
                val result = performAuthentication(timeout)

                val response = Arguments.createMap().apply {
                    putBoolean("success", result.success)
                    result.data?.let { putString("data", it) }
                    result.error?.let { putString("error", it) }
                }
                promise.resolve(response)
            } catch (e: Exception) {
                promise.reject("AUTH_ERROR", e.message, e)
            }
        }
    }

    // Enviar eventos a JS
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    private fun emitProgress(progress: Int) {
        val params = Arguments.createMap().apply {
            putString("type", "onProgress")
            putInt("progress", progress)
        }
        sendEvent(EVENT_NAME, params)
    }

    // Requerido para eventos
    @ReactMethod
    fun addListener(eventName: String) {
        // Requerido para NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Requerido para NativeEventEmitter
    }

    // Lógica de negocio nativa
    private suspend fun performAuthentication(timeout: Int): AuthResult {
        return withContext(Dispatchers.IO) {
            // Implementar aquí
            AuthResult(success = true, data = "authenticated")
        }
    }

    private fun isBiometricSupported(): Boolean {
        // Implementar verificación
        return true
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cancel() // Cancelar coroutines
    }
}

data class AuthResult(
    val success: Boolean,
    val data: String? = null,
    val error: String? = null
)
```

```kotlin
// android/app/src/main/java/com/{package}/{modulename}/{ModuleName}Package.kt
package com.{package}.{modulename}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class {ModuleName}Package : ReactPackage {
    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        return listOf({ModuleName}Module(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

```kotlin
// Añadir a MainApplication.kt
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add({ModuleName}Package())
    }
```

### Paso 4: Módulo iOS (Swift)

```swift
// ios/{AppName}/{ModuleName}.swift
import Foundation
import React
import LocalAuthentication // u otro framework requerido

@objc({ModuleName})
class {ModuleName}: RCTEventEmitter {

    private let eventName = "{moduleName}Event"

    // MARK: - Configuración del Módulo

    @objc override static func moduleName() -> String! {
        return "{ModuleName}"
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    // Eventos soportados
    override func supportedEvents() -> [String]! {
        return [eventName]
    }

    // Constantes expuestas a JS
    @objc override func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "SUPPORTED": isBiometricSupported()
        ]
    }

    // MARK: - Métodos

    @objc
    func getConstant() -> String {
        return "some_value"
    }

    @objc(isSupported:rejecter:)
    func isSupported(
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        resolve(isBiometricSupported())
    }

    @objc(authenticate:resolver:rejecter:)
    func authenticate(
        options: NSDictionary,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let timeout = options["timeout"] as? Int ?? 30000

        DispatchQueue.global(qos: .userInitiated).async { [weak self] in
            self?.performAuthentication(timeout: timeout) { result in
                switch result {
                case .success(let data):
                    resolve([
                        "success": true,
                        "data": data
                    ])
                case .failure(let error):
                    resolve([
                        "success": false,
                        "error": error.localizedDescription
                    ])
                }
            }
        }
    }

    // MARK: - Métodos Privados

    private func isBiometricSupported() -> Bool {
        let context = LAContext()
        var error: NSError?
        return context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        )
    }

    private func performAuthentication(
        timeout: Int,
        completion: @escaping (Result<String, Error>) -> Void
    ) {
        let context = LAContext()
        context.localizedFallbackTitle = "Usar código de acceso"

        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Autenticación requerida"
        ) { success, error in
            if success {
                completion(.success("authenticated"))
            } else if let error = error {
                completion(.failure(error))
            }
        }
    }

    // Emitir evento a JS
    private func emitProgress(_ progress: Int) {
        sendEvent(withName: eventName, body: [
            "type": "onProgress",
            "progress": progress
        ])
    }
}
```

```objc
// ios/{AppName}/{ModuleName}-Bridging-Header.h
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

// Exponer métodos a Objective-C
@interface RCT_EXTERN_MODULE({ModuleName}, RCTEventEmitter)

RCT_EXTERN_METHOD(isSupported:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authenticate:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getConstant)

@end
```

### Paso 5: Tests del Módulo

```typescript
// src/native/{ModuleName}/__tests__/{ModuleName}.test.ts
import { NativeModules } from 'react-native';
import { authenticate, isSupported } from '../index';

// Mock del módulo nativo
jest.mock('react-native', () => ({
  NativeModules: {
    {ModuleName}: {
      isSupported: jest.fn(),
      authenticate: jest.fn(),
    },
  },
  NativeEventEmitter: jest.fn(() => ({
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  })),
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

describe('{ModuleName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isSupported', () => {
    it('devuelve true cuando está soportado', async () => {
      (NativeModules.{ModuleName}.isSupported as jest.Mock).mockResolvedValue(true);

      const result = await isSupported();

      expect(result).toBe(true);
    });

    it('devuelve false en caso de error', async () => {
      (NativeModules.{ModuleName}.isSupported as jest.Mock).mockRejectedValue(
        new Error('No disponible')
      );

      const result = await isSupported();

      expect(result).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('devuelve resultado de éxito', async () => {
      const mockResult = { success: true, data: 'authenticated' };
      (NativeModules.{ModuleName}.authenticate as jest.Mock).mockResolvedValue(mockResult);

      const result = await authenticate({ timeout: 5000 });

      expect(result).toEqual(mockResult);
      expect(NativeModules.{ModuleName}.authenticate).toHaveBeenCalledWith({
        timeout: 5000,
      });
    });

    it('maneja fallo de autenticación', async () => {
      const mockResult = { success: false, error: 'Usuario canceló' };
      (NativeModules.{ModuleName}.authenticate as jest.Mock).mockResolvedValue(mockResult);

      const result = await authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Usuario canceló');
    });
  });
});
```

### Resumen

```
══════════════════════════════════════════════════════════════
✅ MÓDULO NATIVO - {ModuleName}
══════════════════════════════════════════════════════════════

📁 Archivos creados:

JavaScript/TypeScript:
- src/native/{ModuleName}/index.ts
- src/native/{ModuleName}/types.ts
- src/native/{ModuleName}/NativeModule.ts

Android (Kotlin):
- android/.../{ ModuleName}Module.kt
- android/.../{ ModuleName}Package.kt

iOS (Swift):
- ios/{AppName}/{ModuleName}.swift
- ios/{AppName}/{ModuleName}-Bridging-Header.h

📝 API expuesta:
- isSupported(): Promise<boolean>
- authenticate(options): Promise<Result>
- use{ModuleName}(): Hook completo
- use{ModuleName}Events(): Listener de eventos

🔧 Próximos pasos:
1. Android: Añadir {ModuleName}Package a MainApplication.kt
2. iOS: pod install
3. Reconstruir ambas apps
4. Probar en dispositivo físico
```
