# Checklist: Nova Feature React Native

Use este checklist ao implementar qualquer nova feature em uma aplicação React Native.

---

## 📋 Planejamento

### Análise de Requisitos
- [ ] Requisitos claramente definidos e documentados
- [ ] Casos de uso identificados
- [ ] User stories escritas (se aplicável)
- [ ] Critérios de aceitação definidos
- [ ] Mockups/designs recebidos e revisados
- [ ] Discussão de decisões técnicas com a equipe

### Análise Técnica
- [ ] Componentes/telas necessários identificados
- [ ] Estrutura de dados planejada
- [ ] APIs/endpoints necessários identificados
- [ ] Dependências de terceiros avaliadas
- [ ] Considerações de performance analisadas
- [ ] Requisitos específicos de plataforma (iOS/Android) identificados

---

## 🏗️ Arquitetura

### Estrutura de Pastas
- [ ] Pasta de feature criada em `src/features/[feature-name]`
- [ ] Subpastas organizadas (components, hooks, services, types)
- [ ] Arquivos de barrel export (index.ts) criados

### Tipos TypeScript
- [ ] Interfaces/types definidos em `types/`
- [ ] DTOs para chamadas de API
- [ ] Props de componentes tipadas
- [ ] Tipos de resposta de API definidos
- [ ] Strict mode do TypeScript respeitado (sem `any`)

---

## 🎨 UI Components

### Criação de Componentes
- [ ] Componentes divididos em smart/presentational
- [ ] Componentes funcionais com hooks
- [ ] Props decompostas adequadamente
- [ ] Default props definidas quando necessário
- [ ] Componentes memorizados (React.memo) se apropriado

### Estilização
- [ ] StyleSheet.create usado (não inline objects)
- [ ] Tema integrado (colors, spacing, typography)
- [ ] Estilos específicos de plataforma gerenciados (iOS/Android)
- [ ] Estilos responsivos para diferentes tamanhos de tela
- [ ] Dark mode suportado (se aplicável)

### Acessibilidade
- [ ] Propriedades accessible adicionadas
- [ ] accessibilityLabel fornecido para elementos interativos
- [ ] accessibilityHint adicionado quando necessário
- [ ] accessibilityRole definido apropriadamente
- [ ] Navegação por teclado testada (se aplicável)
- [ ] Leitor de tela testado (TalkBack/VoiceOver)

---

## 🔧 Lógica de Negócio

### Hooks Customizados
- [ ] Hooks nomeados com prefixo `use`
- [ ] Lógica reutilizável extraída em hooks
- [ ] Regras dos hooks respeitadas (não condicionais)
- [ ] Arrays de dependências corretos (sem warnings)
- [ ] Cleanup implementado em useEffect quando necessário

### Gerenciamento de Estado
- [ ] Estado local com useState/useReducer para estado de componente
- [ ] Estado global com Zustand para estado compartilhado
- [ ] React Query para estado do servidor (data fetching)
- [ ] Estado persistido com MMKV quando necessário
- [ ] Estado síncrono entre componentes quando necessário

### Data Fetching
- [ ] React Query/TanStack Query usado para chamadas de API
- [ ] Query keys definidas apropriadamente
- [ ] Cache configurado (staleTime, cacheTime)
- [ ] Invalidação de queries implementada
- [ ] Mutations para create/update/delete
- [ ] Optimistic updates implementados (se aplicável)

---

## 🌐 Serviços e API

### API Services
- [ ] Serviço criado em `services/`
- [ ] Métodos HTTP (GET, POST, PUT, DELETE) implementados
- [ ] Interceptors configurados (auth, error handling)
- [ ] Tratamento de timeout implementado
- [ ] Tipos de resposta definidos

### Tratamento de Erros
- [ ] Try-catch para código assíncrono
- [ ] Tipos de erro customizados criados se necessário
- [ ] Mensagens de erro amigáveis ao usuário
- [ ] Logging de erros para monitoramento
- [ ] Retry logic para falhas de rede (se aplicável)

---

## 🧭 Navegação

### Expo Router
- [ ] Telas adicionadas em `app/`
- [ ] Rota dinâmica configurada (se necessário)
- [ ] Layout compartilhado criado (se aplicável)
- [ ] Navegação typesafe implementada
- [ ] Deep linking configurado (se necessário)
- [ ] Parâmetros de rota tipados
- [ ] Back navigation gerenciada adequadamente

---

## ⚡ Performance

### Otimização de Componentes
- [ ] React.memo aplicado a componentes caros
- [ ] useCallback para funções passadas como props
- [ ] useMemo para cálculos caros
- [ ] Evitar renderizações desnecessárias

### Otimização de Listas
- [ ] FlatList usado para listas longas (não ScrollView)
- [ ] keyExtractor fornecido
- [ ] renderItem memoizado
- [ ] getItemLayout implementado (se tamanho fixo)
- [ ] initialNumToRender configurado
- [ ] maxToRenderPerBatch ajustado
- [ ] windowSize otimizado

### Otimização de Imagens
- [ ] Fast Image usado para múltiplas imagens
- [ ] Placeholder/skeleton durante carregamento
- [ ] Tamanhos de imagem otimizados
- [ ] Lazy loading implementado
- [ ] Cache configurado

---

## 🔒 Segurança

### Armazenamento de Dados
- [ ] Dados sensíveis no SecureStore (não AsyncStorage)
- [ ] Tokens armazenados com segurança
- [ ] Dados criptografados quando necessário
- [ ] Permissões solicitadas adequadamente

### Validação
- [ ] Validação de entrada implementada
- [ ] Sanitização de dados de API
- [ ] XSS prevenido (escaping de user input)
- [ ] Validação de formulários implementada

### API Security
- [ ] HTTPS usado para todas as chamadas de API
- [ ] Tokens de auth renovados automaticamente
- [ ] Rate limiting gerenciado
- [ ] Credenciais sensíveis em variáveis de ambiente

---

## 🧪 Testes

### Testes Unitários
- [ ] Hooks testados
- [ ] Utils testados
- [ ] Serviços testados
- [ ] Casos extremos cobertos
- [ ] Cobertura > 80%

### Testes de Componentes
- [ ] React Native Testing Library usado
- [ ] Renderização de componentes testada
- [ ] Interações do usuário testadas
- [ ] Estados condicionais testados
- [ ] Props testadas
- [ ] Snapshot tests criados (se apropriado)

### Testes de Integração
- [ ] Fluxos críticos testados end-to-end
- [ ] Navegação testada
- [ ] Data fetching testado com mocks
- [ ] Tratamento de erros testado

### Testes Manuais
- [ ] Testado em iOS
- [ ] Testado em Android
- [ ] Testado em diferentes tamanhos de tela
- [ ] Testado dark mode (se aplicável)
- [ ] Testado cenários offline (se aplicável)
- [ ] Testado em dispositivos reais

---

## 📚 Documentação

### Código
- [ ] JSDoc para funções públicas
- [ ] Comentários para lógica complexa
- [ ] README atualizado (se necessário)
- [ ] CHANGELOG atualizado

### Componentes
- [ ] Props documentadas
- [ ] Exemplos de uso fornecidos
- [ ] Storybook stories criadas (se aplicável)

---

## 🔍 Revisão de Código

### Auto-revisão
- [ ] Código formatado (Prettier)
- [ ] Sem warnings de ESLint
- [ ] Sem warnings de TypeScript
- [ ] Sem console.logs esquecidos
- [ ] Sem código comentado
- [ ] Imports organizados

### Princípios
- [ ] SOLID principles respeitados
- [ ] DRY (Don't Repeat Yourself)
- [ ] KISS (Keep It Simple, Stupid)
- [ ] YAGNI (You Aren't Gonna Need It)
- [ ] Código autodocumentado

### Performance
- [ ] Sem memory leaks
- [ ] Sem renderizações infinitas
- [ ] Bundle size não aumentado significativamente
- [ ] Tempo de carregamento aceitável

---

## 🚀 Deployment

### Pré-deployment
- [ ] Feature testada em dev/staging
- [ ] Feature flags implementadas (se necessário)
- [ ] Rollback plan preparado
- [ ] Monitoramento configurado

### Pós-deployment
- [ ] Feature monitorada em produção
- [ ] Métricas coletadas
- [ ] Feedback do usuário monitorado
- [ ] Bugs críticos resolvidos imediatamente

---

## ✅ Critérios de Aceitação

- [ ] Todos os requisitos funcionais implementados
- [ ] Todos os testes passando
- [ ] Cobertura de testes adequada (>80%)
- [ ] Code review aprovado
- [ ] Documentação completa
- [ ] Performance aceitável
- [ ] Sem regressões
- [ ] UI/UX conforme design
- [ ] Acessibilidade implementada
- [ ] Funciona em iOS e Android

---

**Use este checklist como guia. Nem todos os itens se aplicam a todas as features. Adapte conforme necessário.**
