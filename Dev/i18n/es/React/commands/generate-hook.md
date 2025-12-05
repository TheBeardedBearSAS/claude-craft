# Generar Hook Personalizado

Genera un hook personalizado de React con TypeScript, tests y documentacion.

## Uso

```bash
# Generar hook basico
generate-hook useCounter

# Generar con opciones
generate-hook useAuth --path src/hooks

# Con tests
generate-hook useCounter --with-tests
```

## Estructura del Hook Generado

```
useCustomHook/
├── useCustomHook.ts        # Hook principal
├── useCustomHook.test.ts   # Tests unitarios
├── types.ts                # Tipos TypeScript
└── index.ts                # Exportaciones
```

## Template: Hook Basico

```typescript
// useCounter.ts
import { useState, useCallback } from 'react';

export interface UseCounterOptions {
  /**
   * Valor inicial del contador
   * @default 0
   */
  initialValue?: number;

  /**
   * Valor minimo permitido
   */
  min?: number;

  /**
   * Valor maximo permitido
   */
  max?: number;

  /**
   * Callback cuando el valor cambia
   */
  onChange?: (value: number) => void;
}

export interface UseCounterReturn {
  /**
   * Valor actual del contador
   */
  count: number;

  /**
   * Incrementar el contador
   */
  increment: () => void;

  /**
   * Decrementar el contador
   */
  decrement: () => void;

  /**
   * Establecer un valor especifico
   */
  setValue: (value: number) => void;

  /**
   * Reiniciar al valor inicial
   */
  reset: () => void;
}

/**
 * Hook personalizado para gestionar un contador
 *
 * @param options - Opciones de configuracion
 * @returns Estado y metodos para gestionar el contador
 *
 * @example
 * ```tsx
 * const { count, increment, decrement } = useCounter({
 *   initialValue: 0,
 *   min: 0,
 *   max: 10
 * });
 * ```
 */
export const useCounter = (
  options: UseCounterOptions = {}
): UseCounterReturn => {
  const { initialValue = 0, min, max, onChange } = options;

  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      if (max !== undefined && next > max) return prev;

      onChange?.(next);
      return next;
    });
  }, [max, onChange]);

  const decrement = useCallback(() => {
    setCount((prev) => {
      const next = prev - 1;
      if (min !== undefined && next < min) return prev;

      onChange?.(next);
      return next;
    });
  }, [min, onChange]);

  const setValue = useCallback(
    (value: number) => {
      if (min !== undefined && value < min) return;
      if (max !== undefined && value > max) return;

      setCount(value);
      onChange?.(value);
    },
    [min, max, onChange]
  );

  const reset = useCallback(() => {
    setCount(initialValue);
    onChange?.(initialValue);
  }, [initialValue, onChange]);

  return {
    count,
    increment,
    decrement,
    setValue,
    reset
  };
};
```

## Template: Hook con React Query

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

## Template: Hook con Estado Local

```typescript
// useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para persistir estado en localStorage
 *
 * @param key - Clave localStorage
 * @param initialValue - Valor inicial si no existe en localStorage
 * @returns Estado y setter
 *
 * @example
 * ```tsx
 * const [theme, setTheme] = useLocalStorage('theme', 'light');
 * ```
 */
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // Obtener valor inicial de localStorage o usar valor por defecto
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // Guardar en localStorage cuando cambia el valor
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};
```

## Template: Tests

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

  it('should respect max limit', () => {
    const { result } = renderHook(() =>
      useCounter({ initialValue: 10, max: 10 })
    );

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(10);
  });

  it('should respect min limit', () => {
    const { result } = renderHook(() =>
      useCounter({ initialValue: 0, min: 0 })
    );

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(0);
  });

  it('should call onChange callback', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useCounter({ onChange }));

    act(() => {
      result.current.increment();
    });

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('should reset to initial value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(5);
  });
});
```

## Patrones de Hooks

### Hook de Datos (Data Hook)

```typescript
export const useUserData = (userId: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser(userId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [userId]);

  return { data, loading, error };
};
```

### Hook de UI (UI Hook)

```typescript
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};
```

### Hook Compuesto (Compound Hook)

```typescript
export const useUserManagement = () => {
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [selectedUser, setSelectedUser] = useState(null);

  const handleCreate = useCallback(async (data) => {
    await createUser.mutateAsync(data);
  }, []);

  return {
    users,
    selectedUser,
    setSelectedUser,
    isLoading,
    handleCreate
  };
};
```

## Mejores Practicas

### 1. Nomenclatura

```typescript
// ✅ BIEN - Comenzar con "use"
export const useAuth = () => {};
export const useLocalStorage = () => {};

// ❌ MAL - No comienza con "use"
export const authHook = () => {};
```

### 2. Valores de Retorno

```typescript
// ✅ BIEN - Objeto para multiples valores
export const useAuth = () => {
  return {
    user,
    login,
    logout,
    isAuthenticated
  };
};

// ✅ BIEN - Tupla para dos valores
export const useState = () => {
  return [value, setValue];
};
```

### 3. Dependencias

```typescript
// ✅ BIEN - Especificar todas las dependencias
useEffect(() => {
  fetchData(userId, filter);
}, [userId, filter]);

// ❌ MAL - Omitir dependencias
useEffect(() => {
  fetchData(userId, filter);
}, []);
```

### 4. Callbacks Memorizados

```typescript
// ✅ BIEN - Usar useCallback
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ❌ MAL - Funcion nueva en cada render
const handleClick = () => {
  doSomething(value);
};
```

## Index File

```typescript
// index.ts
export { useCounter } from './useCounter';
export type { UseCounterOptions, UseCounterReturn } from './useCounter';
```

## Recursos

- [Documentacion React Hooks](https://react.dev/reference/react)
- [Reglas de Hooks](https://react.dev/warnings/invalid-hook-call-warning)
- [usehooks.com](https://usehooks.com/)
- [useHooks-ts](https://usehooks-ts.com/)
