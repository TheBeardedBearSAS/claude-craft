# Checklist: Refatoração React Native

Use este checklist ao refatorar código existente em aplicações React Native.

---

## 🎯 Antes de Começar

### Preparação
- [ ] Objetivo da refatoração claramente definido
- [ ] Escopo da refatoração identificado
- [ ] Riscos potenciais avaliados
- [ ] Plano de rollback preparado
- [ ] Branch de feature criada
- [ ] Testes existentes documentados

### Baseline
- [ ] Todos os testes passando antes da refatoração
- [ ] Cobertura de testes atual documentada
- [ ] Métricas de performance baseline coletadas
- [ ] Bugs conhecidos documentados
- [ ] Screenshots/vídeos do comportamento atual

---

## 🧪 Testes

### Antes da Refatoração
- [ ] Suite de testes existente executada e passando
- [ ] Testes de integração críticos identificados
- [ ] Casos extremos documentados
- [ ] Testes adicionais escritos se cobertura insuficiente
- [ ] Testes end-to-end críticos identificados

### Durante a Refatoração
- [ ] Executar testes frequentemente
- [ ] Novos testes adicionados para novo código
- [ ] Testes atualizados para mudanças de API
- [ ] Todos os testes continuam passando

### Após a Refatoração
- [ ] 100% dos testes passando
- [ ] Cobertura de testes mantida ou melhorada
- [ ] Testes obsoletos removidos
- [ ] Novos testes documentados

---

## 🏗️ Arquitetura

### Estrutura
- [ ] Estrutura de pastas melhorada se necessário
- [ ] Separação de responsabilidades melhorada
- [ ] Camadas claramente definidas
- [ ] Dependências circulares removidas
- [ ] Imports organizados e limpos

### Componentes
- [ ] Componentes grandes divididos em menores
- [ ] Componentes de apresentação separados de lógica
- [ ] Componentes reutilizáveis identificados e extraídos
- [ ] Props de componentes simplificadas
- [ ] Componente compound patterns aplicados onde apropriado

### Hooks
- [ ] Lógica reutilizável extraída em hooks customizados
- [ ] Hooks complexos divididos em menores
- [ ] Arrays de dependências otimizados
- [ ] Regras dos hooks respeitadas
- [ ] Cleanup adequado implementado

---

## 📝 TypeScript

### Tipagem
- [ ] `any` substituído por tipos apropriados
- [ ] Tipos genéricos aplicados onde apropriado
- [ ] Type guards adicionados para validação
- [ ] Tipos de união simplificados
- [ ] Tipos utilitários usados (Partial, Pick, Omit, etc.)

### Interfaces
- [ ] Interfaces grandes segregadas
- [ ] Propriedades opcionais vs obrigatórias revisadas
- [ ] Herança de interface otimizada
- [ ] Types vs interfaces usados apropriadamente
- [ ] DTOs definidos para APIs

---

## ⚡ Performance

### Renderização
- [ ] Renderizações desnecessárias identificadas e eliminadas
- [ ] React.memo aplicado a componentes caros
- [ ] useCallback aplicado a funções
- [ ] useMemo aplicado a cálculos caros
- [ ] Re-renders excessivos prevenidos

### Listas
- [ ] ScrollView substituído por FlatList onde apropriado
- [ ] Virtualization implementada para listas longas
- [ ] keyExtractor otimizado
- [ ] renderItem memoizado
- [ ] getItemLayout implementado para listas de altura fixa
- [ ] Props de otimização de FlatList ajustadas

### Data Fetching
- [ ] Chamadas de API desnecessárias eliminadas
- [ ] Cache implementado apropriadamente
- [ ] Stale-while-revalidate aplicado
- [ ] Prefetching implementado onde benéfico
- [ ] Paginação/infinite scroll otimizados

### Imagens
- [ ] Tamanhos de imagem otimizados
- [ ] Lazy loading implementado
- [ ] Placeholders adicionados
- [ ] Cache de imagem configurado
- [ ] Fast Image usado para múltiplas imagens

---

## 🎨 Estilização

### Consolidação
- [ ] Estilos duplicados consolidados
- [ ] Tema aplicado consistentemente
- [ ] Magic numbers substituídos por constantes de tema
- [ ] Estilos inline convertidos em StyleSheet
- [ ] Estilos específicos de plataforma organizados

### Organização
- [ ] Arquivos de estilos separados criados se necessário
- [ ] Nomes de estilos descritivos
- [ ] Estilos não utilizados removidos
- [ ] Estilos comuns extraídos
- [ ] Dark mode suportado (se aplicável)

---

## 🔧 Código

### Simplicidade
- [ ] Lógica complexa simplificada
- [ ] Funções longas divididas
- [ ] Condições aninhadas achatadas
- [ ] Operadores ternários complexos simplificados
- [ ] Código duplicado eliminado (DRY)

### Nomenclatura
- [ ] Nomes de variáveis descritivos
- [ ] Nomes de funções verbais e claros
- [ ] Nomes de componentes substantivos e claros
- [ ] Convenções de nomenclatura consistentes
- [ ] Abreviações evitadas

### Legibilidade
- [ ] Comentários desnecessários removidos
- [ ] Lógica complexa comentada
- [ ] TODOs resolvidos ou documentados
- [ ] Código morto removido
- [ ] Magic numbers extraídos em constantes

---

## 🔄 Gerenciamento de Estado

### Estado Local
- [ ] useState otimizado
- [ ] useReducer usado para estado complexo
- [ ] Elevação de estado quando apropriado
- [ ] Estado derivado calculado vs armazenado

### Estado Global
- [ ] Zustand usado para estado global compartilhado
- [ ] Estado global minimizado
- [ ] Slices/stores organizados logicamente
- [ ] Seletores otimizados
- [ ] Persistência configurada apropriadamente

### Server State
- [ ] React Query usado para data fetching
- [ ] Query keys consistentes e organizadas
- [ ] Cache configurado otimamente
- [ ] Invalidação de queries implementada
- [ ] Optimistic updates aplicados

---

## 🌐 API e Serviços

### Estrutura
- [ ] Serviços API organizados logicamente
- [ ] Client API centralizado
- [ ] Interceptors implementados
- [ ] Tratamento de erro centralizado
- [ ] Retry logic configurado

### Data Fetching
- [ ] Hooks de data fetching criados
- [ ] Loading states gerenciados
- [ ] Error states gerenciados
- [ ] Success states gerenciados
- [ ] Cancelamento de requests implementado

---

## 🔒 Segurança

### Dados Sensíveis
- [ ] Credenciais hardcoded removidas
- [ ] Variáveis de ambiente usadas
- [ ] SecureStore usado para dados sensíveis
- [ ] Tokens gerenciados com segurança
- [ ] Logs de dados sensíveis removidos

### Validação
- [ ] Validação de entrada melhorada
- [ ] Sanitização de dados implementada
- [ ] Type guards adicionados
- [ ] Error boundaries implementados

---

## 📱 Plataforma

### iOS/Android
- [ ] Código específico de plataforma isolado
- [ ] Platform.select usado apropriadamente
- [ ] Extensões de arquivo .ios/.android usadas quando necessário
- [ ] Permissões solicitadas corretamente
- [ ] Safe areas gerenciadas

### Responsividade
- [ ] Diferentes tamanhos de tela suportados
- [ ] Orientação portrait/landscape gerenciada
- [ ] Tablets suportados (se aplicável)
- [ ] Dimensões dinâmicas usadas

---

## 🧭 Navegação

### Expo Router
- [ ] Estrutura de rotas otimizada
- [ ] Rotas tipadas adequadamente
- [ ] Layouts compartilhados aplicados
- [ ] Deep linking configurado
- [ ] Navegação aninhada simplificada

---

## 📚 Documentação

### Código
- [ ] JSDoc atualizado
- [ ] Comentários obsoletos removidos
- [ ] Lógica complexa documentada
- [ ] README atualizado se necessário
- [ ] CHANGELOG atualizado

### APIs
- [ ] Props de componentes documentadas
- [ ] Parâmetros de hooks documentados
- [ ] Tipos de retorno documentados
- [ ] Exemplos de uso atualizados

---

## 🔍 Revisão

### Code Review
- [ ] Auto-revisão completada
- [ ] ESLint passa sem warnings
- [ ] Prettier aplicado
- [ ] TypeScript strict mode respeitado
- [ ] Nenhum console.log esquecido

### Princípios
- [ ] SOLID principles respeitados
- [ ] DRY aplicado
- [ ] KISS mantido
- [ ] YAGNI respeitado
- [ ] Clean Code principles seguidos

### Performance
- [ ] Bundle size não aumentou significativamente
- [ ] Métricas de performance mantidas ou melhoradas
- [ ] Memory leaks eliminados
- [ ] Renderizações otimizadas

---

## ✅ Validação

### Funcionalidade
- [ ] Todas as features funcionando como antes
- [ ] Nenhuma regressão introduzida
- [ ] Comportamento idêntico ao original
- [ ] Edge cases ainda funcionam
- [ ] Erros tratados adequadamente

### Testes
- [ ] Todos os testes passando
- [ ] Cobertura mantida ou melhorada
- [ ] Novos testes adicionados se necessário
- [ ] Testes atualizados para mudanças

### Plataformas
- [ ] Testado em iOS
- [ ] Testado em Android
- [ ] Testado em diferentes tamanhos de tela
- [ ] Testado em dispositivos reais
- [ ] Testado em versões antigas de OS (se suportadas)

---

## 🚀 Deploy

### Pré-deploy
- [ ] Feature flag implementada (se grande refatoração)
- [ ] Rollback plan preparado
- [ ] Monitoramento configurado
- [ ] Métricas baseline documentadas

### Pós-deploy
- [ ] Comportamento monitorado em produção
- [ ] Métricas coletadas e comparadas
- [ ] Crashes monitorados
- [ ] Feedback de usuários coletado
- [ ] Performance monitorada

---

## 📊 Métricas de Sucesso

### Qualidade de Código
- [ ] Complexidade ciclomática reduzida
- [ ] Duplicação de código reduzida
- [ ] Tamanho de funções reduzido
- [ ] Profundidade de aninhamento reduzida
- [ ] Manutenibilidade melhorada

### Performance
- [ ] Tempo de carregamento mantido ou melhorado
- [ ] Uso de memória mantido ou melhorado
- [ ] Frame rate mantido ou melhorado
- [ ] Bundle size mantido ou reduzido

### Testes
- [ ] Cobertura de testes mantida ou melhorada
- [ ] Velocidade de execução de testes mantida ou melhorada
- [ ] Número de testes mantido ou aumentado

---

## ⚠️ Red Flags

**Pare e reavalie se:**
- [ ] Refatoração leva mais de 1 semana
- [ ] Mais de 50% do código mudou
- [ ] Testes quebraram extensivamente
- [ ] Performance degradou significativamente
- [ ] Escopo cresceu muito além do plano original

**Considere dividir em refatorações menores.**

---

## 💡 Boas Práticas

### Incremental
- [ ] Refatorar em pequenos passos
- [ ] Commit frequentemente
- [ ] Testes passando em cada commit
- [ ] Mudanças atômicas e focadas

### Segurança
- [ ] Manter feature flag ativa inicialmente
- [ ] Monitorar de perto após deploy
- [ ] Estar pronto para rollback
- [ ] Coletar métricas comparativas

---

**Refatoração é sobre melhorar o código sem mudar comportamento. Seja metódico e disciplinado.**
