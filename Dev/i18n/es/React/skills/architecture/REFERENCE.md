# Arquitectura React - Organización y Patrones

## Principios Arquitectónicos

### 1. Separación de Responsabilidades
- **Presentación** (UI): Componentes React
- **Lógica de Negocio**: Hooks personalizados, servicios
- **Datos**: Gestión de estado, llamadas API
- **Utilidades**: Funciones helpers, transformadores

### 2. Modularidad
- Funcionalidades organizadas en módulos
- Componentes reutilizables y componibles
- Acoplamiento débil entre módulos

### 3. Escalabilidad
- Estructura que crece con el proyecto
- Código fácil de mantener y refactorizar
- Onboarding simplificado para nuevos desarrolladores

## Estructura de Carpetas Recomendada

###  Opción 1: Arquitectura Basada en Funcionalidades (Recomendada)

```
src/
├── app/                          # Configuración de la aplicación
│   ├── App.tsx                   # Componente raíz
│   ├── routes.tsx                # Configuración de rutas
│   ├── providers.tsx             # Proveedores (Query, Router, Theme)
│   └── index.tsx                 # Punto de entrada
│
├── features/                     # Funcionalidades de negocio
│   ├── auth/                     # Autenticación
│   │   ├── components/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   └── index.ts
│   │   │   └── RegisterForm/
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── utils/
│   │   │   └── token.utils.ts
│   │   └── index.ts              # Barrel export
│   │
│   ├── users/                    # Gestión de usuarios
│   │   ├── components/
│   │   │   ├── UserList/
│   │   │   ├── UserForm/
│   │   │   └── UserProfile/
│   │   ├── hooks/
│   │   │   ├── useUsers.ts
│   │   │   ├── useUser.ts
│   │   │   └── useUserMutations.ts
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   └── index.ts
│   │
│   └── products/                 # Productos
│       ├── components/
│       ├── hooks/
│       ├── services/
│       ├── types/
│       └── index.ts
│
├── components/                   # Componentes compartidos
│   ├── ui/                       # Componentes UI primitivos
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   ├── Button.module.css
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Card/
│   │   ├── Modal/
│   │   └── Spinner/
│   │
│   ├── layout/                   # Componentes de diseño
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── MainLayout/
│   │
│   └── common/                   # Componentes comunes
│       ├── ErrorBoundary/
│       ├── NotFound/
│       └── Loading/
│
├── hooks/                        # Hooks compartidos
│   ├── useLocalStorage.ts
│   ├── useDebounce.ts
│   ├── useMediaQuery.ts
│   └── index.ts
│
├── services/                     # Servicios compartidos
│   ├── api/
│   │   ├── client.ts            # Cliente API (axios/ky)
│   │   ├── endpoints.ts         # Endpoints API
│   │   └── interceptors.ts      # Interceptores
│   ├── storage/
│   │   └── storage.service.ts
│   └── analytics/
│       └── analytics.service.ts
│
├── stores/                       # Estado global
│   ├── themeStore.ts
│   ├── notificationStore.ts
│   └── index.ts
│
├── lib/                          # Configuración de bibliotecas externas
│   ├── react-query.ts
│   └── axios.ts
│
├── types/                        # Tipos globales
│   ├── api.types.ts
│   ├── common.types.ts
│   └── index.ts
│
├── utils/                        # Funciones de utilidad
│   ├── format/
│   │   ├── date.ts
│   │   ├── number.ts
│   │   └── string.ts
│   ├── validation/
│   │   └── schemas.ts
│   └── helpers/
│       └── cn.ts                 # Helper classnames
│
├── constants/                    # Constantes
│   ├── routes.ts
│   ├── config.ts
│   └── index.ts
│
├── assets/                       # Assets estáticos
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── styles/                       # Estilos globales
    ├── index.css
    ├── variables.css
    └── reset.css
```

### Opción 2: Diseño Atómico

```
src/
├── components/
│   ├── atoms/               # Componentes más pequeños (Button, Input, Label)
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Label/
│   │   └── Icon/
│   │
│   ├── molecules/           # Combinación de átomos (SearchBar, FormField)
│   │   ├── SearchBar/
│   │   ├── FormField/
│   │   └── NavItem/
│   │
│   ├── organisms/           # Componentes complejos (Header, UserForm, Table)
│   │   ├── Header/
│   │   ├── UserForm/
│   │   ├── DataTable/
│   │   └── Navigation/
│   │
│   ├── templates/           # Plantillas de página (DashboardLayout, ProfileLayout)
│   │   ├── DashboardLayout/
│   │   ├── ProfileLayout/
│   │   └── AuthLayout/
│   │
│   └── pages/               # Páginas completas (Home, Dashboard, Profile)
│       ├── HomePage/
│       ├── DashboardPage/
│       └── ProfilePage/
```

## Patrones de Arquitectura

### 1. Arquitectura en Capas

```
┌─────────────────────────────┐
│   Capa de Presentación      │ ← Componentes React
│   (Components)               │
├─────────────────────────────┤
│   Capa de Lógica de Negocio │ ← Hooks, servicios
│   (Business Logic)           │
├─────────────────────────────┤
│   Capa de Datos              │ ← API, gestión de estado
│   (Data Layer)               │
├─────────────────────────────┤
│   Capa de Utilidades         │ ← Helpers, constantes
│   (Utilities)                │
└─────────────────────────────┘
```

### 2. Patrón Container/Presentational

```typescript
// Presentational Component (UI pura)
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const UserCard: FC<UserCardProps> = ({ user, onEdit, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user.id)}>Editar</button>
      <button onClick={() => onDelete(user.id)}>Eliminar</button>
    </div>
  );
};

// Container Component (lógica)
export const UserCardContainer: FC<{ userId: string }> = ({ userId }) => {
  const { data: user } = useUser(userId);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const handleEdit = (id: string) => {
    // Lógica de edición
  };

  const handleDelete = (id: string) => {
    // Lógica de eliminación
  };

  if (!user) return <UserCardSkeleton />;

  return <UserCard user={user} onEdit={handleEdit} onDelete={handleDelete} />;
};
```

### 3. Patrón Compound Components

```typescript
// Componente compuesto
interface CardProps {
  children: ReactNode;
}

export const Card: FC<CardProps> & {
  Header: FC<CardHeaderProps>;
  Body: FC<CardBodyProps>;
  Footer: FC<CardFooterProps>;
} = ({ children }) => {
  return <div className="card">{children}</div>;
};

Card.Header = ({ children }) => {
  return <div className="card-header">{children}</div>;
};

Card.Body = ({ children }) => {
  return <div className="card-body">{children}</div>;
};

Card.Footer = ({ children }) => {
  return <div className="card-footer">{children}</div>;
};

// Uso
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Acciones</Card.Footer>
</Card>
```

### 4. Patrón Render Props

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: {
    data: T | null;
    loading: boolean;
    error: Error | null;
  }) => ReactNode;
}

export const DataFetcher = <T,>({ url, children }: DataFetcherProps<T>) => {
  const { data, loading, error } = useFetch<T>(url);

  return <>{children({ data, loading, error })}</>;
};

// Uso
<DataFetcher<User> url="/api/users/1">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />;
    if (error) return <Error error={error} />;
    if (!data) return null;
    return <UserProfile user={data} />;
  }}
</DataFetcher>
```

## Gestión de Estado

### Estado Local (useState)

```typescript
// Para estado simple específico del componente
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
```

### Estado de Servidor (React Query)

```typescript
// Para datos del servidor
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Consulta
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => userService.getAll()
});

// Mutación
const createUser = useMutation({
  mutationFn: (data: CreateUserInput) => userService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  }
});
```

### Estado Global (Zustand)

```typescript
// Para estado compartido entre componentes
import { create } from 'zustand';

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  login: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null })
}));
```

### Context API

```typescript
// Para dependencias o configuración
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

## Enrutamiento

### React Router v6

```typescript
// routes.tsx
import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        loader: dashboardLoader
      },
      {
        path: 'users',
        children: [
          {
            index: true,
            element: <UserListPage />
          },
          {
            path: ':userId',
            element: <UserDetailPage />
          }
        ]
      }
    ]
  }
]);
```

### Rutas Protegidas

```typescript
// ProtectedRoute.tsx
export const ProtectedRoute: FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Uso
{
  path: 'dashboard',
  element: (
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  )
}
```

## Mejores Prácticas

### 1. Colocación
- Mantener archivos relacionados juntos
- Un componente = una carpeta
- Tests al lado del código

### 2. Barrel Exports (index.ts)
```typescript
// features/users/index.ts
export { UserList } from './components/UserList';
export { UserForm } from './components/UserForm';
export { useUsers, useUser } from './hooks';
export type { User, CreateUserInput } from './types';
```

### 3. Alias de Ruta
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/features/*": ["./src/features/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  }
}

// Uso
import { Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { cn } from '@/utils/helpers';
```

### 4. Lazy Loading

```typescript
// Carga diferida de rutas
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// Uso
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/settings" element={<SettingsPage />} />
  </Routes>
</Suspense>
```

## Antipatrones a Evitar

### ❌ Props Drilling Excesivo
```typescript
// Malo: Pasar props a través de muchos niveles
<App>
  <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />
    </Header>
  </Layout>
</App>

// Bueno: Usar Context o estado global
const user = useAuthStore((state) => state.user);
```

### ❌ Componentes God
```typescript
// Malo: Un componente que hace demasiado (500+ líneas)
const UserDashboard = () => {
  // Lógica para 10 características diferentes
};

// Bueno: Dividir en componentes más pequeños
const UserDashboard = () => (
  <>
    <UserHeader />
    <UserStats />
    <UserActivity />
    <UserSettings />
  </>
);
```

### ❌ Dependencias Circulares
```typescript
// Malo: A importa B, B importa A
// featureA/index.ts
import { FeatureB } from '../featureB';

// featureB/index.ts
import { FeatureA } from '../featureA';

// Bueno: Extraer código compartido
// shared/index.ts
export const SharedLogic = () => {};
```

## Checklist de Arquitectura

- [ ] Estructura de carpetas clara y consistente
- [ ] Separación de responsabilidades respetada
- [ ] Componentes reutilizables y componibles
- [ ] Estado gestionado apropiadamente
- [ ] Enrutamiento bien organizado
- [ ] Sin dependencias circulares
- [ ] Lazy loading implementado
- [ ] Alias de ruta configurados
- [ ] Barrel exports utilizados
- [ ] Documentación actualizada

**Regla de oro**: Una buena arquitectura facilita agregar características, no hace más difícil.
