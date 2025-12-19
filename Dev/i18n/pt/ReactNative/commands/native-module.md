---
description: Comando: Criar Módulo Nativo
---

# Comando: Criar Módulo Nativo

Guia para criar um módulo nativo (bridge) React Native para iOS e Android.

---

## Objetivo

Este comando orienta a criação de um módulo nativo para acessar funcionalidades específicas da plataforma não disponíveis via JavaScript.

---

## Estrutura do Módulo

```
src/native/{ModuleName}/
├── index.ts          # API JavaScript
├── types.ts          # Tipos TypeScript
└── NativeModule.ts   # Bridge

android/app/src/main/java/com/{package}/{modulename}/
├── {ModuleName}Module.kt      # Módulo principal Android
└── {ModuleName}Package.kt     # Registro do pacote

ios/{AppName}/
├── {ModuleName}.swift         # Módulo Swift
└── {ModuleName}-Bridging-Header.h  # Header Objective-C
```

---

## Implementação TypeScript

```typescript
// types.ts
export interface ModuleResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// NativeModule.ts
import { NativeModules } from 'react-native';

const { ModuleName } = NativeModules;

export const callNativeMethod = async (): Promise<ModuleResult> => {
  return await ModuleName.methodName();
};
```

---

## Implementação Android (Kotlin)

```kotlin
package com.yourapp.modulename

import com.facebook.react.bridge.*

class ModuleNameModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "ModuleName"

    @ReactMethod
    fun methodName(promise: Promise) {
        try {
            // Implementação nativa
            val result = Arguments.createMap()
            result.putBoolean("success", true)
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("ERROR_CODE", e.message, e)
        }
    }
}
```

---

## Implementação iOS (Swift)

```swift
@objc(ModuleName)
class ModuleName: NSObject {

    @objc
    func methodName(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        do {
            // Implementação nativa
            let result: [String: Any] = ["success": true]
            resolve(result)
        } catch {
            reject("ERROR_CODE", error.localizedDescription, error)
        }
    }

    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
}
```

---

## Casos de Uso Comuns

- Biometria (Face ID, Touch ID, Fingerprint)
- Gerenciamento de arquivos nativos
- Acesso a hardware específico
- Funcionalidades de segurança avançadas
- Integração com SDKs nativos
- Otimizações de performance críticas

---

## Checklist

- [ ] Estrutura de módulo criada
- [ ] Implementação Android completa
- [ ] Implementação iOS completa
- [ ] Tipagem TypeScript definida
- [ ] Testes unitários criados
- [ ] Documentação escrita
- [ ] Tratamento de erros implementado
- [ ] Testado em ambas plataformas

---

**Módulos nativos são poderosos mas aumentam complexidade. Use apenas quando necessário.**
