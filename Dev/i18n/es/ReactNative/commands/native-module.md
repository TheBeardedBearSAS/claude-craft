---
description: Creación de Módulo Nativo
---

# Creación de Módulo Nativo

Crea un módulo nativo para funcionalidad específica de plataforma.

## Cuándo Crear un Módulo Nativo

- Acceso a APIs nativas no disponibles en React Native
- Funcionalidad de rendimiento crítico
- Integración con SDKs nativos
- Características específicas de plataforma

## Con Expo Modules

### 1. Crear Módulo

```bash
npx create-expo-module my-module
cd my-module
```

### 2. Estructura

```
my-module/
├── android/
│   └── src/main/java/.../MyModule.kt
├── ios/
│   └── MyModule.swift
├── src/
│   ├── index.ts
│   └── MyModule.types.ts
└── package.json
```

### 3. Código iOS (Swift)

```swift
// ios/MyModule.swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    // Función síncrona
    Function("hello") { (name: String) -> String in
      return "Hello \(name)!"
    }

    // Función asíncrona
    AsyncFunction("fetchData") { (url: String, promise: Promise) in
      // Lógica asíncrona
      promise.resolve("Data fetched")
    }

    // Eventos
    Events("onData")

    // Constantes
    Constants([
      "PI": Double.pi
    ])
  }
}
```

### 4. Código Android (Kotlin)

```kotlin
// android/src/main/java/expo/modules/mymodule/MyModule.kt
package expo.modules.mymodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    // Función síncrona
    Function("hello") { name: String ->
      "Hello $name!"
    }

    // Función asíncrona
    AsyncFunction("fetchData") { url: String ->
      // Lógica asíncrona
      "Data fetched"
    }

    // Eventos
    Events("onData")

    // Constantes
    Constants(
      "PI" to Math.PI
    )
  }
}
```

### 5. TypeScript Interface

```typescript
// src/MyModule.types.ts
export type MyModuleEvents = {
  onData: (data: string) => void;
};

// src/index.ts
import { NativeModulesProxy, EventEmitter } from 'expo-modules-core';
import { MyModuleEvents } from './MyModule.types';

const MyModule = NativeModulesProxy.MyModule;
const emitter = new EventEmitter(MyModule);

export function hello(name: string): string {
  return MyModule.hello(name);
}

export async function fetchData(url: string): Promise<string> {
  return await MyModule.fetchData(url);
}

export function addDataListener(
  listener: MyModuleEvents['onData']
): { remove: () => void } {
  return emitter.addListener('onData', listener);
}

export const PI = MyModule.PI;
```

### 6. Usage

```typescript
import * as MyModule from 'my-module';

// Función síncrona
const greeting = MyModule.hello('World');

// Función asíncrona
const data = await MyModule.fetchData('https://api.example.com');

// Eventos
const subscription = MyModule.addDataListener((data) => {
  console.log('Received:', data);
});

// Cleanup
subscription.remove();

// Constantes
console.log(MyModule.PI);
```

## Sin Expo (React Native Puro)

### iOS (Objective-C)

```objc
// MyModule.h
#import <React/RCTBridgeModule.h>

@interface MyModule : NSObject <RCTBridgeModule>
@end

// MyModule.m
#import "MyModule.h"

@implementation MyModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(hello:(NSString *)name
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSString *greeting = [NSString stringWithFormat:@"Hello %@!", name];
  resolve(greeting);
}

@end
```

### Android (Java)

```java
// MyModule.java
package com.mymodule;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

public class MyModule extends ReactContextBaseJavaModule {
  MyModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "MyModule";
  }

  @ReactMethod
  public void hello(String name, Promise promise) {
    try {
      String greeting = "Hello " + name + "!";
      promise.resolve(greeting);
    } catch (Exception e) {
      promise.reject("ERROR", e);
    }
  }
}
```

## Testing

```typescript
// __tests__/MyModule.test.ts
import * as MyModule from '../src';

describe('MyModule', () => {
  it('says hello', () => {
    const result = MyModule.hello('World');
    expect(result).toBe('Hello World!');
  });

  it('fetches data', async () => {
    const data = await MyModule.fetchData('https://api.example.com');
    expect(data).toBeDefined();
  });
});
```

## Best Practices

- Manejar errores correctamente
- Documentar APIs públicas
- Probar en ambas plataformas
- Mantener compatibilidad de versiones
- Emitir eventos para actualizaciones
- Usar TypeScript para type safety
