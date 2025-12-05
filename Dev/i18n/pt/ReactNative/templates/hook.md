# Template: Hook Personalizado

## Nome do Hook

`use{{HOOK_NAME}}.ts`

## Estrutura

```typescript
// hooks/use{{HOOK_NAME}}.ts
import { useState, useEffect, useCallback } from 'react';

// Importar tipos
import type { {{TYPE_NAME}} } from '@/types/{{TYPE_NAME}}.types';

/**
 * Hook {{HOOK_NAME}}
 *
 * Descrição: {{DESCRIPTION}}
 *
 * @hook
 * @example
 * ```typescript
 * const { data, isLoading, error, refetch } = use{{HOOK_NAME}}(param);
 * ```
 */
export const use{{HOOK_NAME}} = (param?: ParamType) => {
  // 1. State
  const [data, setData] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Refs (se necessário)
  const ref = useRef<RefType>(null);

  // 3. Outros hooks
  const { otherHook } = useOtherHook();

  // 4. Effects
  useEffect(() => {
    fetchData();

    // Cleanup
    return () => {
      // Lógica de cleanup
    };
  }, [param]);

  // 5. Callbacks
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall(param);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [param]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // 6. Valores computados
  const computedValue = useMemo(() => {
    if (!data) return null;
    return transformData(data);
  }, [data]);

  // 7. Return
  return {
    data,
    isLoading,
    error,
    refetch,
    computedValue,
  };
};

// Tipo de retorno (para melhor suporte do TypeScript)
export type Use{{HOOK_NAME}}Return = ReturnType<typeof use{{HOOK_NAME}}>;
```

## Exemplo com React Query

```typescript
// hooks/use{{FEATURE_NAME}}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {{FEATURE_NAME}}Service } from '@/services/{{FEATURE_NAME}}.service';

/**
 * Buscar dados de {{FEATURE_NAME}}
 */
export const use{{FEATURE_NAME}} = (id?: string) => {
  return useQuery({
    queryKey: ['{{FEATURE_NAME}}', id],
    queryFn: () => {{FEATURE_NAME}}Service.getById(id!),
    enabled: !!id,
  });
};

/**
 * Criar {{FEATURE_NAME}}
 */
export const useCreate{{FEATURE_NAME}} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Create{{FEATURE_NAME}}DTO) =>
      {{FEATURE_NAME}}Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{{FEATURE_NAME}}'] });
    },
  });
};

/**
 * Atualizar {{FEATURE_NAME}}
 */
export const useUpdate{{FEATURE_NAME}} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Update{{FEATURE_NAME}}DTO }) =>
      {{FEATURE_NAME}}Service.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['{{FEATURE_NAME}}', variables.id] });
    },
  });
};

/**
 * Deletar {{FEATURE_NAME}}
 */
export const useDelete{{FEATURE_NAME}} = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {{FEATURE_NAME}}Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{{FEATURE_NAME}}'] });
    },
  });
};
```

## Teste

```typescript
// hooks/use{{HOOK_NAME}}.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { use{{HOOK_NAME}} } from './use{{HOOK_NAME}}';

describe('use{{HOOK_NAME}}', () => {
  it('inicializa com valores padrão', () => {
    const { result } = renderHook(() => use{{HOOK_NAME}}());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('busca dados com sucesso', async () => {
    const { result } = renderHook(() => use{{HOOK_NAME}}('param'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('trata erros', async () => {
    // Mock API para lançar erro
    const { result } = renderHook(() => use{{HOOK_NAME}}('invalid'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
  });

  it('refaz fetch de dados', async () => {
    const { result } = renderHook(() => use{{HOOK_NAME}}());

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
  });
});
```
