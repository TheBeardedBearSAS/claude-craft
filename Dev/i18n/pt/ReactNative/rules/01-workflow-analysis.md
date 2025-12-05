# Análise de Fluxo de Trabalho - Análise Obrigatória Antes de Codificar

## Introdução

**REGRA ABSOLUTA**: Antes de qualquer modificação de código, uma fase de análise OBRIGATÓRIA deve ser realizada. Esta regra é inegociável e garante a qualidade do código produzido.

---

## Princípio Fundamental

> "Pense Primeiro, Code Depois"

Cada intervenção de código deve ser precedida por uma análise metódica para:
- Compreender o contexto
- Identificar impactos
- Antecipar problemas
- Escolher a melhor solução

---

## Fase 1: Compreensão da Necessidade

### 1.1 Esclarecimento da Solicitação

**Perguntas a fazer**:
- Qual é a necessidade exata do usuário?
- Qual problema estamos tentando resolver?
- Quais são os critérios de aceitação?
- Existem restrições técnicas ou de negócio?

**Ações**:
```typescript
// ANTES de codificar, documente:
/**
 * NECESSIDADE: [Descrição clara da necessidade]
 * PROBLEMA: [Problema a resolver]
 * CRITÉRIOS: [Critérios de aceitação]
 * RESTRIÇÕES: [Restrições identificadas]
 */
```

### 1.2 Análise do Contexto de Negócio

**Compreender**:
- O fluxo de usuário impactado
- Regras de negócio aplicáveis
- Impacto na experiência do usuário
- Casos de uso

**Exemplo**:
```typescript
// Feature: Adição de sistema de favoritos
//
// CONTEXTO DE NEGÓCIO:
// - Usuário deve poder marcar artigos como favoritos
// - Favoritos devem estar acessíveis offline
// - Favoritos são sincronizados entre dispositivos
// - Máximo de 100 favoritos por usuário
//
// IMPACTO UX:
// - Ícone de coração em cada artigo
// - Tela dedicada de favoritos
// - Feedback visual imediato (atualização otimista)
```

---

## Fase 2: Análise Técnica

### 2.1 Exploração do Código Existente

**Use ferramentas de busca**:

```bash
# Buscar padrões similares
npx expo-search "similar-pattern"

# Buscar implementação existente
grep -r "relatedFeature" src/

# Identificar dependências
grep -r "import.*TargetComponent" src/
```

**Checklist de exploração**:
- [ ] Componentes existentes reutilizáveis
- [ ] Hooks customizados disponíveis
- [ ] Serviços de API já implementados
- [ ] Gerenciamento de estado em vigor
- [ ] Padrões de navegação usados
- [ ] Estilos e tema consistentes

### 2.2 Análise de Arquitetura

**Questões de arquitetura**:
- Onde esta funcionalidade se encaixa na arquitetura?
- Quais camadas são impactadas? (UI, Lógica, Dados, Navegação)
- Existe um padrão estabelecido a seguir?
- Devo criar um novo módulo ou estender o existente?

**Exemplo de análise**:
```typescript
// Feature: Sistema de favoritos
//
// CAMADAS IMPACTADAS:
//
// 1. CAMADA DE DADOS
//    - Novo store: stores/favorites.store.ts
//    - Serviço API: services/api/favorites.service.ts
//    - Storage: services/storage/favorites.storage.ts
//    - Tipos: types/Favorite.types.ts
//
// 2. CAMADA DE LÓGICA
//    - Hook: hooks/useFavorites.ts
//    - Hook: hooks/useFavoriteToggle.ts
//    - Utilitários: utils/favorites.utils.ts
//
// 3. CAMADA DE UI
//    - Componente: components/FavoriteButton.tsx
//    - Tela: screens/FavoritesScreen.tsx
//    - Ícone: components/ui/FavoriteIcon.tsx
//
// 4. NAVEGAÇÃO
//    - Rota: app/(tabs)/favorites.tsx
//    - Deep link: favorites/:id
```

### 2.3 Análise de Dependências

**Identificar**:
- Bibliotecas externas necessárias
- Dependências internas (módulos, componentes)
- Potenciais dependências circulares
- Versões compatíveis

**Template de análise**:
```typescript
// DEPENDÊNCIAS NECESSÁRIAS:
//
// Novas bibliotecas:
// - @react-native-async-storage/async-storage (armazenamento)
// - react-query (sincronização API)
//
// Módulos internos:
// - stores/user.store (para userId)
// - services/api/client (para chamadas API)
// - hooks/useAuth (para autenticação)
//
// Verificações:
// - Nenhuma dependência circular com features/articles
// - Compatível com arquitetura existente
```

---

## Fase 3: Identificação de Impacto

### 3.1 Impacto no Código Existente

**Analisar**:
- Quais arquivos serão modificados?
- Quais componentes serão impactados?
- Existem mudanças que quebram compatibilidade?
- Os testes existentes serão afetados?

**Checklist de impacto**:
```typescript
// IMPACTO NO CÓDIGO EXISTENTE:
//
// MODIFICAÇÕES:
// - screens/ArticleDetailScreen.tsx (adicionar FavoriteButton)
// - components/ArticleCard.tsx (adicionar ícone de favorito)
// - navigation/TabNavigator.tsx (adicionar aba Favoritos)
//
// NOVOS ARQUIVOS:
// - stores/favorites.store.ts
// - screens/FavoritesScreen.tsx
// - hooks/useFavorites.ts
//
// MUDANÇAS QUE QUEBRAM COMPATIBILIDADE: Nenhuma
//
// TESTES A MODIFICAR:
// - ArticleCard.test.tsx (novas props)
// - ArticleDetailScreen.test.tsx (novo botão)
```

### 3.2 Impacto de Performance

**Considerar**:
- Impacto no tamanho do bundle
- Performance em tempo de execução (FPS, memória)
- Tamanho dos assets
- Requisições de rede adicionais
- Armazenamento usado

**Exemplo**:
```typescript
// ANÁLISE DE PERFORMANCE:
//
// TAMANHO DO BUNDLE:
// - Adicionar react-query: +50kb (gzipped)
// - Nova tela: ~15kb
// - TOTAL: +65kb (aceitável < 100kb)
//
// TEMPO DE EXECUÇÃO:
// - Renderizar lista de favoritos: FlatList com windowSize otimizado
// - Armazenamento: MMKV (ultra rápido)
// - Rede: Atualizações otimistas (sem latência percebida)
//
// ARMAZENAMENTO:
// - Máx 100 favoritos × 1kb = 100kb (negligível)
```

### 3.3 Impacto UX/UI

**Avaliar**:
- Consistência com sistema de design
- Acessibilidade
- Responsivo (tablet, telefone)
- Animações e transições
- Feedback do usuário

**Checklist UX**:
```typescript
// ANÁLISE UX/UI:
//
// SISTEMA DE DESIGN:
// - Usar theme.colors.primary para ícone ativo
// - Usar componente Button existente
// - Animação: escala + feedback háptico
//
// ACESSIBILIDADE:
// - Label: "Adicionar aos favoritos" / "Remover dos favoritos"
// - Compatível com leitor de tela
// - Hit slop: 44x44 mínimo
//
// RESPONSIVO:
// - Ícone adaptado para tablet (maior)
// - Grade de favoritos: 2 colunas mobile, 3 tablet
//
// FEEDBACK:
// - Feedback háptico ao alternar
// - Notificação toast ao sucesso
// - Animação de coração
```

---

## Fase 4: Design da Solução

### 4.1 Seleção de Abordagem

**Comparar opções**:

```typescript
// ABORDAGEM 1: Local First com sincronização
// PRÓS:
// - Funciona offline
// - Performance ótima
// - UX suave
// CONTRAS:
// - Complexidade de sincronização
// - Potenciais conflitos
//
// ABORDAGEM 2: Apenas API
// PRÓS:
// - Simples
// - Sem sincronização
// - Fonte única de verdade
// CONTRAS:
// - Requer conexão
// - Latência
//
// DECISÃO: Abordagem 1 (Local First)
// MOTIVO: Melhor UX, funcionalidade offline crítica
```

### 4.2 Padrão de Design a Usar

**Identificar padrão apropriado**:

```typescript
// PADRÕES APLICÁVEIS:
//
// 1. GERENCIAMENTO DE ESTADO: Zustand
//    - Store global para favoritos
//    - Persistir com MMKV
//
// 2. BUSCA DE DADOS: React Query
//    - Query favoritos com cache
//    - Mutation para alternar
//    - Atualizações otimistas
//
// 3. PADRÃO DE COMPONENTE: Compound Component
//    - FavoriteButton.Toggle
//    - FavoriteButton.Icon
//    - FavoriteButton.Count
//
// 4. PADRÃO DE HOOK: Custom Hook
//    - useFavorites() para dados
//    - useFavoriteToggle() para ação
```

### 4.3 Estrutura de Dados

**Definir tipos**:

```typescript
// TIPOS DEFINIDOS:

// Entidade Favorite
interface Favorite {
  id: string;
  userId: string;
  articleId: string;
  createdAt: Date;
  syncedAt?: Date;
  localOnly?: boolean; // Para favoritos ainda não sincronizados
}

// Resposta da API
interface FavoritesResponse {
  favorites: Favorite[];
  total: number;
}

// Estado do Store
interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;

  // Ações
  addFavorite: (articleId: string) => Promise<void>;
  removeFavorite: (articleId: string) => Promise<void>;
  isFavorite: (articleId: string) => boolean;
  sync: () => Promise<void>;
}
```

---

## Fase 5: Plano de Implementação

### 5.1 Divisão de Tarefas

**Criar plano detalhado**:

```typescript
// PLANO DE IMPLEMENTAÇÃO:
//
// PASSO 1: Tipos & Interfaces
// - Criar types/Favorite.types.ts
// - Definir interfaces
// Duração: 30min
//
// PASSO 2: Camada de Storage
// - Implementar favorites.storage.ts
// - Testes de storage
// Duração: 1h
//
// PASSO 3: Serviço API
// - Implementar favorites.service.ts
// - Mock de respostas API
// Duração: 1h
//
// PASSO 4: Store
// - Criar favorites.store.ts
// - Implementar ações
// - Testes do store
// Duração: 2h
//
// PASSO 5: Hooks
// - Criar useFavorites
// - Criar useFavoriteToggle
// - Testes de hooks
// Duração: 1h30
//
// PASSO 6: Componentes UI
// - FavoriteButton
// - FavoriteIcon
// - Testes de componentes
// Duração: 2h
//
// PASSO 7: Tela
// - FavoritesScreen
// - Configuração de navegação
// - Testes de tela
// Duração: 2h
//
// PASSO 8: Integração
// - Integrar em ArticleCard
// - Integrar em ArticleDetail
// - Testes E2E
// Duração: 2h
//
// TOTAL: ~12h
```

### 5.2 Ordem de Implementação

**Regra**: Sempre bottom-up

```typescript
// ORDEM DE IMPLEMENTAÇÃO:
//
// 1. Fundações (Camada de Dados)
//    ↓
// 2. Serviços & Storage
//    ↓
// 3. Gerenciamento de Estado
//    ↓
// 4. Lógica de Negócio (Hooks)
//    ↓
// 5. Componentes UI (burros)
//    ↓
// 6. Componentes UI (inteligentes)
//    ↓
// 7. Telas
//    ↓
// 8. Navegação & Integração
//    ↓
// 9. Testes E2E
```

### 5.3 Identificação de Riscos

**Antecipar problemas**:

```typescript
// RISCOS IDENTIFICADOS:
//
// RISCO 1: Conflitos de sincronização
// - Impacto: Alto
// - Probabilidade: Médio
// - Mitigação: Resolução baseada em timestamp, última escrita vence
//
// RISCO 2: Limite de 100 favoritos
// - Impacto: Médio
// - Probabilidade: Baixo
// - Mitigação: Aviso na UI aos 90 favoritos, deletar mais antigos
//
// RISCO 3: Performance da lista de favoritos
// - Impacto: Médio
// - Probabilidade: Baixo
// - Mitigação: FlatList virtualizada, paginação
//
// RISCO 4: Espaço de armazenamento
// - Impacto: Baixo
// - Probabilidade: Muito baixo
// - Mitigação: Limpeza de favoritos antigos sincronizados
```

---

## Fase 6: Validação Pré-Implementação

### 6.1 Checklist de Validação

**Antes de codificar, verificar**:

```typescript
// CHECKLIST DE VALIDAÇÃO:
//
// ANÁLISE:
// ✓ Necessidade claramente compreendida
// ✓ Contexto de negócio analisado
// ✓ Arquitetura estudada
// ✓ Dependências identificadas
// ✓ Impactos avaliados
//
// DESIGN:
// ✓ Solução escolhida e justificada
// ✓ Padrões identificados
// ✓ Tipos definidos
// ✓ Plano de implementação criado
//
// RISCOS:
// ✓ Riscos identificados
// ✓ Mitigações planejadas
//
// QUALIDADE:
// ✓ Testes planejados
// ✓ Performance considerada
// ✓ Acessibilidade provida
// ✓ Documentação preparada
//
// PRONTO PARA CODIFICAR: SIM ✓
```

### 6.2 Revisão de Design

**Pontos de revisão**:

```typescript
// QUESTÕES DE REVISÃO:
//
// 1. A solução é KISS (Keep It Simple)?
//    → Sim, padrão React Query + Zustand padrão
//
// 2. Respeita DRY?
//    → Sim, hooks reutilizáveis
//
// 3. Segue SOLID?
//    → Sim, responsabilidades separadas
//
// 4. É testável?
//    → Sim, cada camada independente
//
// 5. É performático?
//    → Sim, atualizações otimistas, FlatList
//
// 6. É mantível?
//    → Sim, código claro, bem tipado, documentado
//
// 7. Respeita a arquitetura?
//    → Sim, segue padrões estabelecidos
//
// VALIDAÇÃO: APROVADO ✓
```

---

## Fase 7: Documentação da Análise

### 7.1 Template de Documentação

**Criar um ADR (Architecture Decision Record)**:

```markdown
# ADR-XXX: Sistema de Favoritos

## Status
Proposto

## Contexto
Usuários precisam marcar artigos como favoritos
para acessá-los rapidamente, mesmo offline.

## Decisão
Implementação de sistema de favoritos com:
- Abordagem local-first (armazenamento MMKV)
- Sincronização em segundo plano (React Query)
- Atualizações otimistas (UX suave)
- Limite: 100 favoritos por usuário

## Consequências

### Positivas
- Funciona offline
- Performance ótima
- UX suave
- Sincronização automática

### Negativas
- Complexidade de sincronização
- Gerenciamento de conflitos
- Armazenamento local necessário

## Alternativas Consideradas
1. Apenas API: Rejeitada (requer conexão)
2. AsyncStorage: Rejeitada (performance)

## Notas de Implementação
- Store: Zustand com persistência MMKV
- API: React Query com atualizações otimistas
- Limite: Aviso na UI aos 90 favoritos
```

### 7.2 Documentação Inline

**No código, documentar decisões**:

```typescript
/**
 * Favorites Store
 *
 * DECISÕES:
 * - Zustand para gerenciamento de estado (simples, performático)
 * - MMKV para persistência (ultra rápido)
 * - Atualizações otimistas (melhor UX)
 *
 * LIMITES:
 * - Máx 100 favoritos por usuário
 * - Sincronização a cada 5min em segundo plano
 *
 * @see ADR-XXX para detalhes de arquitetura
 */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      // Implementação
    }),
    {
      name: 'favorites',
      storage: createMMKVStorage(),
    }
  )
);
```

---

## Exemplos Completos

### Exemplo 1: Adição de Funcionalidade Complexa

```typescript
// ========================================
// ANÁLISE: Feature "Notificações Push"
// ========================================

// FASE 1: COMPREENSÃO
// -----------------------
// NECESSIDADE: Receber notificações push para novos artigos
// CRITÉRIOS:
// - Notificações em iOS e Android
// - Opt-in (permissão do usuário)
// - Notificações silenciosas para sincronização de dados
// - Deep links para artigos

// FASE 2: ANÁLISE TÉCNICA
// ---------------------------
// EXPLORAÇÃO:
// - Expo Notifications já instalado
// - Serviço push: FCM (Firebase Cloud Messaging)
// - Deep linking: Compatível com Expo Router
//
// ARQUITETURA:
// - Serviço: services/notifications/push.service.ts
// - Store: stores/notifications.store.ts
// - Hook: hooks/useNotifications.ts
// - Provider: providers/NotificationsProvider.tsx

// FASE 3: IMPACTOS
// ----------------
// CÓDIGO:
// - Novo módulo notifications/
// - Modificar App.tsx (provider)
// - Atualizar app.json (config)
//
// PERFORMANCE:
// - Bundle: +80kb (expo-notifications)
// - Tarefa em segundo plano: Impacto mínimo
//
// UX:
// - Prompt de permissão (iOS/Android)
// - Atualização da tela de configurações
// - Toast para notificações recebidas

// FASE 4: DESIGN
// -------------------
// ABORDAGEM: Expo Notifications Nativo
// PADRÃO: Provider + Hook
// TIPOS:
interface PushNotification {
  id: string;
  title: string;
  body: string;
  data?: {
    type: 'article' | 'system';
    articleId?: string;
  };
}

// FASE 5: PLANO
// -------------
// 1. Configurar Firebase (2h)
// 2. Config app.json (30min)
// 3. Serviço de notificações (2h)
// 4. Store + Hook (1h30)
// 5. Provider (1h)
// 6. UI de configurações (2h)
// 7. Deep links (1h)
// 8. Testes (2h)
// TOTAL: 12h

// FASE 6: VALIDAÇÃO
// -------------------
// ✓ Análise completa
// ✓ Solução validada
// ✓ Plano detalhado
// ✓ Riscos identificados
// → PRONTO PARA CODIFICAR
```

### Exemplo 2: Correção de Bug

```typescript
// ========================================
// ANÁLISE: Bug "Imagens não são cacheadas"
// ========================================

// FASE 1: COMPREENSÃO
// -----------------------
// PROBLEMA: Imagens recarregam a cada visita
// SINTOMAS:
// - Piscada ao rolar
// - Alto consumo de dados
// - Performance degradada
//
// REPRODUÇÃO:
// 1. Rolar lista de artigos
// 2. Navegar para outro lugar
// 3. Retornar à lista
// 4. Imagens recarregam

// FASE 2: INVESTIGAÇÃO
// ----------------------
// CÓDIGO ATUAL:
<Image source={{ uri: article.imageUrl }} />

// PROBLEMA IDENTIFICADO:
// - Nenhum cache configurado
// - Cache padrão do Image do react-native é fraco
//
// SOLUÇÕES POSSÍVEIS:
// 1. expo-image (novo, performático)
// 2. react-native-fast-image (comprovado)
// 3. Cache manual com FileSystem

// FASE 3: IMPACTOS
// ----------------
// MUDANÇA:
// - Substituir Image por expo-image
// - Migração ~50 arquivos
//
// PERFORMANCE:
// - Bundle: +40kb
// - Cache em disco: ~100MB máx
// - Melhoria de FPS: +15-20%

// FASE 4: DECISÃO
// -----------------
// ESCOLHA: expo-image
// MOTIVO:
// - Integração nativa Expo
// - Cache automático
// - Suporte a Blurhash
// - Melhor performance

// FASE 5: PLANO
// -------------
// 1. Instalar expo-image (15min)
// 2. Criar componente CachedImage (30min)
// 3. Migração Image → CachedImage (2h)
// 4. Testes (1h)
// 5. Validação de performance (30min)
// TOTAL: 4h15

// FASE 6: VALIDAÇÃO
// -------------------
// ✓ Causa raiz identificada
// ✓ Solução testada
// ✓ Plano de migração claro
// → PRONTO PARA CORRIGIR
```

---

## Anti-Padrões a Evitar

### ❌ Codificar Sem Analisar

```typescript
// RUIM: Codificar diretamente
const handleFavorite = () => {
  // Codifico sem pensar...
  fetch('/api/favorites', { ... });
};

// BOM: Analisar então codificar
// 1. Analisar: Precisa sincronização offline?
// 2. Design: React Query + atualização otimista
// 3. Codificar:
const { mutate } = useMutation({
  mutationFn: addFavorite,
  onMutate: optimisticUpdate,
});
```

### ❌ Ignorar Código Existente

```typescript
// RUIM: Recriar o que existe
const MyCustomButton = () => { ... };

// BOM: Reutilizar
import { Button } from '@/components/ui/Button';
```

### ❌ Over-Engineering

```typescript
// RUIM: Complexidade desnecessária
class FavoriteManager extends AbstractManager
  implements IFavoriteService, IObservable { ... }

// BOM: Simples e efetivo
export function useFavorites() { ... }
```

---

## Checklist Final

**Antes de cada intervenção de código**:

```typescript
// CHECKLIST DE ANÁLISE PRÉ-CÓDIGO
//
// □ Necessidade claramente definida
// □ Contexto de negócio compreendido
// □ Código existente explorado
// □ Arquitetura analisada
// □ Dependências identificadas
// □ Impactos avaliados
// □ Solução desenhada
// □ Padrão escolhido
// □ Tipos definidos
// □ Plano detalhado criado
// □ Riscos identificados
// □ Testes planejados
// □ Documentação preparada
//
// SE TODOS MARCADOS → CODIFICAR
// SENÃO → CONTINUAR ANÁLISE
```

---

## Conclusão

A análise pré-código NÃO é perda de tempo, é um INVESTIMENTO que:

- **Evita erros custosos**
- **Garante qualidade do código**
- **Acelera o desenvolvimento** (menos refatoração)
- **Facilita a manutenção**
- **Melhora a colaboração**

> "Horas de análise economizam dias de depuração"

---

**Regra de ouro**: Gaste tanto tempo analisando quanto codificando (proporção 1:1 mínimo).
