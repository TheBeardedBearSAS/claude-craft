# Génération Custom Hook React

Tu es un développeur React senior. Tu dois générer un custom hook React avec TypeScript, tests et documentation.

## Arguments
$ARGUMENTS

Arguments :
- Nom du hook (ex: `useDebounce`, `useLocalStorage`, `useFetch`)
- (Optionnel) Description du comportement

Exemple : `/react:generate-hook useDebounce` ou `/react:generate-hook useFetch "Hook pour fetch avec cache"`

## MISSION

### Étape 1 : Structure du Hook

```
src/
└── hooks/
    ├── index.ts
    └── {hookName}/
        ├── index.ts
        ├── {hookName}.ts
        ├── {hookName}.types.ts
        └── {hookName}.test.ts
```

### Étape 2 : Types

```typescript
// src/hooks/{hookName}/{hookName}.types.ts

/**
 * Options pour le hook {hookName}
 */
export interface {HookName}Options {
  /**
   * Délai en millisecondes
   * @default 500
   */
  delay?: number;

  /**
   * Activer/désactiver le hook
   * @default true
   */
  enabled?: boolean;

  /**
   * Callback appelé lors du changement
   */
  onChange?: (value: unknown) => void;
}

/**
 * Retour du hook {hookName}
 */
export interface {HookName}Return<T> {
  /**
   * La valeur actuelle
   */
  value: T;

  /**
   * Fonction pour mettre à jour la valeur
   */
  setValue: (value: T | ((prev: T) => T)) => void;

  /**
   * Indique si le hook est en cours de traitement
   */
  isPending: boolean;

  /**
   * Réinitialiser à la valeur initiale
   */
  reset: () => void;
}
```

### Étape 3 : Implémentation - Exemples de Hooks Courants

#### useDebounce

```typescript
// src/hooks/useDebounce/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
}

export interface UseDebounceReturn<T> {
  debouncedValue: T;
  isPending: boolean;
  cancel: () => void;
  flush: () => void;
}

export function useDebounce<T>(
  value: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const { delay = 500, leading = false } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(
    leading ? value : (undefined as T)
  );
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    setIsPending(true);

    if (leading && timeoutRef.current === null) {
      setDebouncedValue(value);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      setIsPending(false);
      timeoutRef.current = null;
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, leading]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPending(false);
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDebouncedValue(valueRef.current);
    setIsPending(false);
  }, []);

  return { debouncedValue, isPending, cancel, flush };
}
```

#### useLocalStorage

```typescript
// src/hooks/useLocalStorage/useLocalStorage.ts
import { useState, useCallback, useEffect } from 'react';

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  remove: () => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): UseLocalStorageReturn<T> {
  const {
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;

  // Initialiser avec la valeur stockée ou la valeur initiale
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Mettre à jour la valeur
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serializer(valueToStore));

          // Dispatch event pour synchroniser entre onglets
          window.dispatchEvent(
            new StorageEvent('storage', {
              key,
              newValue: serializer(valueToStore),
            })
          );
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, serializer, storedValue]
  );

  // Supprimer la valeur
  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Synchroniser entre onglets
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(deserializer(event.newValue));
        } catch (error) {
          console.warn(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserializer]);

  return { value: storedValue, setValue, remove };
}
```

#### useFetch

```typescript
// src/hooks/useFetch/useFetch.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseFetchOptions<T> extends RequestInit {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  select?: (data: unknown) => T;
}

export interface UseFetchReturn<T> {
  data: T | undefined;
  error: Error | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => Promise<void>;
  abort: () => void;
}

export function useFetch<T = unknown>(
  url: string | null,
  options: UseFetchOptions<T> = {}
): UseFetchReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    select,
    ...fetchOptions
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return;

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const result = select ? select(json) : (json as T);

      setData(result);
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        onError?.(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [url, enabled, fetchOptions, select, onSuccess, onError]);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Fetch initial et sur changement d'URL
  useEffect(() => {
    fetchData();

    return () => {
      abort();
    };
  }, [fetchData, abort]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  return {
    data,
    error,
    isLoading,
    isError: error !== null,
    isSuccess: data !== undefined && error === null,
    refetch: fetchData,
    abort,
  };
}
```

#### useMediaQuery

```typescript
// src/hooks/useMediaQuery/useMediaQuery.ts
import { useState, useEffect, useCallback } from 'react';

export function useMediaQuery(query: string): boolean {
  const getMatches = useCallback((query: string): boolean => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  }, []);

  const [matches, setMatches] = useState<boolean>(() => getMatches(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = () => {
      setMatches(mediaQuery.matches);
    };

    // Initial check
    handleChange();

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback pour anciens navigateurs
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

// Hooks dérivés pratiques
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)');
}

export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
```

### Étape 4 : Tests

```typescript
// src/hooks/{hookName}/{hookName}.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce } from './useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial'));

    expect(result.current.debouncedValue).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    // Change value
    rerender({ value: 'updated' });

    // Value should not change immediately
    expect(result.current.debouncedValue).toBe('initial');
    expect(result.current.isPending).toBe(true);

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
  });

  it('cancels pending updates on unmount', () => {
    const { result, unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should not throw
    act(() => {
      jest.advanceTimersByTime(500);
    });
  });

  it('cancel() stops pending debounce', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      result.current.cancel();
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should not have updated
    expect(result.current.debouncedValue).toBe('initial');
  });

  it('flush() immediately applies pending value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500 }),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    act(() => {
      result.current.flush();
    });

    // Value should be updated immediately
    expect(result.current.debouncedValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
  });

  it('supports leading option', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, { delay: 500, leading: true }),
      { initialProps: { value: 'initial' } }
    );

    // With leading: true, first value is applied immediately
    expect(result.current.debouncedValue).toBe('initial');

    rerender({ value: 'updated' });

    // Update should still be debounced
    expect(result.current.debouncedValue).toBe('initial');

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.debouncedValue).toBe('updated');
  });
});

// Test for useFetch
describe('useFetch', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() =>
      useFetch<typeof mockData>('https://api.example.com/data')
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
  });

  it('handles fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useFetch('https://api.example.com/data')
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isError).toBe(true);
    expect(result.current.error?.message).toBe('Network error');
  });

  it('does not fetch when enabled is false', () => {
    const { result } = renderHook(() =>
      useFetch('https://api.example.com/data', { enabled: false })
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Étape 5 : Export

```typescript
// src/hooks/index.ts
export { useDebounce } from './useDebounce';
export type { UseDebounceOptions, UseDebounceReturn } from './useDebounce';

export { useLocalStorage } from './useLocalStorage';
export type { UseLocalStorageOptions, UseLocalStorageReturn } from './useLocalStorage';

export { useFetch } from './useFetch';
export type { UseFetchOptions, UseFetchReturn } from './useFetch';

export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './useMediaQuery';
```

### Résumé

```
══════════════════════════════════════════════════════════════
✅ HOOK GÉNÉRÉ - {hookName}
══════════════════════════════════════════════════════════════

📁 Fichiers créés :
- src/hooks/{hookName}/index.ts
- src/hooks/{hookName}/{hookName}.ts
- src/hooks/{hookName}/{hookName}.types.ts
- src/hooks/{hookName}/{hookName}.test.ts

📝 Features :
- TypeScript strict avec types exportés
- Options configurables
- Tests complets avec mocks
- SSR compatible (typeof window check)
- Cleanup automatique

🔧 Commandes :
# Lancer les tests
npm test {hookName}

# Usage
import { {hookName} } from '@/hooks';

const result = {hookName}(value, options);
```
