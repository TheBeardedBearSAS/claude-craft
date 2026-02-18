---
description: Comando: Verificar Arquitectura
---

# Comando: Verificar Arquitectura

Verifica que la arquitectura del proyecto siga las mejores prácticas de React.

## Ejecución

```bash
npm run check-architecture
```

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## Verificaciones Arquitectónicas

### 1. Estructura de Carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── atoms/          # Componentes básicos
│   ├── molecules/      # Combinaciones de atoms
│   └── organisms/      # Componentes complejos
├── features/           # Características de negocio
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── users/
├── hooks/              # Hooks compartidos
├── services/           # Servicios API
├── utils/              # Utilidades
├── types/              # Tipos TypeScript compartidos
├── config/             # Configuración
└── App.tsx
```

### 2. Arquitectura Basada en Características

**Verificar:**
- [ ] Cada característica tiene su propia carpeta
- [ ] Características independientes y desacopladas
- [ ] Exports centralizados en index.ts
- [ ] Sin dependencias circulares entre características
- [ ] Estructura consistente en todas las características

**Ejemplo de Característica:**
```
features/users/
├── components/
│   ├── UserList.tsx
│   ├── UserCard.tsx
│   └── UserForm.tsx
├── hooks/
│   ├── useUsers.ts
│   ├── useUserForm.ts
│   └── index.ts
├── services/
│   └── user.service.ts
├── types/
│   └── user.types.ts
├── utils/
│   └── validation.ts
└── index.ts              # Public API
```

### 3. Diseño Atómico

**Atoms (Átomos)**
```typescript
// Componentes básicos, no divisibles
Button, Input, Label, Icon, Badge, Avatar
```

**Molecules (Moléculas)**
```typescript
// Combinaciones simples de atoms
FormField, SearchBar, Card, MenuItem
```

**Organisms (Organismos)**
```typescript
// Componentes complejos con lógica de negocio
LoginForm, UserProfile, DataTable, Navigation
```

**Templates**
```typescript
// Estructura de página sin datos
PageTemplate, LayoutTemplate, DashboardTemplate
```

**Pages**
```typescript
// Páginas completas con datos
HomePage, DashboardPage, ProfilePage
```

### 4. Separación de Responsabilidades

**Container/Presenter Pattern:**

```typescript
// UserListContainer.tsx (Smart Component - Lógica)
export const UserListContainer: FC = () => {
  const { data, isLoading, error } = useUsers();
  const { handleDelete } = useUserActions();

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;

  return (
    <UserListPresenter
      users={data}
      onDelete={handleDelete}
    />
  );
};

// UserListPresenter.tsx (Dumb Component - UI)
interface UserListPresenterProps {
  users: User[];
  onDelete: (id: string) => void;
}

export const UserListPresenter: FC<UserListPresenterProps> = ({
  users,
  onDelete
}) => {
  return (
    <div>
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
```

### 5. Gestión de Estado

**Verificar:**
- [ ] Estado local para UI (useState)
- [ ] Estado de servidor con React Query
- [ ] Estado global con Zustand/Context (si necesario)
- [ ] Sin props drilling excesivo (>3 niveles)
- [ ] Estado compartido mínimo
- [ ] Estado derivado calculado (useMemo)

**Ejemplo:**
```typescript
// Estado Local
const [isOpen, setIsOpen] = useState(false);

// Estado de Servidor (React Query)
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
});

// Estado Global (Zustand)
const theme = useThemeStore(state => state.theme);

// Estado Derivado
const activeUsers = useMemo(
  () => users?.filter(u => u.isActive),
  [users]
);
```

### 6. Dependencias entre Capas

```
Reglas de dependencia (unidireccional):

Pages → Templates → Organisms → Molecules → Atoms
   ↓
Features
   ↓
Hooks → Services → Utils
   ↓
Types
```

**Verificar:**
- [ ] Atoms no dependen de molecules/organisms
- [ ] Utils no dependen de componentes
- [ ] Services no dependen de componentes
- [ ] Sin dependencias circulares
- [ ] Imports siguiendo la jerarquía

## Script de Verificación

```bash
#!/bin/bash
# check-architecture.sh

echo "🔍 Verificando arquitectura del proyecto..."

# 1. Verificar estructura de carpetas
echo "\n📁 Estructura de Carpetas:"
tree src/ -L 2 -I 'node_modules'

# 2. Verificar dependencias circulares
echo "\n🔄 Verificando dependencias circulares:"
npx madge --circular --extensions ts,tsx src/

# 3. Verificar imports
echo "\n📦 Verificando imports:"
npx eslint src/ --ext .ts,.tsx --rule 'import/no-cycle: error'

# 4. Verificar organización de componentes
echo "\n🧩 Verificando organización de componentes:"
if [ -d "src/components/atoms" ] && \
   [ -d "src/components/molecules" ] && \
   [ -d "src/components/organisms" ]; then
  echo "✅ Diseño Atómico implementado"
else
  echo "❌ Diseño Atómico faltante"
fi

# 5. Verificar características
echo "\n🎯 Verificando características:"
for feature in src/features/*/; do
  feature_name=$(basename "$feature")
  echo "\nCaracterística: $feature_name"

  [ -d "$feature/components" ] && echo "  ✅ components/" || echo "  ❌ components/ faltante"
  [ -d "$feature/hooks" ] && echo "  ✅ hooks/" || echo "  ⚠️  hooks/ faltante"
  [ -f "$feature/index.ts" ] && echo "  ✅ index.ts" || echo "  ❌ index.ts faltante"
done

# 6. Verificar tamaños de archivos
echo "\n📏 Archivos grandes (>300 líneas):"
find src/ -name "*.tsx" -o -name "*.ts" | \
  xargs wc -l | \
  awk '$1 > 300 {print $0}'

echo "\n✅ Verificación completada!"
```

## Herramientas de Análisis

### 1. Madge - Análisis de Dependencias

```bash
# Instalar
npm install -D madge

# Analizar dependencias circulares
npx madge --circular src/

# Generar gráfico de dependencias
npx madge --image graph.svg src/

# Verificar estructura
npx madge --json src/ > dependencies.json
```

### 2. Dependency Cruiser

```bash
# Instalar
npm install -D dependency-cruiser

# Inicializar configuración
npx depcruise --init

# Verificar reglas
npx depcruise src/ --validate
```

### Configuración (.dependency-cruiser.js):
```javascript
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: { orphan: true },
      to: {}
    },
    {
      name: 'atoms-no-molecules',
      severity: 'error',
      from: { path: 'components/atoms' },
      to: { path: 'components/(molecules|organisms)' }
    }
  ]
};
```

### 3. ESLint Import Rules

```javascript
// .eslintrc.cjs
module.exports = {
  rules: {
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-relative-parent-imports': 'warn',
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'pathGroups': [
        {
          'pattern': '@/**',
          'group': 'internal'
        }
      ]
    }]
  }
};
```

## Problemas Comunes

### 1. Componentes Monolíticos

**❌ Problema:**
```typescript
// UserDashboard.tsx (800 líneas)
export const UserDashboard = () => {
  // Demasiada lógica y UI en un componente
  return (/* 500 líneas de JSX */);
};
```

**✅ Solución:**
```typescript
// UserDashboard.tsx (50 líneas)
export const UserDashboard = () => {
  return (
    <DashboardLayout>
      <UserStats />
      <UserActivity />
      <UserSettings />
    </DashboardLayout>
  );
};

// Componentes separados
// UserStats.tsx
// UserActivity.tsx
// UserSettings.tsx
```

### 2. Props Drilling

**❌ Problema:**
```typescript
<App>
  <Layout theme={theme}>
    <Content theme={theme}>
      <Sidebar theme={theme}>
        <Menu theme={theme} />
      </Sidebar>
    </Content>
  </Layout>
</App>
```

**✅ Solución (Context):**
```typescript
// ThemeContext.tsx
const ThemeContext = createContext<Theme>('light');

// App.tsx
<ThemeProvider value={theme}>
  <Layout>
    <Content>
      <Sidebar>
        <Menu />
      </Sidebar>
    </Content>
  </Layout>
</ThemeProvider>

// Menu.tsx
const theme = useContext(ThemeContext);
```

### 3. Dependencias Circulares

**❌ Problema:**
```typescript
// UserService.ts
import { formatUser } from './userUtils';

// userUtils.ts
import { UserService } from './UserService';
```

**✅ Solución:**
```typescript
// Extraer a archivo separado o reorganizar
// types/user.types.ts
export interface User { ... }

// utils/userUtils.ts
import type { User } from '@/types/user.types';

// services/user.service.ts
import type { User } from '@/types/user.types';
```

## Métricas de Calidad

### Objetivos
- [ ] Componentes <300 líneas cada uno
- [ ] Características independientes (cohesión alta, acoplamiento bajo)
- [ ] Cero dependencias circulares
- [ ] Props drilling máximo 2 niveles
- [ ] 100% de features con estructura estándar
- [ ] Diseño Atómico aplicado consistentemente

## Recursos

- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Madge](https://github.com/pahen/madge)
- [Dependency Cruiser](https://github.com/sverweij/dependency-cruiser)

---

**Objetivo**: Arquitectura mantenible, escalable y testeable

**Frecuencia**: Verificar mensualmente o en refactorizaciones mayores

**Versión**: 1.0
**Última actualización**: 2025-12-03
