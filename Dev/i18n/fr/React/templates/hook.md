# Template : Hook Custom

## Structure de Base

```typescript
// useCustomHook.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Options de configuration pour le hook
 */
export interface UseCustomHookOptions {
  /**
   * Valeur initiale
   */
  initialValue?: string;

  /**
   * Callback de succès
   */
  onSuccess?: (data: string) => void;

  /**
   * Callback d'erreur
   */
  onError?: (error: Error) => void;
}

/**
 * Valeur de retour du hook
 */
export interface UseCustomHookReturn {
  /**
   * Valeur actuelle
   */
  value: string;

  /**
   * Indicateur de chargement
   */
  isLoading: boolean;

  /**
   * Erreur éventuelle
   */
  error: Error | null;

  /**
   * Mettre à jour la valeur
   */
  update: (newValue: string) => Promise<void>;

  /**
   * Réinitialiser
   */
  reset: () => void;
}

/**
 * Hook personnalisé pour [description de la fonctionnalité].
 *
 * @param options - Options de configuration
 * @returns État et méthodes pour gérer [fonctionnalité]
 *
 * @example
 * ```tsx
 * const { value, update, isLoading } = useCustomHook({
 *   initialValue: 'default',
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 *
 * // Utiliser dans le composant
 * await update('new value');
 * ```
 *
 * @throws {ValidationError} Si la valeur est invalide
 */
export const useCustomHook = (
  options: UseCustomHookOptions = {}
): UseCustomHookReturn => {
  const { initialValue = '', onSuccess, onError } = options;

  // État
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Effets
  useEffect(() => {
    // Initialisation ou side effects
  }, []);

  // Méthodes
  const update = useCallback(
    async (newValue: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Logique de mise à jour
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

## Hook avec React Query

```typescript
// useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, CreateUserInput } from '@/types/user.types';

/**
 * Hook pour récupérer tous les utilisateurs
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook pour récupérer un utilisateur par ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id
  });
};

/**
 * Hook pour créer un utilisateur
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      // Invalider le cache pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * Hook pour mettre à jour un utilisateur
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
 * Hook pour supprimer un utilisateur
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

## Hook avec Zustand

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
 * Store global pour le thème de l'application
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
      name: 'theme-storage' // Clé localStorage
    }
  )
);

/**
 * Hook helper pour accéder au thème
 */
export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return { theme, setTheme, toggleTheme };
};
```

## Hook Composite

```typescript
// useUserManagement.ts
import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Récupération des données
  const { data: users, isLoading, error } = useUsers();

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Méthodes composées
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
    // Data
    users,
    selectedUser,
    setSelectedUser,

    // Loading states
    isLoading,
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,

    // Errors
    error,
    createError: createUser.error,
    updateError: updateUser.error,
    deleteError: deleteUser.error,

    // Actions
    handleCreate,
    handleUpdate,
    handleDelete
  };
};
```

## Tests de Hook

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

## Organisation

```
hooks/
├── useCustomHook.ts       # Hook principal
├── useCustomHook.test.ts  # Tests
└── index.ts               # Exports

# Pour un hook complexe avec dépendances:
useComplexFeature/
├── useComplexFeature.ts
├── useComplexFeature.test.ts
├── utils/
│   ├── validation.ts
│   └── helpers.ts
└── index.ts
```
