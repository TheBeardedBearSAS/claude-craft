---
description: Custom Hook generieren
---

# Custom Hook generieren

Generiere einen neuen React Custom Hook mit allen zugehörigen Dateien.

## Aufgabe

Erstelle einen vollständigen Custom Hook mit:

1. **Haupt-Hook** (`useHookName.ts`)
   - TypeScript mit strikter Typisierung
   - Options und Return Type Interfaces
   - JSDoc-Dokumentation
   - Exported Types

2. **Tests** (`useHookName.test.ts`)
   - Hook-Tests mit @testing-library/react
   - Alle Use Cases abdecken
   - Edge Cases testen
   - Error Handling testen

3. **Verwendungsbeispiele**
   - Code-Beispiele in Kommentaren
   - Reale Szenarien
   - Best Practices
   - Common Patterns

4. **Dokumentation**
   - Purpose und Use Case
   - API-Referenz
   - Parameter-Beschreibung
   - Return-Value-Beschreibung

5. **Index** (`index.ts`)
   - Named Exports
   - Type Exports

## Parameter

- **Hook Name**: [Name des Hooks (ohne 'use')]
- **Purpose**: [Zweck des Hooks]
- **Parameters**: [Options/Config-Parameter]
- **Return Values**: [Zurückgegebene Werte und Funktionen]
- **Dependencies**: [Benötigte externe Hooks oder Libraries]

## Template-Struktur

```
hooks/
└── useHookName/
    ├── useHookName.ts
    ├── useHookName.test.ts
    ├── types.ts (wenn komplex)
    └── index.ts
```

## Anforderungen

1. **TypeScript**
   - Strikte Typisierung
   - Generic Types wo sinnvoll
   - Keine `any` Types
   - Vollständige JSDoc

2. **React Best Practices**
   - Hook Rules befolgen
   - Stabile Dependencies
   - Korrekte useCallback/useMemo
   - Cleanup in useEffect

3. **Performance**
   - Memoization wo nötig
   - Stable Functions
   - Optimierte Dependencies
   - Keine unnötigen Re-Renders

4. **Error Handling**
   - Try-Catch Blocks
   - Error States
   - Error Callbacks
   - Validierung

5. **Testing**
   - >90% Coverage
   - Alle Use Cases
   - Edge Cases
   - Error Scenarios

6. **Dokumentation**
   - JSDoc mit Examples
   - Parameter beschrieben
   - Return Values erklärt
   - Common Pitfalls

## Beispiel-Aufruf

```
Hook Name: LocalStorage
Purpose: Persistiere State in localStorage mit automatic sync
Parameters:
- key: string (localStorage key)
- initialValue: T (default value)
- options?: {
    serializer?: (value: T) => string
    deserializer?: (value: string) => T
    syncData?: boolean
  }
Return Values:
- value: T (current value)
- setValue: (value: T | ((prev: T) => T)) => void
- remove: () => void
- error: Error | null
Dependencies: useState, useEffect, useCallback
```

## Zu liefern

1. Vollständiger Hook mit Typen
2. Umfassende Tests
3. Verwendungsbeispiele
4. Vollständige Dokumentation
5. Integration mit bestehenden Hooks (falls relevant)
