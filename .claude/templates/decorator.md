# Template: Decorator Pattern

> **Pattern** - Decorator pour ajouter des comportements sans modifier la classe
> Référence: `.claude/rules/04-solid-principles.md` (OCP: Open/Closed Principle)

## Principe

Le decorator pattern permet d'ajouter dynamiquement des responsabilités à un objet sans modifier sa classe.

---

## Template Python

```python
from abc import ABC, abstractmethod
from functools import wraps
from typing import Callable, Any

# Interface
class [Interface](ABC):
    """
    Interface: [NomInterface]
    
    Responsabilité: [Description]
    """
    
    @abstractmethod
    def [operation](self) -> [ReturnType]:
        """Description de l'opération"""
        pass

# Implémentation concrète
class [ConcreteClass]([Interface]):
    """Implémentation de base"""
    
    def [operation](self) -> [ReturnType]:
        return [result]

# Decorator de base
class [DecoratorBase]([Interface]):
    """Decorator de base pour délégation"""
    
    def __init__(self, wrapped: [Interface]) -> None:
        self._wrapped = wrapped
    
    def [operation](self) -> [ReturnType]:
        return self._wrapped.[operation]()

# Decorator concret
class [ConcreteDecorator]([DecoratorBase]):
    """
    Decorator: [NomDecorator]
    
    Ajoute: [Comportement additionnel]
    """
    
    def [operation](self) -> [ReturnType]:
        # Avant l'opération
        self._before()
        
        # Déléguer à l'objet wrappé
        result = super().[operation]()
        
        # Après l'opération
        self._after()
        
        return result
    
    def _before(self) -> None:
        """Logique avant"""
        pass
    
    def _after(self) -> None:
        """Logique après"""
        pass
```

### Exemple: Cache Decorator

```python
from abc import ABC, abstractmethod
from typing import Any, Dict
import time

class DataService(ABC):
    @abstractmethod
    def get_data(self, key: str) -> Dict[str, Any]:
        pass

class DatabaseService(DataService):
    """Service qui récupère depuis la DB"""
    
    def get_data(self, key: str) -> Dict[str, Any]:
        # Simuler requête DB
        time.sleep(0.5)
        return {"id": key, "value": "data"}

class CachedDataService(DataService):
    """Decorator qui ajoute un cache"""
    
    def __init__(self, wrapped: DataService) -> None:
        self._wrapped = wrapped
        self._cache: Dict[str, Dict[str, Any]] = {}
    
    def get_data(self, key: str) -> Dict[str, Any]:
        if key in self._cache:
            print(f"Cache HIT: {key}")
            return self._cache[key]
        
        print(f"Cache MISS: {key}")
        result = self._wrapped.get_data(key)
        self._cache[key] = result
        return result

# Usage
service = CachedDataService(DatabaseService())
data = service.get_data("user:123")  # MISS, 0.5s
data = service.get_data("user:123")  # HIT, 0ms
```

---

## Template TypeScript

```typescript
/**
 * Interface: [NomInterface]
 *
 * Responsabilité: [Description]
 */
interface [Interface] {
  [operation](): [ReturnType];
}

/**
 * Implémentation concrète
 */
class [ConcreteClass] implements [Interface] {
  [operation](): [ReturnType] {
    return [result];
  }
}

/**
 * Decorator: [NomDecorator]
 *
 * Ajoute: [Comportement additionnel]
 */
class [ConcreteDecorator] implements [Interface] {
  constructor(private wrapped: [Interface]) {}

  [operation](): [ReturnType] {
    // Avant l'opération
    this.before();

    // Déléguer
    const result = this.wrapped.[operation]();

    // Après l'opération
    this.after();

    return result;
  }

  private before(): void {
    // Logique avant
  }

  private after(): void {
    // Logique après
  }
}
```

### Exemple: Logger Decorator

```typescript
interface NotificationService {
  send(message: string, recipient: string): void;
}

class EmailService implements NotificationService {
  send(message: string, recipient: string): void {
    console.log(`Sending email to ${recipient}: ${message}`);
  }
}

class LoggedNotificationService implements NotificationService {
  constructor(private wrapped: NotificationService) {}

  send(message: string, recipient: string): void {
    console.log(`[LOG] Sending notification to ${recipient}`);
    const start = Date.now();

    this.wrapped.send(message, recipient);

    const duration = Date.now() - start;
    console.log(`[LOG] Notification sent in ${duration}ms`);
  }
}

// Usage
const service = new LoggedNotificationService(new EmailService());
service.send('Hello!', 'user@example.com');
```
