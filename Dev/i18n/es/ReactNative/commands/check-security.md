---
description: Verificar la Seguridad de React Native
argument-hint: [argumentos]
---

# Verificar la Seguridad de React Native

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en auditoría de seguridad de React Native. Tu misión es analizar las prácticas de seguridad según los estándares definidos en `.claude/rules/11-security.md`.

### Paso 1: Análisis de dependencias y configuración

1. Verificar las dependencias de seguridad instaladas
2. Analizar archivos de configuración sensibles
3. Comprobar si hay secretos en el código
4. Analizar los permisos solicitados

### Paso 2: Almacenamiento Seguro (6 puntos)

#### 🔐 Expo SecureStore / Keychain

- [ ] **(2 pts)** Uso de `expo-secure-store` o `react-native-keychain` para datos sensibles
- [ ] **(1 pt)** Sin almacenamiento de tokens/secretos en AsyncStorage
- [ ] **(1 pt)** Sin almacenamiento de contraseñas en texto plano
- [ ] **(1 pt)** Sin datos sensibles en estado Redux/Zustand no persistido
- [ ] **(1 pt)** Configuración biométrica para acceso a datos sensibles si aplica

**Archivos a verificar:**
```bash
src/services/storage.ts
src/utils/secureStorage.ts
src/hooks/useAuth.ts
```

Buscar patrones peligrosos:
```bash
# Buscar AsyncStorage con datos sensibles
grep -r "AsyncStorage.setItem.*token" src/
grep -r "AsyncStorage.setItem.*password" src/
grep -r "AsyncStorage.setItem.*secret" src/
```

### Paso 3: Gestión de secretos y claves API (5 puntos)

#### 🔑 Sin secretos en el código

- [ ] **(2 pts)** Sin clave API hardcodeada en el código fuente
- [ ] **(1 pt)** Uso de variables de entorno (`.env`, `app.config.js`)
- [ ] **(1 pt)** `.env` en `.gitignore`
- [ ] **(1 pt)** Documentación de las variables de entorno requeridas (`.env.example`)

**Archivos a verificar:**
```bash
.env
.env.example
.gitignore
app.config.js
app.json
```

Buscar secretos hardcodeados:
```bash
# Patrones sospechosos
grep -rE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" src/ --exclude-dir=node_modules
grep -rE "https?://[^/]*:([^@]+)@" src/ --exclude-dir=node_modules
```

**Verificar específicamente:**
- Sin claves AWS, Google, Firebase hardcodeadas
- Sin tokens OAuth hardcodeados
- Sin certificados o claves privadas en el repositorio

### Paso 4: Comunicación de red segura (5 puntos)

#### 🌐 HTTPS y Certificate Pinning

- [ ] **(2 pts)** Todas las comunicaciones únicamente en HTTPS
- [ ] **(1 pt)** Certificate pinning implementado para APIs críticas
- [ ] **(1 pt)** Validación de certificados SSL habilitada
- [ ] **(1 pt)** Timeout y reintentos apropiados para las solicitudes

**Archivos a verificar:**
```bash
src/services/api.ts
src/config/network.ts
app.json (iOS NSAppTransportSecurity)
android/app/src/main/AndroidManifest.xml (android:usesCleartextTraffic)
```

Verificar:
```typescript
// Bien: solo HTTPS
const API_URL = 'https://api.example.com';

// Mal: HTTP
const API_URL = 'http://api.example.com';
```

Para iOS (app.json):
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false
      }
    }
  }
}
```

Para Android (AndroidManifest.xml):
```xml
<!-- Debe ser false o estar ausente -->
<application android:usesCleartextTraffic="false">
```

### Paso 5: Autenticación y autorización (4 puntos)

#### 🔒 Gestión de tokens y sesiones

- [ ] **(1 pt)** JWT almacenado de forma segura (SecureStore)
- [ ] **(1 pt)** Refresh token implementado
- [ ] **(1 pt)** Expiración del token manejada
- [ ] **(1 pt)** Cierre de sesión automático por inactividad (si aplica)

**Archivos a verificar:**
```bash
src/services/auth.ts
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
```

**Verificar el flujo:**
```typescript
// Patrón correcto
const token = await SecureStore.getItemAsync('access_token');
const refreshToken = await SecureStore.getItemAsync('refresh_token');

// Patrón incorrecto
const token = await AsyncStorage.getItem('access_token');
```

### Paso 6: Permisos y datos de usuario (3 puntos)

#### 📱 Permisos Android/iOS

- [ ] **(1 pt)** Permisos solicitados justificados y mínimos
- [ ] **(1 pt)** Solicitudes de permisos en tiempo de ejecución (no todos al arrancar)
- [ ] **(1 pt)** Mensajes explicativos para permisos sensibles

**Archivos a verificar:**
```bash
app.json (permisos iOS/Android)
android/app/src/main/AndroidManifest.xml
ios/[AppName]/Info.plist
```

**Permisos a auditar:**
- Cámara (NSCameraUsageDescription / CAMERA)
- Ubicación (NSLocationWhenInUseUsageDescription / ACCESS_FINE_LOCATION)
- Contactos (NSContactsUsageDescription / READ_CONTACTS)
- Almacenamiento (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)

### Paso 7: Protección del código (2 puntos)

#### 🛡️ Ofuscación y protección

- [ ] **(1 pt)** Ofuscación habilitada para builds de producción (ProGuard/R8)
- [ ] **(1 pt)** Logs sensibles deshabilitados en producción (sin console.log de tokens)

**Archivos a verificar:**
```bash
android/app/build.gradle (minifyEnabled, shrinkResources)
src/**/*.ts (sentencias console.log)
```

Para Android (build.gradle):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Buscar logs sensibles:
```bash
grep -rE "console\.(log|debug|info).*token" src/
grep -rE "console\.(log|debug|info).*password" src/
grep -rE "console\.(log|debug|info).*secret" src/
```

### Paso 8: Calcular la puntuación

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterio                         │ Puntos  │ Estado │
├──────────────────────────────────┼─────────┼────────┤
│ Almacenamiento seguro            │ XX/6    │ ✅/⚠️/❌│
│ Secretos y claves API            │ XX/5    │ ✅/⚠️/❌│
│ Comunicación de red              │ XX/5    │ ✅/⚠️/❌│
│ Autenticación                    │ XX/4    │ ✅/⚠️/❌│
│ Permisos                         │ XX/3    │ ✅/⚠️/❌│
│ Protección del código            │ XX/2    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL SEGURIDAD                  │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Leyenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Advertencia (15-19/25)
- ❌ Crítico (< 15/25)

### Paso 9: Análisis de vulnerabilidades

Ejecutar los siguientes comandos para detectar vulnerabilidades:

#### 🔍 NPM Audit

```bash
npm audit
```

Analizar resultados:
- **Vulnerabilidades críticas:** XX (objetivo: 0)
- **Vulnerabilidades altas:** XX (objetivo: 0)
- **Vulnerabilidades medias:** XX (objetivo: < 5)
- **Vulnerabilidades bajas:** XX

#### 📦 Dependencias desactualizadas

```bash
npm outdated
```

Listar dependencias de seguridad desactualizadas:
- `expo-secure-store`
- `react-native-keychain`
- `react-native-ssl-pinning`
- etc.

### Paso 10: Informe detallado

## 📊 RESULTADOS DE LA AUDITORÍA DE SEGURIDAD

### ✅ Puntos Fuertes

Listar las buenas prácticas identificadas:
- [Práctica 1 con ubicación]
- [Práctica 2 con ubicación]

### 🚨 Vulnerabilidades Críticas

Listar los problemas críticos de seguridad (puntuación ❌ inmediata):

1. **[CRÍTICO - Problema 1]**
   - **Severidad:** CRÍTICA
   - **Ubicación:** [Archivos afectados]
   - **Riesgo:** [Descripción del riesgo]
   - **Ejemplo:**
   ```typescript
   // Código vulnerable
   const API_KEY = "sk_live_123456789abcdef"; // ❌ CRÍTICO
   ```
   - **Corrección inmediata:**
   ```typescript
   // Código seguro
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY; // ✅
   ```

### ⚠️ Puntos de Mejora

Listar los problemas por prioridad:

1. **[Problema 1]**
   - **Severidad:** Alta/Media
   - **Ubicación:** [Archivos afectados]
   - **Riesgo:** [Descripción]
   - **Recomendación:** [Acción]

2. **[Problema 2]**
   - **Severidad:** Alta/Media
   - **Ubicación:** [Archivos afectados]
   - **Riesgo:** [Descripción]
   - **Recomendación:** [Acción]

### 📈 Métricas de Seguridad

#### Vulnerabilidades de dependencias

```
┌─────────────────────┬──────────┐
│ Severidad           │ Cantidad │
├─────────────────────┼──────────┤
│ 🔴 Crítica          │ XX       │
│ 🟠 Alta             │ XX       │
│ 🟡 Media            │ XX       │
│ 🟢 Baja             │ XX       │
└─────────────────────┴──────────┘
```

#### Secretos detectados

- **Claves API hardcodeadas:** XX (objetivo: 0)
- **Tokens hardcodeados:** XX (objetivo: 0)
- **Contraseñas hardcodeadas:** XX (objetivo: 0)
- **Claves privadas en el repositorio:** XX (objetivo: 0)

#### Permisos

- **Total de permisos solicitados:** XX
- **Permisos sensibles:** XX
- **Permisos no justificados:** XX (objetivo: 0)

#### Almacenamiento

- **Uso de SecureStore/Keychain:** Sí/No
- **Datos sensibles en AsyncStorage:** XX ocurrencias (objetivo: 0)
- **Biometría configurada:** Sí/No

#### Comunicación

- **Endpoints HTTP (inseguros):** XX (objetivo: 0)
- **Endpoints HTTPS:** XX
- **Certificate pinning:** Sí/No
- **Tráfico en texto claro permitido:** Sí/No (objetivo: No)

### 🎯 TOP 3 ACCIONES PRIORITARIAS

#### 1. [ACCIÓN DE SEGURIDAD #1]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** CRÍTICO/Alto/Medio
- **Riesgo si no se corrige:** [Descripción del riesgo]
- **Descripción:** [Detalle de la vulnerabilidad]
- **Solución:** [Acción concreta y código]
- **Archivos afectados:**
  - `[archivo1]` - [problema]
  - `[archivo2]` - [problema]
- **Ejemplo de corrección:**
```typescript
// ANTES (vulnerable)
[código vulnerable]

// DESPUÉS (seguro)
[código seguro]
```

#### 2. [ACCIÓN DE SEGURIDAD #2]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** CRÍTICO/Alto/Medio
- **Riesgo si no se corrige:** [Descripción]
- **Descripción:** [Detalle]
- **Solución:** [Acción]
- **Archivos afectados:** [Lista]

#### 3. [ACCIÓN DE SEGURIDAD #3]
- **Esfuerzo:** Bajo/Medio/Alto
- **Impacto:** CRÍTICO/Alto/Medio
- **Riesgo si no se corrige:** [Descripción]
- **Descripción:** [Detalle]
- **Solución:** [Acción]
- **Archivos afectados:** [Lista]

---

## 🛡️ Checklist OWASP Mobile Security

Referencia: [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)

- [ ] **M1: Uso Incorrecto de la Plataforma** - Uso correcto de la API de la plataforma
- [ ] **M2: Almacenamiento de Datos Inseguro** - Almacenamiento seguro (SecureStore/Keychain)
- [ ] **M3: Comunicación Insegura** - HTTPS + Certificate Pinning
- [ ] **M4: Autenticación Insegura** - Autenticación robusta con JWT
- [ ] **M5: Criptografía Insuficiente** - Sin cripto personalizada, usar APIs de la plataforma
- [ ] **M6: Autorización Insegura** - Autorización del lado del servidor validada
- [ ] **M7: Calidad del Código del Cliente** - Código de calidad, ofuscado en producción
- [ ] **M8: Manipulación del Código** - Protección contra modificaciones (detección de jailbreak)
- [ ] **M9: Ingeniería Inversa** - Ofuscación y protección del código
- [ ] **M10: Funcionalidad Extraña** - Sin backdoors ni logs de depuración en producción

---

## 🚀 Recomendaciones

### Acciones inmediatas (hoy)
1. Corregir todas las vulnerabilidades CRÍTICAS
2. Eliminar todos los secretos hardcodeados
3. Ejecutar `npm audit fix` para vulnerabilidades corregibles automáticamente

### Acciones a corto plazo (esta semana)
1. Implementar SecureStore para todos los tokens
2. Habilitar solo HTTPS (bloquear HTTP)
3. Añadir .env a .gitignore si no está presente
4. Actualizar las dependencias vulnerables

### Acciones a medio plazo (este mes)
1. Implementar certificate pinning
2. Habilitar ofuscación en producción
3. Completar la auditoría de permisos
4. Formación del equipo en buenas prácticas

### Herramientas recomendadas

```bash
# Instalar herramientas de seguridad
npm install --save-dev @react-native-community/cli-doctor
npm audit

# Para iOS
gem install fastlane

# Para Android
# Usar ProGuard/R8 (ya incluido)
```

---

## 📚 Referencias

- `.claude/rules/11-security.md` - Estándares de seguridad
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**Puntuación final: XX/25**

**⚠️ ADVERTENCIA: Una puntuación < 15/25 en seguridad requiere acción inmediata antes de cualquier despliegue a producción.**
