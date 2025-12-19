---
description: React Native Native Module Creation Guide
argument-hint: [arguments]
---

# React Native Native Module Creation Guide

You are a senior React Native developer. You must guide the creation of a native module (bridge) for iOS and Android.

## Arguments
$ARGUMENTS

Arguments:
- Module name (e.g., `DeviceInfo`, `Biometrics`, `FileManager`)
- (Optional) Features: sync, async, events

Example: `/reactnative:native-module Biometrics async,events`

## MISSION

### Step 1: Module Structure

```
src/
└── native/
    └── {ModuleName}/
        ├── index.ts          # JavaScript API
        ├── types.ts          # TypeScript Types
        └── NativeModule.ts   # Bridge with TurboModule

android/
└── app/src/main/java/com/{package}/
    └── {modulename}/
        ├── {ModuleName}Module.kt      # Main module
        └── {ModuleName}Package.kt     # Package registration

ios/
└── {AppName}/
    ├── {ModuleName}.swift             # Swift module
    └── {ModuleName}-Bridging-Header.h # Header for Obj-C bridge
```

### Step 2: JavaScript/TypeScript API

```typescript
// src/native/{ModuleName}/types.ts
export interface {ModuleName}Result {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface {ModuleName}Options {
  timeout?: number;
  // ...other options
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
  `The package '{ModuleName}' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

// Native module type
interface {ModuleName}NativeModule {
  // Synchronous methods
  getConstant(): string;

  // Asynchronous methods
  authenticate(options: {ModuleName}Options): Promise<{ModuleName}Result>;
  isSupported(): Promise<boolean>;

  // For events
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
 * Check if feature is supported on device.
 */
export async function isSupported(): Promise<boolean> {
  try {
    return await Native{ModuleName}.isSupported();
  } catch {
    return false;
  }
}

/**
 * Launch biometric authentication.
 */
export async function authenticate(
  options: {ModuleName}Options = {}
): Promise<{ModuleName}Result> {
  return Native{ModuleName}.authenticate(options);
}

/**
 * Hook to listen to module events.
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
 * Complete hook to use the module.
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
      setError('{ModuleName} not available');
      return { success: false, error: '{ModuleName} not available' };
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await Native{ModuleName}.authenticate(options || {});
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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

// Export all
export * from './types';
```

### Step 3: Android Module (Kotlin)

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

    // Constants exposed to JS
    override fun getConstants(): MutableMap<String, Any> {
        return hashMapOf(
            "SUPPORTED" to isBiometricSupported()
        )
    }

    // Synchronous method
    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getConstant(): String {
        return "some_value"
    }

    // Asynchronous method with Promise
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
                // Implement native logic here
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

    // Send events to JS
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

    // Required for events
    @ReactMethod
    fun addListener(eventName: String) {
        // Required for NativeEventEmitter
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Required for NativeEventEmitter
    }

    // Native business logic
    private suspend fun performAuthentication(timeout: Int): AuthResult {
        return withContext(Dispatchers.IO) {
            // Implement here
            AuthResult(success = true, data = "authenticated")
        }
    }

    private fun isBiometricSupported(): Boolean {
        // Implement verification
        return true
    }

    override fun onCatalystInstanceDestroy() {
        super.onCatalystInstanceDestroy()
        cancel() // Cancel coroutines
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
// Add to MainApplication.kt
override fun getPackages(): List<ReactPackage> =
    PackageList(this).packages.apply {
        add({ModuleName}Package())
    }
```

### Step 4: iOS Module (Swift)

```swift
// ios/{AppName}/{ModuleName}.swift
import Foundation
import React
import LocalAuthentication // or other required framework

@objc({ModuleName})
class {ModuleName}: RCTEventEmitter {

    private let eventName = "{moduleName}Event"

    // MARK: - Module Setup

    @objc override static func moduleName() -> String! {
        return "{ModuleName}"
    }

    @objc override static func requiresMainQueueSetup() -> Bool {
        return false
    }

    // Supported events
    override func supportedEvents() -> [String]! {
        return [eventName]
    }

    // Constants exposed to JS
    @objc override func constantsToExport() -> [AnyHashable : Any]! {
        return [
            "SUPPORTED": isBiometricSupported()
        ]
    }

    // MARK: - Methods

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

    // MARK: - Private Methods

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
        context.localizedFallbackTitle = "Use passcode"

        context.evaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            localizedReason: "Authentication required"
        ) { success, error in
            if success {
                completion(.success("authenticated"))
            } else if let error = error {
                completion(.failure(error))
            }
        }
    }

    // Emit event to JS
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

// Expose methods to Objective-C
@interface RCT_EXTERN_MODULE({ModuleName}, RCTEventEmitter)

RCT_EXTERN_METHOD(isSupported:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(authenticate:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(getConstant)

@end
```

### Step 5: Module Tests

```typescript
// src/native/{ModuleName}/__tests__/{ModuleName}.test.ts
import { NativeModules } from 'react-native';
import { authenticate, isSupported } from '../index';

// Mock native module
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
    it('returns true when supported', async () => {
      (NativeModules.{ModuleName}.isSupported as jest.Mock).mockResolvedValue(true);

      const result = await isSupported();

      expect(result).toBe(true);
    });

    it('returns false on error', async () => {
      (NativeModules.{ModuleName}.isSupported as jest.Mock).mockRejectedValue(
        new Error('Not available')
      );

      const result = await isSupported();

      expect(result).toBe(false);
    });
  });

  describe('authenticate', () => {
    it('returns success result', async () => {
      const mockResult = { success: true, data: 'authenticated' };
      (NativeModules.{ModuleName}.authenticate as jest.Mock).mockResolvedValue(mockResult);

      const result = await authenticate({ timeout: 5000 });

      expect(result).toEqual(mockResult);
      expect(NativeModules.{ModuleName}.authenticate).toHaveBeenCalledWith({
        timeout: 5000,
      });
    });

    it('handles authentication failure', async () => {
      const mockResult = { success: false, error: 'User cancelled' };
      (NativeModules.{ModuleName}.authenticate as jest.Mock).mockResolvedValue(mockResult);

      const result = await authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });
  });
});
```

### Summary

```
══════════════════════════════════════════════════════════════
✅ NATIVE MODULE - {ModuleName}
══════════════════════════════════════════════════════════════

📁 Created files:

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

📝 Exposed API:
- isSupported(): Promise<boolean>
- authenticate(options): Promise<Result>
- use{ModuleName}(): Complete hook
- use{ModuleName}Events(): Event listener

🔧 Next steps:
1. Android: Add {ModuleName}Package to MainApplication.kt
2. iOS: pod install
3. Rebuild both apps
4. Test on physical device
```
