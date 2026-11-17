---
description: Custom Hook generieren
---

# Custom Hook generieren

Einen neuen benutzerdefinierten React-Hook mit TypeScript und Tests generieren.

## Was dieser Befehl tut

1. **Hook-Generierung**
   - Hook-Datei erstellen
   - TypeScript-Typen generieren
   - Testdatei erstellen
   - Verwendungsbeispiele in Kommentaren hinzufügen

2. **Verwendete Templates**
   - Custom-Hook-Funktion
   - Typdefinitionen
   - Test-Struktur mit renderHook
   - JSDoc-Dokumentation

3. **Generierte Dateien**
   ```
   src/hooks/
   ├── useHookName.ts
   └── useHookName.test.ts
   ```

## Verwendung

```bash
# Hook generieren
npm run generate:hook useHookName

# Mit benutzerdefiniertem Pfad
npm run generate:hook features/users/hooks/useUserData

# Feature-spezifischer Hook
npm run generate:hook features/auth/hooks/useLogin
```

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## Hook-Templates

### 1. Einfacher State-Hook

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
 * Hook zur Verwaltung des Zählerstatus
 *
 * @param options - Konfigurationsoptionen
 * @returns Zählerstatus und Methoden
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

### 2. Datenabruf-Hook

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
 * Hook zum Abrufen von Benutzerdaten
 *
 * @param userId - Die abzurufende Benutzer-ID
 * @param options - Abfrageoptionen
 * @returns Benutzerdaten und Abfragestatus
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

### 3. Local-Storage-Hook

```typescript
// useLocalStorage.ts
import { useState, useEffect } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

/**
 * Hook zur Synchronisierung des Status mit localStorage
 *
 * @param key - Der localStorage-Schlüssel
 * @param initialValue - Anfangswert, wenn Schlüssel nicht existiert
 * @param options - Serialisierungsoptionen
 * @returns Statuswert und Setter
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

  // Anfangswert aus localStorage lesen oder initialValue verwenden
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.error(`Fehler beim Lesen des localStorage-Schlüssels "${key}":`, error);
      return initialValue;
    }
  });

  // localStorage aktualisieren, wenn der Wert sich ändert
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.error(`Fehler beim Setzen des localStorage-Schlüssels "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### 4. Formular-Hook

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
 * Hook zur Verwaltung von Formularzustand und Validierung
 *
 * @param options - Formularkonfiguration
 * @returns Formularzustand und Handler
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
    // Fehler für dieses Feld löschen
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validieren
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
        console.error('Fehler beim Formularabsenden:', error);
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

### 5. Media-Query-Hook

```typescript
// useMediaQuery.ts
import { useState, useEffect } from 'react';

/**
 * Hook zur Verfolgung von Media-Query-Übereinstimmungen
 *
 * @param query - Der Media-Query-String
 * @returns Ob die Media Query übereinstimmt
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

    // Anfangswert setzen
    setMatches(mediaQuery.matches);

    // Auf Änderungen hören
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
};
```

## Test-Template

```typescript
// useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('sollte mit Standardwert initialisieren', () => {
    const { result } = renderHook(() => useCounter());

    expect(result.current.count).toBe(0);
  });

  it('sollte mit benutzerdefiniertem Wert initialisieren', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 10 }));

    expect(result.current.count).toBe(10);
  });

  it('sollte Zähler erhöhen', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('sollte Zähler verringern', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 5 }));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('sollte auf Anfangswert zurücksetzen', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 0 }));

    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });

    expect(result.current.count).toBe(0);
  });

  it('sollte Maximalwert respektieren', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 9, max: 10 }));

    act(() => {
      result.current.increment();
      result.current.increment(); // Sollte Maximum nicht überschreiten
    });

    expect(result.current.count).toBe(10);
  });

  it('sollte Minimalwert respektieren', () => {
    const { result } = renderHook(() => useCounter({ initialValue: 1, min: 0 }));

    act(() => {
      result.current.decrement();
      result.current.decrement(); // Sollte nicht unter Minimum gehen
    });

    expect(result.current.count).toBe(0);
  });
});
```

## Hook-Muster

### Komposition

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

### Event-Handler

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

## Generator-Skript

```typescript
// scripts/generate-hook.ts
import fs from 'fs/promises';
import path from 'path';

async function generateHook(name: string, hookPath = 'src/hooks') {
  const fileName = name.startsWith('use') ? name : `use${name}`;
  const dir = path.join(hookPath);

  await fs.mkdir(dir, { recursive: true });

  // Hook-Datei generieren
  await fs.writeFile(
    path.join(dir, `${fileName}.ts`),
    getHookTemplate(fileName)
  );

  // Testdatei generieren
  await fs.writeFile(
    path.join(dir, `${fileName}.test.ts`),
    getTestTemplate(fileName)
  );

  console.log(`✅ Hook ${fileName} erstellt unter ${dir}`);
}

// Ausführen
const [,, name] = process.argv;
generateHook(name);
```

## Best Practices

1. **Benennung**: Immer mit `use`-Präfix beginnen
2. **Single Responsibility**: Ein Hook, ein Zweck
3. **Dependencies**: Alle Dependencies in useEffect/useCallback auflisten
4. **TypeScript**: Rückgabewerte und Parameter stark typisieren
5. **Dokumentation**: JSDoc-Kommentare mit Beispielen
6. **Testing**: Alle Use Cases und Edge Cases testen
7. **Memoization**: useMemo/useCallback angemessen einsetzen
8. **Fehlerbehandlung**: Fehler elegant behandeln

## Ressourcen

- [React Hooks Dokumentation](https://react.dev/reference/react)
- [Custom Hooks Leitfaden](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Testing Library Hooks](https://react-hooks-testing-library.com/)
- [usehooks.com](https://usehooks.com/)
