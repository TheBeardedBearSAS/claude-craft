---
description: Verificar Qualidade de Código React Native
argument-hint: [arguments]
---

# Verificar Qualidade de Código React Native

## Argumentos

$ARGUMENTS

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer uma investigação transversal.

## MISSÃO

Você é um especialista em auditoria de qualidade de código React Native. Sua missão é analisar a conformidade do código de acordo com os padrões definidos em `.claude/rules/03-coding-standards.md`, `.claude/rules/04-solid-principles.md` e `.claude/rules/05-kiss-dry-yagni.md`.

### Etapa 1: Análise da configuração

1. Verificar a presença e configuração do TypeScript
2. Verificar a presença e configuração do ESLint
3. Verificar a presença e configuração do Prettier
4. Analisar os arquivos de configuração do package.json

### Etapa 2: Verificação do TypeScript (7 pontos)

Verificar a configuração do TypeScript:

#### 🔧 Configuração do tsconfig.json

- [ ] **(2 pts)** `"strict": true` habilitado
- [ ] **(1 pt)** `"noImplicitAny": true`
- [ ] **(1 pt)** `"strictNullChecks": true`
- [ ] **(1 pt)** `"noUnusedLocals": true` e `"noUnusedParameters": true`
- [ ] **(1 pt)** Aliases de caminho configurados (ex.: `@/components`, `@/utils`)
- [ ] **(1 pt)** Tipos corretos para React Native (`@types/react`, `@types/react-native`)

**Arquivos a verificar:**
```bash
tsconfig.json
package.json
```

#### 📝 Uso do TypeScript no Código

Verificar de 5 a 10 arquivos TypeScript aleatórios:

- [ ] Sem uso de `any` (exceto casos justificados e documentados)
- [ ] Interfaces/Tipos bem definidos para props
- [ ] Tipos para funções (parâmetros e retorno)
- [ ] Sem `@ts-ignore` ou `@ts-nocheck` (exceto exceções documentadas)
- [ ] Uso de generics quando apropriado

**Arquivos a verificar:**
```bash
src/**/*.tsx
src/**/*.ts
```

### Etapa 3: Verificação do ESLint (6 pontos)

#### 🔍 Configuração do ESLint

- [ ] **(2 pts)** `.eslintrc.js` ou `.eslintrc.json` presente e configurado
- [ ] **(1 pt)** Plugin `@react-native` ou equivalente configurado
- [ ] **(1 pt)** Plugin `@typescript-eslint` configurado
- [ ] **(1 pt)** Regras de React Hooks habilitadas (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`)
- [ ] **(1 pt)** Scripts ESLint no package.json (`lint`, `lint:fix`)

**Arquivos a verificar:**
```bash
.eslintrc.js
.eslintrc.json
package.json
```

#### ⚠️ Verificação de Erros do ESLint

Executar o ESLint e analisar os resultados:

```bash
npm run lint
# ou
yarn lint
```

- [ ] 0 erros ESLint
- [ ] < 10 avisos ESLint
- [ ] Sem regras desabilitadas sem justificativa

### Etapa 4: Verificação do Prettier (3 pontos)

- [ ] **(1 pt)** `.prettierrc` presente com configuração consistente
- [ ] **(1 pt)** Integração ESLint + Prettier (sem conflitos)
- [ ] **(1 pt)** Script de formatação no package.json

**Arquivos a verificar:**
```bash
.prettierrc
.prettierrc.js
.prettierrc.json
package.json
```

### Etapa 5: Princípios SOLID (4 pontos)

Referência: `.claude/rules/04-solid-principles.md`

Analisar de 3 a 5 componentes ou módulos principais:

- [ ] **(1 pt)** **S - Responsabilidade Única**: Cada componente/função tem uma única responsabilidade
- [ ] **(1 pt)** **O - Aberto/Fechado**: Extensões possíveis sem modificar o código existente
- [ ] **(1 pt)** **L - Substituição de Liskov**: Componentes são intercambiáveis
- [ ] **(1 pt)** **D - Inversão de Dependência**: Dependências via props/injeção, sem acoplamento forte

**Arquivos a analisar:**
```bash
src/components/**/*.tsx
src/features/**/*.tsx
src/hooks/**/*.ts
```

### Etapa 6: Princípios KISS, DRY, YAGNI (5 pontos)

Referência: `.claude/rules/05-kiss-dry-yagni.md`

- [ ] **(2 pts)** **KISS (Keep It Simple)**: Código simples e legível, sem engenharia excessiva
- [ ] **(2 pts)** **DRY (Don't Repeat Yourself)**: Sem duplicação de código, reutilização via hooks/utils
- [ ] **(1 pt)** **YAGNI (You Aren't Gonna Need It)**: Sem código não utilizado ou funcionalidades especulativas

Verificar:
- Funções duplicadas que poderiam ser fatoradas
- Lógica complexa que poderia ser simplificada
- Código morto ou comentado que deveria ser removido

**Arquivos a analisar:**
```bash
src/**/*.ts
src/**/*.tsx
```

### Etapa 7: Padrões de Código React Native

Referência: `.claude/rules/03-coding-standards.md`

#### 📱 Boas Práticas Específicas

- [ ] Uso correto de `StyleSheet.create()` (não estilos inline em todo lugar)
- [ ] Constantes para cores, espaçamentos, tipografia
- [ ] Componentes funcionais com hooks (sem componentes de classe)
- [ ] Gerenciamento de estado correto (useState, useReducer conforme necessário)
- [ ] Uso de `useCallback` para handlers passados como props
- [ ] Uso de `useMemo` para cálculos custosos

**Arquivos a verificar:**
```bash
src/components/**/*.tsx
src/theme/
src/constants/
```

### Etapa 8: Calcular pontuação

```
┌──────────────────────────────────┬─────────┬────────┐
│ Critério                         │ Pontos  │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Configuração TypeScript          │ XX/7    │ ✅/⚠️/❌│
│ ESLint                           │ XX/6    │ ✅/⚠️/❌│
│ Prettier                         │ XX/3    │ ✅/⚠️/❌│
│ Princípios SOLID                 │ XX/4    │ ✅/⚠️/❌│
│ KISS, DRY, YAGNI                 │ XX/5    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL QUALIDADE DE CÓDIGO        │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legenda:**
- ✅ Excelente (≥ 20/25)
- ⚠️ Atenção (15-19/25)
- ❌ Crítico (< 15/25)

### Etapa 9: Relatório detalhado

## 📊 RESULTADOS DA AUDITORIA DE QUALIDADE DE CÓDIGO

### ✅ Pontos Fortes

Liste as boas práticas identificadas:
- [Prática 1 com exemplo de código]
- [Prática 2 com exemplo de código]

### ⚠️ Pontos de Melhoria

Liste os problemas identificados por prioridade:

1. **[Problema 1]**
   - **Severidade:** Crítica/Alta/Média
   - **Localização:** [Arquivos afetados]
   - **Exemplo:**
   ```typescript
   // Código problemático
   ```
   - **Recomendação:**
   ```typescript
   // Código corrigido
   ```

2. **[Problema 2]**
   - **Severidade:** Crítica/Alta/Média
   - **Localização:** [Arquivos afetados]
   - **Exemplo:**
   ```typescript
   // Código problemático
   ```
   - **Recomendação:**
   ```typescript
   // Código corrigido
   ```

### 📈 Métricas de Qualidade

Executar e reportar as seguintes métricas:

#### Erros ESLint
```bash
npm run lint
```
- **Erros:** XX
- **Avisos:** XX
- **Arquivos analisados:** XX

#### Complexidade de Código

Se SonarQube ou outra ferramenta estiver disponível:
- **Complexidade ciclomática média:** XX (alvo: < 10)
- **Linhas de código:** XX
- **Duplicação:** XX% (alvo: < 5%)
- **Dívida técnica:** XX horas

#### TypeScript

- **Percentual de tipagem estrita:** XX% (alvo: 100%)
- **Uso de `any`:** XX ocorrências (alvo: 0)
- **Erros TypeScript:** XX (alvo: 0)

### 🎯 TOP 3 AÇÕES PRIORITÁRIAS

#### 1. [AÇÃO #1]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Detalhe do problema]
- **Solução:** [Ação concreta]
- **Arquivos:** [Lista de arquivos]
- **Exemplo:**
```typescript
// Antes
[código problemático]

// Depois
[código corrigido]
```

#### 2. [AÇÃO #2]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Detalhe do problema]
- **Solução:** [Ação concreta]
- **Arquivos:** [Lista de arquivos]

#### 3. [AÇÃO #3]
- **Esforço:** Baixo/Médio/Alto
- **Impacto:** Crítico/Alto/Médio
- **Descrição:** [Detalhe do problema]
- **Solução:** [Ação concreta]
- **Arquivos:** [Lista de arquivos]

---

## 📚 Referências

- `.claude/rules/03-coding-standards.md` - Padrões de código
- `.claude/rules/04-solid-principles.md` - Princípios SOLID
- `.claude/rules/05-kiss-dry-yagni.md` - Princípios KISS, DRY, YAGNI
- `.claude/rules/06-tooling.md` - Configuração de ferramentas

---

**Pontuação final: XX/25**
