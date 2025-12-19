---
description: Gerar Hook Personalizado
---

# Gerar Hook Personalizado

Gerar um novo hook React personalizado com TypeScript e testes.

## O Que Este Comando Faz

1. **Geracao de Hook**
   - Criar arquivo de hook
   - Gerar tipos TypeScript
   - Criar arquivo de teste
   - Adicionar exemplos de uso em comentarios

2. **Templates Usados**
   - Funcao de hook personalizado
   - Definicoes de tipos
   - Estrutura de teste com renderHook
   - Documentacao JSDoc

3. **Arquivos Gerados**
   ```
   src/hooks/
   ├── useHookName.ts
   └── useHookName.test.ts
   ```

## Como Usar

```bash
# Gerar hook
npm run generate:hook useHookName

# Com caminho personalizado
npm run generate:hook features/users/hooks/useUserData

# Hook especifico de funcionalidade
npm run generate:hook features/auth/hooks/useLogin
```

## Template de Hook Simples

```typescript
// useCounter.ts
import { useState, useCallback } from 'react';

export interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
}

export interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setCount: (value: number) => void;
}

/**
 * Hook para gerenciar estado de contador
 *
 * @param options - Opcoes de configuracao
 * @returns Estado e metodos do contador
 *
 * @example
 * const { count, increment, decrement } = useCounter({ initialValue: 0 });
 */
export const useCounter = (
  options: UseCounterOptions = {}
): UseCounterReturn => {
  const { initialValue = 0, min, max } = options;
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      return max !== undefined ? Math.min(next, max) : next;
    });
  }, [max]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const next = prev - 1;
      return min !== undefined ? Math.max(next, min) : next;
    });
  }, [min]);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset,
    setCount
  };
};
```

## Template de Teste

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('deve inicializar com valor padrao', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('deve incrementar contador', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });
});
```

## Melhores Praticas

1. **Nomenclatura**: Sempre comecar com prefixo `use`
2. **Responsabilidade Unica**: Um hook, um proposito
3. **Dependencias**: Listar todas as dependencias em useEffect/useCallback
4. **TypeScript**: Tipar fortemente valores de retorno e parametros
5. **Documentacao**: Comentarios JSDoc com exemplos
6. **Testes**: Testar todos os casos de uso e casos extremos
7. **Memoizacao**: Usar useMemo/useCallback apropriadamente
8. **Tratamento de Erros**: Tratar erros graciosamente
