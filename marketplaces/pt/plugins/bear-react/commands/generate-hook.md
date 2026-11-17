---
description: Gerar Hook Personalizado
---

# Gerar Hook Personalizado

Gere um novo hook React personalizado com TypeScript e testes.

## O Que Este Comando Faz

1. **Geração de Hook**
   - Criar arquivo do hook
   - Gerar tipos TypeScript
   - Criar arquivo de teste
   - Adicionar exemplos de uso nos comentários

2. **Templates Utilizados**
   - Função de hook personalizado
   - Definições de tipos
   - Estrutura de teste com renderHook
   - Documentação JSDoc

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

# Hook específico de feature
npm run generate:hook features/auth/hooks/useLogin
```

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Templates de Hook

### 1. Hook de Estado Simples

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
 * @param options - Opções de configuração
 * @returns Estado e métodos do contador
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

### 2. Hook de Busca de Dados

```typescript
// useUser.ts
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User } from '@/types/user.types';

export interface UseUserOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export interface UseUserReturn {
  user: User | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados de um usuário
 *
 * @param userId - O ID do usuário a buscar
 * @param options - Opções de query
 * @returns Dados do usuário e estado da query
 *
 * @example
 * const { user, isLoading } = useUser('123');
 */
export const useUser = (
  userId: string,
  options: UseUserOptions = {}
): UseUserReturn => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getById(userId),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval
  });

  return {
    user: data,
    isLoading,
    error: error as Error | null,
    refetch
  };
};
```

### 3. Hook de Armazenamento Local

```typescript
// useLocalStorage.ts
import { useState, useEffect } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

/**
 * Hook para sincronizar estado com o localStorage
 *
 * @param key - A chave do localStorage
 * @param initialValue - Valor inicial caso a chave não exista
 * @param options - Opções de serialização
 * @returns Valor do estado e setter
 *
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((val: T) => T)) => void] {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse
  } = options;

  // Obter o valor inicial do localStorage ou usar initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Atualizar localStorage quando o valor mudar
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 4. Hook de Formulário

```typescript
// useForm.ts
import { useState, useCallback, FormEvent } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: unknown) => void;
  handleSubmit: (e: FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Hook para gerenciar estado e validação de formulário
 *
 * @param options - Configuração do formulário
 * @returns Estado e handlers do formulário
 *
 * @example
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => { ... },
 *   validate: (values) => { ... }
 * });
 */
export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, onSubmit, validate } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((name: keyof T, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Limpar erro deste campo
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validar
      if (validate) {
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) {
          setErrors(validationErrors);
          setIsSubmitting(false);
          return;
        }
      }

      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset
  };
}
```

### 5. Hook de Media Query

```typescript
// useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Hook para monitorar correspondência de media query
 *
 * @param query - A string de media query
 * @returns Se a media query corresponde ou não
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Definir valor inicial
    setMatches(mediaQuery.matches);

    // Escutar mudanças
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
```

## Template de Teste

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));

    expect(result.current.count).toBe(10);
  });

  it('should increment count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('should decrement count', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 0 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });

  it('should respect max value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 9, max: 10 }));

    act(() => {
      result.current.increment();
      result.current.increment(); // Não deve ultrapassar o max
    });

    expect(result.current.count).toBe(10);
  });

  it('should respect min value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 1, min: 0 }));

    act(() => {
      result.current.decrement();
      result.current.decrement(); // Não deve ficar abaixo do min
    });

    expect(result.current.count).toBe(0);
  });
});
```

## Padrões de Hook

### Composição

```typescript
// useAuth.ts
export const useAuth = () => {
  const user = useUser();
  const permissions = usePermissions(user?.id);
  const logout = useLogout();

  return {
    user,
    permissions,
    logout,
    isAuthenticated: !!user
  };
};
```

### Injeção de Dependência

```typescript
// useRepository.ts
export const useUserRepository = () => {
  const apiClient = useApiClient();

  return useMemo(
    () => createUserRepository(apiClient),
    [apiClient]
  );
};
```

### Handlers de Eventos

```typescript
// useClickOutside.ts
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
```

## Script Gerador

```typescript
// scripts/generate-hook.ts
import fs from 'fs/promises';
import path from 'path';

async function generateHook(name: string, hookPath = 'src/hooks') {
  const fileName = name.startsWith('use') ? name : `use${name}`;
  const dir = path.join(hookPath);

  await fs.mkdir(dir, { recursive: true });

  // Gerar arquivo do hook
  await fs.writeFile(
    path.join(dir, `${fileName}.ts`),
    getHookTemplate(fileName)
  );

  // Gerar arquivo de teste
  await fs.writeFile(
    path.join(dir, `${fileName}.test.ts`),
    getTestTemplate(fileName)
  );

  console.log(`✅ Hook ${fileName} created at ${dir}`);
}

// Executar
const [,, name] = process.argv;
generateHook(name);
```

## Boas Práticas

1. **Nomenclatura**: Sempre iniciar com o prefixo `use`
2. **Responsabilidade Única**: Um hook, um propósito
3. **Dependências**: Listar todas as dependências em useEffect/useCallback
4. **TypeScript**: Tipagem forte para valores de retorno e parâmetros
5. **Documentação**: Comentários JSDoc com exemplos
6. **Testes**: Testar todos os casos de uso e casos extremos
7. **Memoização**: Usar useMemo/useCallback de forma adequada
8. **Tratamento de Erros**: Tratar erros de forma elegante

## Recursos

- [Documentação React Hooks](https://react.dev/reference/react)
- [Guia de Hooks Personalizados](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [usehooks.com](https://usehooks.com/)
