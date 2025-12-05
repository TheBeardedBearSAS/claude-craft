# Comando: Verificar Qualidade do Código

Avalie a qualidade geral do código React Native incluindo legibilidade, manutenibilidade e aderência às melhores práticas.

---

## Objetivo

Este comando realiza uma análise abrangente da qualidade do código, identificando áreas de melhoria e garantindo que o código atende aos padrões de qualidade.

---

## Análise

### 1. Ferramentas Automáticas

**Executar:**

```bash
# ESLint
npx eslint src --ext .ts,.tsx --max-warnings 0

# TypeScript
npx tsc --noEmit

# Prettier
npx prettier --check "src/**/*.{ts,tsx}"

# Análise de complexidade
npx ts-complex src/**/*.{ts,tsx}
```

### 2. Métricas de Código

**Avaliar:**

- [ ] Complexidade ciclomática < 10
- [ ] Profundidade de aninhamento < 4
- [ ] Comprimento de funções < 50 linhas
- [ ] Comprimento de arquivos < 300 linhas
- [ ] Duplicação de código < 3%

### 3. Code Smells

**Identificar:**

- [ ] Funções muito longas
- [ ] Classes/componentes muito grandes
- [ ] Muitos parâmetros (> 4)
- [ ] Condições aninhadas profundamente
- [ ] Código duplicado
- [ ] Magic numbers
- [ ] Variáveis globais
- [ ] Código morto

### 4. TypeScript

**Verificar:**

- [ ] Sem uso de `any`
- [ ] Tipos explícitos em funções públicas
- [ ] Interfaces bem definidas
- [ ] Generics usados apropriadamente
- [ ] Type guards implementados

### 5. Componentes React Native

**Avaliar:**

- [ ] Componentes pequenos e focados
- [ ] Props bem tipadas
- [ ] Hooks usados corretamente
- [ ] Memoization apropriada
- [ ] Event handlers otimizados

---

## Relatório

```markdown
## Qualidade de Código

### Métricas Gerais
- Complexidade média: [X]
- Duplicação: [X]%
- Cobertura de testes: [X]%
- Dívida técnica: [horas estimadas]

### Problemas Principais
1. [Problema] - [localização] - [severidade]
2. [Problema] - [localização] - [severidade]

### Recomendações
1. [Ação prioritária]
2. [Ação média prioridade]
3. [Melhoria sugerida]
```

---

## Ações

- [ ] Refatorar funções complexas
- [ ] Dividir componentes grandes
- [ ] Eliminar código duplicado
- [ ] Adicionar testes faltantes
- [ ] Atualizar documentação
- [ ] Configurar qualidade gates em CI/CD

---

**Qualidade de código não é luxo, é necessidade para manutenibilidade a longo prazo.**
