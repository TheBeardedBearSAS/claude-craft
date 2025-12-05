# Estándares de Documentación

## Documentación de Código

### JSDoc / TSDoc para TypeScript

#### Documentar Funciones

```typescript
/**
 * Calcula el total de un pedido incluyendo impuestos y envío.
 *
 * @param items - Lista de artículos del pedido
 * @param taxRate - Tasa de impuesto (por defecto 0.20 para 20%)
 * @param shippingCost - Costos de envío opcionales
 *
 * @returns El monto total del pedido
 *
 * @throws {ValidationError} Si el array de items está vacío
 * @throws {RangeError} Si la tasa de impuesto es negativa
 *
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Producto 1', price: 10, quantity: 2 },
 *   { name: 'Producto 2', price: 15, quantity: 1 }
 * ];
 *
 * const total = calculateOrderTotal(items, 0.20, 5);
 * // Retorna: 47 (20 + 15 + impuesto 7 + envío 5)
 * ```
 *
 * @see {@link https://docs.example.com/pricing | Documentación de Precios}
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number = 0.20,
  shippingCost?: number
): number {
  if (items.length === 0) {
    throw new ValidationError('Items array cannot be empty');
  }

  if (taxRate < 0) {
    throw new RangeError('Tax rate cannot be negative');
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const tax = subtotal * taxRate;
  const shipping = shippingCost ?? 0;

  return subtotal + tax + shipping;
}
```

#### Documentar Interfaces y Types

```typescript
/**
 * Representa un artículo de pedido.
 *
 * @interface OrderItem
 */
export interface OrderItem {
  /**
   * Identificador único del artículo
   * @example "prod_123abc"
   */
  id: string;

  /**
   * Nombre del producto
   * @example "MacBook Pro 14\""
   */
  name: string;

  /**
   * Precio unitario en euros
   * @minimum 0
   * @example 1999.99
   */
  price: number;

  /**
   * Cantidad pedida
   * @minimum 1
   * @example 2
   */
  quantity: number;

  /**
   * Categoría del producto (opcional)
   * @example "electronics"
   */
  category?: ProductCategory;
}

/**
 * Categorías de productos disponibles
 *
 * @enum {string}
 */
export enum ProductCategory {
  /** Productos electrónicos */
  ELECTRONICS = 'electronics',

  /** Ropa y accesorios */
  CLOTHING = 'clothing',

  /** Libros y medios */
  BOOKS = 'books',

  /** Artículos para el hogar */
  HOME = 'home'
}

/**
 * Opciones de configuración para cálculo de pedidos
 *
 * @typedef {Object} OrderCalculationOptions
 * @property {number} [taxRate=0.20] - Tasa de impuesto aplicada
 * @property {number} [shippingCost] - Costos de envío fijos
 * @property {boolean} [includeTax=true] - Incluir impuesto en el cálculo
 * @property {DiscountCode} [discountCode] - Código promocional opcional
 */
export type OrderCalculationOptions = {
  taxRate?: number;
  shippingCost?: number;
  includeTax?: boolean;
  discountCode?: DiscountCode;
};
```

#### Documentar Componentes React

```typescript
/**
 * Componente de tarjeta de usuario que muestra información principal.
 *
 * @component
 * @example
 * ```tsx
 * <UserCard
 *   user={userData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   showActions
 * />
 * ```
 */
export const UserCard: FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  showActions = false
}) => {
  // Implementación
};

/**
 * Props para el componente UserCard
 *
 * @interface UserCardProps
 */
export interface UserCardProps {
  /**
   * Datos del usuario a mostrar
   */
  user: User;

  /**
   * Callback llamado cuando se hace clic en "Editar"
   * @param user - El usuario a editar
   */
  onEdit?: (user: User) => void;

  /**
   * Callback llamado cuando se hace clic en "Eliminar"
   * @param userId - El ID del usuario a eliminar
   */
  onDelete?: (userId: string) => void;

  /**
   * Mostrar u ocultar botones de acción
   * @default false
   */
  showActions?: boolean;

  /**
   * Clases CSS adicionales
   */
  className?: string;
}
```

#### Documentar Custom Hooks

```typescript
/**
 * Hook personalizado para gestionar autenticación de usuario.
 *
 * Maneja login, logout y estado de autenticación.
 * Utiliza React Query para caché y sincronización.
 *
 * @hook
 *
 * @returns {UseAuthReturn} Objeto que contiene estado y métodos de autenticación
 *
 * @throws {AuthError} Si las credenciales son inválidas
 * @throws {NetworkError} Si la conexión de red falla
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'user@example.com', password: 'pass123' });
 *       navigate('/dashboard');
 *     } catch (error) {
 *       console.error('Login failed:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Logout</button>
 *       ) : (
 *         <button onClick={handleLogin}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link AuthService} para la implementación del servicio
 * @see {@link https://docs.example.com/auth | Documentación de Autenticación}
 */
export const useAuth = (): UseAuthReturn => {
  // Implementación
};

/**
 * Valor de retorno del hook useAuth
 *
 * @interface UseAuthReturn
 */
export interface UseAuthReturn {
  /**
   * Usuario actualmente autenticado (null si no está autenticado)
   */
  user: User | null;

  /**
   * Indica si el usuario está autenticado
   */
  isAuthenticated: boolean;

  /**
   * Indica si una operación de autenticación está en progreso
   */
  isLoading: boolean;

  /**
   * Posible error de autenticación
   */
  error: Error | null;

  /**
   * Iniciar sesión con email y contraseña
   *
   * @param credentials - Email y contraseña
   * @returns Promise resuelto con el usuario autenticado
   */
  login: (credentials: LoginCredentials) => Promise<User>;

  /**
   * Cerrar sesión
   *
   * @returns Promise resuelto cuando se completa el logout
   */
  logout: () => Promise<void>;

  /**
   * Refrescar token de autenticación
   *
   * @returns Promise resuelto con el nuevo token
   */
  refreshToken: () => Promise<string>;
}
```

### Comentarios de Código

#### Cuándo Comentar

```typescript
// ✅ BUENO - Explicar el "por qué"
// Usamos requestAnimationFrame para evitar layout thrashing
// que causaría retrasos en animaciones complejas
const optimizedScroll = () => {
  requestAnimationFrame(() => {
    updateScrollPosition();
  });
};

// ✅ BUENO - Workaround o solución no obvia
// HACK: Safari no soporta scrollTo con behavior: 'smooth'
// Usar solución alternativa para Safari
if (isSafari) {
  window.scrollTo(0, targetPosition);
} else {
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

// ✅ BUENO - TODO con contexto
// TODO(john): Implementar paginación del lado del servidor
// Actualmente limitado a 100 items, refactorizar cuando tengamos API v2
// Ticket: #USER-456

// ✅ BUENO - Complejidad algorítmica
// Complejidad temporal: O(n log n) - ordenamiento requerido para búsqueda binaria
// Complejidad espacial: O(n) - copia de array para evitar mutación

// ❌ MALO - Comentario obvio
// Incrementar el contador en 1
counter++;

// ❌ MALO - Código comentado (eliminar en su lugar)
// const oldFunction = () => {
//   // código antiguo...
// };
```

#### Tipos de Comentarios Útiles

```typescript
// ========== Secciones ==========
// Usar para separar partes lógicas

// ========== Configuración ==========
const API_BASE_URL = 'https://api.example.com';
const TIMEOUT = 30000;

// ========== Gestión de Estado ==========
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);

// ========== Efectos ==========
useEffect(() => {
  fetchUsers();
}, []);

// ---------- Sub-secciones ----------
// Usar para sub-partes

// WARNING: No modificar este valor sin consultar al equipo backend
// Está sincronizado con la configuración del servidor
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// NOTE: Esta función es temporal y será reemplazada por API v2
function getLegacyData() {
  // ...
}

// FIXME: Esta validación no es correcta para emails internacionales
// Ver https://github.com/project/issues/123
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## README.md del Proyecto

### Estructura Recomendada

```markdown
# Nombre del Proyecto

![Build Status](https://img.shields.io/github/workflow/status/user/repo/CI)
![Coverage](https://img.shields.io/codecov/c/github/user/repo)
![License](https://img.shields.io/github/license/user/repo)

Descripción breve del proyecto (1-2 oraciones).

## Tabla de Contenidos

- [Vista General](#vista-general)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Scripts Disponibles](#scripts-disponibles)
- [Arquitectura](#arquitectura)
- [Tests](#tests)
- [Despliegue](#despliegue)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Vista General

Descripción detallada del proyecto, su propósito y contexto.

### Tecnologías Utilizadas

- React 18.3
- TypeScript 5.4
- Vite 5.2
- TanStack Query v5
- React Router v6
- Tailwind CSS 3.4
- Vitest
- Playwright

## Características

- ✅ Autenticación con JWT
- ✅ Gestión de usuarios (CRUD)
- ✅ Dashboard con estadísticas
- ✅ Tema claro/oscuro
- ✅ Diseño responsivo
- ✅ Tests unitarios y E2E
- ✅ CI/CD con GitHub Actions

## Requisitos Previos

- Node.js >= 20.0.0
- pnpm >= 8.0.0 (o npm >= 9.0.0)
- Git

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/user/project.git
cd project

# Instalar dependencias
pnpm install

# Copiar archivo de entorno
cp .env.example .env.local

# Configurar variables de entorno
# Editar .env.local con sus valores
```

## Configuración

### Variables de Entorno

```env
# API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Autenticación
VITE_AUTH_DOMAIN=auth.example.com
VITE_AUTH_CLIENT_ID=your-client-id

# Características
VITE_FEATURE_NEW_DASHBOARD=true
VITE_FEATURE_ANALYTICS=false

# Analytics (opcional)
VITE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Configuración Adicional

Ver [docs/configuration.md](docs/configuration.md) para más detalles.

## Uso

### Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Accesible en http://localhost:3000
```

### Build

```bash
# Construir para producción
pnpm build

# Previsualizar la construcción
pnpm preview
```

### Docker

```bash
# Construir la imagen
docker build -t my-app .

# Ejecutar el contenedor
docker run -p 3000:80 my-app

# O usar docker-compose
docker-compose up
```

## Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Construcción de producción
pnpm preview      # Previsualizar build

pnpm test         # Tests unitarios
pnpm test:e2e     # Tests E2E
pnpm test:coverage # Cobertura

pnpm lint         # Linter
pnpm lint:fix     # Corregir linting
pnpm format       # Formatear código
pnpm type-check   # Verificar tipos

pnpm quality      # Linter + Tipos + Tests
```

## Arquitectura

```
src/
├── components/        # Componentes reutilizables
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/         # Características de negocio
│   ├── auth/
│   ├── users/
│   └── dashboard/
├── hooks/            # Custom hooks
├── services/         # Servicios API
├── utils/            # Utilidades
├── types/            # Tipos TypeScript
└── config/           # Configuración

```

Ver [docs/architecture.md](docs/architecture.md) para más detalles.

## Tests

### Tests Unitarios

```bash
# Ejecutar todos los tests
pnpm test

# Modo watch
pnpm test:watch

# Cobertura
pnpm test:coverage
```

### Tests E2E

```bash
# Ejecutar tests E2E
pnpm test:e2e

# Modo UI
pnpm test:e2e:ui
```

## Despliegue

### Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify

```bash
# Construir
pnpm build

# La carpeta dist/ está lista para despliegue
```

### Docker

```bash
# Construir y push
docker build -t registry.example.com/my-app:latest .
docker push registry.example.com/my-app:latest
```

Ver [docs/deployment.md](docs/deployment.md) para más detalles.

## Contribuir

¡Las contribuciones son bienvenidas! Por favor lee [CONTRIBUTING.md](CONTRIBUTING.md).

### Workflow

1. Fork el proyecto
2. Crear una rama (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'feat: add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Abrir un Pull Request

### Estándares

- Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- Escribir tests para nuevas características
- Mantener cobertura > 80%
- Respetar reglas de ESLint y Prettier

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## Contacto

- Autor: Tu Nombre
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## Agradecimientos

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
```

## Storybook - Documentación de Componentes

### Instalación

```bash
npx storybook@latest init
```

### Ejemplo de Story

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * El componente Button se utiliza para activar acciones.
 * Soporta diferentes variantes, tamaños y estados.
 */
const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Un botón personalizable con múltiples variantes y tamaños.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'La variante visual del botón'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'El tamaño del botón'
    },
    disabled: {
      control: 'boolean',
      description: 'Deshabilitar el botón'
    },
    isLoading: {
      control: 'boolean',
      description: 'Mostrar estado de carga'
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Botón primario por defecto
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

/**
 * Botón secundario
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

/**
 * Botón outline
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button'
  }
};

/**
 * Botón de peligro
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Delete'
  }
};

/**
 * Botón deshabilitado
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Disabled Button'
  }
};

/**
 * Botón con carga
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Loading...'
  }
};

/**
 * Diferentes tamaños
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  )
};

/**
 * Todas las variantes
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Danger</Button>
    </div>
  )
};
```

## Documentación Técnica

### docs/architecture.md

```markdown
# Arquitectura

## Vista General

La aplicación sigue una arquitectura basada en características organizada según el patrón Atomic Design.

## Principios

1. **Basado en Características**: Código organizado por característica de negocio
2. **Atomic Design**: Componentes jerárquicos (atoms, molecules, organisms)
3. **Separación de Responsabilidades**: Lógica separada de presentación
4. **Type Safety**: TypeScript strict habilitado

## Estructura

[Detalles de estructura...]

## Flujo de Datos

[Diagramas y explicaciones...]
```

### docs/api-reference.md

```markdown
# Referencia de API

## Endpoints

### Autenticación

#### POST /api/auth/login

Autentica a un usuario.

**Petición:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta:**

```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-here"
}
```

[Más detalles...]
```

### docs/deployment.md

```markdown
# Despliegue

## Requisitos Previos

- Node.js 20+
- Acceso a servicios cloud (Vercel, AWS, etc.)

## Entornos

### Desarrollo

[Configuración...]

### Staging

[Configuración...]

### Producción

[Configuración...]
```

## Changelog

### CHANGELOG.md

```markdown
# Changelog

Todos los cambios notables a este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
y este proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [No Publicado]

### Agregado

- Soporte de modo oscuro
- Edición de perfil de usuario

### Cambiado

- Mejorado rendimiento de lista de usuarios

### Corregido

- Problema con regex de validación de email

## [1.2.0] - 2024-01-15

### Agregado

- Autenticación OAuth2
- Dashboard con analytics
- Exportar datos a CSV

### Cambiado

- Actualizado React a v18.3
- Migrado a Vite 5

### Deprecado

- Endpoints de API antiguos (se eliminarán en v2.0.0)

### Seguridad

- Corregida vulnerabilidad XSS en entrada de usuario

## [1.1.0] - 2023-12-01

### Agregado

- Operaciones CRUD de gestión de usuarios
- Control de acceso basado en roles

### Corregido

- Problema de redirección de login
- Memory leak en componente DataTable

## [1.0.0] - 2023-11-01

### Agregado

- Lanzamiento inicial
- Autenticación de usuarios
- Dashboard básico
- Lista de usuarios

[unreleased]: https://github.com/user/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
```

## Conclusión

Una buena documentación permite:

1. ✅ **Onboarding**: Nuevos desarrolladores productivos rápidamente
2. ✅ **Mantenimiento**: Entender código rápidamente
3. ✅ **Colaboración**: Comunicación clara entre equipos
4. ✅ **Calidad**: Reducir bugs y malentendidos
5. ✅ **Evolución**: Facilitar cambios futuros

**Regla de oro**: El código se documenta a sí mismo (buen nombrado), los comentarios explican el "por qué", la documentación explica "cómo usar".
