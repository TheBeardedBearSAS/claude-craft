---
description: Auditoria de Acessibilidade
---

# Auditoria de Acessibilidade

Realize uma auditoria completa de acessibilidade (a11y) da aplicação React.

## O Que Este Comando Faz

1. **Análise de Acessibilidade**
   - Verificar componentes em busca de problemas de a11y
   - Checar rótulos ARIA
   - Verificar HTML semântico
   - Testar navegação por teclado
   - Verificar contrastes de cores

2. **Ferramentas Utilizadas**
   - eslint-plugin-jsx-a11y
   - axe-core
   - Lighthouse
   - React DevTools

3. **Relatório Gerado**
   - Lista de violações de a11y
   - Nível de severidade (crítico, sério, moderado, menor)
   - Recomendações acionáveis
   - Exemplos de código para correções

## Como Usar

```bash
# Executar auditoria de acessibilidade
npm run a11y:check

# Ou com pnpm
pnpm a11y:check
```

## Modo de Planejamento

> O modo de planejamento é ativado automaticamente quando o escopo abrange múltiplos módulos ou requer investigação transversal.

## O Que Verificar

### 1. HTML Semântico

```typescript
// ❌ Ruim - Não semântico
<div onClick={handleClick}>Clique aqui</div>

// ✅ Bom - Semântico
<button onClick={handleClick}>Clique aqui</button>
```

### 2. Rótulos ARIA

```typescript
// ❌ Ruim - Sem rótulo
<input type="text" />

// ✅ Bom - Com label
<label htmlFor="name">Nome</label>
<input id="name" type="text" />

// ✅ Bom - Com aria-label
<button aria-label="Fechar modal" onClick={onClose}>
  <XIcon />
</button>
```

### 3. Navegação por Teclado

```typescript
// ✅ Bom - Navegação por Tab funciona
<button onClick={handleClick}>Ação</button>

// ✅ Bom - Tratamento de teclado personalizado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Botão Personalizado
</div>
```

### 4. Contraste de Cores

- O texto deve ter uma taxa de contraste suficiente
- WCAG AA: 4,5:1 para texto normal
- WCAG AAA: 7:1 para texto normal
- Use ferramentas para verificar os contrastes

### 5. Texto Alternativo para Imagens

```typescript
// ❌ Ruim - Alt ausente
<img src="photo.jpg" />

// ✅ Bom - Alt descritivo
<img src="photo.jpg" alt="Equipe da empresa na conferência anual" />

// ✅ Bom - Imagem decorativa
<img src="decoration.jpg" alt="" role="presentation" />
```

## Configuração

### ESLint (eslint-plugin-jsx-a11y)

```json
// .eslintrc.json
{
  "extends": [
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/aria-role": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    "jsx-a11y/label-has-associated-control": "error",
    "jsx-a11y/no-noninteractive-element-interactions": "error"
  }
}
```

### Testes Automatizados com axe-core

```typescript
// test/a11y.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { MyComponent } from './MyComponent';

expect.extend(toHaveNoViolations);

describe('Acessibilidade', () => {
  it('não deve ter violações de a11y', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Problemas Comuns e Correções

### Problema 1: Rótulos de Formulário Ausentes

```typescript
// ❌ Problema
<input type="email" placeholder="Email" />

// ✅ Solução
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="seu@email.com" />
```

### Problema 2: Elementos Não Interativos com Manipuladores de Clique

```typescript
// ❌ Problema
<div onClick={handleClick}>Clique aqui</div>

// ✅ Solução 1: Usar button
<button onClick={handleClick}>Clique aqui</button>

// ✅ Solução 2: Adicionar role adequado e suporte a teclado
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Clique aqui
</div>
```

### Problema 3: Texto Alternativo Ausente

```typescript
// ❌ Problema
<img src="logo.png" />

// ✅ Solução
<img src="logo.png" alt="Logo da Empresa" />
```

### Problema 4: Informação Transmitida Apenas por Cor

```typescript
// ❌ Problema
<span style={{ color: 'red' }}>Erro</span>

// ✅ Solução
<span style={{ color: 'red' }} aria-label="Erro">
  <ErrorIcon aria-hidden="true" /> Erro
</span>
```

## Testes com Lighthouse

```bash
# Instalar Lighthouse
npm install -g lighthouse

# Executar auditoria
lighthouse http://localhost:3000 --view

# Salvar relatório
lighthouse http://localhost:3000 --output html --output-path ./report.html
```

## Boas Práticas

1. **Use HTML semântico** (button, nav, main, header, footer)
2. **Adicione rótulos ARIA** onde necessário
3. **Teste a navegação por teclado** (Tab, Enter, Escape)
4. **Verifique contrastes de cores** (mínimo WCAG AA)
5. **Forneça texto alternativo** para imagens
6. **Suporte a leitores de tela**
7. **Testes automatizados** com axe-core
8. **Testes manuais** com leitores de tela (NVDA, JAWS, VoiceOver)

## Recursos

- [Diretrizes WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Acessibilidade](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility)
- [React Acessibilidade](https://react.dev/learn/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
