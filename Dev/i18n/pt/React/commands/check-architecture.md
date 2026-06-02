---
description: Verificação de Conformidade Arquitetural
---

# Verificação de Conformidade Arquitetural

Verifique se o projeto segue os padrões arquiteturais estabelecidos e as melhores práticas.

## O Que Este Comando Faz

1. **Análise de Arquitetura**
   - Verificar a estrutura de pastas
   - Validar a separação de responsabilidades
   - Confirmar a organização dos componentes
   - Verificar as direções de dependência
   - Validar os padrões de design utilizados

2. **Pontos de Verificação**
   - Estrutura baseada em features
   - Hierarquia de componentes
   - Gerenciamento de estado
   - Separação da camada de API
   - Definições de tipos

3. **Relatório Gerado**
   - Violações arquiteturais
   - Recomendações
   - Oportunidades de refatoração
   - Pontuação de conformidade

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou exige investigação transversal.

## Arquitetura Esperada

### Estrutura de Pastas

```
src/
├── app/                    # Configuração da aplicação
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── features/              # Features (lógica de negócio)
│   └── users/
│       ├── components/    # Componentes específicos da feature
│       ├── hooks/         # Hooks específicos da feature
│       ├── services/      # Chamadas de API
│       ├── stores/        # Gerenciamento de estado
│       ├── types/         # Tipos TypeScript
│       └── utils/         # Funções utilitárias
│
├── components/            # Componentes compartilhados
│   ├── ui/               # Primitivas de UI (Button, Input)
│   ├── layout/           # Componentes de layout
│   └── common/           # Componentes comuns
│
├── hooks/                 # Hooks compartilhados
├── services/             # Serviços compartilhados
├── stores/               # Estado global
├── types/                # Tipos globais
├── utils/                # Funções utilitárias
├── constants/            # Constantes
└── config/               # Configuração
```

## O Que Verificar

### 1. Organização de Componentes

```typescript
// ❌ Ruim - Tudo em um único arquivo
src/components/UserList.tsx (1000 linhas)

// ✅ Bom - Organização adequada
src/features/users/
  ├── components/
  │   ├── UserList/
  │   │   ├── UserList.tsx
  │   │   ├── UserList.test.tsx
  │   │   ├── UserListItem.tsx
  │   │   └── index.ts
  │   └── UserForm/
  │       ├── UserForm.tsx
  │       └── UserForm.test.tsx
  ├── hooks/
  │   └── useUsers.ts
  └── services/
      └── user.service.ts
```

### 2. Separação de Responsabilidades

```typescript
// ❌ Ruim - Responsabilidades misturadas
export const UserList: FC = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
};

// ✅ Bom - Responsabilidades separadas
// hooks/useUsers.ts
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};

// services/user.service.ts
export const userService = {
  getAll: () => apiClient.get<User[]>('/users')
};

// components/UserList.tsx
export const UserList: FC = () => {
  const { data: users, isLoading } = useUsers();

  if (isLoading) return <Spinner />;

  return (
    <ul>
      {users?.map(user => (
        <UserListItem key={user.id} user={user} />
      ))}
    </ul>
  );
};
```

### 3. Direção das Dependências

```typescript
// ✅ Bom - As dependências fluem para dentro
features/users/
  └── components/     → Pode usar hooks/
      └── hooks/      → Pode usar services/
          └── services/ → Pode usar utils/

// ❌ Ruim - Dependências circulares
services/user.service.ts importa de components/
```

### 4. Tipos de Componentes

```typescript
// Componentes de Apresentação (apenas UI)
export const Button: FC<ButtonProps> = ({ children, ...props }) => {
  return <button {...props}>{children}</button>;
};

// Componentes Container (lógica)
export const UserListContainer: FC = () => {
  const { data: users } = useUsers();
  const deleteUser = useDeleteUser();

  return <UserListPresenter users={users} onDelete={deleteUser} />;
};

// Componentes de Página (roteamento)
export const UsersPage: FC = () => {
  return (
    <MainLayout>
      <PageHeader title="Usuários" />
      <UserListContainer />
    </MainLayout>
  );
};
```

### 5. Gerenciamento de Estado

```typescript
// ❌ Ruim - Estado em vários lugares
const [users, setUsers] = useState([]);
// Mesmos dados em 5 componentes diferentes

// ✅ Bom - Estado centralizado
// stores/userStore.ts
export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users })
}));

// Ou React Query para estado do servidor
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll()
  });
};
```

## Padrões Arquiteturais

### 1. Estrutura Baseada em Features

```
src/features/
├── auth/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── stores/
├── users/
└── products/
```

### 2. Camadas de Clean Architecture

```
Camada de Apresentação (Componentes)
    ↓
Camada de Lógica de Negócio (Hooks, Services)
    ↓
Camada de Dados (API, Store)
```

### 3. Design Atômico

```
src/components/
├── atoms/        # Button, Input, Label
├── molecules/    # FormField, SearchBar
├── organisms/    # UserForm, Header
├── templates/    # PageLayout, DashboardLayout
└── pages/        # HomePage, UsersPage
```

## Regras de Validação

### Regra 1: Sem Lógica de Negócio em Componentes

```typescript
// ❌ Ruim
export const UserForm: FC = () => {
  const [email, setEmail] = useState('');

  const validate = () => {
    return email.includes('@') && email.length > 5;
  };

  // ... lógica de validação complexa
};

// ✅ Bom
export const UserForm: FC = () => {
  const form = useForm({
    resolver: zodResolver(userSchema)
  });

  // Validação no schema, lógica no hook
};
```

### Regra 2: Chamadas de API Através de Serviços

```typescript
// ❌ Ruim - fetch direto no componente
const response = await fetch('/api/users');

// ✅ Bom - Através do serviço
const users = await userService.getAll();
```

### Regra 3: Tipos São Centralizados

```typescript
// ✅ Boa estrutura
src/features/users/types/
  ├── user.types.ts
  ├── dto.types.ts
  └── index.ts
```

## Verificações Automatizadas

### Regras ESLint para Arquitetura

```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": [
      "error",
      {
        "patterns": [
          {
            "group": ["../**/features/*"],
            "message": "Features não devem importar de outras features"
          },
          {
            "group": ["**/components/**/services/*"],
            "message": "Componentes não devem importar serviços diretamente"
          }
        ]
      }
    ]
  }
}
```

### Script Personalizado

```typescript
// scripts/check-architecture.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';

const checkImports = async () => {
  const files = await glob('src/**/*.{ts,tsx}');
  const violations = [];

  for (const file of files) {
    const content = await readFile(file, 'utf-8');

    // Verificar violações
    if (file.includes('/components/') && content.includes('fetch(')) {
      violations.push({
        file,
        rule: 'Sem chamadas diretas de API em componentes',
        line: content.split('\n').findIndex(l => l.includes('fetch('))
      });
    }
  }

  return violations;
};
```

## Melhores Práticas

1. **Isolamento de features**: Cada feature é autocontida
2. **Fronteiras claras**: Camadas de apresentação, lógica e dados
3. **Injeção de dependências**: Serviços através de hooks/context
4. **Segurança de tipos**: TypeScript em todo lugar
5. **Nomenclatura consistente**: Seguir as convenções
6. **Responsabilidade única**: Um componente, uma responsabilidade
7. **Composição sobre herança**: Usar composição
8. **Documentação**: Documentar as decisões arquiteturais

## Violações Comuns

### Violação 1: Componentes Deus

**Problema**: O componente faz coisas demais
**Solução**: Dividir em componentes menores

### Violação 2: Dependências Circulares

**Problema**: A importa B, B importa A
**Solução**: Extrair código comum ou repensar a estrutura

### Violação 3: Prop Drilling

**Problema**: Passar props por muitos níveis
**Solução**: Usar Context ou gerenciamento de estado

### Violação 4: Responsabilidades Misturadas

**Problema**: UI e lógica de negócio misturadas
**Solução**: Separar em apresentador (presenter) e container

## Ferramentas

- ESLint com regras personalizadas
- Dependency cruiser
- Madge (grafo de dependências)
- SonarQube
- Scripts personalizados

## Recursos

- [Melhores Práticas de Arquitetura React](https://react.dev/learn/thinking-in-react)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
