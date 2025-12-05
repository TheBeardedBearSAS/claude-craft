# React Native Development Rules for Claude Code

Regras de desenvolvimento completas para React Native (TypeScript + Expo) destinadas ao Claude Code.

---

## 📁 Estrutura

```
ReactNative/
├── README.md                           # Este arquivo
├── CLAUDE.md.template                  # Template principal para projetos
├── rules/                              # Regras detalhadas (15 arquivos)
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-performance.md
│   ├── 13-state-management.md
│   └── 14-navigation.md
├── templates/                          # Templates de código
│   ├── screen.md
│   ├── component.md
│   ├── hook.md
│   └── test-component.md
└── checklists/                         # Checklists de validação
    ├── pre-commit.md
    ├── new-feature.md
    ├── refactoring.md
    └── security.md
```

---

## 🚀 Quick Start

### Para um Novo Projeto

1. **Copiar o template**:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/.claude/CLAUDE.md
   ```

2. **Personalizar**:
   - Substituir `{{PROJECT_NAME}}` pelo nome do projeto
   - Substituir `{{TECH_STACK}}` pela stack tecnológica
   - Preencher as informações específicas

3. **Copiar as regras** (opcional mas recomendado):
   ```bash
   cp -r rules/ /path/to/your/project/.claude/rules/
   cp -r templates/ /path/to/your/project/.claude/templates/
   cp -r checklists/ /path/to/your/project/.claude/checklists/
   ```

### Para um Projeto Existente

1. **Adaptar progressivamente**:
   - Começar por CLAUDE.md
   - Adicionar as regras prioritárias
   - Integrar os checklists
   - Adotar os templates

---

## 📚 Documentação

### Regras por Categoria

#### Fundamentos
- **00-project-context**: Template de contexto do projeto
- **01-workflow-analysis**: Processo de análise obrigatório
- **02-architecture**: Arquitetura React Native/Expo
- **03-coding-standards**: Padrões TypeScript/React Native

#### Princípios de Design
- **04-solid-principles**: SOLID adaptado para React Native
- **05-kiss-dry-yagni**: Princípios de simplicidade

#### Ferramentas e Qualidade
- **06-tooling**: Expo CLI, EAS, Metro
- **07-testing**: Jest, Testing Library, Detox
- **08-quality-tools**: ESLint, Prettier, TypeScript
- **09-git-workflow**: Git & Conventional Commits
- **10-documentation**: Padrões de documentação

#### Produção
- **11-security**: Segurança móvel (SecureStore, etc.)
- **12-performance**: Otimizações (Hermes, FlatList, etc.)
- **13-state-management**: React Query, Zustand, MMKV
- **14-navigation**: Expo Router

---

## 🎯 Regras Fundamentais

### REGRA #1: ANÁLISE OBRIGATÓRIA
**Antes de qualquer código, análise completa.**

Ver: [rules/01-workflow-analysis.md](./rules/01-workflow-analysis.md)

### REGRA #2: ARCHITECTURE FIRST
**Respeitar a arquitetura estabelecida.**

Ver: [rules/02-architecture.md](./rules/02-architecture.md)

### REGRA #3: PADRÕES DE CÓDIGO
**TypeScript strict, ESLint, Prettier.**

Ver: [rules/03-coding-standards.md](./rules/03-coding-standards.md)

### REGRA #4: PRINCÍPIOS SOLID
**Aplicar SOLID, KISS, DRY, YAGNI.**

Ver: [rules/04-solid-principles.md](./rules/04-solid-principles.md)

### REGRA #5: TESTES OBRIGATÓRIOS
**Coverage > 80%.**

Ver: [rules/07-testing.md](./rules/07-testing.md)

### REGRA #6: SEGURANÇA
**Security by design.**

Ver: [rules/11-security.md](./rules/11-security.md)

### REGRA #7: DESEMPENHO
**60 FPS target.**

Ver: [rules/12-performance.md](./rules/12-performance.md)

---

## 📋 Templates

### Screen Component
Template completo para criar uma nova tela com Expo Router.

Ver: [templates/screen.md](./templates/screen.md)

### Reusable Component
Template para componente reutilizável com tipos, estilos, testes.

Ver: [templates/component.md](./templates/component.md)

### Custom Hook
Template para custom hook com React Query ou lógica personalizada.

Ver: [templates/hook.md](./templates/hook.md)

### Component Test
Template completo de testes para componentes.

Ver: [templates/test-component.md](./templates/test-component.md)

---

## ✅ Checklists

### Pre-Commit
Validação antes de cada commit.

Ver: [checklists/pre-commit.md](./checklists/pre-commit.md)

**Pontos-chave**:
- Code lint (0 errors)
- Testes passam
- Coverage mantido
- Performance OK
- Security check

### New Feature
Workflow completo para nova funcionalidade.

Ver: [checklists/new-feature.md](./checklists/new-feature.md)

**Fases**:
1. Analysis
2. Design
3. Setup
4. Implementation (bottom-up)
5. Quality Assurance
6. Documentation
7. Manual Testing
8. Code Review
9. Merge & Deploy
10. Cleanup

### Refactoring
Processo seguro de refatoração.

Ver: [checklists/refactoring.md](./checklists/refactoring.md)

**Abordagem**:
- Testes primeiro
- Commits pequenos
- Testar continuamente
- Comportamento preservado

### Security Audit
Auditoria de segurança completa.

Ver: [checklists/security.md](./checklists/security.md)

**Áreas**:
- Sensitive data storage
- API security
- Input validation
- Authentication
- Dependencies

---

## 🛠 Stack Recomendada

### Core
- React Native
- Expo SDK
- TypeScript
- Node.js

### Navigation
- **Expo Router** (file-based routing)

### State Management
- **React Query** (server state)
- **Zustand** (global client state)
- **MMKV** (persistence)

### UI
- StyleSheet (native)
- Reanimated (animations)
- Gesture Handler

### Forms & Validation
- React Hook Form
- Zod

### Testing
- Jest
- React Native Testing Library
- Detox (E2E)

### Tools
- ESLint
- Prettier
- Husky
- EAS CLI

---

## 📖 Uso com Claude Code

### Configuração Global

Adicionar em `~/.claude/CLAUDE.md`:

```markdown
# React Native Projects

Para projetos React Native, seguir as regras:
/path/to/ReactNative/CLAUDE.md.template

Ver documentação completa:
/path/to/ReactNative/
```

### Configuração Por Projeto

No projeto React Native:

```
my-react-native-app/
├── .claude/
│   ├── CLAUDE.md           # Copiado de CLAUDE.md.template
│   ├── rules/              # (opcional) Copiado de rules/
│   ├── templates/          # (opcional) Copiado de templates/
│   └── checklists/         # (opcional) Copiado de checklists/
├── src/
├── app/
└── package.json
```

Claude Code lerá automaticamente `.claude/CLAUDE.md`.

---

## 🎓 Filosofia

### Análise Primeiro
**Think First, Code Later**

Sempre começar por:
1. Compreender a necessidade
2. Analisar o existente
3. Projetar a solução
4. DEPOIS codificar

### Architecture Matters
**Estrutura clara = Código manutenível**

- Feature-based organization
- Separation of concerns
- Clean architecture layers

### Quality Over Speed
**Um código de qualidade economiza tempo**

- Testes desde o início
- Code review sistemático
- Padrões rigorosos
- Refatoração contínua

### Security by Design
**A segurança não é uma opção**

- Tokens em SecureStore
- Input validation
- HTTPS only
- Dependencies audit

### Performance First
**60 FPS target**

- Hermes engine
- Optimizations (memo, FlatList)
- Images optimized
- Native driver animations

---

## 🔄 Workflow Típico

### Feature Development

```
Requisito recebido
    ↓
ANÁLISE (obrigatória)
    ↓
Design & Planning
    ↓
Setup (branch, ticket)
    ↓
Implementation (bottom-up)
    ├── 1. Types
    ├── 2. Services
    ├── 3. Hooks
    ├── 4. Components
    ├── 5. Screens
    └── 6. Integration
    ↓
Tests
    ↓
Quality Check
    ↓
Documentation
    ↓
Code Review
    ↓
Merge & Deploy
    ↓
Monitor
```

---

## 📊 Métricas de Qualidade

### Objetivos

- **Code Coverage**: > 80%
- **ESLint**: 0 errors, 0 warnings
- **TypeScript**: 0 errors (strict mode)
- **npm audit**: 0 vulnerabilities
- **Bundle Size**: < 10MB
- **Startup Time**: < 3s
- **FPS**: 60 constante

---

## 🤝 Contributing

Para melhorar estas regras:

1. Fork / Clone
2. Criar branch (`feature/improvement`)
3. Modificar as regras
4. Testar com um projeto real
5. Documentar as mudanças
6. Pull Request

---

## 📄 License

MIT

---

## 👥 Autores

- **Criador**: TheBeardedCTO
- **Contribuidores**: Ver CONTRIBUTORS.md

---

## 🔗 Recursos

### Documentação Oficial
- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Guias
- [React Query Docs](https://tanstack.com/query)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Expo Router Docs](https://docs.expo.dev/router/introduction/)

### Best Practices
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Performance](https://reactnative.dev/docs/performance)

---

**Version**: 1.0.0
**Last Updated**: 2025-12-03

**Remember**: Estas regras são guias, não dogmas. Adapte-as ao seu contexto.
