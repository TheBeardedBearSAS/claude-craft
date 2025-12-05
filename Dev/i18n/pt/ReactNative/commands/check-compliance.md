# Comando: Verificar Conformidade

Verifique a conformidade do código React Native com padrões, convenções e melhores práticas do projeto.

---

## Objetivo

Este comando verifica se o código segue os padrões estabelecidos do projeto, incluindo estilo de código, convenções de nomenclatura e princípios de design.

---

## Verificações

### 1. Estilo de Código

**Executar ferramentas:**

```bash
# Prettier
npx prettier --check "src/**/*.{ts,tsx}"

# ESLint
npx eslint "src/**/*.{ts,tsx}"

# TypeScript
npx tsc --noEmit
```

**Verificar:**

- [ ] Código formatado com Prettier
- [ ] Sem erros de ESLint
- [ ] Sem erros de TypeScript
- [ ] Convenções de nomenclatura seguidas
- [ ] Imports organizados

### 2. Convenções de Nomenclatura

**Verificar:**

- [ ] Componentes: PascalCase (UserProfile.tsx)
- [ ] Hooks: camelCase com prefixo use (useAuth.ts)
- [ ] Arquivos utils: camelCase (formatDate.ts)
- [ ] Constantes: UPPER_SNAKE_CASE
- [ ] Variáveis/funções: camelCase
- [ ] Interfaces: PascalCase com sufixo Props/State (ButtonProps)
- [ ] Types: PascalCase

### 3. Estrutura de Arquivos

**Verificar:**

- [ ] Um componente por arquivo
- [ ] Arquivos nomeados como o componente exportado
- [ ] Barrel exports (index.ts) em pastas de componentes
- [ ] Arquivos de teste co-localizados (.test.tsx)
- [ ] Arquivos de estilo co-localizados (.styles.ts)

### 4. Princípios SOLID

**Avaliar:**

- [ ] Single Responsibility: um componente, uma responsabilidade
- [ ] Open/Closed: extensível sem modificação
- [ ] Liskov Substitution: contratos respeitados
- [ ] Interface Segregation: sem props não utilizadas
- [ ] Dependency Inversion: depende de abstrações

### 5. Testes

**Verificar:**

- [ ] Cobertura de testes > 80%
- [ ] Testes unitários para hooks e utils
- [ ] Testes de componentes para UI
- [ ] Testes de integração para fluxos críticos
- [ ] Convenções de nomenclatura de testes

### 6. Documentação

**Verificar:**

- [ ] JSDoc para funções públicas
- [ ] README atualizado
- [ ] Comentários para lógica complexa
- [ ] Props de componentes documentadas
- [ ] CHANGELOG atualizado

---

## Relatório

```markdown
## Relatório de Conformidade

### Métricas
- Conformidade com Prettier: [%]
- Conformidade com ESLint: [%]
- Conformidade com TypeScript: [%]
- Conformidade com convenções: [%]
- Cobertura de testes: [%]

### Violações
1. **[Tipo de violação]**
   - Arquivo: [path]
   - Descrição: [detalhes]
   - Ação: [correção]

### Recomendações
- [Lista de ações para melhorar conformidade]
```

---

## Ações

- [ ] Corrigir todas as violações críticas
- [ ] Configurar pre-commit hooks (Husky)
- [ ] Documentar padrões do projeto
- [ ] Treinar equipe em convenções

---

**Conformidade consistente resulta em código mais manutenível e colaboração mais eficiente.**
