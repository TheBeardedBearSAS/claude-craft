# Summary - React Native Development Rules

Resumo completo de todos os arquivos criados para desenvolvimento React Native com Claude Code.

---

## 📊 Estatísticas

- **Total de arquivos**: 25 arquivos markdown
- **Tamanho total**: ~274 KB
- **Linhas de código**: ~8.000+ linhas de documentação
- **Categorias**: 4 (Rules, Templates, Checklists, Docs)

---

## 📁 Estrutura Completa

```
ReactNative/
├── README.md                              ✅ Guia de uso
├── SUMMARY.md                             ✅ Este arquivo
├── CLAUDE.md.template                     ✅ Template principal (12 KB)
│
├── rules/                                 ✅ 15 regras detalhadas
│   ├── 00-project-context.md.template    ✅ Template contexto projeto (9.2 KB)
│   ├── 01-workflow-analysis.md           ✅ Análise obrigatória (18 KB)
│   ├── 02-architecture.md                ✅ Arquitetura RN (32 KB)
│   ├── 03-coding-standards.md            ✅ Padrões TypeScript (25 KB)
│   ├── 04-solid-principles.md            ✅ Princípios SOLID (27 KB)
│   ├── 05-kiss-dry-yagni.md              ✅ Simplicidade (25 KB)
│   ├── 06-tooling.md                     ✅ Ferramentas Expo/EAS (4.4 KB)
│   ├── 07-testing.md                     ✅ Testing (8.5 KB)
│   ├── 08-quality-tools.md               ✅ ESLint/Prettier (2.2 KB)
│   ├── 09-git-workflow.md                ✅ Git & Conventional Commits (4.5 KB)
│   ├── 10-documentation.md               ✅ Documentação (4.4 KB)
│   ├── 11-security.md                    ✅ Segurança móvel (16 KB)
│   ├── 12-performance.md                 ✅ Performance (15 KB)
│   ├── 13-state-management.md            ✅ Gestão de estado (13 KB)
│   └── 14-navigation.md                  ✅ Expo Router (12 KB)
│
├── templates/                             ✅ 4 templates de código
│   ├── screen.md                         ✅ Template screen (3.7 KB)
│   ├── component.md                      ✅ Template componente (3.6 KB)
│   ├── hook.md                           ✅ Template hook (4.6 KB)
│   └── test-component.md                 ✅ Template test (6.3 KB)
│
├── checklists/                            ✅ 4 checklists de validação
│   ├── pre-commit.md                     ✅ Pre-commit (2.4 KB)
│   ├── new-feature.md                    ✅ Nova funcionalidade (4.5 KB)
│   ├── refactoring.md                    ✅ Refatoração (5.9 KB)
│   └── security.md                       ✅ Auditoria de segurança (7.0 KB)
│
└── examples/                              📁 (vazio, para exemplos futuros)
```

---

## 📚 Conteúdo Detalhado

### 🎯 Arquivos Principais

#### README.md (6.5 KB)
- Visão geral completa
- Guia de início rápido
- Estrutura do projeto
- Uso com Claude Code
- Filosofia e fluxo de trabalho
- Recursos

#### CLAUDE.md.template (12 KB)
- Template principal para projetos
- Contexto do projeto
- 7 regras fundamentais
- Stack tecnológico
- Comandos essenciais
- Arquitetura
- Documentação completa
- Fluxo de trabalho típico
- Instruções para Claude Code

---

### 📖 Rules (15 arquivos, ~190 KB)

#### 00-project-context.md.template (9.2 KB)
Template com placeholders para:
- Informações gerais
- Configuração Expo
- Stack técnico detalhado
- Ambientes
- APIs e serviços
- Funcionalidades
- Restrições técnicas
- Build & deployment
- Equipe
- Convenções

#### 01-workflow-analysis.md (18 KB)
**Regra absoluta**: Análise obrigatória antes de codificar
- Fase 1: Compreensão dos requisitos
- Fase 2: Análise técnica
- Fase 3: Identificação de impactos
- Fase 4: Design da solução
- Fase 5: Plano de implementação
- Fase 6: Validação pré-implementação
- Exemplos completos (feature, bug fix)

#### 02-architecture.md (32 KB)
Arquitetura React Native completa:
- Princípios arquiteturais (Clean Architecture)
- Organização baseada em features
- Estrutura de pastas detalhada
- Detalhes das camadas (4 camadas)
- App Router (Expo Router)
- Componentes (UI, Smart, Compound)
- Padrões de Hooks
- Gestão de estado multinível
- Serviços (API, Storage)
- Navegação
- Código específico de plataforma
- Módulos nativos
- Melhores práticas (DI, Repository, Adapter)

#### 03-coding-standards.md (25 KB)
Padrões TypeScript/React Native:
- Configuração TypeScript strict mode
- Anotações de tipo
- Interface vs Type
- Generics e Type Guards
- Utility types
- Padrões de componentes (Funcional, Estrutura)
- Desestruturação de Props
- Renderização condicional
- Manipuladores de eventos
- Padrões de Hooks (nomenclatura, estrutura, regras)
- Arrays de dependências
- Padrões de estilos (StyleSheet, Organização)
- Estilos dinâmicos
- Integração de tema
- Padrões específicos de plataforma
- Organização de imports
- Tratamento de erros
- Performance (memoization, FlatList)
- Convenções de nomenclatura
- Comentários e JSDoc

#### 04-solid-principles.md (27 KB)
SOLID adaptado para React Native:
- **S**RP: Single Responsibility (exemplos User Profile)
- **O**CP: Open/Closed (variantes de Button, abstração Storage)
- **L**SP: Liskov Substitution (contratos Button, componentes List)
- **I**SP: Interface Segregation (ArticleCard, componentes Form)
- **D**IP: Dependency Inversion (padrão Repository, DI)
- Exemplos completos para cada princípio
- Benefícios e anti-padrões

#### 05-kiss-dry-yagni.md (25 KB)
Princípios de simplicidade:
- **KISS**: Keep It Simple
  - Over-engineering vs Soluções simples
  - Gestão de estado simples
  - Busca de dados simples
  - Renderização condicional
- **DRY**: Don't Repeat Yourself
  - Código duplicado → Código reutilizado
  - Utils de validação
  - Hooks/componentes reutilizáveis
  - Estilos centralizados
  - Regra de 3
- **YAGNI**: You Aren't Gonna Need It
  - Over-engineering futuro
  - Paginação, i18n, tema "por precaução"
  - Quando antecipar (segurança, performance)
- Equilíbrio entre os 3 princípios

#### 06-tooling.md (4.4 KB)
Ferramentas Expo/EAS:
- Expo CLI (instalação, comandos)
- EAS (Build, Update, Submit)
- Configuração eas.json
- Configuração Metro bundler
- Ferramentas de desenvolvimento (Debugger, Flipper)
- Extensões VS Code
- Gestão de pacotes (npm vs yarn)

#### 07-testing.md (8.5 KB)
Testing completo:
- Tipos de testes (Unit, Component, Integration, E2E)
- Configuração Jest
- Testes unitários (utils, serviços)
- Testes de componentes (Testing Library)
- Testing de hooks
- Testing com React Query
- E2E com Detox
- Organização de testes
- Cobertura

#### 08-quality-tools.md (2.2 KB)
Ferramentas de qualidade:
- Configuração ESLint
- Configuração Prettier
- TypeScript strict mode
- Pre-commit hooks (Husky)
- lint-staged

#### 09-git-workflow.md (4.5 KB)
Git & Conventional Commits:
- Estratégia de branching
- Nomenclatura de branches
- Conventional Commits (tipos, formato)
- Exemplos completos
- Fluxo de desenvolvimento de features
- Processo de hotfix
- Template Pull Request
- Melhores práticas
- Comandos Git úteis

#### 10-documentation.md (4.4 KB)
Padrões de documentação:
- Comentários JSDoc
- Documentação de componentes
- Estrutura README
- Comentários inline (quando/como)
- ADR (Architecture Decision Records)
- Documentação API
- Changelog

#### 11-security.md (16 KB)
Segurança móvel completa:
- **Secure Storage**: SecureStore, criptografia MMKV
- **API Security**: Gestão de tokens, Interceptors, Certificate pinning
- **Input Validation**: Schemas Zod, Sanitização
- **Biometric Authentication**: Setup, Implementação
- **Code Obfuscation**: react-native-obfuscating-transformer
- **Environment Variables**: .env, EAS Secrets
- **Network Security**: HTTPS, Timeout
- **Screen Security**: Prevenção de screenshots
- **Deep Link Security**: Validação
- **Security Checklist** (Development, Pre-Production, Post-Production)
- **Common Vulnerabilities** (XSS, SQL Injection, MITM)

#### 12-performance.md (15 KB)
Otimizações de performance:
- **Hermes Engine**: Configuração, Benefícios
- **FlatList Optimization**: Props, Memoization, getItemLayout
- **Image Optimization**: expo-image, Redimensionamento, Lazy loading
- **Memoization**: React.memo, useMemo, useCallback
- **Animations Performance**: Native driver, Reanimated, LayoutAnimation
- **Bundle Size**: Analisar, Code splitting, Remover não utilizados
- **Network Performance**: Batching, Caching, Paginação
- **JavaScript Performance**: Evitar inline, Debounce
- **Memory Management**: Cleanup, Cancelar async
- **Profiling Tools**: React DevTools, Performance Monitor
- **Performance Checklist**
- **Metrics** (Target: 60 FPS, < 3s startup, etc.)

#### 13-state-management.md (13 KB)
Gestão de estado multinível:
- **React Query**: Setup, Queries, Mutations, Atualizações otimistas, Infinite queries
- **Zustand**: Store básico, Persistente (MMKV), Selectors, Slices
- **MMKV**: Armazenamento rápido, Armazenamento criptografado
- **Decision Tree**: Qual ferramenta para qual necessidade
- **Best Practices**: Não misturar concerns, Usar selectors, Normalizar dados
- **Offline Support**: useOfflineQuery
- **Checklist**

#### 14-navigation.md (12 KB)
Expo Router (Navegação):
- Instalação e Setup
- **File-based Routing**: Estrutura básica, Root layout
- **Route Groups**: Tabs, Auth groups
- **Dynamic Routes**: Parâmetro único, Múltiplos parâmetros, Catch-all
- **Navigation API**: router.push/replace/back, useRouter, useNavigation
- **Deep Linking**: Configuração, Manipulação
- **Modal Screens**: Configuração
- **Protected Routes**: Verificação de autenticação
- **Type-safe Navigation**: Tipos TypeScript
- **Navigation Patterns**: Tabs+Stack, Drawer, Onboarding
- **Screen Options**: Configuração por tela
- **Best Practices**: Organizar por feature, Usar route groups, Tipar params

---

### 🎨 Templates (4 arquivos, ~18 KB)

#### screen.md (3.7 KB)
Template de screen completo:
- Estrutura completa (imports, state, hooks, handlers, render)
- Estilos separados
- Testes (renderização, loading, estados de erro)
- Opções de screen para Expo Router

#### component.md (3.6 KB)
Template de componente reutilizável:
- Estrutura (props, state, handlers, render)
- Tipos separados (interfaces)
- Estilos (StyleSheet)
- Testes completos
- Exportação por índice

#### hook.md (4.6 KB)
Template de hook personalizado:
- Estrutura (state, refs, effects, callbacks, return)
- Exemplo com React Query (operações CRUD)
- Testes (inicialização, fetching, erros, refetch)

#### test-component.md (6.3 KB)
Template de teste completo:
- Estrutura de teste (describe, beforeEach)
- Testes de renderização
- Testes de interações
- Testes de estados (loading, error, empty)
- Testes de comportamento async
- Testes de acessibilidade
- Testes de estilos
- Testes de casos extremos
- Testes de snapshot
- Testes de integração

---

### ✅ Checklists (4 arquivos, ~20 KB)

#### pre-commit.md (2.4 KB)
Validação antes do commit:
- Qualidade de código (lint, format, type-check)
- Testes (unit, component, coverage)
- Padrões de código (nomenclatura, imports, DRY, JSDoc)
- Performance (memoization, imagens, FlatList)
- Segurança (secrets, validação, armazenamento)
- Arquitetura (SRP, separação, DI)
- Documentação (README, JSDoc, changelog)
- Git (mensagem, atômico, branch)
- Verificação final

#### new-feature.md (4.5 KB)
Fluxo de trabalho completo de feature (10 fases):
1. **Analysis** (obrigatório): Requisitos, user stories, casos de uso
2. **Design**: Arquitetura, modelagem de dados, decisões técnicas
3. **Setup**: Branch, ticket, dependências
4. **Implementation** (bottom-up): Data → Logic → UI → Screens → Integration
5. **Quality Assurance**: Qualidade de código, testing, performance, segurança, acessibilidade
6. **Documentation**: JSDoc, comentários, README, ADR
7. **Manual Testing**: Funcional, plataformas, UX
8. **Code Review**: PR, revisores, feedback
9. **Merge & Deploy**: Staging, produção, monitoramento
10. **Cleanup**: Deletar branch, fechar ticket
+ **Post-Launch**: Métricas, feedback, retrospectiva

#### refactoring.md (5.9 KB)
Refatoração segura (5 fases):
1. **Preparation**: Compreensão, documentação, testes
2. **Planning**: Estratégia, avaliação de riscos
3. **Refactoring**: Mudanças incrementais, qualidade de código, testes
4. **Validation**: Testes automatizados, testes manuais, revisão de código
5. **Deployment**: Pre-deploy, deploy, post-deploy
+ **Refactoring Patterns**: Extract method, Extract component, Introduce hook
+ **Common Pitfalls**: Listas de evitar/fazer

#### security.md (7.0 KB)
Auditoria de segurança completa (16 seções):
1. Sensitive Data Storage
2. API Security
3. Input Validation
4. Authentication & Authorization
5. Code Security
6. Platform Security (iOS/Android)
7. Network Security
8. Offline Security
9. Error Handling
10. Third-Party Security
11. WebView Security
12. Biometric Security
13. Code Obfuscation
14. Compliance (GDPR, CCPA, HIPAA)
15. Monitoring & Response
16. Testing
+ **Security Score**: Critical/High/Medium/Low

---

## 🎯 Regras Fundamentais (Resumo)

### REGRA #1: ANÁLISE OBRIGATÓRIA
Antes de qualquer código, análise completa (6 fases).
**Proporção**: 1h análise = 1h código mínimo.

### REGRA #2: ARQUITETURA PRIMEIRO
Seguir arquitetura baseada em features + clean architecture.
**Estrutura**: Data → Logic → UI → Screens.

### REGRA #3: PADRÕES DE CÓDIGO
TypeScript strict, ESLint 0 erros, Prettier auto-format.
**Qualidade**: JSDoc, exportações nomeadas, imports organizados.

### REGRA #4: PRINCÍPIOS SOLID
Aplicar SOLID + KISS + DRY + YAGNI.
**Simplicidade**: Código simples > Código inteligente.

### REGRA #5: TESTES OBRIGATÓRIOS
Cobertura > 80%, todos os tipos de testes.
**Testing**: Unit + Component + Integration + E2E.

### REGRA #6: SEGURANÇA
Segurança por design, SecureStore, validação.
**Proteção**: Tokens seguros, HTTPS, auditar dependências.

### REGRA #7: PERFORMANCE
Objetivo 60 FPS, Hermes, otimizações.
**Velocidade**: Memoization, FlatList, imagens, animações.

---

## 📦 Stack Tecnológico Recomendado

### Core
- **React Native** (latest)
- **Expo SDK** (latest)
- **TypeScript** (strict mode)
- **Node.js** (18+)

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state, cache)
- **Zustand** (global client state)
- **MMKV** (fast persistence)

### UI & Styling
- **StyleSheet** (native styling)
- **Theme** (centralized)
- **Reanimated** (animations)
- **Gesture Handler** (gestures)

### Forms & Validation
- **React Hook Form** (forms management)
- **Zod** (validation schemas)

### Testing
- **Jest** (unit tests)
- **React Native Testing Library** (component tests)
- **Detox** (E2E tests)

### Quality Tools
- **ESLint** (linting)
- **Prettier** (formatting)
- **Husky** (git hooks)
- **TypeScript** (type checking)

### Build & Deploy
- **EAS CLI** (Expo Application Services)
- **Metro** (bundler)

---

## 🚀 Uso

### Para Novo Projeto

```bash
# 1. Copiar template
cp CLAUDE.md.template /my-project/.claude/CLAUDE.md

# 2. Personalizar
# Substituir {{PROJECT_NAME}}, {{TECH_STACK}}, etc.

# 3. Copiar regras (opcional)
cp -r rules/ /my-project/.claude/rules/
cp -r templates/ /my-project/.claude/templates/
cp -r checklists/ /my-project/.claude/checklists/
```

### Para Projeto Existente

```bash
# 1. Copiar CLAUDE.md
cp CLAUDE.md.template /existing-project/.claude/CLAUDE.md

# 2. Adaptar progressivamente
# Começar com regras prioritárias
```

---

## 💡 Highlights

### Documentação Completa
- **~8.000+ linhas** de documentação detalhada
- **50+ exemplos** de código concreto
- **100+ code snippets** React Native/TypeScript
- Francês para explicações, inglês para código

### Cobertura Completa
- **Architecture**: Clean Architecture, Feature-based
- **Code Standards**: TypeScript strict, ESLint, Prettier
- **Patterns**: SOLID, KISS, DRY, YAGNI
- **Testing**: Unit, Component, Integration, E2E
- **Security**: SecureStore, validation, HTTPS, audit
- **Performance**: Hermes, memoization, FlatList, animations
- **State**: React Query, Zustand, MMKV
- **Navigation**: Expo Router, deep links, types

### Prático
- **4 Templates** código pronto para uso
- **4 Checklists** de validação
- **15 Regras** detalhadas
- **Workflow** completo (analysis → code → deploy)

---

## 📈 Metas de Métricas de Qualidade

- **Code Coverage**: > 80%
- **ESLint**: 0 erros, 0 avisos
- **TypeScript**: 0 erros (strict mode)
- **npm audit**: 0 vulnerabilidades
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constante
- **Memory**: < 200MB

---

## 🎓 Filosofia

### Think First, Code Later
Análise obrigatória antes de qualquer código.

### Architecture Matters
Estrutura clara = Código mantível.

### Quality Over Speed
Código de qualidade economiza tempo.

### Security by Design
Segurança desde o início, não depois.

### Performance First
Objetivo 60 FPS, otimizações nativas.

---

## ✅ Completude

### Regras: 15/15 ✅
- Todas as regras essenciais cobertas
- Da análise ao deployment
- Exemplos concretos em todos os lugares

### Templates: 4/4 ✅
- Screen, Component, Hook, Test
- Prontos para copiar-colar
- Com tipos, estilos, testes

### Checklists: 4/4 ✅
- Pre-commit, Feature, Refactoring, Security
- Validação completa
- Processo claro

### Documentação: 100% ✅
- README completo
- Template CLAUDE.md
- Todos os arquivos documentados

---

## 🔮 Futuro (Potencial)

### Extensões Possíveis
- [ ] Exemplos de código completos (pasta examples/)
- [ ] Video tutorials
- [ ] Interactive checklists
- [ ] VS Code snippets
- [ ] CLI tool para setup
- [ ] More templates (service, store, etc.)

---

## 🏆 Conclusão

**Estrutura completa e profissional** para desenvolvimento React Native com Claude Code:

✅ **25 arquivos** de documentação
✅ **~8.000+ linhas** de conteúdo detalhado
✅ **15 regras** essenciais
✅ **4 templates** prontos para uso
✅ **4 checklists** de validação
✅ **100+ exemplos** de código
✅ **Cobertura completa**: Arquitetura → Segurança → Performance
✅ **Pronto para uso** em projetos React Native/Expo

---

**Version**: 1.0.0
**Criado em**: 2025-12-03
**Autor**: The Bearded Bear

**Remember**: Essas regras são guias para produzir código de qualidade. Adapte-as ao seu contexto específico.
