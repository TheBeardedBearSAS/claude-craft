# Template: Hook Personalizado

## Estrutura Basica

```typescript
// useCustomHook.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Opcoes de configuracao do hook
 */
export interface UseCustomHookOptions {
  /**
   * Valor inicial
   */
  initialValue?: string;

  /**
   * Callback de sucesso
   */
  onSuccess?: (data: string) => void;

  /**
   * Callback de erro
   */
  onError?: (error: Error) => void;
}

/**
 * Valor de retorno do hook
 */
export interface UseCustomHookReturn {
  /**
   * Valor atual
   */
  value: string;

  /**
   * Indicador de carregamento
   */
  isLoading: boolean;

  /**
   * Erro potencial
   */
  error: Error | null;

  /**
   * Atualizar o valor
   */
  update: (newValue: string) => Promise<void>;

  /**
   * Resetar
   */
  reset: () => void;
}

/**
 * Hook personalizado para [descricao da funcionalidade].
 *
 * @param options - Opcoes de configuracao
 * @returns Estado e metodos para gerenciar [funcionalidade]
 *
 * @example
 * ```tsx
 * const { value, update, isLoading } = useCustomHook({
 *   initialValue: 'padrao',
 *   onSuccess: (data) => console.log('Sucesso:', data)
 * });
 *
 * // Usar no componente
 * await update('novo valor');
 * ```
 *
 * @throws {ValidationError} Se valor for invalido
 */
export const useCustomHook = (
  options: UseCustomHookOptions = {}
): UseCustomHookReturn => {
  const { initialValue = '', onSuccess, onError } = options;

  // Estado
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Efeitos
  useEffect(() => {
    // Inicializacao ou efeitos colaterais
  }, []);

  // Metodos
  const update = useCallback(
    async (newValue: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Logica de atualizacao
        setValue(newValue);
        onSuccess?.(newValue);
      } catch (err) {
        const error = err as Error;
        setError(error);
        onError?.(error);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(null);
  }, [initialValue]);

  return {
    value,
    isLoading,
    error,
    update,
    reset
  };
};
```

## Hook com React Query

```typescript
// useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, CreateUserInput } from '@/types/user.types';

/**
 * Hook para buscar todos os usuarios
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};

/**
 * Hook para buscar um usuario por ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id
  });
};

/**
 * Hook para criar um usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      // Invalidar cache para atualizar dados
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * Hook para atualizar um usuario
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * Hook para deletar um usuario
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
```

## Hook com Zustand

```typescript
// useThemeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

/**
 * Store global para tema da aplicacao
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',

      setTheme: (theme) => set({ theme }),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }))
    }),
    {
      name: 'theme-storage' // chave localStorage
    }
  )
);

/**
 * Hook auxiliar para acessar tema
 */
export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return { theme, setTheme, toggleTheme };
};
```

## Hook Composto

```typescript
// useUserManagement.ts
import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Busca de dados
  const { data: users, isLoading, error } = useUsers();

  // Mutacoes
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Metodos compostos
  const handleCreate = async (data: CreateUserInput) => {
    await createUser.mutateAsync(data);
  };

  const handleUpdate = async (id: string, data: Partial<User>) => {
    await updateUser.mutateAsync({ id, data });
  };

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id);
    if (selectedUser?.id === id) {
      setSelectedUser(null);
    }
  };

  return {
    // Dados
    users,
    selectedUser,
    setSelectedUser,

    // Estados de carregamento
    isLoading,
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,

    // Erros
    error,
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error,

    // Acoes
    handleCreate,
    handleUpdate,
    handleDelete
  };
};
```

## Testes de Hook

```typescript
// useCustomHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('deve inicializar com valor padrao', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.value).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('deve inicializar com valor personalizado', () => {
    const { result } = renderHook(() =>
      useCustomHook({ initialValue: 'personalizado' })
    );

    expect(result.current.value).toBe('personalizado');
  });

  it('deve atualizar valor', async () => {
    const { result } = renderHook(() => useCustomHook());

    await act(async () => {
      await result.current.update('novo valor');
    });

    expect(result.current.value).toBe('novo valor');
  });

  it('deve chamar callback onSuccess', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCustomHook({ onSuccess }));

    await act(async () => {
      await result.current.update('novo valor');
    });

    expect(onSuccess).toHaveBeenCalledWith('novo valor');
  });

  it('deve resetar para valor inicial', () => {
    const { result } = renderHook(() =>
      useCustomHook({ initialValue: 'inicial' })
    );

    act(() => {
      result.current.update('atualizado');
    });

    expect(result.current.value).toBe('atualizado');

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('inicial');
  });
});
```

## Organizacao

```
hooks/
├── useCustomHook.ts       # Hook principal
├── useCustomHook.test.ts  # Testes
└── index.ts               # Exports

# Para um hook complexo com dependencias:
useComplexFeature/
├── useComplexFeature.ts
├── useComplexFeature.test.ts
├── utils/
│   ├── validation.ts
│   └── helpers.ts
└── index.ts
```
