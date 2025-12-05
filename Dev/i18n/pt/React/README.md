# Regras de Desenvolvimento React TypeScript para Claude Code

## Visão Geral

Esta pasta contém um conjunto completo de regras, templates e checklists para o desenvolvimento React TypeScript com Claude Code. Essas regras asseguram a consistência, qualidade e manutenibilidade do código em todos os seus projetos React.

## Estrutura da Pasta

```
React/
├── CLAUDE.md.template          # Configuração principal (copiar para seu projeto)
├── README.md                   # Este arquivo
│
├── rules/                      # Regras de desenvolvimento detalhadas
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
│   ├── 12-performance.md          # A criar
│   ├── 13-state-management.md     # A criar
│   └── 14-styling.md              # A criar
│
├── templates/                  # Templates de código
│   ├── component.md           # Template componente React
│   ├── hook.md                # Template hook personalizado
│   ├── context.md             # A criar
│   ├── test-component.md      # A criar
│   └── test-hook.md           # A criar
│
└── checklists/                # Checklists de validação
    ├── pre-commit.md          # Checklist antes do commit
    ├── new-feature.md         # Checklist nova funcionalidade
    ├── refactoring.md         # A criar
    └── security.md            # A criar
```

## Utilização

### 1. Inicializar um Novo Projeto

1. **Copiar CLAUDE.md.template** para seu projeto:
   ```bash
   cp CLAUDE.md.template /path/to/your/project/CLAUDE.md
   ```

2. **Substituir os placeholders** em CLAUDE.md:
   - `{{PROJECT_NAME}}`: Nome do seu projeto
   - `{{TECH_STACK}}`: Stack técnico completo
   - `{{REACT_VERSION}}`: Versão do React
   - `{{TYPESCRIPT_VERSION}}`: Versão do TypeScript
   - `{{BUILD_TOOL}}`: Vite, Next.js, etc.
   - `{{PACKAGE_MANAGER}}`: pnpm, npm, yarn
   - Etc.

3. **Copiar rules/00-project-context.md.template**:
   ```bash
   cp rules/00-project-context.md.template /path/to/your/project/docs/project-context.md
   ```

4. **Preencher o contexto do projeto** com as informações específicas.

### 2. Configurar Claude Code

No seu projeto, Claude Code lerá automaticamente o arquivo `CLAUDE.md` e aplicará todas as regras definidas.

### 3. Referenciar as Regras

Cada arquivo de regras pode ser referenciado no CLAUDE.md principal:

```markdown
**Referência**: `rules/01-workflow-analysis.md`
```

Claude Code terá acesso a todas essas regras para assisti-lo no desenvolvimento.

## Regras Principais

### 1. Fluxo de Análise (01-workflow-analysis.md)

**Antes de escrever código, SEMPRE**:
- Analisar o código existente
- Compreender a necessidade
- Projetar a solução
- Documentar as decisões

### 2. Arquitetura (02-architecture.md)

- **Feature-based**: Organização por funcionalidade de negócio
- **Atomic Design**: Hierarquia atoms → molecules → organisms → templates
- **Container/Presenter**: Separação lógica/apresentação
- **Hooks Personalizados**: Lógica reutilizável

### 3. Padrões de Código (03-coding-standards.md)

- **TypeScript Strict**: Modo estrito ativado
- **ESLint**: Configuração estrita
- **Prettier**: Formatação automática
- **Convenções**: Nomenclatura coerente

### 4. Princípios SOLID (04-solid-principles.md)

Aplicação dos princípios SOLID no React com exemplos concretos.

### 5. KISS, DRY, YAGNI (05-kiss-dry-yagni.md)

- **KISS**: Simplicidade acima de tudo
- **DRY**: Evitar duplicação inteligentemente
- **YAGNI**: Implementar apenas o necessário

### 6. Tooling (06-tooling.md)

Configuração completa de:
- Vite / Next.js
- pnpm / npm
- Docker + Makefile
- Build optimization

### 7. Tests (07-testing.md)

- **Pirâmide de testes**: 70% unitários, 20% integração, 10% E2E
- **Vitest**: Testes unitários
- **React Testing Library**: Testes componentes
- **MSW**: Mock API
- **Playwright**: Testes E2E

### 8. Qualidade (08-quality-tools.md)

- **ESLint**: Linting
- **Prettier**: Formatting
- **TypeScript**: Type checking
- **Husky**: Git hooks
- **Commitlint**: Conventional commits

### 9. Git Workflow (09-git-workflow.md)

- **Git Flow**: Estratégia de branching
- **Conventional Commits**: Mensagens padronizadas
- **Pull Requests**: Fluxo de revisão
- **Versioning**: Semantic versioning

### 10. Documentação (10-documentation.md)

- **JSDoc/TSDoc**: Documentação do código
- **Storybook**: Documentação dos componentes
- **README**: Documentação do projeto
- **Changelog**: Histórico de versões

### 11. Segurança (11-security.md)

- **XSS Prevention**: Sanitização do HTML
- **CSRF Protection**: Tokens e validação
- **Input Validation**: Zod schemas
- **Authentication**: JWT, protected routes
- **Dependencies**: Auditoria regular

## Templates de Código

### Componente React (templates/component.md)

Template completo para criar componentes React com:
- TypeScript
- Props tipadas
- JSDoc
- Testes
- Storybook

### Hook Personalizado (templates/hook.md)

Template para criar hooks personalizados com:
- TypeScript
- Documentação
- Testes
- Exemplos de uso

## Checklists

### Pre-Commit (checklists/pre-commit.md)

Checklist a verificar antes de cada commit:
- Code quality
- Testes
- Documentação
- Segurança
- Git

### Nova Funcionalidade (checklists/new-feature.md)

Fluxo completo para implementar uma nova funcionalidade:
1. Análise e planejamento
2. Design técnico
3. Implementação
4. Testes
5. Qualidade e desempenho
6. Documentação
7. Revisão e merge
8. Deploy e monitoramento

## Comandos Úteis

### Desenvolvimento

```bash
# Criar um novo projeto React + TypeScript
npm create vite@latest my-app -- --template react-ts
cd my-app
pnpm install

# Copiar as regras
cp /path/to/React/CLAUDE.md.template ./CLAUDE.md
```

### Qualidade

```bash
# Verificar tudo
pnpm run quality

# Detalhe
pnpm run lint
pnpm run type-check
pnpm run test
pnpm run build
```

## Arquivos Restantes a Criar

Para completar este sistema de regras, falta criar:

### Rules

- [ ] `12-performance.md`: Otimizações React (memo, lazy, code splitting)
- [ ] `13-state-management.md`: React Query, Zustand, Context API
- [ ] `14-styling.md`: Tailwind, CSS Modules, styled-components

### Templates

- [ ] `context.md`: Template de Context Provider
- [ ] `test-component.md`: Template de teste componente
- [ ] `test-hook.md`: Template de teste hook

### Checklists

- [ ] `refactoring.md`: Checklist de refactoring seguro
- [ ] `security.md`: Auditoria de segurança completa

## Contribuição

Para melhorar essas regras:

1. Criar um branch `feature/improve-react-rules`
2. Modificar os arquivos de regras
3. Testar em um projeto real
4. Criar uma Pull Request com as melhorias

## Recursos

### Documentação Oficial

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org
- Vite: https://vitejs.dev
- TanStack Query: https://tanstack.com/query
- React Router: https://reactrouter.com

### Ferramentas Recomendadas

- Vite: Build tool rápida
- pnpm: Gerenciador de pacotes eficiente
- Vitest: Testing framework rápido
- Playwright: Testes E2E
- Storybook: Documentação de componentes

## Licença

Essas regras são fornecidas "as-is" para uso com Claude Code.

## Suporte

Para perguntas ou sugestões:
- Criar uma issue no repositório
- Consultar a documentação do Claude Code

---

**Última atualização**: 2025-12-03
**Versão**: 1.0.0
**Mantenedor**: TheBeardedCTO
