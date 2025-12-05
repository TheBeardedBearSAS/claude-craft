# Estándares de Documentación

## Documentación de Código

### Comentarios JSDoc

```typescript
/**
 * Obtiene datos de usuario desde la API
 *
 * @param userId - El identificador único del usuario
 * @returns Una promesa que se resuelve al objeto de usuario
 * @throws {ApiError} Cuando la solicitud a la API falla
 *
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string): Promise<User> {
  const response = await apiClient.get(\`/users/\${userId}\`);
  return response.data;
}
```

### Documentación de Componentes

```typescript
/**
 * Un componente de botón reutilizable con múltiples variantes
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handlePress}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementación
};
```

---

## Estructura README.md

```markdown
# Nombre del Proyecto

Breve descripción

## Características

- Característica 1
- Característica 2

## Requisitos Previos

- Node.js 18+
- npm 9+
- Expo CLI

## Instalación

```bash
npm install
```

## Configuración

Copia \`.env.example\` a \`.env\`:
```bash
cp .env.example .env
```

## Ejecución

```bash
npx expo start
```

## Testing

```bash
npm test
```

## Build

```bash
eas build --platform all
```

## Estructura del Proyecto

```
src/
├── app/
├── components/
└── services/
```

## Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md)

## Licencia

MIT
```

---

## Comentarios Inline

### Cuándo Comentar

```typescript
// ✅ BUENO: Explica el "porqué"
// Workaround para bug de teclado iOS en React Native 0.72
if (Platform.OS === 'ios') {
  Keyboard.dismiss();
}

// ✅ BUENO: Explica lógica de negocio compleja
// Los usuarios con suscripción premium obtienen 3 reintentos,
// usuarios gratuitos solo obtienen 1 reintento
const maxRetries = user.isPremium ? 3 : 1;

// ❌ MALO: Explica el "qué" (ya es evidente)
// Establecer count a 0
setCount(0);

// ❌ MALO: Comentario obsoleto
// TODO: Corregir esto después (de hace 2 años)
```

---

## Registros de Decisiones de Arquitectura (ADR)

### Plantilla

```markdown
# ADR-001: Usar Zustand para Estado Global

## Estado
Aceptado

## Contexto
Necesitamos una solución de gestión de estado para el estado
global de la app (tema, sesión de usuario, configuraciones).

## Decisión
Usar Zustand con persistencia MMKV.

## Consecuencias

### Positivas
- Ligero (< 1kb)
- API simple
- Soporte TypeScript
- Persistencia rápida con MMKV

### Negativas
- Ecosistema menor que Redux
- Sin sistema de middleware

## Alternativas Consideradas
1. Redux Toolkit - Demasiado pesado
2. Context API - Problemas de rendimiento
3. Jotai - Menos maduro

## Referencias
- [Documentos Zustand](https://github.com/pmndrs/zustand)
```

---

## Documentación de API

```typescript
/**
 * Servicio de API de Usuarios
 *
 * Maneja todas las llamadas de API relacionadas con usuarios.
 */
export class UsersService {
  /**
   * Obtiene todos los usuarios con filtrado opcional
   *
   * @param filters - Filtros opcionales (nombre, email, rol)
   * @returns Lista paginada de usuarios
   *
   * @example
   * ```typescript
   * const users = await usersService.getAll({ role: 'admin' });
   * ```
   */
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    // Implementación
  }
}
```

---

## Changelog

### CHANGELOG.md

```markdown
# Changelog

Todos los cambios notables a este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [No publicado]

### Agregado
- Soporte para modo oscuro
- Modo offline para artículos

### Cambiado
- Rendimiento mejorado de lista de artículos

### Corregido
- Crash de login en Android

## [1.2.0] - 2024-01-15

### Agregado
- Login social (Google, Apple)
- Notificaciones push
- Subida de imágenes

### Cambiado
- Actualizado a Expo SDK 50

### Deprecado
- Endpoints antiguos de API de auth

### Eliminado
- Sistema de navegación legacy

### Corregido
- Memory leak en pantalla de perfil

### Seguridad
- Dependencias actualizadas con vulnerabilidades de seguridad

## [1.1.0] - 2023-12-01

...
```

---

## Checklist Documentación

- [ ] README.md actualizado
- [ ] JSDoc para funciones públicas
- [ ] Comentarios inline pertinentes
- [ ] ADR para decisiones importantes
- [ ] CHANGELOG.md mantenido
- [ ] API documentada
- [ ] Arquitectura documentada

---

**Una buena documentación ahorra tiempo a todo el equipo.**
