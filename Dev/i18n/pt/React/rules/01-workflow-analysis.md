# Fluxo de Trabalho de Análise Pré-Desenvolvimento

## Princípio Fundamental

**REGRA DE OURO**: Antes de escrever uma única linha de código, uma fase de análise completa é OBRIGATÓRIA. Esta fase permite compreender o contexto, as implicações e as melhores abordagens para resolver o problema.

## Fase 1: Compreensão da Necessidade

### 1.1 Análise da Solicitação

**Perguntas a fazer**:

1. **Qual é o objetivo real**?
   - Qual valor de negócio está sendo entregue?
   - Quem são os usuários finais?
   - Qual problema estamos resolvendo?

2. **Qual é o escopo**?
   - Quais são as funcionalidades exatas solicitadas?
   - Existem dependências com outras funcionalidades?
   - Quais são os limites do escopo?

3. **Quais são as restrições**?
   - Restrições técnicas (desempenho, compatibilidade)
   - Restrições de negócio (regras de negócio)
   - Restrições de tempo (prazos)

### 1.2 Documentação da Compreensão

Criar um documento de análise contendo:

```markdown
# Análise da Solicitação: [TÍTULO]

## Contexto
[Descrição do contexto de negócio]

## Objetivo
[Objetivo principal e objetivos secundários]

## Usuários Afetados
- Persona 1: [Descrição]
- Persona 2: [Descrição]

## Funcionalidades Esperadas
1. [Funcionalidade 1]
   - Critério de aceitação 1
   - Critério de aceitação 2
2. [Funcionalidade 2]
   - ...

## Restrições
- Técnicas: [Lista]
- Negócio: [Lista]
- Tempo: [Prazo]

## Fora do Escopo
[O que não está incluído nesta solicitação]
```

## Fase 2: Análise Técnica

### 2.1 Auditoria do Código Existente

**Passos obrigatórios**:

1. **Buscar código similar**
   ```bash
   # Buscar componentes ou hooks similares
   grep -r "similar-pattern" src/

   # Identificar componentes reutilizáveis
   find src/components -name "*.tsx"
   ```

2. **Análise de dependências**
   - Quais componentes serão afetados?
   - Quais hooks existentes podem ser reutilizados?
   - Quais APIs já estão disponíveis?

3. **Identificação de padrões**
   - Qual padrão arquitetural é usado?
   - Como funcionalidades similares são implementadas?
   - Quais convenções estão em vigor?

### 2.2 Análise da Arquitetura

**Verificações a realizar**:

```typescript
// 1. Estrutura de funcionalidade
// Verificar estrutura existente
src/features/
  └── existing-feature/
      ├── components/
      ├── hooks/
      ├── services/
      ├── types/
      └── utils/

// 2. Gerenciamento de Estado
// Identificar a solução usada
- React Query para dados do servidor?
- Zustand para estado global?
- Context API para estado compartilhado?

// 3. Roteamento
// Compreender estrutura de rotas
- React Router?
- Next.js App Router?
- TanStack Router?

// 4. Estilização
// Identificar a solução de estilização
- Tailwind CSS?
- CSS Modules?
- styled-components?
```

### 2.3 Análise de Impacto

**Matriz de impacto**:

| Componente/Módulo | Impacto | Risco | Ação Necessária |
|-------------------|---------|-------|----------------|
| Componente A | Modificação | Médio | Testes a atualizar |
| Hook B | Nenhum | Baixo | - |
| Serviço C | Criação | Baixo | Novos testes |
| Tipo D | Extensão | Médio | Verificar compatibilidade |

## Fase 3: Design da Solução

### 3.1 Escolhas Arquiteturais

**Decisões a tomar**:

1. **Estrutura de componente**
   ```typescript
   // Opção 1: Componente único com lógica integrada
   export const FeatureComponent: FC = () => {
     // Lógica + UI
   };

   // Opção 2: Separação Container/Presenter
   export const FeatureContainer: FC = () => {
     // Somente lógica
     return <FeaturePresenter {...props} />;
   };

   export const FeaturePresenter: FC<Props> = (props) => {
     // Somente UI
   };

   // Opção 3: Composição com hooks
   export const FeatureComponent: FC = () => {
     const logic = useFeatureLogic();
     return <FeatureUI {...logic} />;
   };
   ```

2. **Gerenciamento de estado**
   ```typescript
   // Opção 1: Estado local
   const [state, setState] = useState();

   // Opção 2: Estado global (Zustand)
   const state = useFeatureStore(state => state.value);

   // Opção 3: Estado do servidor (React Query)
   const { data, isLoading } = useQuery({
     queryKey: ['feature'],
     queryFn: fetchFeature
   });

   // Opção 4: Context API
   const context = useFeatureContext();
   ```

3. **Comunicação com API**
   ```typescript
   // Opção 1: React Query
   const mutation = useMutation({
     mutationFn: updateFeature,
     onSuccess: () => queryClient.invalidateQueries(['feature'])
   });

   // Opção 2: Serviço personalizado
   const featureService = useFeatureService();
   await featureService.update(data);
   ```

### 3.2 Design de Interface

**Tipos e Interfaces**:

```typescript
// 1. Definir tipos de negócio
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}

// 2. Definir props de componente
interface FeatureComponentProps {
  userId: string;
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  className?: string;
}

// 3. Definir retornos de hook
interface UseFeatureReturn {
  data: User | null;
  isLoading: boolean;
  error: Error | null;
  updateUser: (data: Partial<User>) => Promise<void>;
  deleteUser: () => Promise<void>;
}

// 4. Definir serviços
interface FeatureService {
  getUser: (id: string) => Promise<User>;
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
}
```

### 3.3 Plano de Teste

**Estratégia de teste**:

```typescript
// 1. Testes unitários de componente
describe('FeatureComponent', () => {
  it('should render loading state', () => {});
  it('should render data when loaded', () => {});
  it('should handle errors', () => {});
  it('should call callbacks on success', () => {});
});

// 2. Testes de hook
describe('useFeature', () => {
  it('should fetch data on mount', () => {});
  it('should handle mutations', () => {});
  it('should update cache on success', () => {});
});

// 3. Testes de integração
describe('Feature Integration', () => {
  it('should complete full user flow', () => {});
  it('should handle API errors gracefully', () => {});
});

// 4. Testes E2E
describe('Feature E2E', () => {
  it('should complete full user journey', () => {});
});
```

## Fase 4: Planejamento

### 4.1 Decomposição de Tarefas

**Decomposição fina**:

```markdown
# Epic: [Funcionalidade Principal]

## História 1: [Sub-funcionalidade 1]
- [ ] Tarefa 1.1: Criar tipos TypeScript
- [ ] Tarefa 1.2: Criar serviço de API
- [ ] Tarefa 1.3: Criar hook personalizado
- [ ] Tarefa 1.4: Escrever testes de hook
- [ ] Tarefa 1.5: Criar componente de UI
- [ ] Tarefa 1.6: Escrever testes de componente
- [ ] Tarefa 1.7: Integrar na funcionalidade

## História 2: [Sub-funcionalidade 2]
- [ ] Tarefa 2.1: ...
```

### 4.2 Estimativa de Esforço

**Pontos de complexidade**:

| Tarefa | Complexidade | Tempo Estimado | Dependências |
|--------|-------------|---------------|-------------|
| Criar tipos | 1 | 30min | - |
| Serviço de API | 2 | 1h | Tipos |
| Hook personalizado | 3 | 2h | Serviço |
| Testes de hook | 2 | 1h | Hook |
| Componente de UI | 5 | 3h | Hook |
| Testes de componente | 3 | 1.5h | Componente |
| Integração | 2 | 1h | Todos |
| **TOTAL** | **18** | **10h** | - |

### 4.3 Identificação de Riscos

**Análise de riscos**:

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| API indisponível | Baixa | Alto | Usar MSW para simulação |
| Mudança de especificação | Média | Médio | Design flexível |
| Desempenho | Baixa | Alto | Otimização com memo/useMemo |
| Regressão | Média | Alto | Testes exaustivos |

## Fase 5: Validação Pré-Codificação

### 5.1 Checklist de Validação

**Verificações obrigatórias**:

- [ ] A necessidade está claramente compreendida e documentada
- [ ] Os critérios de aceitação estão definidos
- [ ] A arquitetura existente foi analisada
- [ ] Os padrões do projeto são identificados
- [ ] A solução técnica está projetada
- [ ] Os tipos TypeScript estão definidos
- [ ] O plano de teste está estabelecido
- [ ] As tarefas estão decompostas e estimadas
- [ ] Os riscos são identificados
- [ ] As dependências são gerenciadas
- [ ] O código existente reutilizável é identificado
- [ ] Os impactos no código existente são analisados

### 5.2 Revisão da Análise

**Pontos a validar com a equipe**:

1. **Validação técnica**
   - A abordagem escolhida é a correta?
   - Existem alternativas melhores?
   - Os padrões usados são consistentes?

2. **Validação de negócio**
   - A solução atende à necessidade?
   - Os casos extremos estão cobertos?
   - A UX é ótima?

3. **Validação de qualidade**
   - Os testes são suficientes?
   - O desempenho é levado em conta?
   - A segurança é garantida?

## Fase 6: Documentação da Análise

### 6.1 Template de Análise Técnica

```markdown
# Análise Técnica: [NOME_DA_FUNCIONALIDADE]

## 1. Resumo
[Breve descrição da funcionalidade]

## 2. Análise da Necessidade
### 2.1 Contexto
[Contexto de negócio]

### 2.2 Objetivos
- Objetivo principal: [...]
- Objetivos secundários: [...]

### 2.3 Critérios de Aceitação
1. [Critério 1]
2. [Critério 2]

## 3. Solução Técnica
### 3.1 Arquitetura
[Diagrama ou descrição da arquitetura]

### 3.2 Componentes
- **FeatureComponent**: Componente principal
- **useFeature**: Hook de gerenciamento de lógica
- **featureService**: Serviço de API

### 3.3 Tipos TypeScript
```typescript
// Tipos principais
```

### 3.4 Fluxo de Dados
[Descrição do fluxo]

## 4. Impactos
### 4.1 Código Existente
- Componentes modificados: [Lista]
- Novos arquivos: [Lista]

### 4.2 Testes
- Testes a criar: [Lista]
- Testes a modificar: [Lista]

## 5. Plano de Implementação
### 5.1 Tarefas
1. [Tarefa 1]
2. [Tarefa 2]

### 5.2 Estimativa
- Tempo total: [X horas]
- Complexidade: [Baixa/Média/Alta]

## 6. Riscos e Mitigação
| Risco | Mitigação |
|-------|-----------|
| [Risco 1] | [Solução] |

## 7. Alternativas Consideradas
### Alternativa 1
- Vantagens: [...]
- Desvantagens: [...]
- Razão da rejeição: [...]

## 8. Decisões Tomadas
1. [Decisão 1]: [Justificativa]
2. [Decisão 2]: [Justificativa]
```

## Ferramentas de Análise

### Ferramentas de Busca

```bash
# Buscar padrões similares
grep -r "useQuery" src/features/
grep -r "useMutation" src/features/

# Analisar importações
grep -r "import.*from '@/components" src/

# Encontrar componentes
find src -name "*.tsx" -type f

# Analisar tipos
grep -r "interface.*Props" src/

# Verificar testes
find src -name "*.test.tsx" -type f
```

### Ferramentas de Visualização

```typescript
// Analisar estrutura com ts-morph
import { Project } from "ts-morph";

const project = new Project();
project.addSourceFilesAtPaths("src/**/*.tsx");

// Analisar dependências
const sourceFile = project.getSourceFile("Component.tsx");
const imports = sourceFile?.getImportDeclarations();
```

## Anti-Padrões a Evitar

### O que NÃO fazer

1. **Começar a codificar sem análise**
   ```typescript
   // ERRADO
   // Começar diretamente sem entender o código existente
   export const NewFeature = () => {
     // Código escrito sem análise prévia
   };
   ```

2. **Ignorar código existente**
   ```typescript
   // ERRADO
   // Criar um novo hook quando um similar já existe
   const useNewFeature = () => {
     // Duplicação de useExistingFeature
   };
   ```

3. **Não documentar decisões**
   ```typescript
   // ERRADO
   // Escolher uma abordagem sem documentar o porquê
   ```

4. **Subestimar a complexidade**
   ```markdown
   ERRADO
   Tarefa: Adicionar a funcionalidade
   Tempo: 1h
   (Sem decomposição ou análise)
   ```

### O que FAZER

1. **Analisar antes de codificar**
   ```typescript
   // BOM
   // 1. Analisar existente
   // 2. Compreender padrões
   // 3. Projetar solução
   // 4. Documentar decisões
   // 5. Codificar com confiança
   ```

2. **Reutilizar e estender**
   ```typescript
   // BOM
   // Estender um hook existente
   const useEnhancedFeature = () => {
     const baseFeature = useExistingFeature();
     // Adicionar lógica específica
     return { ...baseFeature, newLogic };
   };
   ```

3. **Documentar sistematicamente**
   ```typescript
   /**
    * Hook personalizado para gerenciar funcionalidade X
    *
    * @remarks
    * Este hook foi criado para centralizar lógica X porque:
    * - Razão 1
    * - Razão 2
    *
    * @example
    * ```tsx
    * const { data, update } = useFeature();
    * ```
    */
   ```

4. **Decomposição fina**
   ```markdown
   BOM
   Epic: Funcionalidade X
   - História 1: Tipos e interfaces (30min)
   - História 2: Serviço de API (1h)
   - História 3: Hook personalizado (2h)
   - História 4: Testes (1.5h)
   - História 5: UI (3h)
   ```

## Exemplos Concretos

### Exemplo 1: Adicionar um Formulário de Login

```markdown
# Análise: Formulário de Login

## 1. Auditoria do Código Existente
- Formulário de registro existe (src/features/auth/components/RegisterForm.tsx)
- Hook useAuth existe (src/hooks/useAuth.ts)
- authService existe (src/services/auth.service.ts)
- Validação Zod é usada no projeto

## 2. Decisões Arquiteturais
- Reutilizar o padrão do RegisterForm
- Usar Zod para validação
- Usar React Hook Form para gerenciamento de formulário
- Usar hook useAuth existente

## 3. Plano de Implementação
1. Criar schema Zod (types/auth.schema.ts)
2. Criar componente LoginForm (features/auth/components/LoginForm.tsx)
3. Adicionar testes (LoginForm.test.tsx)
4. Integrar na LoginPage
5. Testar fluxo completo

## 4. Código Reutilizado
- Hook useAuth
- authService.login()
- Componente FormInput
- Componente Button
```

### Exemplo 2: Painel do Usuário

```markdown
# Análise: Painel do Usuário

## 1. Auditoria do Código Existente
- Hook useUser existe
- Nenhum componente Dashboard
- React Query usado para cache
- Recharts usado para gráficos

## 2. Arquitetura Proposta
```
features/dashboard/
├── components/
│   ├── DashboardLayout.tsx       # Layout principal
│   ├── StatsCard.tsx             # Cartão de estatísticas
│   ├── UserChart.tsx             # Gráfico de usuários
│   └── ActivityFeed.tsx          # Feed de atividades
├── hooks/
│   ├── useDashboardData.ts       # Lógica de busca de dados
│   └── useStatsCalculation.ts    # Cálculos estatísticos
├── types/
│   └── dashboard.types.ts        # Tipos TypeScript
└── utils/
    └── statsHelpers.ts           # Utilitários
```

## 3. Tipos a Criar
```typescript
interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

interface ActivityItem {
  id: string;
  type: 'login' | 'purchase' | 'update';
  timestamp: Date;
  user: User;
}
```

## 4. Estimativa
- Total: 12h
- Complexidade: Média-Alta
```

## Conclusão

A análise prévia é **NÃO NEGOCIÁVEL**. Ela permite:

1. Economizar tempo a longo prazo
2. Evitar reescritas
3. Manter consistência do código
4. Reduzir bugs
5. Facilitar revisões
6. Melhorar a manutenibilidade

**Tempo de análise recomendado**: 20-30% do tempo total do projeto

**Lema**: "Uma hora de análise economiza dez horas de desenvolvimento"
