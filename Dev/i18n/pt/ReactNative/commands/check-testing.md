---
description: Verificar Testes React Native
argument-hint: [arguments]
---

# Verificar Testes React Native

## Argumentos

$ARGUMENTS

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

Você é um especialista em auditoria de testes React Native. Sua missão é analisar a estratégia de testes e a cobertura de acordo com os padrões definidos em `.claude/rules/07-testing.md` e `.claude/rules/08-quality-tools.md`.

### Etapa 1: Análise da configuração de testes

1. Verificar a presença e configuração do Jest
2. Verificar a presença e configuração da React Native Testing Library (RNTL)
3. Verificar a presença e configuração do Detox (testes E2E)
4. Analisar os scripts de teste no package.json

### Etapa 2: Configuração do Jest (5 pontos)

#### 🧪 Arquivos de configuração

- [ ] **(1 pt)** `jest.config.js` ou configuração no package.json presente
- [ ] **(1 pt)** Preset do React Native configurado (`@react-native/jest-preset` ou equivalente)
- [ ] **(1 pt)** Arquivos de setup configurados (`setupFilesAfterEnv`)
- [ ] **(1 pt)** Cobertura de código habilitada (coverage)
- [ ] **(1 pt)** Transformações configuradas para TypeScript e React Native

**Arquivos a verificar:**
```bash
jest.config.js
jest.setup.js
package.json
```

#### 📊 Configuração de cobertura

Verificar em `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  }
}
```

- [ ] Limites de cobertura definidos (≥ 80% recomendado)
- [ ] Coleta a partir das pastas corretas (src/, app/)
- [ ] Exclusões apropriadas (node_modules, __tests__, etc.)

### Etapa 3: Testes Unitários com RNTL (8 pontos)

Referência: `.claude/rules/07-testing.md`

#### 📁 Organização dos testes

- [ ] **(1 pt)** Testes colocalizados com componentes ou em `__tests__/`
- [ ] **(1 pt)** Convenção de nomenclatura: `*.test.tsx` ou `*.spec.tsx`
- [ ] **(1 pt)** Estrutura AAA (Arrange, Act, Assert) respeitada

**Arquivos a verificar:**
```bash
src/**/__tests__/
src/**/*.test.tsx
src/**/*.spec.tsx
```

#### 🧩 Qualidade dos testes unitários

Analisar de 5 a 10 arquivos de teste:

- [ ] **(1 pt)** Uso de `@testing-library/react-native` (render, fireEvent, waitFor)
- [ ] **(1 pt)** Testes de componentes isolados com props mockados
- [ ] **(1 pt)** Testes de hooks customizados com `@testing-library/react-hooks`
- [ ] **(1 pt)** Mocks apropriados para módulos nativos (AsyncStorage, etc.)
- [ ] **(1 pt)** Testes de casos extremos e de erro

**Exemplo de bom teste:**
```typescript
describe('LoginButton', () => {
  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<LoginButton onPress={onPress} />);

    fireEvent.press(getByText('Login'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Etapa 4: Testes de Integração (4 pontos)

- [ ] **(1 pt)** Testes de fluxo completo do usuário
- [ ] **(1 pt)** Testes de navegação entre telas
- [ ] **(1 pt)** Testes de chamadas de API mockadas
- [ ] **(1 pt)** Testes de gerenciamento de estado (Context, Redux, Zustand)

**Arquivos a verificar:**
```bash
src/**/*.integration.test.tsx
__tests__/integration/
```

### Etapa 5: Testes E2E com Detox (4 pontos)

#### 🤖 Configuração do Detox

- [ ] **(1 pt)** `.detoxrc.js` ou configuração do Detox presente
- [ ] **(1 pt)** Configuração para iOS e Android
- [ ] **(1 pt)** Scripts de testes E2E no package.json (`test:e2e`)

**Arquivos a verificar:**
```bash
.detoxrc.js
.detoxrc.json
e2e/
package.json
```

#### 🎬 Testes E2E

- [ ] **(1 pt)** Pelo menos 3 cenários E2E críticos testados (login, navegação principal, ação-chave)

**Arquivos a verificar:**
```bash
e2e/**/*.e2e.ts
e2e/**/*.e2e.js
```

### Etapa 6: Cobertura de Testes (4 pontos)

Executar o comando de cobertura:

```bash
npm run test -- --coverage
# ou
yarn test --coverage
```

Analisar o relatório de cobertura:

- [ ] **(1 pt)** Cobertura global ≥ 80%
- [ ] **(1 pt)** Cobertura de branches ≥ 75%
- [ ] **(1 pt)** Componentes críticos cobertos a 100%
- [ ] **(1 pt)** Relatório de cobertura gerado (coverage/lcov-report/)

**Arquivos a verificar:**
```bash
coverage/lcov-report/index.html
coverage/coverage-summary.json
```

### Etapa 7: Calcular pontuação

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critério                         │ Pontos  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Configuração do Jest             │ XX/5    │ ✅/⚠️/❌│
│ Testes Unitários (RNTL)          │ XX/8    │ ✅/⚠️/❌│
│ Testes de Integração             │ XX/4    │ ✅/⚠️/❌│
│ Testes E2E (Detox)               │ XX/4    │ ✅/⚠️/❌│
│ Cobertura de Código              │ XX/4    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL TESTES                     │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Atenção (15-19/25)
- ❌ Crítico (< 15/25)

### Etapa 8: Relatório detalhado

## 📊 RESULTADOS DA AUDITORIA DE TESTES

### ✅ Pontos Fortes

Liste as boas práticas identificadas:
- [Prática 1 com exemplo de teste]
- [Prática 2 com exemplo de teste]

### ⚠️ Pontos de Melhoria

Liste os problemas identificados por prioridade:

1. **[Problema 1]**
   - **Severidade:** Crítica/Alta/Média
   - **Localização:** [Arquivos/componentes não testados]
   - **Impacto:** [Risco de regressão]
   - **Recomendação:** [Ações a tomar]

2. **[Problema 2]**
   - **Severidade:** Crítica/Alta/Média
   - **Localização:** [Arquivos/componentes não testados]
   - **Impacto:** [Risco de regressão]
   - **Recomendação:** [Ações a tomar]

### 📈 Métricas de Testes

#### Cobertura de código

```
┌─────────────────┬──────────┬──────────┬──────────┬──────────┐
│ Tipo            │ Linhas   │ Branches │ Funções  │ Statements│
├─────────────────┼──────────┼──────────┼──────────┼──────────┤
│ Global          │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Componentes     │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Hooks           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Utils           │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
│ Serviços        │ XX.XX%   │ XX.XX%   │ XX.XX%   │ XX.XX%   │
└─────────────────┴──────────┴──────────┴──────────┴──────────┘
```

#### Estatísticas de testes

- **Número total de testes:** XX
  - Testes unitários: XX
  - Testes de integração: XX
  - Testes E2E: XX
- **Testes aprovados:** XX
- **Testes reprovados:** XX
- **Tempo total de execução:** XX segundos
- **Proporção testes/código:** XX testes para YY linhas de código

#### Componentes sem testes

Liste os componentes críticos não testados:
1. `[Caminho/Componente]` - [Razão de criticidade]
2. `[Caminho/Componente]` - [Razão de criticidade]
3. `[Caminho/Componente]` - [Razão de criticidade]

#### Funcionalidades críticas testadas

- [ ] Autenticação (login, logout, refresh token)
- [ ] Navegação principal
- [ ] Formulários críticos
- [ ] Principais chamadas de API
- [ ] Tratamento de erros
- [ ] Estados de carregamento
- [ ] Gerenciamento offline

### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

#### 1. [AÇÃO #1]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Componentes/funcionalidades a testar com prioridade]
- **Cobertura atual:** XX%
- **Cobertura alvo:** YY%
- **Arquivos afetados:**
  - `[arquivo1]` (cobertura: XX%)
  - `[arquivo2]` (cobertura: XX%)
- **Exemplos de testes a adicionar:**
```typescript
describe('[Componente]', () => {
  it('should [comportamento]', () => {
    // Teste a implementar
  });
});
```

#### 2. [AÇÃO #2]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Configuração ou melhoria de testes]
- **Arquivos afetados:** [Lista]

#### 3. [AÇÃO #3]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Testes E2E ou de integração a adicionar]
- **Cenários a cobrir:**
  - [Cenário 1]
  - [Cenário 2]

---

## 🚀 Recomendações

### Ganhos Rápidos (Baixo esforço, alto impacto)
- [Melhoria rápida 1]
- [Melhoria rápida 2]

### Investimentos (Esforço médio/alto, alto impacto)
- [Melhoria estrutural 1]
- [Melhoria estrutural 2]

### Boas práticas a adotar
- Escrever testes junto com o código (TDD)
- Almejar cobertura mínima de 80%
- Testar casos extremos e erros
- Manter os testes atualizados com o código
- Usar snapshots com parcimônia

---

## 📚 Referências

- `.claude/rules/07-testing.md` - Padrões de testes
- `.claude/rules/08-quality-tools.md` - Ferramentas de qualidade
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)

---

**Pontuação final: XX/25**
