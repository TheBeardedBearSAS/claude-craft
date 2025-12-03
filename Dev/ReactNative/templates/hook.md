# Template: Custom Hook

## Nom du Hook

`use{{HOOK_NAME}}.ts`

## Structure

```typescript
// hooks/use{{HOOK_NAME}}.ts
import { useState, useEffect, useCallback } from 'react';

// Import types
import type { {{TYPE_NAME}} } from '@/types/{{TYPE_NAME}}.types';

/**
 * {{HOOK_NAME}} Hook
 * 
 * Description: {{DESCRIPTION}}
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

  // 2. Refs (if needed)
  const ref = useRef<RefType>(null);

  // 3. Other hooks
  const { otherHook } = useOtherHook();

  // 4. Effects
  useEffect(() => {
    fetchData();

    // Cleanup
    return () => {
      // Cleanup logic
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

  // 6. Computed values
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

// Return type (for better TypeScript support)
export type Use{{HOOK_NAME}}Return = ReturnType<typeof use{{HOOK_NAME}}>;
```

## Exemple avec React Query

```typescript
// hooks/use{{FEATURE_NAME}}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { {{FEATURE_NAME}}Service } from '@/services/{{FEATURE_NAME}}.service';

/**
 * Fetch {{FEATURE_NAME}} data
 */
export const use{{FEATURE_NAME}} = (id?: string) => {
  return useQuery({
    queryKey: ['{{FEATURE_NAME}}', id],
    queryFn: () => {{FEATURE_NAME}}Service.getById(id!),
    enabled: !!id,
  });
};

/**
 * Create {{FEATURE_NAME}}
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
 * Update {{FEATURE_NAME}}
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
 * Delete {{FEATURE_NAME}}
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

## Test

```typescript
// hooks/use{{HOOK_NAME}}.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { use{{HOOK_NAME}} } from './use{{HOOK_NAME}}';

describe('use{{HOOK_NAME}}', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => use{{HOOK_NAME}}());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches data successfully', async () => {
    const { result } = renderHook(() => use{{HOOK_NAME}}('param'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeDefined();
    expect(result.current.error).toBeNull();
  });

  it('handles errors', async () => {
    // Mock API to throw error
    const { result } = renderHook(() => use{{HOOK_NAME}}('invalid'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.data).toBeNull();
  });

  it('refetches data', async () => {
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
