# Template: Custom Hook

## Basic Structure

```typescript
// useCustomHook.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Configuration options for the hook
 */
export interface UseCustomHookOptions {
  /**
   * Initial value
   */
  initialValue?: string;

  /**
   * Success callback
   */
  onSuccess?: (data: string) => void;

  /**
   * Error callback
   */
  onError?: (error: Error) => void;
}

/**
 * Hook return value
 */
export interface UseCustomHookReturn {
  /**
   * Current value
   */
  value: string;

  /**
   * Loading indicator
   */
  isLoading: boolean;

  /**
   * Potential error
   */
  error: Error | null;

  /**
   * Update the value
   */
  update: (newValue: string) => Promise<void>;

  /**
   * Reset
   */
  reset: () => void;
}

/**
 * Custom hook for [feature description].
 *
 * @param options - Configuration options
 * @returns State and methods to manage [feature]
 *
 * @example
 * ```tsx
 * const { value, update, isLoading } = useCustomHook({
 *   initialValue: 'default',
 *   onSuccess: (data) => console.log('Success:', data)
 * });
 *
 * // Use in component
 * await update('new value');
 * ```
 *
 * @throws {ValidationError} If value is invalid
 */
export const useCustomHook = (
  options: UseCustomHookOptions = {}
): UseCustomHookReturn => {
  const { initialValue = '', onSuccess, onError } = options;

  // State
  const [value, setValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Effects
  useEffect(() => {
    // Initialization or side effects
  }, []);

  // Methods
  const update = useCallback(
    async (newValue: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Update logic
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

## Hook with React Query

```typescript
// useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import type { User, CreateUserInput } from '@/types/user.types';

/**
 * Hook to fetch all users
 */
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Hook to fetch a user by ID
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
    enabled: !!id
  });
};

/**
 * Hook to create a user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) => userService.create(data),
    onSuccess: () => {
      // Invalidate cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

/**
 * Hook to update a user
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
 * Hook to delete a user
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

## Hook with Zustand

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
 * Global store for application theme
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
      name: 'theme-storage' // localStorage key
    }
  )
);

/**
 * Helper hook to access theme
 */
export const useTheme = () => {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return { theme, setTheme, toggleTheme };
};
```

## Composite Hook

```typescript
// useUserManagement.ts
import { useState } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';

export const useUserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Data fetching
  const { data: users, isLoading, error } = useUsers();

  // Mutations
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  // Composed methods
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

## Hook Tests

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

## Organization

```
hooks/
├── useCustomHook.ts       # Main hook
├── useCustomHook.test.ts  # Tests
└── index.ts               # Exports

# For a complex hook with dependencies:
useComplexFeature/
├── useComplexFeature.ts
├── useComplexFeature.test.ts
├── utils/
│   ├── validation.ts
│   └── helpers.ts
└── index.ts
```
