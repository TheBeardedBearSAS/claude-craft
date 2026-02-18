---
description: Verificación Seguridad Flutter
argument-hint: [arguments]
---

# Verificación Seguridad Flutter

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en Flutter encargado de auditar la seguridad del proyecto según las mejores prácticas.

### Paso 1: Análisis de archivos sensibles

- [ ] Examinar `pubspec.yaml` para las dependencias de seguridad
- [ ] Buscar los archivos de configuración (`.env`, `config.dart`)
- [ ] Referenciar las reglas desde `/rules/11-security.md`
- [ ] Verificar `.gitignore` para los secrets
- [ ] Escanear los archivos Dart para credentials hardcodeados

### Paso 2: Verificaciones Seguridad (25 puntos)

#### 2.1 Gestión de secrets (8 puntos)
- [ ] **Sin secrets hardcodeados** en el código (0-4 pts)
  - Buscar: API keys, tokens, passwords, URLs sensibles
  - Comando: `grep -r -E "(api[_-]?key|token|password|secret)" lib/ --include="*.dart"`
  - Ejemplos a evitar:
    ```dart
    ❌ const apiKey = "sk_live_123abc";
    ❌ final password = "admin123";
    ```
- [ ] **Variables de entorno** utilizadas (0-2 pts)
  - Package `flutter_dotenv` o `envied`
  - Archivo `.env` en `.gitignore`
  - Archivo `.env.example` commiteado
- [ ] **Almacenamiento seguro** con flutter_secure_storage (0-2 pts)
  - Para tokens, credentials de usuario
  - Sin SharedPreferences para datos sensibles

#### 2.2 Comunicación de red (6 puntos)
- [ ] **HTTPS obligatorio** para todas las APIs (0-3 pts)
  - Sin `http://` en producción
  - Certificate pinning para APIs críticas
  - Verificar las llamadas Dio/http
- [ ] **Validación de certificados** SSL/TLS (0-2 pts)
  - Sin `badCertificateCallback` que acepte todo
  - Trust anchor correctamente configurado
- [ ] **Timeout configurados** para evitar DoS (0-1 pt)

#### 2.3 Datos sensibles (5 puntos)
- [ ] **Cifrado de datos locales** (0-2 pts)
  - flutter_secure_storage para credentials
  - Hive/SQLite con encryption para PII
- [ ] **Sin logs sensibles** (0-2 pts)
  - Sin `print()` con tokens, emails, passwords
  - Logger configurado para filtrar datos sensibles
  - Ejemplos a evitar:
    ```dart
    ❌ print('User password: $password');
    ❌ debugPrint('API Response: $token');
    ```
- [ ] **Obfuscación del código** en release (0-1 pt)
  - `flutter build --obfuscate --split-debug-info`

#### 2.4 Permisos y accesos (3 puntos)
- [ ] **Permisos mínimos** Android/iOS (0-2 pts)
  - AndroidManifest.xml: solo necesarios
  - Info.plist: justificaciones NSUsage*Description
- [ ] **Validación de entradas del usuario** (0-1 pt)
  - Sin inyección en queries
  - Sanitización de inputs

#### 2.5 Dependencias (3 puntos)
- [ ] **Packages actualizados** sin vulnerabilidades conocidas (0-2 pts)
  - Comando: `docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub outdated`
  - Verificar en pub.dev los security advisories
- [ ] **Auditoría de dependencias** terceras (0-1 pt)
  - Sin packages abandonados
  - Fuentes fiables (pub.dev verificado)

### Paso 3: Escaneos automatizados

```bash
# Escanear secrets hardcodeados
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n -E '(api[_-]?key|token|password|secret|credential).*[=:]\s*[\"'\''][^\"'\'']+[\"'\'']' lib/ || echo 'Ningún secret encontrado'
"

# Verificar HTTPS
docker run --rm -v $(pwd):/app -w /app alpine/git sh -c "
  grep -r -n 'http://' lib/ --include='*.dart' || echo 'No se encontró HTTP'
"

# Listar packages sensibles
docker run --rm -v $(pwd):/app -w /app cirrusci/flutter:stable flutter pub deps --style=compact
```

### Paso 4: Cálculo del score

```
SCORE SEGURIDAD = Total de puntos / 25

Interpretación:
✅ 20-25 pts: Seguridad excelente
⚠️ 15-19 pts: Seguridad correcta, vigilancia requerida
⚠️ 10-14 pts: Seguridad a reforzar
❌ 0-9 pts: Vulnerabilidades críticas
```

### Paso 5: Reporte detallado

Genera un reporte con:

#### 📊 SCORE SEGURIDAD: XX/25

#### ✅ Puntos fuertes
- Buenas prácticas de seguridad detectadas
- flutter_secure_storage utilizado
- HTTPS configurado

#### ⚠️ Puntos de atención
- Packages a actualizar
- Permisos demasiado amplios
- Logs potencialmente sensibles

#### ❌ Vulnerabilidades críticas

**SECRETS HARDCODEADOS DETECTADOS:**
```
❌ lib/config/api_config.dart:5
  const apiKey = "sk_live_abc123xyz";

❌ lib/services/auth_service.dart:12
  final baseUrl = "http://api.example.com"; // HTTP en lugar de HTTPS
```

**ALMACENAMIENTO NO SEGURO:**
```
❌ lib/repositories/auth_repository.dart:23
  await prefs.setString('auth_token', token); // SharedPreferences para token
```

#### 🔒 Recomendaciones de seguridad

1. **Migrar los secrets hacia .env**
   ```dart
   // ✅ Bueno
   final apiKey = dotenv.env['API_KEY'];
   ```

2. **Utilizar flutter_secure_storage**
   ```dart
   // ✅ Bueno
   final storage = FlutterSecureStorage();
   await storage.write(key: 'token', value: token);
   ```

3. **Forzar HTTPS**
   ```dart
   // ✅ Bueno
   final dio = Dio(BaseOptions(
     baseUrl: 'https://api.example.com',
     validateStatus: (status) => status! < 500,
   ));
   ```

#### 🎯 TOP 3 ACCIONES PRIORITARIAS

1. **[PRIORIDAD CRÍTICA]** Eliminar todos los secrets hardcodeados y migrar hacia .env (Impacto: seguridad de datos)
2. **[PRIORIDAD ALTA]** Reemplazar SharedPreferences por flutter_secure_storage para tokens (Impacto: robo de credenciales)
3. **[PRIORIDAD MEDIA]** Activar certificate pinning para APIs de producción (Impacto: ataques MITM)

---

**⚠️ ATENCIÓN**: ¡Nunca commitear secrets! Verificar `.gitignore` y utilizar `git-secrets` o `truffleHog`.

**Nota**: Este reporte se concentra únicamente en la seguridad. Para una auditoría completa, utiliza `/check-compliance`.
