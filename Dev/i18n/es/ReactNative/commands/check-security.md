# Verificación de Seguridad

Realiza una auditoría de seguridad de la aplicación React Native.

## 1. Vulnerabilidades de Dependencias

```bash
# Auditar npm
npm audit

# Auditar con Snyk
npx snyk test
npx snyk monitor

# Ver dependencias desactualizadas
npm outdated
```

## 2. Secretos y Claves API

```bash
# Buscar secretos en el código
grep -r "API_KEY" .
grep -r "SECRET" .
grep -r "PASSWORD" .

# Verificar .env en .gitignore
cat .gitignore | grep "\.env"
```

**Checklist:**
- [ ] Sin claves API hardcodeadas
- [ ] .env no está commiteado
- [ ] Variables de entorno usadas correctamente
- [ ] Secretos en variables de entorno
- [ ] react-native-config o expo-constants usado

## 3. Seguridad de Almacenamiento

```typescript
// ❌ MAL - AsyncStorage para datos sensibles
await AsyncStorage.setItem('password', password);

// ✅ BIEN - Keychain/Keystore
import * as SecureStore from 'expo-secure-store';
await SecureStore.setItemAsync('password', password);
```

**Checklist:**
- [ ] Contraseñas en SecureStore/Keychain
- [ ] Tokens en SecureStore
- [ ] Sin datos sensibles en AsyncStorage
- [ ] Datos sensibles cifrados

## 4. Comunicaciones de Red

```typescript
// ✅ HTTPS obligatorio
const API_BASE_URL = 'https://api.example.com';

// ✅ SSL Pinning (opcional pero recomendado)
```

**Checklist:**
- [ ] Solo HTTPS, sin HTTP
- [ ] Certificados SSL válidos
- [ ] SSL Pinning implementado (prod)
- [ ] Timeouts configurados
- [ ] Manejo correcto de errores de red

## 5. Autenticación y Autorización

**Checklist:**
- [ ] Tokens JWT con expiración
- [ ] Refresh token implementado
- [ ] Logout borra tokens
- [ ] Sin autenticación por defecto
- [ ] Permisos verificados en backend

## 6. Validación de Entrada

```typescript
// ✅ Validación con Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
```

**Checklist:**
- [ ] Validación de formularios
- [ ] Sanitización de input
- [ ] Validación en frontend Y backend
- [ ] XSS prevenido

## 7. Permisos de la Aplicación

```typescript
// ✅ Solicitar permisos solo cuando es necesario
import * as Location from 'expo-location';

const requestPermission = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    // Manejar permiso denegado
  }
};
```

**Checklist:**
- [ ] Permisos solicitados solo cuando son necesarios
- [ ] Explicación clara para cada permiso
- [ ] Manejo de permisos denegados
- [ ] Permisos mínimos solicitados

## 8. Seguridad de Código

**Checklist:**
- [ ] Sin console.log en producción
- [ ] Sin código debug en producción
- [ ] Ofuscación de código (JS) activada
- [ ] ProGuard (Android) configurado
- [ ] Bitcode (iOS) activado

## 9. Deep Links y URLs

```typescript
// ✅ Validar URLs entrantes
const handleDeepLink = (url: string) => {
  // Validar dominio
  if (!url.startsWith('https://myapp.com/')) {
    return;
  }
  // Procesar URL
};
```

**Checklist:**
- [ ] Deep links validados
- [ ] URL schemes configurados correctamente
- [ ] Sin redirecciones abiertas
- [ ] Parámetros de URL sanitizados

## 10. Herramientas de Auditoría

```bash
# Snyk
npm install -g snyk
snyk test
snyk wizard

# OWASP Dependency Check
npx depcheck

# Retire.js
npx retire
```

## Reporte de Seguridad

Genera un reporte con:
- Vulnerabilidades encontradas
- Nivel de severidad
- Plan de remediación
- Timeline de corrección

**Severidad:**
- 🔴 Crítica: Corregir inmediatamente
- 🟠 Alta: Corregir en 7 días
- 🟡 Media: Corregir en 30 días
- 🟢 Baja: Corregir cuando sea posible
