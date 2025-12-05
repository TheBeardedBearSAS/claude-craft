# Generate Custom Hook

Generate a new custom React hook with TypeScript and tests.

## What This Command Does

1. **Hook Generation**
   - Create hook file
   - Generate TypeScript types
   - Create test file
   - Add usage examples in comments

2. **Templates Used**
   - Custom hook function
   - Type definitions
   - Test structure with renderHook
   - JSDoc documentation

3. **Generated Files**
   ```
   src/hooks/
   ├── useHookName.ts
   └── useHookName.test.ts
   ```

## How to Use

```bash
# Generate hook
npm run generate:hook useHookName

# With custom path
npm run generate:hook features/users/hooks/useUserData

# Feature-specific hook
npm run generate:hook features/auth/hooks/useLogin
```

## Hook Templates

### 1. Simple State Hook

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
 * Hook for managing counter state
 *
 * @param options - Configuration options
 * @returns Counter state and methods
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

### 2. Data Fetching Hook

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
 * Hook to fetch user data
 *
 * @param userId - The user ID to fetch
 * @param options - Query options
 * @returns User data and query state
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

### 3. Local Storage Hook

```typescript
// useLocalStorage.ts
import { useState, useEffect } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

/**
 * Hook for syncing state with localStorage
 *
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Serialization options
 * @returns State value and setter
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

  // Get initial value from localStorage or use initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
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

### 4. Form Hook

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
 * Hook for managing form state and validation
 *
 * @param options - Form configuration
 * @returns Form state and handlers
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
    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate
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

### 5. Media Query Hook

```typescript
// useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Hook to track media query matches
 *
 * @param query - The media query string
 * @returns Whether the media query matches
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

    // Set initial value
    setMatches(mediaQuery.matches);

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
```

## Test Template

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
      result.current.increment(); // Should not exceed max
    });

    expect(result.current.count).toBe(10);
  });

  it('should respect min value', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 1, min: 0 }));

    act(() => {
      result.current.decrement();
      result.current.decrement(); // Should not go below min
    });

    expect(result.current.count).toBe(0);
  });
});
```

## Hook Patterns

### Composition

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

### Dependency Injection

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

### Event Handlers

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

## Generator Script

```typescript
// scripts/generate-hook.ts
import fs from 'fs/promises';
import path from 'path';

async function generateHook(name: string, hookPath = 'src/hooks') {
  const fileName = name.startsWith('use') ? name : `use${name}`;
  const dir = path.join(hookPath);

  await fs.mkdir(dir, { recursive: true });

  // Generate hook file
  await fs.writeFile(
    path.join(dir, `${fileName}.ts`),
    getHookTemplate(fileName)
  );

  // Generate test file
  await fs.writeFile(
    path.join(dir, `${fileName}.test.ts`),
    getTestTemplate(fileName)
  );

  console.log(`✅ Hook ${fileName} created at ${dir}`);
}

// Run
const [,, name] = process.argv;
generateHook(name);
```

## Best Practices

1. **Naming**: Always start with `use` prefix
2. **Single Responsibility**: One hook, one purpose
3. **Dependencies**: List all dependencies in useEffect/useCallback
4. **TypeScript**: Strongly type return values and parameters
5. **Documentation**: JSDoc comments with examples
6. **Testing**: Test all use cases and edge cases
7. **Memoization**: Use useMemo/useCallback appropriately
8. **Error Handling**: Handle errors gracefully

## Resources

- [React Hooks Documentation](https://react.dev/reference/react)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [usehooks.com](https://usehooks.com/)
