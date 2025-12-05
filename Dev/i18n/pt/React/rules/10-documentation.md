# Padroes de Documentacao

## Documentacao de Codigo

### JSDoc / TSDoc para TypeScript

#### Documentando Funcoes

```typescript
/**
 * Calcula o total de um pedido incluindo impostos e frete.
 *
 * @param items - Lista de itens do pedido
 * @param taxRate - Taxa de imposto (padrao 0.20 para 20%)
 * @param shippingCost - Custos de frete opcionais
 *
 * @returns O valor total do pedido
 *
 * @throws {ValidationError} Se o array de itens estiver vazio
 * @throws {RangeError} Se a taxa de imposto for negativa
 *
 * @example
 * ```typescript
 * const items = [
 *   { name: 'Produto 1', price: 10, quantity: 2 },
 *   { name: 'Produto 2', price: 15, quantity: 1 }
 * ];
 *
 * const total = calculateOrderTotal(items, 0.20, 5);
 * // Retorna: 47 (20 + 15 + imposto 7 + frete 5)
 * ```
 *
 * @see {@link https://docs.exemplo.com/pricing | Documentacao de Precos}
 */
export function calculateOrderTotal(
  items: OrderItem[],
  taxRate: number = 0.20,
  shippingCost?: number
): number {
  if (items.length === 0) {
    throw new ValidationError('Array de itens nao pode estar vazio');
  }

  if (taxRate < 0) {
    throw new RangeError('Taxa de imposto nao pode ser negativa');
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

#### Documentando Interfaces e Tipos

```typescript
/**
 * Representa um item de pedido.
 *
 * @interface OrderItem
 */
export interface OrderItem {
  /**
   * Identificador unico do item
   * @example "prod_123abc"
   */
  id: string;

  /**
   * Nome do produto
   * @example "MacBook Pro 14\""
   */
  name: string;

  /**
   * Preco unitario em reais
   * @minimum 0
   * @example 1999.99
   */
  price: number;

  /**
   * Quantidade pedida
   * @minimum 1
   * @example 2
   */
  quantity: number;

  /**
   * Categoria do produto (opcional)
   * @example "eletronicos"
   */
  category?: ProductCategory;
}

/**
 * Categorias de produtos disponiveis
 *
 * @enum {string}
 */
export enum ProductCategory {
  /** Produtos eletronicos */
  ELECTRONICS = 'eletronicos',

  /** Roupas e acessorios */
  CLOTHING = 'roupas',

  /** Livros e midias */
  BOOKS = 'livros',

  /** Artigos para o lar */
  HOME = 'casa'
}

/**
 * Opcoes de configuracao para calculo de pedido
 *
 * @typedef {Object} OrderCalculationOptions
 * @property {number} [taxRate=0.20] - Taxa de imposto aplicada
 * @property {number} [shippingCost] - Custos de frete fixos
 * @property {boolean} [includeTax=true] - Incluir imposto no calculo
 * @property {DiscountCode} [discountCode] - Codigo promocional opcional
 */
export type OrderCalculationOptions = {
  taxRate?: number;
  shippingCost?: number;
  includeTax?: boolean;
  discountCode?: DiscountCode;
};
```

#### Documentando Componentes React

```typescript
/**
 * Componente de cartao de usuario exibindo informacoes principais.
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
  // Implementacao
};

/**
 * Props para o componente UserCard
 *
 * @interface UserCardProps
 */
export interface UserCardProps {
  /**
   * Dados do usuario a exibir
   */
  user: User;

  /**
   * Callback chamado quando "Editar" e clicado
   * @param user - O usuario a ser editado
   */
  onEdit?: (user: User) => void;

  /**
   * Callback chamado quando "Excluir" e clicado
   * @param userId - O ID do usuario a ser excluido
   */
  onDelete?: (userId: string) => void;

  /**
   * Mostrar ou ocultar botoes de acao
   * @default false
   */
  showActions?: boolean;

  /**
   * Classes CSS adicionais
   */
  className?: string;
}
```

#### Documentando Hooks Personalizados

```typescript
/**
 * Hook personalizado para gerenciar autenticacao de usuario.
 *
 * Lida com login, logout e estado de autenticacao.
 * Usa React Query para cache e sincronizacao.
 *
 * @hook
 *
 * @returns {UseAuthReturn} Objeto contendo estado e metodos de autenticacao
 *
 * @throws {AuthError} Se as credenciais forem invalidas
 * @throws {NetworkError} Se a conexao de rede falhar
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { user, login, logout, isAuthenticated, isLoading } = useAuth();
 *
 *   const handleLogin = async () => {
 *     try {
 *       await login({ email: 'usuario@exemplo.com', password: 'senha123' });
 *       navigate('/dashboard');
 *     } catch (error) {
 *       console.error('Login falhou:', error);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       {isAuthenticated ? (
 *         <button onClick={logout}>Sair</button>
 *       ) : (
 *         <button onClick={handleLogin}>Entrar</button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link AuthService} para implementacao do servico
 * @see {@link https://docs.exemplo.com/auth | Documentacao de Autenticacao}
 */
export const useAuth = (): UseAuthReturn => {
  // Implementacao
};

/**
 * Valor de retorno do hook useAuth
 *
 * @interface UseAuthReturn
 */
export interface UseAuthReturn {
  /**
   * Usuario atualmente logado (null se nao logado)
   */
  user: User | null;

  /**
   * Indica se o usuario esta autenticado
   */
  isAuthenticated: boolean;

  /**
   * Indica se uma operacao de autenticacao esta em andamento
   */
  isLoading: boolean;

  /**
   * Possivel erro de autenticacao
   */
  error: Error | null;

  /**
   * Fazer login com email e senha
   *
   * @param credentials - Email e senha
   * @returns Promise resolvida com o usuario logado
   */
  login: (credentials: LoginCredentials) => Promise<User>;

  /**
   * Fazer logout
   *
   * @returns Promise resolvida quando o logout estiver completo
   */
  logout: () => Promise<void>;

  /**
   * Atualizar token de autenticacao
   *
   * @returns Promise resolvida com o novo token
   */
  refreshToken: () => Promise<string>;
}
```

### Comentarios de Codigo

#### Quando Comentar

```typescript
// ✅ BOM - Explicar o "por que"
// Usamos requestAnimationFrame para evitar layout thrashing
// que causaria travamentos em animacoes complexas
const optimizedScroll = () => {
  requestAnimationFrame(() => {
    updateScrollPosition();
  });
};

// ✅ BOM - Workaround ou solucao nao-obvia
// HACK: Safari nao suporta scrollTo com behavior: 'smooth'
// Usar solucao alternativa para Safari
if (isSafari) {
  window.scrollTo(0, targetPosition);
} else {
  window.scrollTo({ top: targetPosition, behavior: 'smooth' });
}

// ✅ BOM - TODO com contexto
// TODO(joao): Implementar paginacao server-side
// Atualmente limitado a 100 itens, refatorar quando tivermos API v2
// Ticket: #USER-456

// ✅ BOM - Complexidade algoritmica
// Complexidade de tempo: O(n log n) - ordenacao necessaria para busca binaria
// Complexidade de espaco: O(n) - copia de array para evitar mutacao

// ❌ RUIM - Comentario obvio
// Incrementa o contador em 1
counter++;

// ❌ RUIM - Codigo comentado (deletar em vez disso)
// const oldFunction = () => {
//   // codigo antigo...
// };
```

#### Tipos de Comentarios Uteis

```typescript
// ========== Secoes ==========
// Use para separar partes logicas

// ========== Configuracao ==========
const API_BASE_URL = 'https://api.exemplo.com';
const TIMEOUT = 30000;

// ========== Gerenciamento de Estado ==========
const [users, setUsers] = useState<User[]>([]);
const [isLoading, setIsLoading] = useState(false);

// ========== Efeitos ==========
useEffect(() => {
  fetchUsers();
}, []);

// ---------- Sub-secoes ----------
// Use para sub-partes

// AVISO: Nao modifique este valor sem consultar a equipe de backend
// Esta sincronizado com a configuracao do servidor
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// NOTA: Esta funcao e temporaria e sera substituida pela API v2
function getLegacyData() {
  // ...
}

// FIXME: Esta validacao nao esta correta para emails internacionais
// Veja https://github.com/projeto/issues/123
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## README.md do Projeto

### Estrutura Recomendada

```markdown
# Nome do Projeto

![Build Status](https://img.shields.io/github/workflow/status/usuario/repo/CI)
![Coverage](https://img.shields.io/codecov/c/github/usuario/repo)
![License](https://img.shields.io/github/license/usuario/repo)

Breve descricao do projeto (1-2 frases).

## Indice

- [Visao Geral](#visao-geral)
- [Funcionalidades](#funcionalidades)
- [Pre-requisitos](#pre-requisitos)
- [Instalacao](#instalacao)
- [Configuracao](#configuracao)
- [Uso](#uso)
- [Scripts Disponiveis](#scripts-disponiveis)
- [Arquitetura](#arquitetura)
- [Testes](#testes)
- [Deployment](#deployment)
- [Contribuindo](#contribuindo)
- [Licenca](#licenca)

## Visao Geral

Descricao detalhada do projeto, seu proposito e contexto.

### Tecnologias Usadas

- React 18.3
- TypeScript 5.4
- Vite 5.2
- TanStack Query v5
- React Router v6
- Tailwind CSS 3.4
- Vitest
- Playwright

## Funcionalidades

- ✅ Autenticacao com JWT
- ✅ Gerenciamento de usuarios (CRUD)
- ✅ Dashboard com estatisticas
- ✅ Tema claro/escuro
- ✅ Design responsivo
- ✅ Testes unitarios e E2E
- ✅ CI/CD com GitHub Actions

## Pre-requisitos

- Node.js >= 20.0.0
- pnpm >= 8.0.0 (ou npm >= 9.0.0)
- Git

## Instalacao

```bash
# Clonar o repositorio
git clone https://github.com/usuario/projeto.git
cd projeto

# Instalar dependencias
pnpm install

# Copiar arquivo de ambiente
cp .env.example .env.local

# Configurar variaveis de ambiente
# Edite .env.local com seus valores
```

## Configuracao

### Variaveis de Ambiente

```env
# API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=30000

# Autenticacao
VITE_AUTH_DOMAIN=auth.exemplo.com
VITE_AUTH_CLIENT_ID=seu-client-id

# Funcionalidades
VITE_FEATURE_NEW_DASHBOARD=true
VITE_FEATURE_ANALYTICS=false

# Analytics (opcional)
VITE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Configuracao Adicional

Veja [docs/configuration.md](docs/configuration.md) para mais detalhes.

## Uso

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Acessivel em http://localhost:3000
```

### Build

```bash
# Build para producao
pnpm build

# Visualizar o build
pnpm preview
```

### Docker

```bash
# Construir a imagem
docker build -t meu-app .

# Executar o container
docker run -p 3000:80 meu-app

# Ou usar docker-compose
docker-compose up
```

## Scripts Disponiveis

```bash
pnpm dev          # Servidor de desenvolvimento
pnpm build        # Build de producao
pnpm preview      # Visualizar build

pnpm test         # Testes unitarios
pnpm test:e2e     # Testes E2E
pnpm test:coverage # Cobertura

pnpm lint         # Linter
pnpm lint:fix     # Corrigir linting
pnpm format       # Formatar codigo
pnpm type-check   # Verificar tipos

pnpm quality      # Linter + Tipos + Testes
```

## Arquitetura

```
src/
├── components/        # Componentes reutilizaveis
│   ├── atoms/
│   ├── molecules/
│   └── organisms/
├── features/         # Funcionalidades de negocio
│   ├── auth/
│   ├── users/
│   └── dashboard/
├── hooks/            # Hooks personalizados
├── services/         # Servicos de API
├── utils/            # Utilitarios
├── types/            # Tipos TypeScript
└── config/           # Configuracao

```

Veja [docs/architecture.md](docs/architecture.md) para mais detalhes.

## Testes

### Testes Unitarios

```bash
# Executar todos os testes
pnpm test

# Modo watch
pnpm test:watch

# Cobertura
pnpm test:coverage
```

### Testes E2E

```bash
# Executar testes E2E
pnpm test:e2e

# Modo UI
pnpm test:e2e:ui
```

## Deployment

### Vercel

```bash
# Instalar CLI Vercel
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
pnpm build

# A pasta dist/ esta pronta para deployment
```

### Docker

```bash
# Build e push
docker build -t registry.exemplo.com/meu-app:latest .
docker push registry.exemplo.com/meu-app:latest
```

Veja [docs/deployment.md](docs/deployment.md) para mais detalhes.

## Contribuindo

Contribuicoes sao bem-vindas! Por favor, leia [CONTRIBUTING.md](CONTRIBUTING.md).

### Workflow

1. Fork do projeto
2. Crie uma branch (`git checkout -b feature/funcionalidade-incrivel`)
3. Commit (`git commit -m 'feat: adicionar funcionalidade incrivel'`)
4. Push (`git push origin feature/funcionalidade-incrivel`)
5. Abra um Pull Request

### Padroes

- Siga [Conventional Commits](https://www.conventionalcommits.org/)
- Escreva testes para novas funcionalidades
- Mantenha cobertura > 80%
- Respeite regras de ESLint e Prettier

## Licenca

Este projeto esta licenciado sob a Licenca MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## Contato

- Autor: Seu Nome
- Email: seu.email@exemplo.com
- GitHub: [@seuusuario](https://github.com/seuusuario)

## Agradecimentos

- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [TanStack Query](https://tanstack.com/query)
```

## Storybook - Documentacao de Componentes

### Instalacao

```bash
npx storybook@latest init
```

### Exemplo de Story

```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * O componente Button e usado para acionar acoes.
 * Suporta diferentes variantes, tamanhos e estados.
 */
const meta = {
  title: 'Components/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Um botao personalizavel com multiplas variantes e tamanhos.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
      description: 'A variante visual do botao'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'O tamanho do botao'
    },
    disabled: {
      control: 'boolean',
      description: 'Desabilitar o botao'
    },
    isLoading: {
      control: 'boolean',
      description: 'Mostrar um estado de carregamento'
    }
  }
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Botao primario por padrao
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Botao Primario'
  }
};

/**
 * Botao secundario
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Botao Secundario'
  }
};

/**
 * Botao outline
 */
export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Botao Outline'
  }
};

/**
 * Botao de perigo
 */
export const Danger: Story = {
  args: {
    variant: 'danger',
    children: 'Excluir'
  }
};

/**
 * Botao desabilitado
 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: 'Botao Desabilitado'
  }
};

/**
 * Botao em carregamento
 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    isLoading: true,
    children: 'Carregando...'
  }
};

/**
 * Diferentes tamanhos
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Pequeno</Button>
      <Button size="md">Medio</Button>
      <Button size="lg">Grande</Button>
    </div>
  )
};

/**
 * Todas as variantes
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primario</Button>
      <Button variant="secondary">Secundario</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="danger">Perigo</Button>
    </div>
  )
};
```

## Documentacao Tecnica

### docs/architecture.md

```markdown
# Arquitetura

## Visao Geral

A aplicacao segue uma arquitetura baseada em funcionalidades (feature-based) organizada segundo o padrao Atomic Design.

## Principios

1. **Feature-Based**: Codigo organizado por funcionalidade de negocio
2. **Atomic Design**: Componentes hierarquicos (atoms, molecules, organisms)
3. **Separacao de Responsabilidades**: Logica separada da apresentacao
4. **Type Safety**: TypeScript strict habilitado

## Estrutura

[Detalhes da estrutura...]

## Fluxo de Dados

[Diagramas e explicacoes...]
```

### docs/api-reference.md

```markdown
# Referencia da API

## Endpoints

### Autenticacao

#### POST /api/auth/login

Autentica um usuario.

**Request:**

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**

```json
{
  "user": {
    "id": "123",
    "email": "usuario@exemplo.com",
    "name": "Joao Silva"
  },
  "token": "jwt-token-aqui"
}
```

[Mais detalhes...]
```

### docs/deployment.md

```markdown
# Deployment

## Pre-requisitos

- Node.js 20+
- Acesso aos servicos cloud (Vercel, AWS, etc.)

## Ambientes

### Desenvolvimento

[Configuracao...]

### Staging

[Configuracao...]

### Producao

[Configuracao...]
```

## Changelog

### CHANGELOG.md

```markdown
# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere a [Versionamento Semantico](https://semver.org/lang/pt-BR/).

## [Nao Lancado]

### Adicionado

- Suporte a modo escuro
- Edicao de perfil de usuario

### Alterado

- Melhorada performance da lista de usuarios

### Corrigido

- Problema de regex de validacao de email

## [1.2.0] - 2024-01-15

### Adicionado

- Autenticacao OAuth2
- Dashboard com analytics
- Exportacao de dados para CSV

### Alterado

- Atualizado React para v18.3
- Migrado para Vite 5

### Descontinuado

- Endpoints antigos da API (serao removidos na v2.0.0)

### Seguranca

- Corrigida vulnerabilidade XSS em input de usuario

## [1.1.0] - 2023-12-01

### Adicionado

- Operacoes CRUD de gerenciamento de usuarios
- Controle de acesso baseado em funcoes

### Corrigido

- Problema de redirecionamento de login
- Vazamento de memoria no componente DataTable

## [1.0.0] - 2023-11-01

### Adicionado

- Lancamento inicial
- Autenticacao de usuario
- Dashboard basico
- Lista de usuarios

[nao lancado]: https://github.com/usuario/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/usuario/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/usuario/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/usuario/repo/releases/tag/v1.0.0
```

## Conclusao

Boa documentacao permite:

1. ✅ **Onboarding**: Novos desenvolvedores produtivos rapidamente
2. ✅ **Manutencao**: Compreender codigo rapidamente
3. ✅ **Colaboracao**: Comunicacao clara entre equipes
4. ✅ **Qualidade**: Reduzir bugs e mal-entendidos
5. ✅ **Evolucao**: Facilitar mudancas futuras

**Regra de ouro**: Codigo se documenta (bons nomes), comentarios explicam o "por que", documentacao explica "como usar".
