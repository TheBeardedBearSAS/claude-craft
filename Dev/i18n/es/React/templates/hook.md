# Template: Custom Hook

## Estructura Básica

```typescript
// useCustomHook.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Opciones de configuración para el hook
 */
export interface UseCustomHookOptions {
  /**
   * Valor inicial
   */
  initialValue?: string;

  /**
   * Callback de éxito
   */
  onSuccess?: (data: string) => void;

  /**
   * Callback de error
   */
  onError?: (error: Error) => void;
}

/**
 * Valor de retorno del hook
 */
export interface UseCustomHookReturn {
  /**
   * Valor actual
   */
  value: string;

  /**
   * Indicador de carga
   */
  isLoading: boolean;

  /**
   * Posible error
   */
  error: Error | null;

  /**
   * Actualizar el valor
   */
  update: (newValue: string) => Promise<void>;

  /**
   * Reiniciar
   */
  reset: () => void;
}

/**
 * Hook personalizado para [descripción de la característica].
 *
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar [característica]
 *
 * @example
 * ```tsx
 * const { value, update, isLoading } = useCustomHook({
 *   initialValue: 'default',
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 *
 * // Usar en componente
 * await update('new value');
 * ```
 *
 * @throws {ValidationError} Si el valor es inválido
 */
export const useCustomHook = (
  options: UseCustomHookOptions = {}
): UseCustomHookReturn => {
  const { initialValue = '', onSuccess, onError } = options;

  // Estado
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Efectos
  useEffect(() => {
    // Inicialización o efectos secundarios
  }, []);

  // Métodos
  const update = useCallback(
    async (newValue: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Lógica de actualización
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

## Hook con React Query

```typescript
// useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, CreateUserInput } from '@/types/user.types';

/**
 * Hook para obtener todos los usuarios
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
};

/**
 * Hook para obtener un usuario por ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id
  });
};

/**
 * Hook para crear un usuario
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      // Invalidar caché para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * Hook para actualizar un usuario
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
 * Hook para eliminar un usuario
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

## Hook con Zustand

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
 * Store global para el tema de la aplicación
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
      name: 'theme-storage' // clave de localStorage
    }
  )
);

/**
 * Hook helper para acceder al tema
 */
export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return { theme, setTheme, toggleTheme };
};
```

## Hook Compuesto

```typescript
// useUserManagement.ts
import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Obtención de datos
  const { data: users, isLoading, error } = useUsers();

  // Mutaciones
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Métodos compuestos
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
    // Datos
    users,
    selectedUser,
    setSelectedUser,

    // Estados de carga
    isLoading,
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,

    // Errores
    error,
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error,

    // Acciones
    handleCreate,
    handleUpdate,
    handleDelete
  };
};
```

## Tests de Hooks

```typescript
// useCustomHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useCustomHook());

    expect(result.current.value).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with custom value', () => {
    const { result } = renderHook(() =>
      useCustomHook({ initialValue: 'custom' })
    );

    expect(result.current.value).toBe('custom');
  });

  it('should update value', async () => {
    const { result } = renderHook(() => useCustomHook());

    await act(async () => {
      await result.current.update('new value');
    });

    expect(result.current.value).toBe('new value');
  });

  it('should call onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() => useCustomHook({ onSuccess }));

    await act(async () => {
      await result.current.update('new value');
    });

    expect(onSuccess).toHaveBeenCalledWith('new value');
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() =>
      useCustomHook({ initialValue: 'initial' })
    );

    act(() => {
      result.current.update('updated');
    });

    expect(result.current.value).toBe('updated');

    act(() => {
      result.current.reset();
    });

    expect(result.current.value).toBe('initial');
  });
});
```

## Organización

```
hooks/
├── useCustomHook.ts       # Hook principal
├── useCustomHook.test.ts  # Tests
└── index.ts               # Exportaciones

# Para un hook complejo con dependencias:
useComplexFeature/
├── useComplexFeature.ts
├── useComplexFeature.test.ts
├── utils/
│   ├── validation.ts
│   └── helpers.ts
└── index.ts
```
