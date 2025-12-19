---
description: Auditoria de Acessibilidade
---

# Auditoria de Acessibilidade

Realizar uma auditoria completa de acessibilidade (a11y) da aplicacao React.

## O Que Este Comando Faz

1. **Analise de Acessibilidade**
   - Escanear componentes em busca de problemas de a11y
   - Verificar rotulos ARIA
   - Verificar HTML semantico
   - Testar navegacao por teclado
   - Verificar contrastes de cores

2. **Ferramentas Usadas**
   - eslint-plugin-jsx-a11y
   - axe-core
   - Lighthouse
   - React DevTools

3. **Relatorio Gerado**
   - Lista de violacoes de a11y
   - Nivel de severidade (critico, serio, moderado, menor)
   - Recomendacoes acionaveis
   - Exemplos de codigo para correcoes

## Como Usar

```bash
# Executar auditoria de acessibilidade
npm run a11y:check

# Ou com pnpm
pnpm a11y:check
```

## O Que Verificar

### 1. HTML Semantico

```typescript
// ❌ Ruim - Nao-semantico
<div onClick={handleClick}>Clique em mim</div>

// ✅ Bom - Semantico
<button onClick={handleClick}>Clique em mim</button>
```

### 2. Rotulos ARIA

```typescript
// ❌ Ruim - Faltando rotulo
<input type="text" />

// ✅ Bom - Com rotulo
<label htmlFor="name">Nome</label>
<input id="name" type="text" />

// ✅ Bom - Com aria-label
<button aria-label="Fechar modal" onClick={onClose}>
  <XIcon />
</button>
```

### 3. Navegacao por Teclado

```typescript
// ✅ Bom - Navegacao por Tab funciona
<button onClick={handleClick}>Acao</button>

// ✅ Bom - Manipulacao de teclado personalizada
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
  Botao Personalizado
</div>
```

### 4. Contraste de Cores

- Texto deve ter razao de contraste suficiente
- WCAG AA: 4.5:1 para texto normal
- WCAG AAA: 7:1 para texto normal
- Usar ferramentas para verificar contrastes

### 5. Texto Alternativo para Imagens

```typescript
// ❌ Ruim - Faltando alt
<img src="foto.jpg" />

// ✅ Bom - Alt descritivo
<img src="foto.jpg" alt="Equipe da empresa na conferencia anual" />

// ✅ Bom - Imagem decorativa
<img src="decoracao.jpg" alt="" role="presentation" />
```

## Melhores Praticas

1. **Usar HTML semantico** (button, nav, main, header, footer)
2. **Adicionar rotulos ARIA** quando necessario
3. **Testar navegacao por teclado** (Tab, Enter, Escape)
4. **Verificar contrastes de cores** (minimo WCAG AA)
5. **Fornecer texto alternativo** para imagens
6. **Suportar leitores de tela**
7. **Testes automatizados** com axe-core
8. **Testes manuais** com leitores de tela (NVDA, JAWS, VoiceOver)

## Recursos

- [Diretrizes WCAG](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Acessibilidade](https://developer.mozilla.org/pt-BR/docs/Web/Accessibility)
- [React Acessibilidade](https://pt-br.react.dev/learn/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
