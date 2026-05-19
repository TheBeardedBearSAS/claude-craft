---
description: Verificar Arquitetura React Native
argument-hint: [arguments]
---

# Verificar Arquitetura React Native

## Argumentos

$ARGUMENTS

## Missão

Você é um especialista em auditoria de arquitetura React Native. Sua missão é analisar a conformidade arquitetural do projeto segundo os padrões definidos em `.claude/rules/02-architecture.md`.

### Etapa 1: Explorar a estrutura

1. Analisar a estrutura raiz do projeto
2. Identificar o tipo de arquitetura (Expo, React Native CLI, Expo Router)
3. Localizar as pastas principais: `src/`, `app/`, `components/`, etc.

### Etapa 2: Verificar a conformidade arquitetural

Realize as seguintes verificações e anote cada resultado:

#### 📁 Estrutura Baseada em Features (8 pontos)

- [ ] **(2 pts)** Estrutura por features/domínios (ex.: `src/features/auth/`, `src/features/profile/`)
- [ ] **(2 pts)** Cada feature contém seus próprios componentes, hooks e lógica
- [ ] **(2 pts)** Separação clara entre `features/` (negócio) e `shared/` (comum)
- [ ] **(2 pts)** Organização consistente em todas as features

#### 🗂️ Organização de Pastas (5 pontos)

- [ ] **(1 pt)** `components/` para componentes reutilizáveis
- [ ] **(1 pt)** `hooks/` para hooks customizados
- [ ] **(1 pt)** `services/` ou `api/` para chamadas de rede
- [ ] **(1 pt)** `utils/` ou `helpers/` para funções utilitárias
- [ ] **(1 pt)** `types/` ou `models/` para definições TypeScript

#### 🚦 Expo Router / Navegação (4 pontos)

- [ ] **(1 pt)** Pasta `app/` na raiz com estrutura de roteamento por arquivo
- [ ] **(1 pt)** Layouts definidos (`_layout.tsx`) para navegação
- [ ] **(1 pt)** Organização de rotas por grupos `(tabs)`, `(stack)`, etc.
- [ ] **(1 pt)** Tipagem dos parâmetros de navegação

#### 🔌 Arquitetura em Camadas (4 pontos)

- [ ] **(1 pt)** Separação apresentação / lógica (componentes UI vs containers)
- [ ] **(1 pt)** Camada de serviço para acesso a dados
- [ ] **(1 pt)** Hooks customizados para lógica reutilizável
- [ ] **(1 pt)** Gerenciamento de estado centralizado (Context, Zustand, Redux, etc.)

#### 🎨 Organização de Assets (4 pontos)

- [ ] **(1 pt)** Pasta `assets/` estruturada (imagens, fontes, ícones)
- [ ] **(1 pt)** Constantes usadas para caminhos de assets
- [ ] **(1 pt)** Otimização de imagens (WebP, dimensões adequadas)
- [ ] **(1 pt)** SVG via `react-native-svg` ou equivalente

### Etapa 3: Calcular o score

```
┌──────────────────────────────────────┬─────────┬────────┐
│ Critério                             │ Score   │ Status │
├──────────────────────────────────────┼─────────┼────────┤
│ Estrutura Baseada em Features        │ XX/8    │ ✅/⚠️/❌│
│ Organização de Pastas                │ XX/5    │ ✅/⚠️/❌│
│ Expo Router / Navegação              │ XX/4    │ ✅/⚠️/❌│
│ Arquitetura em Camadas               │ XX/4    │ ✅/⚠️/❌│
│ Organização de Assets                │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────────┼─────────┼────────┤
│ TOTAL ARQUITETURA                    │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────────┴─────────┴────────┘
```

**Legenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Atenção (15-19/25)
- ❌ Crítico (< 15/25)

---

## Objetivo (Análise Detalhada)

Este comando analisa a arquitetura da sua aplicação React Native e fornece recomendações para melhorar organização, manutenibilidade e escalabilidade.

---

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## Análise

### 1. Estrutura de Pastas

**Verificar organização:**

```bash
tree src -L 3 -I 'node_modules|__tests__'
```

**Avaliar:**

- [ ] Organização baseada em features (não por tipo técnico)
- [ ] Camadas claramente separadas (UI, Logic, Data)
- [ ] Estrutura consistente em todas as features
- [ ] Arquivos de barrel export (index.ts) presentes
- [ ] Sem pastas muito profundas (max 4-5 níveis)
- [ ] Sem arquivos orphan

**Estrutura recomendada:**

```
src/
├── app/                    # Expo Router (screens)
├── features/               # Features por domínio
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── articles/
├── components/             # Componentes compartilhados
│   ├── ui/
│   ├── forms/
│   └── layout/
├── hooks/                  # Hooks globais
├── services/               # Serviços globais
├── stores/                 # Estado global
├── utils/                  # Utilitários
├── types/                  # Tipos globais
├── constants/              # Constantes
├── theme/                  # Tema
└── assets/                 # Assets
```

### 2. Separação de Responsabilidades

**Verificar camadas:**

```typescript
// ❌ RUIM: Tudo misturado
export const UserScreen = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <View>{/* UI */}</View>;
};

// ✅ BOM: Camadas separadas
// Hook (Logic Layer)
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.get(),
  });
};

// Screen (Presentation Layer)
export const UserScreen = () => {
  const { data: user } = useUser();
  return <UserProfile user={user} />;
};
```

**Avaliar:**

- [ ] UI components sem lógica de negócio
- [ ] Hooks customizados para lógica reutilizável
- [ ] Serviços para chamadas de API
- [ ] Stores para estado global
- [ ] Types separados dos componentes

### 3. Gerenciamento de Estado

**Verificar arquitetura de estado:**

- [ ] Estado local com useState para estado de componente
- [ ] Estado global com Zustand para estado compartilhado
- [ ] React Query para estado do servidor
- [ ] MMKV para persistência
- [ ] SecureStore para dados sensíveis

**Anti-patterns a evitar:**

```typescript
// ❌ Prop drilling excessivo
<A>
  <B prop={data}>
    <C prop={data}>
      <D prop={data} />
    </C>
  </B>
</A>

// ✅ Usar context ou store global
const useDataStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### 4. Navegação

**Verificar Expo Router:**

- [ ] Estrutura de rotas clara e consistente
- [ ] Rotas tipadas (TypeScript)
- [ ] Grupos de rotas usados apropriadamente
- [ ] Layouts compartilhados implementados
- [ ] Deep linking configurado
- [ ] Navegação aninhada gerenciada adequadamente

### 5. Dependências

**Verificar imports:**

```bash
npx madge --circular src
```

**Avaliar:**

- [ ] Sem dependências circulares
- [ ] Imports organizados (React, libs, internos, relativos)
- [ ] Path aliases configurados (@/, @components/, etc.)
- [ ] Barrel exports usados adequadamente
- [ ] Sem imports desnecessários

---

## Relatório

```markdown
## Análise de Arquitetura

### ✅ Pontos Fortes
- [Liste o que está bem arquitetado]

### ⚠️ Problemas Identificados
1. **[Problema]**
   - Impacto: [Alto/Médio/Baixo]
   - Localização: [path/to/files]
   - Recomendação: [ação]

### 💡 Recomendações
1. **[Recomendação]**
   - Benefício: [descrição]
   - Esforço: [Alto/Médio/Baixo]
   - Prioridade: [Alta/Média/Baixa]

### 📊 Métricas
- Aderência à arquitetura feature-based: [%]
- Separação de responsabilidades: [%]
- Qualidade de organização: [%]
```

---

## Ações Recomendadas

- [ ] Refatorar estrutura de pastas para feature-based
- [ ] Extrair lógica de componentes para hooks
- [ ] Centralizar chamadas de API em serviços
- [ ] Configurar path aliases
- [ ] Resolver dependências circulares
- [ ] Implementar barrel exports
- [ ] Documentar arquitetura

---

**Uma boa arquitetura facilita manutenção e escalabilidade. Invista tempo desde o início.**
